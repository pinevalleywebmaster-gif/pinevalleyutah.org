import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testsDirectory = path.dirname(fileURLToPath(import.meta.url));
const siteDirectory = path.dirname(testsDirectory);

const routes = new Map([
  ["/", "out/index.html"],
  ["/area-map", "out/area-map/index.html"],
  ["/public-documents", "out/public-documents/index.html"],
  ["/pvhac", "out/pvhac/index.html"],
  ["/pvssd", "out/pvssd/index.html"],
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
    "/public-documents",
    "/pvhac",
    "/pvssd",
  ]);
});

test("primary navigation keeps every important destination", async () => {
  const { html } = await page("/");
  const pageLinks = links(html);

  for (const destination of [
    "/",
    "/pvssd/",
    "/pvhac/",
    "/area-map/",
    "/public-documents/",
    "https://waterdata.usgs.gov/nwis/uv?site_no=09409100",
  ]) {
    assert.ok(pageLinks.includes(destination), `Missing navigation destination: ${destination}`);
  }
});

test("home page preserves essential community information", async () => {
  const { html, text } = await page("/");

  assert.match(text, /first Wednesday of each month/i);
  assert.match(text, /Pine Valley Fire Station/i);
  assert.match(text, /6:00 pm/i);
  assert.match(text, /meetings are open to the public/i);
  assert.match(text, /Memorial Day weekend/i);
  assert.match(text, /Labor Day/i);
  assert.match(text, /Monday through Saturday 10:00 to 6:00/i);
  assert.match(text, /Report Fraud, Waste, or Abuse/i);
  assert.match(html, /mailto:pine\.valley\.webmaster@gmail\.com/i);
  assert.ok(
    links(html).includes("https://www.washco.utah.gov/departments/auditor/report-fraud-waste-abuse/"),
    "The county fraud-reporting destination must remain available",
  );
});

test("public document repository remains accessible", async () => {
  const { html, text } = await page("/public-documents");

  assert.match(text, /public records, agendas, minutes, ordinances, and policies/i);
  assert.ok(
    links(html).some((link) =>
      link.includes("drive.google.com/embeddedfolderview?id=13cYAubJBTUmxaBG4ED8RuQMQvNW9cBHF"),
    ),
    "The public Google Drive repository must remain embedded or linked",
  );
});

test("historical community documents are retained and non-empty", async () => {
  const { html } = await page("/pvhac");

  for (const document of ["/assets/surveyfinal.pdf", "/assets/pvgenplan.pdf"]) {
    assert.ok(links(html).includes(document), `Historical page must link to ${document}`);
    const details = await stat(path.join(siteDirectory, "out", document));
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
