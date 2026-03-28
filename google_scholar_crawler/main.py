from datetime import datetime, timezone
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

    author["updated"] = datetime.now(timezone.utc).isoformat()
    author["publications"] = {
        publication["author_pub_id"]: publication for publication in author.get("publications", [])
    }
    print(
        f"[scholar] fetched citedby={author.get('citedby', 0)} publications={len(author['publications'])}",
        flush=True,
    )

    os.makedirs("results", exist_ok=True)
    with open("results/gs_data.json", "w", encoding="utf-8") as file:
        json.dump(author, file, ensure_ascii=False, indent=2)

    shieldsio_data = {
        "schemaVersion": 1,
        "label": "citations",
        "message": str(author.get("citedby", 0)),
    }
    with open("results/gs_data_shieldsio.json", "w", encoding="utf-8") as file:
        json.dump(shieldsio_data, file, ensure_ascii=False, indent=2)
    print("[scholar] wrote results/gs_data.json and results/gs_data_shieldsio.json", flush=True)


if __name__ == "__main__":
    main()
