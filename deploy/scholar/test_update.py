"""Offline integration checks: real local Git, fake crawler, no network."""

from datetime import datetime, timezone
import fcntl
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import time
import unittest
from unittest.mock import patch


SCRIPT = Path(__file__).with_name("update.py")
SPEC = importlib.util.spec_from_file_location("scholar_updater", SCRIPT)
updater = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(updater)
HISTORY = [{"week": "2020-01-06", "citedby": 12, "updated": "2020-01-07T00:00:00+00:00"}]
FAKE_CRAWLER = r'''
from datetime import datetime, timedelta, timezone
import json
import os
from pathlib import Path
import sys
results = Path("results")
mode = os.getenv("FAKE_CRAWLER_MODE", "success")
if mode == "failure":
    (results / "gs_data.json").write_text("partial output")
    sys.exit(7)
now = datetime.now(timezone.utc)
history = json.loads((results / "citation_history.json").read_text())
week = (now.date() - timedelta(days=now.weekday())).isoformat()
if not any(row["week"] == week for row in history):
    history.append({"week": week, "citedby": 107, "updated": now.isoformat()})
if mode == "lost-history":
    history = history[-1:]
data = {"scholar_id": "example-id", "name": "Example Author", "citedby": 107,
        "updated": now.isoformat(), "citation_history": history,
        "publications": {"example-id:paper": {"author_pub_id": "example-id:paper"}}}
badge = {"schemaVersion": 1, "label": "citations", "message": "107"}
if mode == "bad-badge":
    badge["message"] = "0"
for name, value in (("gs_data.json", data), ("citation_history.json", history),
                    ("gs_data_shieldsio.json", badge)):
    (results / name).write_text(json.dumps(value))
'''


def git(path, *args):
    return subprocess.check_output(
        ["git", "-C", str(path), *args], text=True, stderr=subprocess.DEVNULL
    ).strip()


