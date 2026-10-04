#!/usr/bin/env python3
"""Run the existing crawler and publish a validated, fast-forward stats commit."""

from datetime import date, datetime, timedelta, timezone
import fcntl
import json
import os
from pathlib import Path
import shutil
import signal
import subprocess
import sys
import tempfile
import time


FILES = ("gs_data.json", "gs_data_shieldsio.json", "citation_history.json")


def utcnow():
    return datetime.now(timezone.utc)


def timestamp():
    return utcnow().isoformat()


def log(message):
    print(f"[updater] {message}", flush=True)


def run(command, *, cwd=None, timeout=60, capture=True):
    """Bound the entire process tree, including a crawler's browser children."""
    process = subprocess.Popen(
        command, cwd=cwd, start_new_session=True, text=True,
        stdout=subprocess.PIPE if capture else None,
        stderr=subprocess.PIPE if capture else None,
    )
    try:
        stdout, stderr = process.communicate(timeout=timeout)
    except subprocess.TimeoutExpired:
        try:
            os.killpg(process.pid, signal.SIGTERM)
        except ProcessLookupError:
            pass
        try:
            process.communicate(timeout=5)
        except subprocess.TimeoutExpired:
            pass
        finally:
            # The leader may exit while a browser descendant ignores SIGTERM.
            try:
                os.killpg(process.pid, signal.SIGKILL)
            except ProcessLookupError:
                pass
            process.communicate()
        raise RuntimeError(f"{Path(command[0]).name} exceeded {timeout}s") from None
    if process.returncode:
        # Avoid echoing Git remote URLs or proxy credentials from stderr.
        raise RuntimeError(f"{Path(command[0]).name} failed (exit {process.returncode})")
    return stdout.strip() if capture else ""


def git(checkout, *args):
    return run(["git", "-C", str(checkout), *args])


def load_json(path):
    with open(path, encoding="utf-8") as handle:
        return json.load(handle)


def write_json(path, value):
    temporary = path.with_suffix(path.suffix + ".tmp")
    with open(temporary, "w", encoding="utf-8") as handle:
        json.dump(value, handle, ensure_ascii=False, indent=2)
        handle.write("\n")
    os.replace(temporary, path)


def parsed_time(value):
    parsed = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    if parsed.tzinfo is None:
        raise ValueError("A timestamp has no timezone")
    return parsed


def validate_history(history):
    if not isinstance(history, list):
        raise ValueError("Citation history is not a list")
    seen = set()
    for entry in history:
        if not isinstance(entry, dict):
            raise ValueError("Invalid citation history entry")
        week = date.fromisoformat(entry["week"])
        if week.weekday() != 0 or week.isoformat() in seen:
            raise ValueError("Citation history has an invalid or duplicate week")
        seen.add(week.isoformat())
        if type(entry.get("citedby")) is not int or entry["citedby"] < 0:
            raise ValueError("Invalid historical citation count")
        parsed_time(entry["updated"])
    return history


def validate_results(results, scholar_id, previous_history, started_at):
    data = load_json(results / "gs_data.json")
    badge = load_json(results / "gs_data_shieldsio.json")
    history = validate_history(load_json(results / "citation_history.json"))
    if not isinstance(data, dict) or data.get("scholar_id") != scholar_id:
        raise ValueError("Wrong or missing Scholar profile")
    if not isinstance(data.get("name"), str) or not data["name"].strip():
        raise ValueError("Missing author name")
    if type(data.get("citedby")) is not int or data["citedby"] < 0:
        raise ValueError("Invalid total citation count")
    publications = data.get("publications")
    if not isinstance(publications, dict) or not publications or any(
        not isinstance(item, dict) or item.get("author_pub_id") != key
        for key, item in publications.items()
    ):
        raise ValueError("Missing or invalid publication records")
    updated = parsed_time(data.get("updated"))
    if updated < started_at or updated > utcnow() + timedelta(minutes=5):
        raise ValueError("Crawler output is stale or dated in the future")
    if not isinstance(badge, dict) or (
        badge.get("schemaVersion") != 1 or badge.get("label") != "citations"
        or badge.get("message") != str(data["citedby"])
    ):
        raise ValueError("Badge and author data disagree")
    if data.get("citation_history") != history:
        raise ValueError("Embedded and standalone histories disagree")
    by_week = {entry["week"]: entry for entry in history}
    for entry in previous_history:
        if by_week.get(entry["week"]) != entry:
            raise ValueError("Crawler removed or changed a published history entry")
    monday = updated.date() - timedelta(days=updated.weekday())
    if monday.isoformat() not in by_week:
        raise ValueError("The current week is missing from citation history")
    return data


def prepare_checkout(checkout, repository, branch):
    run(["git", "check-ref-format", "--branch", branch])
    if not (checkout / ".git").exists():
        checkout.mkdir(parents=True, exist_ok=True)
        git(checkout, "init")
        git(checkout, "remote", "add", "origin", repository)
    elif git(checkout, "remote", "get-url", "origin") != repository:
        raise ValueError("Stats checkout belongs to a different repository")
    git(checkout, "fetch", "--no-tags", "origin", f"refs/heads/{branch}")
    base = git(checkout, "rev-parse", "FETCH_HEAD")
    # This is a dedicated disposable checkout, never the application checkout.
    git(checkout, "reset", "--hard", base)
    git(checkout, "checkout", "-B", branch, base)
    git(checkout, "config", "user.name", "scholar-updater")
    git(checkout, "config", "user.email", "scholar-updater@localhost")
    return base, validate_history(load_json(checkout / "citation_history.json"))


