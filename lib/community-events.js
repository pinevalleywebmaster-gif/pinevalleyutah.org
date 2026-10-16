import fs from "node:fs";
import path from "node:path";

const documentsRoot = path.join(process.cwd(), "public", "documents", "Community Events");
const photoExtensions = new Set([".avif", ".gif", ".jpeg", ".jpg", ".png", ".webp"]);

function toSlug(value) {
  return value.toLocaleLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function publicHref(relativePath) {
  return `/documents/${relativePath.split(/[\\/]/).map(encodeURIComponent).join("/")}`;
}

function formatTitle(filename) {
  return path.basename(filename, path.extname(filename))
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (character) => character.toLocaleUpperCase());
}

function imageFiles(directory, relativeDirectory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relativePath = path.posix.join(relativeDirectory, entry.name);
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return imageFiles(absolutePath, relativePath);
    if (!entry.isFile() || !photoExtensions.has(path.extname(entry.name).toLocaleLowerCase())) return [];
    return [{
      title: formatTitle(entry.name),
      relativePath,
      href: publicHref(relativePath),
    }];
  });
}

function pdfFiles(directory, relativeDirectory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relativePath = path.posix.join(relativeDirectory, entry.name);
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return pdfFiles(absolutePath, relativePath);
    if (!entry.isFile() || path.extname(entry.name).toLocaleLowerCase() !== ".pdf") return [];
    const previewPath = `${absolutePath.slice(0, -path.extname(absolutePath).length)}.png`;
    const previewRelativePath = `${relativePath.slice(0, -path.posix.extname(relativePath).length)}.png`;
    return [{
      title: formatTitle(entry.name),
      relativePath,
      href: publicHref(relativePath),
      previewImage: fs.existsSync(previewPath) ? publicHref(previewRelativePath) : undefined,
    }];
  });
}

export function getCommunityEvents() {
  if (!fs.existsSync(documentsRoot)) return [];
  return fs.readdirSync(documentsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const relativeRoot = path.posix.join("Community Events", entry.name);
      const flyers = pdfFiles(
        path.join(documentsRoot, entry.name, "Flyers"),
        path.posix.join(relativeRoot, "Flyers"),
      );
      const photos = imageFiles(
        path.join(documentsRoot, entry.name, "Photos"),
        path.posix.join(relativeRoot, "Photos"),
      );
      return { title: entry.name, slug: toSlug(entry.name), flyers, photos };
    })
    .filter((event) => event.flyers.length > 0 || event.photos.length > 0)
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function getCommunityEvent(eventSlug) {
  return getCommunityEvents().find((event) => event.slug === eventSlug) ?? null;
}
