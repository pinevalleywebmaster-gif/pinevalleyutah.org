"""Export files from a shared Google Drive folder tree into public/documents."""

from __future__ import annotations

import io
import json
import os
import re
import sys
import shutil
import subprocess
import tempfile
from urllib.parse import quote
from pathlib import Path

ROOT_FOLDER_ID = os.environ.get("GOOGLE_DRIVE_FOLDER_ID", "13cYAubJBTUmxaBG4ED8RuQMQvNW9cBHF")
OUTPUT_ROOT = Path("public/documents")
PRESERVED_PDFS = [
    (Path("public/assets/surveyfinal.pdf"), Path("Pine Valley Heritage Center") / "Pine Valley Community Survey 2003.pdf"),
    (Path("public/assets/pvgenplan.pdf"), Path("Pine Valley Heritage Center") / "Pine Valley Community General Plan.pdf"),
]
SCOPES = ["https://www.googleapis.com/auth/drive.readonly"]
GOOGLE_EXPORTS = {
    "application/vnd.google-apps.document": ("application/pdf", ".pdf"),
    "application/vnd.google-apps.spreadsheet": ("application/pdf", ".pdf"),
    "application/vnd.google-apps.presentation": ("application/pdf", ".pdf"),
    "application/vnd.google-apps.drawing": ("application/pdf", ".pdf"),
}
FOLDER_MIME = "application/vnd.google-apps.folder"
WORD_MIMES = {
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.template",
    "application/vnd.ms-word.document.macroEnabled.12",
}
IMAGE_MIMES = {"image/jpeg", "image/png", "image/gif", "image/tiff", "image/bmp", "image/webp"}


def load_local_env():
    """Load simple KEY=value entries from the repo-root .env without overriding shell env."""
    env_file = Path(".env")
    if not env_file.is_file():
        return
    for line in env_file.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in ("\"", "'"):
            value = value[1:-1]
        if key:
            os.environ.setdefault(key, value)


def safe_name(name: str) -> str:
    """Keep human-readable names while excluding path separators and unsafe characters."""
    name = re.sub(r"[<>:\"/\\|?*\x00-\x1f]", "-", name).strip(" .")
    return name or "untitled"


def make_service():
    from google.oauth2 import service_account
    from googleapiclient.discovery import build

    credentials_file = os.environ.get("GOOGLE_SERVICE_ACCOUNT_FILE")
    raw_credentials = os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON")
    if credentials_file:
        credentials_path = Path(credentials_file).expanduser()
        if not credentials_path.is_absolute():
            credentials_path = Path.cwd() / credentials_path
        credentials = service_account.Credentials.from_service_account_file(
            credentials_path, scopes=SCOPES
        )
    elif raw_credentials:
        credentials = service_account.Credentials.from_service_account_info(json.loads(raw_credentials), scopes=SCOPES)
    else:
        raise RuntimeError(
            "Set GOOGLE_SERVICE_ACCOUNT_FILE in .env for local runs or configure "
            "the GOOGLE_SERVICE_ACCOUNT_JSON GitHub Actions secret."
        )
    return build("drive", "v3", credentials=credentials, cache_discovery=False)


def list_children(service, folder_id: str):
    page_token = None
    while True:
        response = service.files().list(
            q=f"'{folder_id}' in parents and trashed = false",
            pageSize=1000,
            pageToken=page_token,
            orderBy="name",
            fields="nextPageToken, files(id,name,mimeType,modifiedTime,webViewLink)",
            supportsAllDrives=True,
            includeItemsFromAllDrives=True,
        ).execute()
        yield from response.get("files", [])
        page_token = response.get("nextPageToken")
        if not page_token:
            break


def download_file(service, file_id: str, destination: Path, mime_type: str):
    from googleapiclient.http import MediaIoBaseDownload

    if mime_type in GOOGLE_EXPORTS:
        export_mime, extension = GOOGLE_EXPORTS[mime_type]
        request = service.files().export_media(fileId=file_id, mimeType=export_mime)
        destination = destination.with_suffix(extension)
    else:
        request = service.files().get_media(fileId=file_id, supportsAllDrives=True)

    destination.parent.mkdir(parents=True, exist_ok=True)
    buffer = io.FileIO(destination, "wb")
    downloader = MediaIoBaseDownload(buffer, request)
    done = False
    while not done:
        _, done = downloader.next_chunk()
    buffer.close()