def publish(checkout, results, branch, base):
    # Catch an intervening update before changing the local stats checkout.
    git(checkout, "fetch", "--no-tags", "origin", f"refs/heads/{branch}")
    if git(checkout, "rev-parse", "FETCH_HEAD") != base:
        raise RuntimeError("Stats branch advanced during the fetch; retry from its new history")
    for name in FILES:
        shutil.copyfile(results / name, checkout / name)
    git(checkout, "add", "--", *FILES)
    if not git(checkout, "diff", "--cached", "--name-only"):
        return base, False
    git(checkout, "commit", "-m", "Update Google Scholar stats")
    commit = git(checkout, "rev-parse", "HEAD")
    # Ordinary push is the final concurrency guard. Never force or auto-merge
    # statistics derived from a different citation-history snapshot.
    git(checkout, "push", "origin", f"HEAD:refs/heads/{branch}")
    return commit, True


def update(state_dir, status):
    code_dir = Path(os.getenv("SCHOLAR_CODE_DIR", "/opt/homepage-scholar"))
    python = os.getenv("SCHOLAR_PYTHON", str(code_dir / "venv/bin/python"))
    repository = os.environ["SCHOLAR_REPOSITORY_URL"]
    scholar_id = os.environ["GOOGLE_SCHOLAR_ID"]
    branch = os.getenv("SCHOLAR_STATS_BRANCH", "google-scholar-stats")
    attempt_timeout = int(os.getenv("SCHOLAR_ATTEMPT_TIMEOUT", "180"))
    retry_delay = int(os.getenv("SCHOLAR_RETRY_DELAY", "15"))
    if attempt_timeout <= 0 or retry_delay < 0:
        raise ValueError("Invalid timeout or retry delay")
    checkout = state_dir / "stats"
    status["phase"] = "restore_history"
    write_json(state_dir / "status.json", status)
    base, history = prepare_checkout(checkout, repository, branch)
    with tempfile.TemporaryDirectory(prefix="fetch-", dir=state_dir) as temporary:
        work = Path(temporary)
        results = work / "results"
        for attempt in range(1, 4):
            if results.exists():
                shutil.rmtree(results)
            results.mkdir()
            write_json(results / "citation_history.json", history)
            started_at = utcnow()
            status.update(phase="fetch", attempt=attempt)
            write_json(state_dir / "status.json", status)
            log(f"attempt {attempt}/3, deadline {attempt_timeout}s")
            try:
                run([python, "-u", str(code_dir / "google_scholar_crawler/main.py")],
                    cwd=work, timeout=attempt_timeout, capture=False)
                data = validate_results(results, scholar_id, history, started_at)
                break
            except (RuntimeError, ValueError, KeyError, OSError) as error:
                log(f"attempt {attempt} failed: {type(error).__name__}: {error}")
                if attempt == 3:
                    raise
                time.sleep(retry_delay)
        status["phase"] = "publish"
        write_json(state_dir / "status.json", status)
        commit, changed = publish(checkout, results, branch, base)
        return {
            "at": timestamp(), "commit": commit, "changed": changed,
            "citedby": data["citedby"], "publications": len(data["publications"]),
            "data_updated": data["updated"],
        }


def main():
    os.umask(0o077)
    os.environ.setdefault("GIT_TERMINAL_PROMPT", "0")
    os.environ.setdefault("GIT_SSH_COMMAND", "ssh -o BatchMode=yes -o ConnectTimeout=15")
    state_dir = Path(os.getenv("SCHOLAR_STATE_DIR", "/var/lib/homepage-scholar"))
    state_dir.mkdir(parents=True, exist_ok=True)
    with open(state_dir / "update.lock", "a", encoding="utf-8") as lock:
        try:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            log("another update is running; skipping")
            return 0
        previous = {}
        try:
            previous = load_json(state_dir / "status.json")
        except (OSError, ValueError):
            pass
        if not isinstance(previous, dict):
            previous = {}
        status = {
            "status": "running", "started_at": timestamp(),
            "last_success": previous.get("last_success"),
        }
        write_json(state_dir / "status.json", status)
        try:
            result = update(state_dir, status)
        except Exception as error:
            status.update(status="failed", finished_at=timestamp(),
                          error=f"{type(error).__name__}: {error}")
            write_json(state_dir / "status.json", status)
            log(f"failed during {status.get('phase', 'configuration')}: {status['error']}")
            return 1
        status.update(status="success", phase="complete", finished_at=timestamp(),
                      last_success=result)
        write_json(state_dir / "status.json", status)
        log(f"published {result['commit'][:12]}: {result['citedby']} citations")
        return 0


if __name__ == "__main__":
    sys.exit(main())
