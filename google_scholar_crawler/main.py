from datetime import datetime, timezone
import json
import os

from scholarly import scholarly


def main():
    scholar_user_id = os.environ["GOOGLE_SCHOLAR_ID"]
    author = scholarly.search_author_id(scholar_user_id)
    scholarly.fill(author, sections=["basics", "indices", "counts", "publications"])

    author["updated"] = datetime.now(timezone.utc).isoformat()
    author["publications"] = {
        publication["author_pub_id"]: publication for publication in author.get("publications", [])
    }

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


if __name__ == "__main__":
    main()
