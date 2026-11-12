import importlib.util
import sys
import tempfile
from types import ModuleType, SimpleNamespace
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


class FakeHttpError(Exception):
    def __init__(self, status):
        super().__init__(f"HTTP {status}")
        self.resp = SimpleNamespace(status=status)


def fake_google_download_modules(downloader_class):
    google_package = ModuleType("googleapiclient")
    google_package.__path__ = []
    http_module = ModuleType("googleapiclient.http")
    http_module.MediaIoBaseDownload = downloader_class
    errors_module = ModuleType("googleapiclient.errors")
    errors_module.HttpError = FakeHttpError
    return {
        "googleapiclient": google_package,
        "googleapiclient.http": http_module,
        "googleapiclient.errors": errors_module,
    }


class FakeDownloadFiles:
    def __init__(self, request):
        self.request = request
        self.calls = []

    def get_media(self, **kwargs):
        self.calls.append(("get_media", kwargs))
        return self.request

    def export_media(self, **kwargs):
        self.calls.append(("export_media", kwargs))
        return self.request


class FakeDownloadService:
    def __init__(self, request):
        self._files = FakeDownloadFiles(request)

    def files(self):
        return self._files


class ExportDrivePdfsTests(unittest.TestCase):
    def test_safe_names_remove_path_separators_controls_and_empty_names(self):
        self.assertEqual(exporter.safe_name("folder\\subfolder/name?.pdf"), "folder-subfolder-name-.pdf")
        self.assertEqual(exporter.safe_name(" name with trailing. "), "name with trailing")
        self.assertEqual(exporter.safe_name("\x00\x1f"), "--")
        self.assertEqual(exporter.safe_name(""), "untitled")

    def test_list_children_follows_all_pages_and_requests_shared_drive_metadata(self):
        responses = [
            {"files": [{"id": "one"}], "nextPageToken": "page-two"},
            {"files": [{"id": "two"}]},
        ]

        class PagedRequest:
            def execute(self):
                return responses.pop(0)

        class PagedFiles:
            def __init__(self):
                self.calls = []

            def list(self, **kwargs):
                self.calls.append(kwargs)
                return PagedRequest()

        class PagedService:
            def __init__(self):
                self.file_api = PagedFiles()

            def files(self):
                return self.file_api

        service = PagedService()
        self.assertEqual(list(exporter.list_children(service, "parent-id")), [{"id": "one"}, {"id": "two"}])
        self.assertEqual(len(service.file_api.calls), 2)
        self.assertIsNone(service.file_api.calls[0]["pageToken"])
        self.assertEqual(service.file_api.calls[1]["pageToken"], "page-two")
        self.assertTrue(service.file_api.calls[0]["supportsAllDrives"])
        self.assertTrue(service.file_api.calls[0]["includeItemsFromAllDrives"])

    def test_unsupported_files_are_skipped_without_download_or_manifest_entries(self):
        service = FakeService([{
            "id": "unsupported",
            "name": "Archive Package",
            "mimeType": "application/zip",
        }])
        with tempfile.TemporaryDirectory(dir=TEMP_ROOT) as tmp:
            root = Path(tmp)
            manifest = []
            with patch.object(exporter, "download_file") as download:
                exporter.walk(service, root, "folder", Path(), set(), manifest)

        download.assert_not_called()
        self.assertEqual(manifest, [])

    def test_google_workspace_mime_types_all_export_to_pdf(self):
        for index, mime_type in enumerate(exporter.GOOGLE_EXPORTS):
            with self.subTest(mime_type=mime_type), tempfile.TemporaryDirectory(dir=TEMP_ROOT) as tmp:
                service = FakeService([{
                    "id": f"workspace-{index}",
                    "name": f"Workspace item {index}",
                    "mimeType": mime_type,
                }])
                manifest = []
                with patch.object(exporter, "download_file") as download:
                    exporter.walk(service, Path(tmp), "folder", Path(), set(), manifest)

                self.assertEqual(download.call_args.args[2].name, f"Workspace item {index}.pdf")
                self.assertEqual(manifest[0]["relativePath"], f"Workspace item {index}.pdf")

    def test_excluded_folders_are_not_traversed(self):
        drive = {
            "root": [
                {"id": "excluded", "name": "Pine Valley Heritage Center", "mimeType": exporter.FOLDER_MIME},
                {"id": "kept", "name": "Public Folder", "mimeType": exporter.FOLDER_MIME},
            ],
            "excluded": [{"id": "private", "name": "Private.pdf", "mimeType": "application/pdf"}],
            "kept": [],
        }
        service = FakeService(drive)
        with tempfile.TemporaryDirectory(dir=TEMP_ROOT) as tmp:
            exporter.walk(service, Path(tmp), "root", Path(), set(), [])

        self.assertEqual(service._files.parent_id, "kept")
        self.assertFalse((Path(tmp) / "Pine Valley Heritage Center").exists())

    def test_event_folder_creation_time_is_added_to_each_exported_document(self):
        created_time = "2026-01-02T03:04:05.000Z"
        drive = {
            "root": [{"id": "events", "name": "Community Events", "mimeType": exporter.FOLDER_MIME}],
            "events": [{"id": "event", "name": "Sample Event", "mimeType": exporter.FOLDER_MIME, "createdTime": created_time}],
            "event": [{"id": "flyers", "name": "Flyers", "mimeType": exporter.FOLDER_MIME}],
            "flyers": [{"id": "flyer", "name": "Notice.pdf", "mimeType": "application/pdf"}],
        }
        with tempfile.TemporaryDirectory(dir=TEMP_ROOT) as tmp:
            manifest = []
            with patch.object(exporter, "download_file"):
                exporter.walk(FakeService(drive), Path(tmp), "root", Path(), set(), manifest)

        self.assertEqual(manifest[0]["eventAddedTime"], created_time)
        self.assertEqual(manifest[0]["sourcePath"], "Community Events/Sample Event/Flyers/Notice.pdf")

    def test_download_retries_transient_errors_and_discards_partial_bytes(self):
        class Request:
            attempts = 0

        class Downloader:
            def __init__(self, stream, request):
                self.stream = stream
                self.request = request
                self.attempt = request.attempts
                request.attempts += 1

            def next_chunk(self):
                if self.attempt == 0:
                    self.stream.write(b"partial response")
                    raise FakeHttpError(500)
                self.stream.write(b"complete response")
                return None, True

        request = Request()
        service = FakeDownloadService(request)
        with tempfile.TemporaryDirectory(dir=TEMP_ROOT) as tmp:
            destination = Path(tmp) / "document.pdf"
            with patch.dict(sys.modules, fake_google_download_modules(Downloader)), \
                    patch.object(exporter.time, "sleep") as sleep:
                exporter.download_file(service, "file-id", destination, "application/pdf")

            self.assertEqual(destination.read_bytes(), b"complete response")
            self.assertEqual(request.attempts, 2)
            sleep.assert_called_once_with(1)

    def test_download_does_not_retry_permanent_errors_and_removes_partial_file(self):
        class Request:
            attempts = 0

        class Downloader:
            def __init__(self, stream, request):
                self.stream = stream
                self.request = request
                request.attempts += 1

            def next_chunk(self):
                self.stream.write(b"partial response")
                raise FakeHttpError(404)

        request = Request()
        with tempfile.TemporaryDirectory(dir=TEMP_ROOT) as tmp:
            destination = Path(tmp) / "document.pdf"
            with patch.dict(sys.modules, fake_google_download_modules(Downloader)), \
                    patch.object(exporter.time, "sleep") as sleep:
                with self.assertRaises(FakeHttpError):
                    exporter.download_file(FakeDownloadService(request), "file-id", destination, "application/pdf")

            self.assertFalse(destination.exists())
            self.assertEqual(request.attempts, 1)
            sleep.assert_not_called()

    def test_download_stops_after_bounded_transient_retries(self):
        class Request:
            attempts = 0

        class Downloader:
            def __init__(self, _stream, request):
                self.request = request
                request.attempts += 1

            def next_chunk(self):
                raise FakeHttpError(503)

        request = Request()
        with tempfile.TemporaryDirectory(dir=TEMP_ROOT) as tmp:
            destination = Path(tmp) / "document.pdf"
            with patch.dict(sys.modules, fake_google_download_modules(Downloader)), \
                    patch.object(exporter.time, "sleep") as sleep:
                with self.assertRaises(FakeHttpError):
                    exporter.download_file(FakeDownloadService(request), "file-id", destination, "application/pdf")

            self.assertEqual(request.attempts, exporter.DOWNLOAD_RETRIES)
            self.assertEqual([call.args[0] for call in sleep.call_args_list], [1, 2, 4, 8])
            self.assertFalse(destination.exists())

    def test_google_workspace_download_uses_export_media_and_pdf_extension(self):
        class Request:
            pass

        class Downloader:
            def __init__(self, stream, _request):
                self.stream = stream

            def next_chunk(self):
                self.stream.write(b"%PDF-export")
                return None, True

        request = Request()
        service = FakeDownloadService(request)
        with tempfile.TemporaryDirectory(dir=TEMP_ROOT) as tmp:
            requested_destination = Path(tmp) / "workspace-file.doc"
            with patch.dict(sys.modules, fake_google_download_modules(Downloader)):
                exporter.download_file(service, "workspace-id", requested_destination, "application/vnd.google-apps.document")

            output = requested_destination.with_suffix(".pdf")
            self.assertEqual(output.read_bytes(), b"%PDF-export")
            self.assertEqual(service._files.calls, [("export_media", {
                "fileId": "workspace-id",
                "mimeType": "application/pdf",
            })])

    def test_image_conversion_writes_a_pdf_and_converts_unsupported_modes(self):
        class FakeImage:
            def __init__(self, mode):
                self.mode = mode
                self.converted_to = None
                self.saved = None

            def __enter__(self):
                return self

            def __exit__(self, *_args):
                return False

            def convert(self, mode):
                self.converted_to = mode
                return FakeImage(mode)

            def save(self, destination, file_format, resolution):
                self.saved = (file_format, resolution)
                Path(destination).write_bytes(b"%PDF-image")

        class FakeImageModule(ModuleType):
            def __init__(self, name):
                super().__init__(name)
                self.opened = []

            def open(self, _source):
                image = FakeImage("RGBA")
                self.opened.append(image)
                return image

        pil_module = ModuleType("PIL")
        image_module = FakeImageModule("PIL.Image")
        pil_module.Image = image_module
        with tempfile.TemporaryDirectory(dir=TEMP_ROOT) as tmp:
            source = Path(tmp) / "input.png"
            source.write_bytes(b"image input")
            destination = Path(tmp) / "output.pdf"
            with patch.dict(sys.modules, {"PIL": pil_module, "PIL.Image": image_module}):
                exporter.convert_image_file(source, destination)

            self.assertEqual(destination.read_bytes(), b"%PDF-image")
            self.assertEqual(image_module.opened[0].converted_to, "RGB")

    def test_office_conversion_moves_pdf_to_requested_destination_and_cleans_profile(self):
        real_temporary_directory = tempfile.TemporaryDirectory
        profile_paths = []

        class TrackingTemporaryDirectory:
            def __init__(self, **kwargs):
                self.manager = real_temporary_directory(**kwargs)

            def __enter__(self):
                profile = self.manager.__enter__()
                profile_paths.append(Path(profile))
                return profile

            def __exit__(self, *args):
                return self.manager.__exit__(*args)

        with tempfile.TemporaryDirectory(dir=TEMP_ROOT) as tmp:
            source = Path(tmp) / "source.docx"
            source.write_bytes(b"office input")
            destination = Path(tmp) / "published-name.pdf"

            def fake_run(command, **kwargs):
                output_dir = Path(command[command.index("--outdir") + 1])
                (output_dir / "source.pdf").write_bytes(b"%PDF-office")

            with patch.object(exporter.tempfile, "TemporaryDirectory", TrackingTemporaryDirectory), \
                    patch.object(exporter.subprocess, "run", side_effect=fake_run) as run:
                exporter.convert_office_file(source, destination)

            self.assertEqual(destination.read_bytes(), b"%PDF-office")
            self.assertFalse((Path(tmp) / "source.pdf").exists())
            self.assertEqual(len(profile_paths), 1)
            self.assertFalse(profile_paths[0].exists())
            self.assertTrue(run.call_args.kwargs["check"])

    def test_office_conversion_reports_missing_converter_output(self):
        with tempfile.TemporaryDirectory(dir=TEMP_ROOT) as tmp:
            source = Path(tmp) / "source.docx"
            source.write_bytes(b"office input")
            with patch.object(exporter.subprocess, "run"):
                with self.assertRaisesRegex(RuntimeError, "did not create the expected PDF"):
                    exporter.convert_office_file(source, Path(tmp) / "output.pdf")

    def test_event_folders_keep_flyers_as_pdfs_and_photos_as_images(self):
        drive = {
            "root": [{"id": "events", "name": "Community Events", "mimeType": exporter.FOLDER_MIME}],
            "events": [{"id": "sample-event", "name": "Sample Event", "mimeType": exporter.FOLDER_MIME}],
            "sample-event": [
                {"id": "flyers", "name": "Flyers", "mimeType": exporter.FOLDER_MIME},
                {"id": "photos", "name": "Photos", "mimeType": exporter.FOLDER_MIME},
            ],
            "flyers": [{"id": "flyer", "name": "Event Flyer.pdf", "mimeType": "application/pdf"}],
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
            flyer = destination / "Community Events" / "Sample Event" / "Flyers" / "Event Flyer.pdf"
            photo = destination / "Community Events" / "Sample Event" / "Photos" / "Decorations.JPG"
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

    def test_repeated_duplicate_id_fails_instead_of_overwriting_an_output(self):
        duplicate = {"id": "same-id", "name": "Repeated.pdf", "mimeType": "application/pdf"}
        with tempfile.TemporaryDirectory(dir=TEMP_ROOT) as tmp:
            with patch.object(exporter, "download_file"):
                with self.assertRaisesRegex(RuntimeError, "Drive file ID collision"):
                    exporter.walk(FakeService([duplicate, duplicate, duplicate]), Path(tmp), "folder", Path(), set(), [])

    def test_failed_office_conversion_removes_temporary_source_and_does_not_add_manifest_entry(self):
        item = {"id": "office-file", "name": "Source document.docx", "mimeType": next(iter(exporter.WORD_MIMES))}
        with tempfile.TemporaryDirectory(dir=TEMP_ROOT) as tmp:
            root = Path(tmp)

            def fake_download(_service, _file_id, destination, _mime_type):
                destination.parent.mkdir(parents=True, exist_ok=True)
                destination.write_bytes(b"source bytes")

            manifest = []
            with patch.object(exporter, "download_file", side_effect=fake_download), \
                    patch.object(exporter, "convert_office_file", side_effect=RuntimeError("conversion failed")):
                with self.assertRaisesRegex(RuntimeError, "conversion failed"):
                    exporter.walk(FakeService([item]), root, "folder", Path(), set(), manifest)

            self.assertFalse((root / "Source document.docx").exists())
            self.assertFalse((root / "Source document.pdf").exists())
            self.assertEqual(manifest, [])

    def test_failed_export_keeps_existing_public_output_untouched(self):
        with tempfile.TemporaryDirectory(dir=TEMP_ROOT) as tmp:
            output_root = Path(tmp) / "public" / "documents"
            output_root.mkdir(parents=True)
            sentinel = output_root / "existing.pdf"
            sentinel.write_bytes(b"previous published version")

            with patch.object(exporter, "OUTPUT_ROOT", output_root), \
                    patch.object(exporter, "make_service", return_value=object()), \
                    patch.object(exporter, "walk", side_effect=RuntimeError("Drive unavailable")):
                with self.assertRaisesRegex(RuntimeError, "Drive unavailable"):
                    exporter.main()

            self.assertEqual(sentinel.read_bytes(), b"previous published version")

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
