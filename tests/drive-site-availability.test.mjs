import assert from "node:assert/strict";
import test from "node:test";

const siteOrigin = process.env.SITE_ORIGIN ?? "https://pinevalleyutah.org";
const driveFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID ?? "13cYAubJBTUmxaBG4ED8RuQMQvNW9cBHF";
const driveView = (folderId) => `https://drive.google.com/embeddedfolderview?id=${encodeURIComponent(folderId)}`;

// These Drive folders are intentionally withheld by scripts/export_drive_pdfs.py.
// Keep this list in sync if the site owner requests additional exclusions.
const excludedFolderNames = [
  "Pine Valley Heritage Center",
  "PVHAC Meeting Minutes",
];

const supportedExtensions = new Set([".pdf", ".doc", ".docx", ".dot", ".dotx", ".rtf", ".odt", ".png", ".jpg", ".jpeg", ".gif", ".tif", ".tiff", ".bmp", ".webp"]);
const imageExtensions = new Set([".png", ".jpg", ".jpeg", ".gif", ".tif", ".tiff", ".bmp", ".webp"]);
const safeName = (name) => name.replace(/[<>:"/\\|?*\x00-\x1f]/g, "-").replace(/[ .]+$/g, "").trim() || "untitled";
const htmlEscape = (value) => value
  .replaceAll("&amp;", "&")
  .replaceAll("&quot;", '"')
  .replaceAll("&#39;", "'")
  .replaceAll("&lt;", "<")
  .replaceAll("&gt;", ">");

async function fetchText(url) {
  const response = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(20_000) });
  assert.ok(response.ok, `GET ${url} returned HTTP ${response.status}`);
  return response.text();
}

async function checkLiveUrl(url) {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await fetch(url, { method: "HEAD", redirect: "follow", signal: AbortSignal.timeout(20_000) });
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

async function readDriveFolder(folderId, pathParts, inheritedExcluded = false) {
  const html = await fetchText(driveView(folderId));
  const entries = [...html.matchAll(/<div class="flip-entry" id="entry-([^\"]+)"[\s\S]*?<div class="flip-entry-title">([\s\S]*?)<\/div>[\s\S]*?<\/div>\s*<div class="flip-entry-last-modified">/g)];
  const documents = [];

  for (const [, id, rawName] of entries) {
    const name = safeName(htmlEscape(rawName.replace(/<[^>]*>/g, "").trim()));
    if (!name) continue;

    const entryStart = html.indexOf(`id="entry-${id}"`);
    const nextEntry = html.indexOf('<div class="flip-entry"', entryStart + 1);
    const markup = html.slice(entryStart, nextEntry === -1 ? undefined : nextEntry);
    const isFolder = /aria-label="Folder"/.test(markup);
    const excluded = inheritedExcluded || excludedFolderNames.some((excludedName) =>
      excludedName.toLocaleLowerCase() === name.toLocaleLowerCase()
      || (excludedName === "PVHAC Meeting Minutes" && name.toLocaleLowerCase().startsWith("pvhac")));

    if (isFolder) {
      if (!excluded) documents.push(...await readDriveFolder(id, [...pathParts, name], false));
      continue;
    }
    if (excluded) continue;

    const extension = name.match(/\.[^.]+$/)?.[0]?.toLocaleLowerCase() ?? "";
    if (!supportedExtensions.has(extension)) continue;
    const inEventPhotos = pathParts.some((part) => part.toLocaleLowerCase() === "community events")
      && pathParts.some((part) => part.toLocaleLowerCase() === "photos");
    const keepImage = inEventPhotos && imageExtensions.has(extension);
    const stem = name.slice(0, -extension.length);
    const publishedName = keepImage ? name : `${safeName(stem)}.pdf`;
    documents.push({ path: [...pathParts, publishedName], source: name, id });
  }
  return documents;
}

function liveUrl(parts) {
  return `${siteOrigin.replace(/\/$/, "")}/documents/${parts.map(encodeURIComponent).join("/")}`;
}

test("public Drive documents are available from the live website", async () => {
  const documents = await readDriveFolder(driveFolderId, []);
  assert.ok(documents.length > 0, "No public Drive documents were found; check the folder ID or Drive availability.");

  const missing = [];
  const unavailable = [];
  let nextIndex = 0;
  const workers = Array.from({ length: 16 }, async () => {
    while (nextIndex < documents.length) {
      const document = documents[nextIndex++];
      const url = liveUrl(document.path);
      try {
        const response = await checkLiveUrl(url);
        if (!response.ok) missing.push(`${document.path.join("/")} (HTTP ${response.status})`);
      } catch (error) {
        unavailable.push(`${url} (${error.message})`);
      }
    }
  });
  await Promise.all(workers);

  assert.deepEqual(unavailable, [], `Could not check live site URLs:\n${unavailable.join("\n")}`);
  assert.deepEqual(missing, [], `Drive documents not found on the live site:\n${missing.join("\n")}`);
}, { timeout: 10 * 60_000 });