def convert_office_file(source: Path, destination: Path):
    """Convert a downloaded Office document with headless LibreOffice."""
    destination.parent.mkdir(parents=True, exist_ok=True)
    profile = Path(tempfile.mkdtemp(prefix="libreoffice-profile-"))
    try:
        subprocess.run(
            ["libreoffice", f"-env:UserInstallation={profile.as_uri()}", "--headless", "--convert-to", "pdf", "--outdir", str(destination.parent), str(source)],
            check=True,
            capture_output=True,
            text=True,
        )
    except (OSError, subprocess.CalledProcessError) as error:
        raise RuntimeError(f"Could not convert Office document {source.name} to PDF: {error}") from error
    generated = destination.parent / f"{source.stem}.pdf"
    if not generated.exists():
        raise RuntimeError(f"LibreOffice did not create the expected PDF for {source.name}")
    if generated != destination:
        generated.replace(destination)


def convert_image_file(source: Path, destination: Path):
    """Convert an image into a one-page PDF using Pillow."""
    from PIL import Image

    destination.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as image:
        if image.mode not in ("RGB", "L"):
            image = image.convert("RGB")
        image.save(destination, "PDF", resolution=150.0)


def walk(service, output_root: Path, folder_id: str, relative_dir: Path, seen_paths: set[Path], manifest: list[dict]):
    for item in list_children(service, folder_id):
        name = safe_name(item["name"])
        if item["mimeType"] == FOLDER_MIME:
            walk(service, output_root, item["id"], relative_dir / name, seen_paths, manifest)
            continue

        mime_type = item["mimeType"]
        supported_upload = mime_type in WORD_MIMES or mime_type in IMAGE_MIMES
        if mime_type not in GOOGLE_EXPORTS and mime_type != "application/pdf" and not supported_upload:
            print(f"Skipping unsupported file: {item['name']} ({mime_type})")
            continue

        output = output_root / relative_dir / f"{safe_name(Path(name).stem)}.pdf"
        if output in seen_paths:
            output = output.with_name(f"{output.stem} [{safe_name(item['id'])}].pdf")
            if output in seen_paths:
                raise RuntimeError(f"Drive file ID collision at output path: {output}")
        seen_paths.add(output)
        if mime_type in WORD_MIMES or mime_type in IMAGE_MIMES:
            temporary_source = output.with_name(f"{output.stem}{Path(name).suffix}")
            download_file(service, item["id"], temporary_source, mime_type)
            try:
                if mime_type in WORD_MIMES:
                    convert_office_file(temporary_source, output)
                else:
                    convert_image_file(temporary_source, output)
            finally:
                temporary_source.unlink(missing_ok=True)
        else:
            download_file(service, item["id"], output, mime_type)
        print(f"Exported {item['name']} -> {output}")
        manifest.append({
            "title": Path(output.name).stem.replace("-", " ").replace("_", " "),
            "relativePath": output.relative_to(output_root).as_posix(),
            "href": "/documents/" + "/".join(quote(part) for part in output.relative_to(output_root).parts),
            "sourceId": item["id"],
            "sourceName": item["name"],
            "sourcePath": (relative_dir / name).as_posix(),
        })


def main():
    service = make_service()
    OUTPUT_ROOT.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="drive-pdfs-") as temporary_dir:
        staged_root = Path(temporary_dir) / "documents"
        staged_root.mkdir()
        seen_paths: set[Path] = set()
        manifest: list[dict] = []
        walk(service, staged_root, ROOT_FOLDER_ID, Path(), seen_paths, manifest)
        for source, relative_output in PRESERVED_PDFS:
            if source.exists():
                destination = staged_root / relative_output
                destination.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(source, destination)
                relative_path = destination.relative_to(staged_root).as_posix()
                manifest.append({
                    "title": destination.stem,
                    "relativePath": relative_path,
                    "href": "/documents/" + "/".join(quote(part) for part in Path(relative_path).parts),
                    "sourceId": "site-asset",
                    "sourceName": source.name,
                    "sourcePath": relative_path,
                })
        (staged_root / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
        (staged_root / "README.md").write_text(
            "PDF exports from the public Google Drive document repository. Folder structure mirrors Google Drive.\n",
            encoding="utf-8",
        )
        if OUTPUT_ROOT.exists():
            shutil.rmtree(OUTPUT_ROOT)
        shutil.copytree(staged_root, OUTPUT_ROOT)


if __name__ == "__main__":
    try:
        load_local_env()
        ROOT_FOLDER_ID = os.environ.get("GOOGLE_DRIVE_FOLDER_ID", ROOT_FOLDER_ID)
        main()
    except Exception as error:
        print(f"Drive PDF export failed: {error}", file=sys.stderr)
        raise
