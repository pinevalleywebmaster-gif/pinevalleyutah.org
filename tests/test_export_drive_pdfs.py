import importlib.util
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch


SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "export_drive_pdfs.py"
TEMP_ROOT = SCRIPT.parents[1] / ".scratch"
SPEC = importlib.util.spec_from_file_location("export_drive_pdfs", SCRIPT)
exporter = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(exporter)


class FakeFiles:
    def __init__(self, files):
        self.items = files

    def list(self, **_kwargs):
        return self

    def execute(self):
        return {"files": self.items}


class FakeService:
    def __init__(self, files):
        self._files = FakeFiles(files)

    def files(self):
        return self._files


class ExportDrivePdfsTests(unittest.TestCase):
    def test_locally_curated_community_events_are_preserved_until_drive_replaces_them(self):
        with tempfile.TemporaryDirectory(dir=TEMP_ROOT) as tmp:
            root = Path(tmp)
            local = root / "local" / "Community Events"
            local.mkdir(parents=True)
            (local / "halloween-trunk-or-treat.pdf").write_bytes(b"%PDF-local")
            destination = root / "staged"
            destination.mkdir()
            manifest = []

            with patch.object(exporter, "OUTPUT_ROOT", root / "local"):
                exporter.preserve_local_community_events(destination, manifest)

            preserved = destination / "Community Events" / "halloween-trunk-or-treat.pdf"
            self.assertEqual(preserved.read_bytes(), b"%PDF-local")
            self.assertEqual(manifest[0]["href"], "/documents/Community%20Events/halloween-trunk-or-treat.pdf")

            # A later Drive folder can use a human-readable name with different punctuation.
            future_drive = root / "future-drive"
            drive_events = future_drive / "Community Events"
            drive_events.mkdir(parents=True)
            (drive_events / "Halloween Trunk or Treat.pdf").write_bytes(b"%PDF-drive")
            second_manifest = []
            with patch.object(exporter, "OUTPUT_ROOT", root / "local"):
                exporter.preserve_local_community_events(future_drive, second_manifest)
            self.assertFalse((drive_events / "halloween-trunk-or-treat.pdf").exists())
            self.assertEqual((drive_events / "Halloween Trunk or Treat.pdf").read_bytes(), b"%PDF-drive")
            self.assertEqual(second_manifest, [])

    def test_word_documents_and_images_are_converted_to_pdf(self):
        files = [
            {"id": "word-1", "name": "Annual Report.doc", "mimeType": "application/msword"},
            {"id": "image-1", "name": "Notice.jpg", "mimeType": "image/jpeg"},
        ]
        with tempfile.TemporaryDirectory(dir=TEMP_ROOT) as tmp:
            root = Path(tmp)
            with patch.object(exporter, "download_file") as download, \
                    patch.object(exporter, "convert_office_file") as office, \
                    patch.object(exporter, "convert_image_file") as image:
                exporter.walk(FakeService(files), root, "folder", Path(), set(), [])

        self.assertEqual(download.call_count, 2)
        self.assertEqual(office.call_args.args[1].name, "Annual Report.pdf")
        self.assertEqual(image.call_args.args[1].name, "Notice.pdf")

    def test_duplicate_names_get_distinct_outputs(self):
        files = [
            {"id": "first", "name": "Minutes.pdf", "mimeType": "application/pdf"},
            {"id": "second", "name": "Minutes.pdf", "mimeType": "application/pdf"},
        ]
        with tempfile.TemporaryDirectory(dir=TEMP_ROOT) as tmp:
            root = Path(tmp)
            with patch.object(exporter, "download_file") as download:
                manifest = []
                exporter.walk(FakeService(files), root, "folder", Path(), set(), manifest)

        outputs = [call.args[2] for call in download.call_args_list]
        self.assertEqual(len(set(outputs)), 2)
        self.assertEqual({path.name for path in outputs}, {"Minutes.pdf", "Minutes [second].pdf"})
        self.assertEqual(len(manifest), 2)

    def test_google_workspace_documents_still_export_as_pdf(self):
        files = [{
            "id": "gdoc-1",
            "name": "Meeting Notes",
            "mimeType": "application/vnd.google-apps.document",
        }]
        with tempfile.TemporaryDirectory(dir=TEMP_ROOT) as tmp:
            root = Path(tmp)
            with patch.object(exporter, "download_file") as download:
                manifest = []
                exporter.walk(FakeService(files), root, "folder", Path(), set(), manifest)

        self.assertEqual(download.call_args.args[2].name, "Meeting Notes.pdf")
        self.assertEqual(manifest[0]["relativePath"], "Meeting Notes.pdf")


if __name__ == "__main__":
    unittest.main()
