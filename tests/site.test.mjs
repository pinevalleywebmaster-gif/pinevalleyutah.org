import assert from "node:assert/strict";
import { access, readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { createServer } from "node:http";
import test from "node:test";
import { fileURLToPath } from "node:url";

const siteDirectory = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outputDirectory = path.join(siteDirectory, "out");
const pages = [
  "index.html",
  "pvssd/index.html",
  "community-events/index.html",
  "community-events/halloween-party-2026/photos/index.html",
  "community-events/pine-valley-garden-club-october-2026/photos/index.html",
  "community-watch/index.html",
  "fire-department/index.html",
  "pvlad/index.html",
  "overlay-zone/index.html",
];

for (const file of pages) {
  test(`${file} is exported with a title`, async () => {
    const html = await readFile(path.join(outputDirectory, file), "utf8");
    assert.match(html, /<title>[^<]+<\/title>/i);
  });
}

test("all referenced public assets exist", async () => {
  for (const file of pages) {
    const html = await readFile(path.join(outputDirectory, file), "utf8");
    const references = [...html.matchAll(/(?:href|src)=["'](\/assets\/[^"'?#]+)[^"']*["']/gi)];
    for (const [, reference] of references) {
      await assert.doesNotReject(access(path.join(outputDirectory, reference)), `${file} references missing asset: ${reference}`);
    }
  }
});

test("every rendered document download across topic sections resolves to a real PDF", async (context) => {
  const server = createServer(async (request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    const requestedFile = path.resolve(outputDirectory, `.${pathname}`);
    if (!requestedFile.startsWith(`${outputDirectory}${path.sep}`)) {
      response.writeHead(400).end();
      return;
    }

    try {
      const details = await stat(requestedFile);
      if (!details.isFile()) throw new Error("not a file");
      const extension = path.extname(requestedFile).toLowerCase();
      const contentType = extension === ".pdf" ? "application/pdf"
        : extension === ".png" ? "image/png"
        : extension === ".webp" ? "image/webp"
        : extension === ".gif" ? "image/gif"
        : "image/jpeg";
      response.writeHead(200, { "content-type": contentType, "content-length": details.size });
      response.end(await readFile(requestedFile));
    } catch {
      response.writeHead(404).end("Not found");
    }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  context.after(() => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())));
  const address = server.address();
  const origin = `http://127.0.0.1:${address.port}`;
  const pagesWithDownloads = new Map([
    ["index.html", ["/documents/Community%20Events/Halloween%20Party%202026/Flyers/halloween-trunk-or-treat.pdf", "/documents/Community%20Events/Pine%20Valley%20Garden%20Club%20October%202026/Flyers/pine-valley-gardening-club-october.pdf"]],
    ["community-events/index.html", ["/documents/Community%20Events/Halloween%20Party%202026/Flyers/halloween-trunk-or-treat.pdf", "/documents/Community%20Events/Pine%20Valley%20Garden%20Club%20October%202026/Flyers/pine-valley-gardening-club-october.pdf"]],
    ["pvssd/index.html", null],
    ["pvlad/index.html", null],
    ["overlay-zone/index.html", null],
  ]);

  async function publicDrivePdfs(directory, relativePath = "") {
    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch (error) {
      if (error.code === "ENOENT") return [];
      throw error;
    }
    return (await Promise.all(entries.map(async (entry) => {
      const childPath = path.join(directory, entry.name);
      const childRelative = path.posix.join(relativePath, entry.name);
      if (entry.isDirectory()) return publicDrivePdfs(childPath, childRelative);
      return entry.isFile() && entry.name.toLowerCase().endsWith(".pdf") ? [childRelative] : [];
    }))).flat();
  }

  async function publicPhotos(directory, relativePath = "") {
    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch (error) {
      if (error.code === "ENOENT") return [];
      throw error;
    }
    return (await Promise.all(entries.map(async (entry) => {
      const childPath = path.join(directory, entry.name);
      const childRelative = path.posix.join(relativePath, entry.name);
      if (entry.isDirectory()) return publicPhotos(childPath, childRelative);
      return entry.isFile() && /\.(?:avif|gif|jpe?g|png|webp)$/i.test(entry.name) ? [childRelative] : [];
    }))).flat();
  }

  const drivePdfPaths = await publicDrivePdfs(path.join(siteDirectory, "public", "documents"));
  for (const drivePath of drivePdfPaths) {
    const topic = drivePath.toLowerCase();
    const targetPage = topic.includes("community events") ? "community-events/index.html"
      : topic.includes("pvssd") || topic.includes("2025 audit report") || topic.includes("screenshot_") ? "pvssd/index.html"
      : topic.includes("pvlad") ? "pvlad/index.html"
      : topic.includes("overlay") || topic.includes("pvoz") || topic.includes("str revisions") ? "overlay-zone/index.html"
      : null;
    assert.ok(targetPage, `No topic section is assigned to document: ${drivePath}`);
    if (!pagesWithDownloads.has(targetPage) || pagesWithDownloads.get(targetPage) === null) pagesWithDownloads.set(targetPage, []);
    pagesWithDownloads.get(targetPage).push(`/documents/${drivePath.split(/[\\/]/).map(encodeURIComponent).join("/")}`);
  }

  for (const [pageFile, expectedDownloads] of pagesWithDownloads) {
    const html = await readFile(path.join(outputDirectory, pageFile), "utf8");
    if (["pvssd/index.html", "pvlad/index.html", "overlay-zone/index.html"].includes(pageFile)) {
      assert.match(html, /documents/i, `${pageFile} should render its document section heading`);
      if (expectedDownloads === null) {
        assert.match(html, /No (?:PVSSD|PVLAD|Overlay Zone) PDFs are synced yet/i, `${pageFile} should explain why the list is empty`);
      }
    }
    const renderedDownloads = [...html.matchAll(/<a\b[^>]*>/gi)].flatMap(([tag]) => {
      if (!/\sdownload(?:="[^"]*")?(?:\s|>)/i.test(tag)) return [];
      const href = tag.match(/\bhref="([^"]+)"/i)?.[1]?.replaceAll("&amp;", "&");
      return href?.toLowerCase().endsWith(".pdf") ? [href] : [];
    });
    if (expectedDownloads !== null) {
      for (const downloadPath of expectedDownloads) {
        assert.ok(renderedDownloads.includes(downloadPath), `${pageFile} should render a download link for ${downloadPath}`);
      }
    }
    for (const downloadPath of renderedDownloads) {
      const response = await fetch(new URL(downloadPath, origin));
      assert.equal(response.status, 200, `${downloadPath} should return HTTP 200`);
      assert.match(response.headers.get("content-type") ?? "", /application\/pdf/i);
      const bytes = new Uint8Array(await response.arrayBuffer());
      assert.ok(bytes.length > 5, `${downloadPath} should not be empty`);
      assert.equal(new TextDecoder().decode(bytes.slice(0, 5)), "%PDF-", `${downloadPath} should contain a PDF signature`);
    }
  }

  const eventsRoot = path.join(siteDirectory, "public", "documents", "Community Events");
  const eventDirectories = (await readdir(eventsRoot, { withFileTypes: true })).filter((entry) => entry.isDirectory());
  const photoPaths = (await Promise.all(eventDirectories.map((event) => publicPhotos(
    path.join(eventsRoot, event.name, "Photos"),
    path.posix.join(event.name, "Photos"),
  )))).flat();
  for (const photoPath of photoPaths) {
    const [eventName] = photoPath.split(/[\\/]/);
    const eventSlug = eventName.toLocaleLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const pageFile = `community-events/${eventSlug}/photos/index.html`;
    const html = await readFile(path.join(outputDirectory, pageFile), "utf8");
    const downloadPath = `/documents/${photoPath.split(/[\\/]/).map(encodeURIComponent).join("/")}`;
    assert.match(html, new RegExp(`<img[^>]*src="${downloadPath.replaceAll("/", "\\/")}"`), `${pageFile} should render ${photoPath} as an image`);
    assert.match(html, new RegExp(`<a[^>]*href="${downloadPath.replaceAll("/", "\\/")}" download`), `${pageFile} should provide a download button for ${photoPath}`);
    const response = await fetch(new URL(downloadPath, origin));
    assert.equal(response.status, 200, `${downloadPath} should download successfully`);
    assert.match(response.headers.get("content-type") ?? "", /^image\//i);
    assert.ok((await response.arrayBuffer()).byteLength > 0, `${downloadPath} should not be empty`);
  }
});

test("Cloudflare deployment metadata is included in the export", async () => {
  const redirects = await readFile(path.join(outputDirectory, "_redirects"), "utf8");
  const headers = await readFile(path.join(outputDirectory, "_headers"), "utf8");

  assert.match(redirects, /\/pvssd-board-of-trustees\.html \/pvssd\/ 301/);
  assert.match(headers, /X-Content-Type-Options: nosniff/);
  assert.match(headers, /Cache-Control: public, max-age=31536000, immutable/);
});

for (const legacyPage of ["pvssd-board-of-trustees.html"]) {
  test(`${legacyPage} remains available as a compatibility redirect`, async () => {
    const html = await readFile(path.join(outputDirectory, legacyPage), "utf8");
    assert.match(html, /http-equiv="refresh"/i);
  });
}