class PublicationTests(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name)
        self.remote = self.root / "remote.git"
        self.seed = self.root / "seed"
        self.state = self.root / "state"
        self.code = self.root / "code"
        self.remote.mkdir()
        self.seed.mkdir()
        (self.code / "google_scholar_crawler").mkdir(parents=True)
        (self.code / "google_scholar_crawler/main.py").write_text(FAKE_CRAWLER)
        git(self.remote, "init", "--bare")
        git(self.seed, "init")
        git(self.seed, "config", "user.name", "Test")
        git(self.seed, "config", "user.email", "test@localhost")
        for name, value in (("citation_history.json", HISTORY),
                            ("gs_data.json", {"previous": "published"}),
                            ("gs_data_shieldsio.json", {"previous": "published"})):
            (self.seed / name).write_text(json.dumps(value))
        (self.seed / "preserved.txt").write_text("retain other branch files")
        git(self.seed, "add", ".")
        git(self.seed, "commit", "-m", "Initial stats")
        git(self.seed, "branch", "-M", "google-scholar-stats")
        git(self.seed, "remote", "add", "origin", str(self.remote))
        git(self.seed, "push", "origin", "google-scholar-stats")
        self.initial = self.remote_head()
        self.env = {
            **os.environ,
            "GOOGLE_SCHOLAR_ID": "example-id",
            "SCHOLAR_REPOSITORY_URL": str(self.remote),
            "SCHOLAR_STATE_DIR": str(self.state),
            "SCHOLAR_CODE_DIR": str(self.code),
            "SCHOLAR_PYTHON": sys.executable,
            "SCHOLAR_ATTEMPT_TIMEOUT": "3",
            "SCHOLAR_RETRY_DELAY": "0",
        }

    def remote_head(self):
        return git(self.remote, "rev-parse", "refs/heads/google-scholar-stats")

    def invoke(self, mode="success"):
        return subprocess.run([sys.executable, str(SCRIPT)],
                              env={**self.env, "FAKE_CRAWLER_MODE": mode},
                              capture_output=True, text=True, timeout=20)

    def status(self):
        return json.loads((self.state / "status.json").read_text())

    def test_success_keeps_ancestry_history_and_other_files(self):
        result = self.invoke()
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        head = self.remote_head()
        self.assertNotEqual(head, self.initial)
        self.assertEqual(git(self.remote, "rev-parse", head + "^"), self.initial)
        self.assertEqual(git(self.remote, "show", head + ":preserved.txt"),
                         "retain other branch files")
        history = json.loads(git(self.remote, "show", head + ":citation_history.json"))
        self.assertIn(HISTORY[0], history)
        self.assertEqual(self.status()["status"], "success")
        self.assertEqual(self.status()["last_success"]["commit"], head)
        self.assertEqual(self.status()["last_success"]["citedby"], 107)

    def test_failure_retries_without_publishing_or_losing_success_status(self):
        self.assertEqual(self.invoke().returncode, 0)
        head = self.remote_head()
        last_success = self.status()["last_success"]
        result = self.invoke("failure")
        self.assertEqual(result.returncode, 1)
        self.assertEqual(result.stdout.count("failed: RuntimeError"), 3)
        self.assertEqual(self.remote_head(), head)
        self.assertEqual(self.status()["status"], "failed")
        self.assertEqual(self.status()["last_success"], last_success)
        self.assertEqual(git(self.state / "stats", "status", "--porcelain"), "")
        self.assertEqual(list(self.state.glob("fetch-*")), [])

    def test_invalid_outputs_never_publish(self):
        for mode in ("bad-badge", "lost-history"):
            with self.subTest(mode=mode):
                result = self.invoke(mode)
                self.assertEqual(result.returncode, 1, result.stdout)
                self.assertEqual(self.remote_head(), self.initial)
                self.assertEqual(self.status()["attempt"], 3)
                self.assertEqual(git(self.state / "stats", "status", "--porcelain"), "")

    def test_racing_update_is_not_overwritten(self):
        checkout = self.root / "checkout"
        base, _ = updater.prepare_checkout(checkout, str(self.remote), "google-scholar-stats")
        (self.seed / "preserved.txt").write_text("concurrent edit")
        git(self.seed, "add", ".")
        git(self.seed, "commit", "-m", "Another publisher")
        git(self.seed, "push", "origin", "google-scholar-stats")
        newer = self.remote_head()
        with self.assertRaisesRegex(RuntimeError, "advanced"):
            updater.publish(checkout, self.root / "unused", "google-scholar-stats", base)
        self.assertEqual(self.remote_head(), newer)
        self.assertEqual(git(checkout, "status", "--porcelain"), "")

    def test_push_rejects_a_race_after_the_final_fetch(self):
        checkout = self.root / "checkout"
        base, _ = updater.prepare_checkout(checkout, str(self.remote), "google-scholar-stats")
        results = self.root / "results"
        results.mkdir()
        for name in updater.FILES:
            (results / name).write_text('{"new":"validated output"}')
        original_git = updater.git

        def competing_git(path, *args):
            if args[0] == "push":
                (self.seed / "preserved.txt").write_text("late concurrent edit")
                git(self.seed, "add", ".")
                git(self.seed, "commit", "-m", "Late concurrent publisher")
                git(self.seed, "push", "origin", "google-scholar-stats")
            return original_git(path, *args)

        with patch.object(updater, "git", side_effect=competing_git):
            with self.assertRaisesRegex(RuntimeError, "git failed"):
                updater.publish(checkout, results, "google-scholar-stats", base)
        self.assertEqual(self.remote_head(), git(self.seed, "rev-parse", "HEAD"))
        self.assertNotEqual(self.remote_head(), git(checkout, "rev-parse", "HEAD"))

    def test_lock_skips_second_process_without_altering_status(self):
        self.state.mkdir()
        status = self.state / "status.json"
        status.write_text('{"status":"running","owner":"first"}')
        with open(self.state / "update.lock", "w") as lock:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
            result = self.invoke()
        self.assertEqual(result.returncode, 0)
        self.assertIn("another update is running", result.stdout)
        self.assertEqual(self.status()["owner"], "first")
        self.assertEqual(self.remote_head(), self.initial)


class DeadlineTests(unittest.TestCase):
    def test_timeout_stops_sigterm_resistant_descendant(self):
        # The inherited pipe prevents communicate() returning until the child
        # also exits; this checks the process-group kill, not just the parent.
        script = (
            "import subprocess,sys,time; "
            "subprocess.Popen([sys.executable,'-c',"
            "'import signal,time; signal.signal(signal.SIGTERM,signal.SIG_IGN); time.sleep(30)']); "
            "time.sleep(30)"
        )
        started = time.monotonic()
        with self.assertRaisesRegex(RuntimeError, "exceeded"):
            updater.run([sys.executable, "-c", script], timeout=0.3)
        self.assertLess(time.monotonic() - started, 8)


if __name__ == "__main__":
    unittest.main()
