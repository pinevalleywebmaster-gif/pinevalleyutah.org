import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { communityBuckets } from "../data/community-content.js";
import { getCommunityEvents } from "../lib/community-events.js";

const testsDirectory = path.dirname(fileURLToPath(import.meta.url));
const siteDirectory = path.dirname(testsDirectory);

const routes = new Map([
  ["/", "out/index.html"],
  ["/area-map", "out/area-map/index.html"],
  ["/pvhac", "out/pvhac/index.html"],
  ["/pvssd", "out/pvssd/index.html"],
  ["/community-events", "out/community-events/index.html"],
  ["/community-events/halloween-party-2026/photos", "out/community-events/halloween-party-2026/photos/index.html"],
  ["/community-events/pine-valley-garden-club-october-2026/photos", "out/community-events/pine-valley-garden-club-october-2026/photos/index.html"],
  ["/community-watch", "out/community-watch/index.html"],
  ["/fire-department", "out/fire-department/index.html"],
  ["/pvlad", "out/pvlad/index.html"],
  ["/overlay-zone", "out/overlay-zone/index.html"],
]);

async function page(route) {
  const file = routes.get(route);
  assert.ok(file, `Unknown route in test: ${route}`);
  const html = await readFile(path.join(siteDirectory, file), "utf8");
  return {
    html,
    text: html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;|&#160;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/\s+/g, " ")
      .trim(),
  };
}

function links(html) {
  return [...html.matchAll(/<(?:a|iframe)\b[^>]*(?:href|src)=["']([^"']+)["']/gi)]
    .map((match) => match[1].replace(/&amp;/g, "&"));
}

test("all public destinations remain represented", () => {
  assert.deepEqual([...routes.keys()], [
    "/",
    "/area-map",
    "/pvhac",
    "/pvssd",
    "/community-events",
    "/community-events/halloween-party-2026/photos",
    "/community-events/pine-valley-garden-club-october-2026/photos",
    "/community-watch",
    "/fire-department",
    "/pvlad",
    "/overlay-zone",
  ]);
});

test("every community bucket has a concrete route file", async () => {
  for (const { slug } of communityBuckets) {
    await assert.doesNotReject(access(path.join(siteDirectory, "app", slug, "page.js")), `Missing static route for /${slug}/`);
  }
});

test("primary navigation keeps every important destination", async () => {
  const { html } = await page("/");
  const pageLinks = links(html);

  for (const destination of [
    "/",
    "/pvssd/",
    "/pvhac/",
    "/area-map/",
    "https://waterdata.usgs.gov/nwis/uv?site_no=09409100",
  ]) {
    assert.ok(pageLinks.includes(destination), `Missing navigation destination: ${destination}`);
  }
});

test("home page preserves essential community information", async () => {
  const { html, text } = await page("/");

  assert.match(text, /Community Activities/i);
  assert.match(text, /numerous community activities planned throughout the year/i);
  assert.match(text, /Click here to learn more/i);
  assert.match(html, /href="\/community-events\/"/);
  assert.match(text, /Mitzi Sullivan at 435-680-5988 or Korrie Ford at 702-577-8777/i);
  assert.ok(links(html).includes("tel:+14356805988"));
  assert.ok(links(html).includes("tel:+17025778777"));
  assert.match(text, /Halloween Trunk or Treat/i);
  assert.match(text, /Pine Valley Gardening Club/i);
  assert.ok(links(html).includes("/documents/Community%20Events/Halloween%20Party%202026/Flyers/halloween-trunk-or-treat.pdf"));
  assert.ok(links(html).includes("/documents/Community%20Events/Pine%20Valley%20Garden%20Club%20October%202026/Flyers/pine-valley-gardening-club-october.pdf"));
  assert.doesNotMatch(text, /Heritage Center/i);
  assert.match(text, /Report Fraud, Waste, or Abuse/i);
  assert.match(html, /mailto:pine\.valley\.webmaster@gmail\.com/i);
  assert.ok(
    links(html).includes("https://www.washco.utah.gov/departments/auditor/report-fraud-waste-abuse/"),
    "The county fraud-reporting destination must remain available",
  );
});

