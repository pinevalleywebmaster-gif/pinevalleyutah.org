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
        self.parent_id = None

    def list(self, **kwargs):
        query = kwargs.get("q", "")
        self.parent_id = query.split("'", 2)[1] if "'" in query else None
        return self

    def execute(self):
        items = self.items.get(self.parent_id, []) if isinstance(self.items, dict) else self.items
        return {"files": items}


class FakeService:
    def __init__(self, files):
        self._files = FakeFiles(files)

    def files(self):
        return self._files


class ExportDrivePdfsTests(unittest.TestCase):
    def test_event_folders_keep_flyers_as_pdfs_and_photos_as_images(self):
        drive = {
            "root": [{"id": "events", "name": "Community Events", "mimeType": exporter.FOLDER_MIME}],
            "events": [{"id": "halloween", "name": "Halloween Party 2026", "mimeType": exporter.FOLDER_MIME}],
            "halloween": [
                {"id": "flyers", "name": "Flyers", "mimeType": exporter.FOLDER_MIME},
                {"id": "photos", "name": "Photos", "mimeType": exporter.FOLDER_MIME},
            ],
            "flyers": [{"id": "flyer", "name": "Halloween Flyer.pdf", "mimeType": "application/pdf"}],
            "photos": [{"id": "photo", "name": "Decorations.JPG", "mimeType": "image/jpeg"}],
        }
        with tempfile.TemporaryDirectory(dir=TEMP_ROOT) as tmp:
            root = Path(tmp)
            destination = root / "staged"
            manifest = []

            def fake_download(_service, file_id, output, _mime_type):
                output.parent.mkdir(parents=True, exist_ok=True)
                output.write_bytes(b"%PDF-flyer" if file_id == "flyer" else b"\xff\xd8\xff-photo")

            with patch.object(exporter, "download_file", side_effect=fake_download) as download:
                exporter.walk(FakeService(drive), destination, "root", Path(), set(), manifest)
            flyer = destination / "Community Events" / "Halloween Party 2026" / "Flyers" / "Halloween Flyer.pdf"
            photo = destination / "Community Events" / "Halloween Party 2026" / "Photos" / "Decorations.JPG"
            self.assertTrue(flyer.is_file())
            self.assertTrue(photo.is_file())
            self.assertEqual(flyer.read_bytes(), b"%PDF-flyer")
            self.assertEqual(photo.read_bytes(), b"\xff\xd8\xff-photo")
            self.assertEqual([entry.get("type") for entry in manifest], [None, "image"])
            self.assertEqual(download.call_args_list[1].args[2].suffix, ".JPG")

    def test_empty_event_photo_folders_are_preserved_in_sync_output(self):
        drive = {
            "event": [{"id": "photos", "name": "Photos", "mimeType": exporter.FOLDER_MIME}],
            "photos": [],
        }
        with tempfile.TemporaryDirectory(dir=TEMP_ROOT) as tmp:
            root = Path(tmp)
            exporter.walk(FakeService(drive), root, "event", Path("Community Events") / "Test Event", set(), [])
            marker = root / "Community Events" / "Test Event" / "Photos" / ".gitkeep"
            self.assertTrue(marker.is_file())

    def test_flyer_previews_render_from_pdf_in_the_same_folder(self):
        with tempfile.TemporaryDirectory(dir=TEMP_ROOT) as tmp:
            root = Path(tmp)
            flyer = root / "Community Events" / "Test Event" / "Flyers" / "notice.pdf"
            flyer.parent.mkdir(parents=True)
            flyer.write_bytes(b"%PDF-test")

            with patch.object(exporter.subprocess, "run") as run:
                exporter.generate_community_flyer_previews(root)

        self.assertEqual(run.call_args.args[0][-2:], [str(flyer), str(flyer.with_suffix(""))])

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
