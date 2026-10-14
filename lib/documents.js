import fs from "node:fs";
import path from "node:path";

const manifestPath = path.join(process.cwd(), "public", "documents", "manifest.json");
const displayTitleOverrides = {
  "halloween-trunk-or-treat": "Halloween Trunk or Treat",
  "pine-valley-gardening-club-october": "Pine Valley Gardening Club · October",
};

function readManifest() {
  if (!fs.existsSync(manifestPath)) return [];
  try {
    const documents = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    return Array.isArray(documents) ? documents.map((document) => {
      const stem = path.basename(document.relativePath ?? "", ".pdf").toLocaleLowerCase();
      return { ...document, title: displayTitleOverrides[stem] ?? document.title };
    }) : [];
  } catch {
    return [];
  }
}

function readPdfFiles(directory, relativeDirectory = "") {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relativePath = path.posix.join(relativeDirectory, entry.name);
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return readPdfFiles(absolutePath, relativePath);
    if (!entry.isFile() || path.extname(entry.name).toLowerCase() !== ".pdf") return [];
    const stem = path.basename(entry.name, ".pdf");
    return [{
      title: displayTitleOverrides[stem.toLocaleLowerCase()] ?? stem.replace(/[-_]+/g, " "),
      relativePath,
      sourcePath: relativePath,
      href: `/documents/${relativePath.split(/[\\/]/).map(encodeURIComponent).join("/")}`,
    }];
  });
}

function allSourceDocuments() {
  const manifestDocuments = readManifest();
  const manifestHrefs = new Set(manifestDocuments.map((document) => document.href));
  const mirroredPdfs = readPdfFiles(path.join(process.cwd(), "public", "documents"));
  return [...manifestDocuments, ...mirroredPdfs.filter((document) => !manifestHrefs.has(document.href))];
}

export function getDocuments(folder = "") {
  const folderNames = (Array.isArray(folder) ? folder : [folder]).map((name) => name.trim().toLocaleLowerCase()).filter(Boolean);
  if (!folderNames.length) return [];
  return allSourceDocuments().filter((document) => {
    const segments = (document.sourcePath ?? "").toLocaleLowerCase().split("/");
    return folderNames.some((folderName) => segments.some((segment) => segment.includes(folderName)));
  });
}

export function getAllDocuments() {
  return allSourceDocuments().sort((a, b) => (a.relativePath ?? "").localeCompare(b.relativePath ?? ""));
}

export function groupDocumentsByDriveFolder(documents) {
  const displayPath = (value) => value?.split("/")
    .map((segment) => segment
      .replace(/Pine Valley Heritage Center|Heritage/gi, "Historical Advisory Committee records")
      .replace(/Other Public Documents/gi, "Additional records")
      .replace(/PVHAC/gi, "Historical Advisory Committee"))
    .join(" / ");

  return documents.map((document) => ({
    ...document,
    folderTitle: displayPath(document.sourcePath?.split("/").slice(0, -1).filter(Boolean).join("/")) ?? "",
    subtitle: displayPath(document.relativePath) ?? "PDF document",
  }));
}

export function mergeDocuments(...groups) {
  const seen = new Set();
  return groups.flat().filter((document) => {
    if (seen.has(document.href)) return false;
    seen.add(document.href);
    return true;
  });
}
