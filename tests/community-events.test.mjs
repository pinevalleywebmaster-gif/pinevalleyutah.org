import assert from "node:assert/strict";
import { access, readdir, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { getCommunityEvents, sortCommunityEvents } from "../lib/community-events.js";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

test("event page discovers its folders, flyer PDFs, and rendered preview images", async () => {
  const events = getCommunityEvents();

  for (const event of events) {
    assert.ok(event.flyers.length > 0 || event.photos.length > 0, `${event.title} should include a flyer or photo`);
    for (const flyer of event.flyers) {
      assert.match(flyer.href, /\/Flyers\/.*\.pdf$/);
      assert.match(flyer.previewImage, /\/Flyers\/.*\.png$/);
      await assert.doesNotReject(access(path.join(root, "public", decodeURIComponent(flyer.href).slice(1))), `${event.title} PDF is missing`);
      await assert.doesNotReject(access(path.join(root, "public", decodeURIComponent(flyer.previewImage).slice(1))), `${event.title} preview image is missing`);
    }
    for (const photo of event.photos) {
      assert.match(photo.href, /\/Photos\/.*\.(?:avif|gif|jpe?g|png|webp)$/i);
      await assert.doesNotReject(access(path.join(root, "public", decodeURIComponent(photo.href).slice(1))), `${event.title} photo is missing`);
    }
  }
});

test("events sort newest first, alphabetically on ties, with undated events last", () => {
  const events = [
    { title: "Undated Event", addedTime: null },
    { title: "Older Event", addedTime: 100 },
    { title: "Zulu Event", addedTime: 100 },
    { title: "Newest Event", addedTime: 200 },
    { title: "Alpha Event", addedTime: 100 },
  ];
  assert.deepEqual(
    sortCommunityEvents(events).map(({ title }) => title),
    ["Newest Event", "Alpha Event", "Older Event", "Zulu Event", "Undated Event"],
  );
});

test("all synced community event directories keep their Photos folder, even while empty", async () => {
  for (const event of getCommunityEvents()) {
    const photosDirectory = path.join(root, "public", "documents", "Community Events", event.title, "Photos");
    const details = await stat(photosDirectory);
    assert.ok(details.isDirectory(), `${event.title} must retain a Photos folder`);
    if (event.photos.length === 0) {
      assert.ok((await readdir(photosDirectory)).includes(".gitkeep"), `${event.title} empty Photos folder needs its sync marker`);
    }
  }
});
