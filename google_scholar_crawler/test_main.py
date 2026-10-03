"""Offline regression checks for Scholar fetching and published statistics."""

import copy
from datetime import datetime, timezone
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch


SPEC = importlib.util.spec_from_file_location("scholar_crawler", Path(__file__).with_name("main.py"))
crawler = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(crawler)
AUTHOR = {
    "scholar_id": "example-id",
    "name": "Example Researcher",
    "citedby": 105,
    "publications": [{"author_pub_id": "example-id:paper", "bib": {"title": "Example"}}],
}


class DependencyAndProxyTests(unittest.TestCase):
    def test_real_dependencies_import_without_network(self):
        result = subprocess.run(
            [sys.executable, "-c", """
from unittest.mock import patch
with patch('socket.socket.connect', side_effect=AssertionError('unexpected network')), \
     patch('socket.create_connection', side_effect=AssertionError('unexpected network')):
    import bibtexparser.bibdatabase
    import main
"""],
            cwd=Path(__file__).parent,
            capture_output=True,
            text=True,
            timeout=30,
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_configured_proxies_cover_both_scholarly_navigators(self):
        cases = [
            ({"SCRAPER_API_KEY": " key "}, "ScraperAPI", ("key",), {}, "scraperapi"),
            ({"SCHOLAR_HTTPS_PROXY": "https://proxy.test:8080"}, "SingleProxy", (),
             {"http": None, "https": "https://proxy.test:8080"}, "single"),
        ]
        for env, method, args, kwargs, mode in cases:
            with self.subTest(mode=mode), patch.dict(os.environ, env, clear=True), \
                    patch.object(crawler, "ProxyGenerator") as generator, \
                    patch.object(crawler, "scholarly") as scholarly:
                proxy = generator.return_value
                getattr(proxy, method).return_value = True
                self.assertEqual(crawler.configure_scholarly(), mode)
                getattr(proxy, method).assert_called_once_with(*args, **kwargs)
                scholarly.use_proxy.assert_called_once_with(proxy, proxy)
                scholarly.set_timeout.assert_called_once_with(30)
                scholarly.set_retries.assert_called_once_with(3)

    def test_failed_proxy_configuration_does_not_fall_back(self):
        for env, method in [({"SCRAPER_API_KEY": "key"}, "ScraperAPI"),
                            ({"SCHOLAR_HTTP_PROXY": "http://proxy.test"}, "SingleProxy")]:
            with self.subTest(method=method), patch.dict(os.environ, env, clear=True), \
                    patch.object(crawler, "ProxyGenerator") as generator, \
                    patch.object(crawler, "scholarly") as scholarly:
                getattr(generator.return_value, method).return_value = False
                with self.assertRaisesRegex(RuntimeError, "initialization failed"):
                    crawler.configure_scholarly()
                scholarly.use_proxy.assert_not_called()

    def test_no_proxy_does_not_initialize_free_proxies(self):
        with patch.dict(os.environ, {"SCHOLAR_USE_FREE_PROXIES": "1"}, clear=True), \
                patch.object(crawler, "ProxyGenerator") as generator, \
                patch.object(crawler, "scholarly") as scholarly:
            self.assertEqual(crawler.configure_scholarly(), "none")
            generator.assert_not_called()
            scholarly.use_proxy.assert_not_called()


class PublishedStatisticsTests(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        previous_cwd = os.getcwd()
        self.addCleanup(os.chdir, previous_cwd)
        os.chdir(temporary.name)
        self.results = Path("results")
        self.results.mkdir()
        env = patch.dict(os.environ, {"GOOGLE_SCHOLAR_ID": AUTHOR["scholar_id"]}, clear=True)
        env.start()
        self.addCleanup(env.stop)
        configure = patch.object(crawler, "configure_scholarly", return_value="none")
        configure.start()
        self.addCleanup(configure.stop)

    def seed_files(self):
        for name in ["gs_data.json", "gs_data_shieldsio.json", "citation_history.json"]:
            (self.results / name).write_text('{"previous": "untouched"}', encoding="utf-8")
        return self.snapshot()

    def snapshot(self):
        return {path.name: path.read_bytes() for path in self.results.iterdir()}

    def test_missing_or_invalid_citation_count_preserves_every_existing_file(self):
        expected = self.seed_files()
        for value in [None, -1, "105", True, 105.5, "missing"]:
            author = copy.deepcopy(AUTHOR)
            if value == "missing":
                del author["citedby"]
            else:
                author["citedby"] = value
            with self.subTest(value=value), patch.object(crawler, "fetch_author", return_value=author):
                with self.assertRaisesRegex(ValueError, "valid citation count"):
                    crawler.main()
                self.assertEqual(self.snapshot(), expected)

    def test_incomplete_profiles_are_rejected(self):
        for change in [{"scholar_id": "another-id"}, {"name": ""},
                       {"publications": None}, {"publications": [{}]}, {"publications": [None]}]:
            with self.subTest(change=change), self.assertRaises(ValueError):
                crawler.validate_author({**AUTHOR, **change}, AUTHOR["scholar_id"])
        crawler.validate_author({**AUTHOR, "citedby": 0, "publications": []}, AUTHOR["scholar_id"])

    def test_fetch_failure_preserves_every_existing_file(self):
        expected = self.seed_files()
        with patch.object(crawler, "fetch_author", side_effect=RuntimeError("blocked")) as fetch:
            with self.assertRaisesRegex(RuntimeError, "Google Scholar fetch failed"):
                crawler.main()
            fetch.assert_called_once_with(AUTHOR["scholar_id"])
        self.assertEqual(self.snapshot(), expected)

    def test_success_writes_three_files_and_keeps_earliest_weekly_snapshot(self):
        history = [
            {"week": "2026-09-21", "citedby": 90, "updated": "2026-09-21T08:00:00+00:00"},
            {"week": "2026-09-28", "citedby": 95, "updated": "2026-09-28T08:00:00+00:00"},
        ]
        (self.results / "citation_history.json").write_text(json.dumps(history), encoding="utf-8")
        for date, count in [("2026-10-03T08:00:00+00:00", 105), ("2026-10-05T08:00:00+00:00", 110)]:
            author = {**copy.deepcopy(AUTHOR), "citedby": count}
            moment = datetime.fromisoformat(date)
            with patch.object(crawler, "fetch_author", return_value=author), \
                    patch.object(crawler, "datetime", wraps=datetime) as clock:
                clock.now.return_value = moment
                crawler.main()
                clock.now.assert_called_once_with(timezone.utc)
            if count == 110:
                history.append({"week": "2026-10-05", "citedby": count, "updated": date})
            files = {path.name: json.loads(path.read_text(encoding="utf-8"))
                     for path in self.results.iterdir()}
            self.assertEqual(set(files), {"gs_data.json", "gs_data_shieldsio.json", "citation_history.json"})
            self.assertEqual(files["citation_history.json"], history)
            self.assertEqual(files["gs_data.json"], {
                **AUTHOR, "citedby": count, "updated": date, "citation_history": history,
                "publications": {AUTHOR["publications"][0]["author_pub_id"]: AUTHOR["publications"][0]},
            })
            self.assertEqual(files["gs_data_shieldsio.json"], {
                "schemaVersion": 1, "label": "citations", "message": str(count),
            })


if __name__ == "__main__":
    unittest.main()