test("there is no central Public Documents page or navigation entry", async () => {
  await assert.rejects(access(path.join(siteDirectory, "app", "public-documents", "page.js")));
  const { html } = await page("/");
  assert.doesNotMatch(html, /Public Documents/i);
  assert.doesNotMatch(html, /href="\/public-documents\//i);
});

test("topic sections expose their matching downloadable documents", async () => {
  const events = await page("/community-events");
  const heritage = await page("/pvhac");
  assert.ok(links(events.html).includes("/documents/Community%20Events/Halloween%20Party%202026/Flyers/halloween-trunk-or-treat.pdf"));
  assert.ok(links(events.html).includes("/documents/Community%20Events/Pine%20Valley%20Garden%20Club%20October%202026/Flyers/pine-valley-gardening-club-october.pdf"));
  assert.match(events.html, /class="document-preview-image"[^>]*src="\/documents\/Community%20Events\/Halloween%20Party%202026\/Flyers\/halloween-trunk-or-treat\.png"[^>]*alt="Halloween Trunk Or Treat flyer"/);
  assert.match(events.html, /class="document-preview-image"[^>]*src="\/documents\/Community%20Events\/Pine%20Valley%20Garden%20Club%20October%202026\/Flyers\/pine-valley-gardening-club-october\.png"[^>]*alt="Pine Valley Gardening Club October flyer"/);
  assert.doesNotMatch(events.html, /<iframe[^>]*(?:pdf|document-preview)/i, "Event flyers should render as page images without embedded PDF viewers");
  assert.match(events.html, /aria-label="Download Halloween Trunk Or Treat PDF"/);
  assert.match(events.html, /aria-label="Download Pine Valley Gardening Club October PDF"/);
  const communityEvents = getCommunityEvents();
  const eventsWithoutPhotos = communityEvents.filter((event) => event.photos.length === 0);
  const eventsWithPhotos = communityEvents.filter((event) => event.photos.length > 0);
  assert.equal([...events.html.matchAll(/<button[^>]*disabled=""/g)].length, eventsWithoutPhotos.length, "Events without photos should have inactive photo buttons");
  for (const event of eventsWithoutPhotos) {
    assert.match(events.html, new RegExp(`<h3>${event.title}</h3>[\\s\\S]*?<button[^>]*disabled=""[^>]*>No photos posted for this event yet`));
    assert.doesNotMatch(events.html, new RegExp(`href="/community-events/${event.slug}/photos/"`), `${event.title} must not link to an empty photo page`);
  }
  for (const event of eventsWithPhotos) {
    assert.ok(links(events.html).includes(`/community-events/${event.slug}/photos/`), `${event.title} needs an active photo link`);
    const photosPage = await page(`/community-events/${event.slug}/photos`);
    assert.match(photosPage.html, /class="community-event-photo-grid"/);
    for (const photo of event.photos) {
      assert.ok(links(photosPage.html).includes(photo.href), `${event.title} page needs a download link for ${photo.title}`);
      assert.match(photosPage.html, new RegExp(`<img src="${photo.href.replaceAll("/", "\\/")}" alt="${photo.title}"`));
    }
  }
  const halloweenPhotos = await page("/community-events/halloween-party-2026/photos");
  assert.match(halloweenPhotos.text, /Halloween Party 2026 photos/);
  assert.match(halloweenPhotos.text, /Photos shared from Halloween Party 2026/);
  assert.match(halloweenPhotos.text, /No photos have been posted for this event yet/);
  for (const imagePath of [
    "/documents/Community%20Events/Halloween%20Party%202026/Flyers/halloween-trunk-or-treat.png",
    "/documents/Community%20Events/Pine%20Valley%20Garden%20Club%20October%202026/Flyers/pine-valley-gardening-club-october.png",
  ]) {
    await assert.doesNotReject(access(path.join(siteDirectory, "out", ...decodeURIComponent(imagePath).slice(1).split("/"))), `${imagePath} must be present for its event flyer preview`);
  }
  assert.doesNotMatch(heritage.html, /document-preview-image|document-preview-download/, "Flyer previews belong only on the Community Events page");
  assert.ok(links(heritage.html).includes("/documents/Pine%20Valley%20Heritage%20Center/Pine%20Valley%20Community%20Survey%202003.pdf"));
  assert.ok(links(heritage.html).includes("/documents/Pine%20Valley%20Heritage%20Center/Pine%20Valley%20Community%20General%20Plan.pdf"));
  assert.doesNotMatch(heritage.text, /Heritage Center/i);
});

test("historical community documents are retained and non-empty", async () => {
  const { html } = await page("/pvhac");

  for (const document of [
    "/documents/Pine%20Valley%20Heritage%20Center/Pine%20Valley%20Community%20Survey%202003.pdf",
    "/documents/Pine%20Valley%20Heritage%20Center/Pine%20Valley%20Community%20General%20Plan.pdf",
  ]) {
    assert.ok(links(html).includes(document), `Historical page must link to ${document}`);
    const details = await stat(path.join(siteDirectory, "out", "documents", ...decodeURIComponent(document).replace(/^\/documents\//, "").split("/")));
    assert.ok(details.size > 0, `${document} must not be empty`);
  }
});

test("historical committee purpose and community plan remain available", async () => {
  const { text } = await page("/pvhac");

  assert.match(text, /Pine Valley Historical Advisory Committee/i);
  assert.match(text, /historic preservation of the historic character/i);
  assert.match(text, /Pine Valley Community Survey 2003/i);
  assert.match(text, /Pine Valley Community General Plan/i);
  assert.match(text, /Washington County Commission/i);
});

test("PVSSD leadership, staff, and contact information are preserved", async () => {
  const { html, text } = await page("/pvssd");
  const peopleAndRoles = [
    ["Bob Dalley", "Chairman"],
    ["Emily Nielson", "Vice Chairman"],
    ["Allen Cannon", "Member"],
    ["Mark Owens", "Member"],
    ["Steve Shakespeare", "Member"],
    ["Robert Hardy", "Fire Chief"],
    ["Rick Peetz", "Clerk"],
    ["Teri Forbes", "Treasurer"],
  ];

  for (const [name] of peopleAndRoles) {
    assert.match(text, new RegExp(name, "i"), `Missing community contact: ${name}`);
  }
  for (const role of new Set(peopleAndRoles.map(([, role]) => role).filter((role) => role !== "Member"))) {
    assert.match(text, new RegExp(role, "i"), `Missing community role: ${role}`);
  }
  for (const email of [
    "bob.dalley@pinevalleyutah.org",
    "emily.nielson@pinevalleyutah.org",
    "allen.cannon@pinevalleyutah.org",
    "mark.owens@pinevalleyutah.org",
    "steve.shakespeare@pinevalleyutah.org",
    "pinevalleyfirestation@gmail.com",
    "rick.peetz@gmail.com",
    "tforbesgroup@hotmail.com",
  ]) {
    assert.match(html, new RegExp(email.replaceAll(".", "\\."), "i"), `Missing email: ${email}`);
  }
});

test("area map keeps its recreation context and Forest Service destination", async () => {
  const { html, text } = await page("/area-map");

  assert.match(text, /Forest Service Campgrounds and recreational opportunities/i);
  assert.ok(
    links(html).some((link) => link.includes("fs.usda.gov/recarea/dixie/recreation/camping-cabins")),
    "The Dixie National Forest recreation link must remain available",
  );
});
