import assert from "node:assert/strict";
import { access, readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { communityBuckets, resourceLinks } from "../data/community-content.js";
import { getCommunityEvents } from "../lib/community-events.js";

const testsDirectory = path.dirname(fileURLToPath(import.meta.url));
const siteDirectory = path.dirname(testsDirectory);

const fixedRoutes = [
  ["/", "out/index.html"],
  ["/pvssd", "out/pvssd/index.html"],
  ["/community-events", "out/community-events/index.html"],
  ["/community-watch", "out/community-watch/index.html"],
  ["/fire-department", "out/fire-department/index.html"],
  ["/pvlad", "out/pvlad/index.html"],
  ["/overlay-zone", "out/overlay-zone/index.html"],
];
const eventPhotoRoutes = getCommunityEvents().map(({ slug }) => [
  `/community-events/${slug}/photos`,
  `out/community-events/${slug}/photos/index.html`,
]);
const routes = new Map([
  ...fixedRoutes.slice(0, 3),
  ...eventPhotoRoutes,
  ...fixedRoutes.slice(3),
]);

function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("'", "&#x27;")
    .replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

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

async function filesUnder(directory) {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
  return (await Promise.all(entries.map((entry) => {
    const child = path.join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(child) : entry.isFile() ? [child] : [];
  }))).flat();
}

test("all public destinations remain represented", () => {
  assert.deepEqual([...routes.keys()], [
    "/",
    "/pvssd",
    "/community-events",
    ...eventPhotoRoutes.map(([route]) => route),
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
  for (const event of getCommunityEvents()) {
    assert.ok(text.includes(event.title), `Home page should include ${event.title}`);
    for (const flyer of event.flyers) {
      assert.ok(links(html).includes(flyer.href), `Home page should link to ${flyer.title}`);
    }
  }
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
  const communityEvents = getCommunityEvents();
  const eventCards = [...events.html.matchAll(/<article class="community-event-card">([\s\S]*?)<\/article>/g)]
    .map(([, card]) => card);
  assert.equal(eventCards.length, communityEvents.length, "Each current event should have one card");
  assert.doesNotMatch(events.html, /<iframe[^>]*(?:pdf|document-preview)/i, "Event flyers should render as page images without embedded PDF viewers");
  const eventsWithoutPhotos = communityEvents.filter((event) => event.photos.length === 0);
  const eventsWithPhotos = communityEvents.filter((event) => event.photos.length > 0);
  assert.equal([...events.html.matchAll(/<button[^>]*disabled=""/g)].length, eventsWithoutPhotos.length, "Events without photos should have inactive photo buttons");
  for (const event of eventsWithoutPhotos) {
    const card = eventCards.find((candidate) => candidate.includes(`<h3>${escapeHtml(event.title)}</h3>`));
    assert.ok(card, `Missing card for ${event.title}`);
    assert.match(card, /<button[^>]*disabled=""[^>]*>No photos posted for this event yet/);
    assert.doesNotMatch(card, new RegExp(`href="/community-events/${event.slug}/photos/"`), `${event.title} must not link to an empty photo page`);
  }
  for (const event of eventsWithPhotos) {
    const card = eventCards.find((candidate) => candidate.includes(`<h3>${escapeHtml(event.title)}</h3>`));
    assert.ok(card, `Missing card for ${event.title}`);
    assert.ok(card.includes(`/community-events/${event.slug}/photos/`), `${event.title} needs an active photo link`);
    const photosPage = await page(`/community-events/${event.slug}/photos`);
    assert.match(photosPage.html, /class="community-event-photo-grid"/);
    for (const photo of event.photos) {
      assert.ok(links(photosPage.html).includes(photo.href), `${event.title} page needs a download link for ${photo.title}`);
      assert.match(photosPage.html, new RegExp(`<img src="${photo.href.replaceAll("/", "\\/")}" alt="${photo.title}"`));
    }
  }

  for (const event of communityEvents) {
    const card = eventCards.find((candidate) => candidate.includes(`<h3>${escapeHtml(event.title)}</h3>`));
    assert.ok(card, `Missing card for ${event.title}`);
    const heading = card.match(/<div class="community-event-heading">([\s\S]*?)<\/div>/)?.[1] ?? "";
    assert.ok(heading.includes(`<h3>${escapeHtml(event.title)}</h3>`), `${event.title} should have a heading`);
    for (const flyer of event.flyers) {
      assert.ok(card.includes(`href="${escapeHtml(flyer.href)}"`), `${event.title} should link to ${flyer.title}`);
      assert.ok(heading.includes(`aria-label="Download ${escapeHtml(flyer.title)} PDF"`), `${flyer.title} needs a download button beside the event name`);
      assert.ok(heading.includes("download"), `${flyer.title} download button should use the browser download behavior`);
      if (flyer.previewImage) {
        assert.ok(card.includes(`src="${escapeHtml(flyer.previewImage)}"`), `${flyer.title} preview should appear in the event card`);
        const imagePath = path.join(siteDirectory, "out", ...decodeURIComponent(flyer.previewImage).slice(1).split("/"));
        await assert.doesNotReject(access(imagePath), `${flyer.previewImage} must be present for its event preview`);
      }
    }
  }
  assert.doesNotMatch(events.html, /PDF document|document-preview-card/);
});

test("PVHAC documents are retained in the archive and excluded from the site", async () => {
  const archivedFiles = await filesUnder(path.join(siteDirectory, "archive", "pvhac-documents"));
  const archivedPdfs = archivedFiles.filter((file) => path.extname(file).toLocaleLowerCase() === ".pdf");
  assert.ok(archivedPdfs.length > 0, "PVHAC PDFs should remain archived");
  for (const archivedPdf of archivedPdfs) {
    const details = await stat(archivedPdf);
    assert.ok(details.size > 0, `${path.relative(siteDirectory, archivedPdf)} must be non-empty`);
  }
  await assert.rejects(access(path.join(siteDirectory, "out", "pvhac", "index.html")));
  const publicDocumentFiles = await filesUnder(path.join(siteDirectory, "out", "documents"));
  assert.ok(publicDocumentFiles.every((file) => {
    const relativePath = path.relative(path.join(siteDirectory, "out", "documents"), file).toLocaleLowerCase();
    return !relativePath.includes("pine valley heritage center") && !relativePath.split(path.sep).some((segment) => segment.startsWith("pvhac"));
  }), "PVHAC files should not be included in public documents");
});

test("PVSSD leadership, staff, and contact information are preserved", async () => {
  const { html, text } = await page("/pvssd");
  const peopleAndRoles = [
    ["Robert Dalley", "Chair"],
    ["Emily Neilson", "Vice Chair"],
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
    "emily.neilson@pinevalleyutah.org",
    "allen.cannon@pinevalleyutah.org",
    "steve.shakespeare@pinevalleyutah.org",
    "mark.owens@pinevalleyutah.org",
    "teri.forbes@pinevalleyutah.org",
    "rick.peetz@pinevalleyutah.org",
    "robert.hardy@pinevalleyutah.org",
  ]) {
    assert.ok(html.toLowerCase().includes(`mailto:${email}`), `Missing email: ${email}`);
  }
});

test("community resources links directly to the Dixie National Forest", () => {
  assert.ok(
    resourceLinks.some(({ href }) => href === "https://www.fs.usda.gov/detailfull/dixie/home/?cid=fseprd1013358"),
    "The Dixie National Forest link must remain available",
  );
  assert.ok(resourceLinks.every(({ href }) => href !== "/area-map/"));
});
