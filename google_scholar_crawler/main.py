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
        return

    if http_proxy or https_proxy:
        pg = ProxyGenerator()
        success = pg.SingleProxy(http=http_proxy or None, https=https_proxy or None)
        print(f"[scholar] proxy=SingleProxy success={success}", flush=True)
        if success:
            scholarly.use_proxy(pg, pg)
        return

    if use_free_proxies:
        pg = ProxyGenerator()
        success = pg.FreeProxies()
        print(f"[scholar] proxy=FreeProxies success={success}", flush=True)
        if success:
            scholarly.use_proxy(pg)
        return

    print("[scholar] proxy=none", flush=True)


def main():
    configure_scholarly()
    scholar_user_id = os.environ["GOOGLE_SCHOLAR_ID"]
    print(f"[scholar] fetching author {scholar_user_id}", flush=True)
    author = scholarly.search_author_id(scholar_user_id)
    print("[scholar] filling author profile", flush=True)
    scholarly.fill(author, sections=["basics", "indices", "counts", "publications"])

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
