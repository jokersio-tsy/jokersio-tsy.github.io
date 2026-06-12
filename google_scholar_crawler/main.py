from datetime import datetime, timedelta, timezone
import json
import os

from scholarly import ProxyGenerator, scholarly


def _as_bool(value):
    return str(value).strip().lower() in {"1", "true", "yes", "on"}


def configure_scholarly():
    timeout = int(os.getenv("SCHOLARLY_TIMEOUT", "30"))
    retries = int(os.getenv("SCHOLARLY_RETRIES", "3"))
    scholarly.set_timeout(timeout)
    scholarly.set_retries(retries)
    print(f"[scholar] timeout={timeout}s retries={retries}", flush=True)

    scraperapi_key = os.getenv("SCRAPER_API_KEY", "").strip()
    http_proxy = os.getenv("SCHOLAR_HTTP_PROXY", "").strip()
    https_proxy = os.getenv("SCHOLAR_HTTPS_PROXY", "").strip()
    use_free_proxies = _as_bool(os.getenv("SCHOLAR_USE_FREE_PROXIES", "false"))

    if scraperapi_key:
        pg = ProxyGenerator()
        success = pg.ScraperAPI(scraperapi_key)
        print(f"[scholar] proxy=ScraperAPI success={success}", flush=True)
        if success:
            scholarly.use_proxy(pg)
        return "scraperapi"

    if http_proxy or https_proxy:
        pg = ProxyGenerator()
        success = pg.SingleProxy(http=http_proxy or None, https=https_proxy or None)
        print(f"[scholar] proxy=SingleProxy success={success}", flush=True)
        if success:
            scholarly.use_proxy(pg, pg)
        return "single"

    if use_free_proxies:
        pg = ProxyGenerator()
        success = pg.FreeProxies()
        print(f"[scholar] proxy=FreeProxies success={success}", flush=True)
        if success:
            scholarly.use_proxy(pg)
        return "free"

    print("[scholar] proxy=none", flush=True)
    return "none"


def enable_free_proxies():
    pg = ProxyGenerator()
    success = pg.FreeProxies()
    print(f"[scholar] fallback proxy=FreeProxies success={success}", flush=True)
    if success:
        scholarly.use_proxy(pg)
    return success


def fetch_author(scholar_user_id):
    print(f"[scholar] fetching author {scholar_user_id}", flush=True)
    author = scholarly.search_author_id(scholar_user_id)
    print("[scholar] filling author profile", flush=True)
    scholarly.fill(author, sections=["basics", "indices", "counts", "publications"])
    return author


def week_start(date_time):
    date = date_time.date()
    return (date - timedelta(days=date.weekday())).isoformat()


def parse_datetime(value):
    if not value:
        return None
    try:
        return datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except ValueError:
        try:
            return datetime.fromisoformat(f"{value}T00:00:00+00:00")
        except ValueError:
            return None


def load_citation_history(path):
    if not os.path.exists(path):
        return []
    try:
        with open(path, "r", encoding="utf-8") as file:
            history = json.load(file)
    except (json.JSONDecodeError, OSError):
        return []
    return history if isinstance(history, list) else []


def as_int(value, default=0):
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def update_citation_history(author, updated_at):
    history_path = "results/citation_history.json"
    history = load_citation_history(history_path)
    week = week_start(updated_at)
    current = {
        "week": week,
        "citedby": int(author.get("citedby", 0)),
        "updated": author["updated"],
    }

    by_week = {}
    for item in history:
        if not isinstance(item, dict):
            continue
        item_time = parse_datetime(item.get("updated") or item.get("date") or item.get("week"))
        item_week = item.get("week")
        if not item_week and item_time:
            item_week = week_start(item_time)
        if not item_week:
            continue
        normalized = {
            "week": item_week,
            "citedby": as_int(item.get("citedby", item.get("citations", item.get("total", 0)))),
            "updated": item.get("updated") or item.get("date") or item_week,
        }
        existing = by_week.get(item_week)
        existing_time = parse_datetime(existing.get("updated")) if existing else None
        if existing is None or (item_time and (existing_time is None or item_time < existing_time)):
            by_week[item_week] = normalized

    existing = by_week.get(week)
    existing_time = parse_datetime(existing.get("updated")) if existing else None
    if existing is None or existing_time is None or updated_at < existing_time:
        by_week[week] = current
    history = [by_week[key] for key in sorted(by_week)]
    author["citation_history"] = history

    with open(history_path, "w", encoding="utf-8") as file:
        json.dump(history, file, ensure_ascii=False, indent=2)
    return history


def main():
    proxy_mode = configure_scholarly()
    scholar_user_id = os.environ["GOOGLE_SCHOLAR_ID"]
    try:
        author = fetch_author(scholar_user_id)
    except Exception as error:
        print(f"[scholar] direct fetch failed: {type(error).__name__}: {error}", flush=True)
        should_try_fallback = proxy_mode == "none" and _as_bool(os.getenv("GITHUB_ACTIONS", "false"))
        if should_try_fallback and enable_free_proxies():
            print("[scholar] retrying fetch with free proxies", flush=True)
            author = fetch_author(scholar_user_id)
        else:
            raise RuntimeError(
                "Google Scholar rejected the runner request. Configure SCRAPER_API_KEY "
                "or SCHOLAR_HTTP_PROXY/SCHOLAR_HTTPS_PROXY in GitHub Actions secrets."
            ) from error

    updated_at = datetime.now(timezone.utc)
    author["updated"] = updated_at.isoformat()
    author["publications"] = {
        publication["author_pub_id"]: publication for publication in author.get("publications", [])
    }
    print(
        f"[scholar] fetched citedby={author.get('citedby', 0)} publications={len(author['publications'])}",
        flush=True,
    )

    os.makedirs("results", exist_ok=True)
    citation_history = update_citation_history(author, updated_at)
    with open("results/gs_data.json", "w", encoding="utf-8") as file:
        json.dump(author, file, ensure_ascii=False, indent=2)

    shieldsio_data = {
        "schemaVersion": 1,
        "label": "citations",
        "message": str(author.get("citedby", 0)),
    }
    with open("results/gs_data_shieldsio.json", "w", encoding="utf-8") as file:
        json.dump(shieldsio_data, file, ensure_ascii=False, indent=2)
    print(
        "[scholar] wrote results/gs_data.json, results/gs_data_shieldsio.json, "
        f"and results/citation_history.json ({len(citation_history)} weeks)",
        flush=True,
    )


if __name__ == "__main__":
    main()
