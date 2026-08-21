import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const siteDirectory = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outputDirectory = path.join(siteDirectory, "out");
const pages = ["index.html", "area-map/index.html", "public-documents/index.html", "pvhac/index.html", "pvssd/index.html"];

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

test("Cloudflare deployment metadata is included in the export", async () => {
  const redirects = await readFile(path.join(outputDirectory, "_redirects"), "utf8");
  const headers = await readFile(path.join(outputDirectory, "_headers"), "utf8");

  assert.match(redirects, /\/pvhac\.html \/pvhac\/ 301/);
  assert.match(redirects, /\/pvssd-board-of-trustees\.html \/pvssd\/ 301/);
  assert.match(headers, /X-Content-Type-Options: nosniff/);
  assert.match(headers, /Cache-Control: public, max-age=31536000, immutable/);
});

for (const legacyPage of ["pine-valley-area-map.html", "public-documents.html", "pvhac.html", "pvssd-board-of-trustees.html"]) {
  test(`${legacyPage} remains available as a compatibility redirect`, async () => {
    const html = await readFile(path.join(outputDirectory, legacyPage), "utf8");
    assert.match(html, /http-equiv="refresh"/i);
  });
}
