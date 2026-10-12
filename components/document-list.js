import { DocumentFolder } from "./document-folder";
import { DownloadItem } from "./download-item";

export function DocumentList({ documents, emptyMessage = "No documents have been published here yet." }) {
  if (!documents?.length) return <p className="document-list-empty">{emptyMessage}</p>;

  const folders = new Map();
  for (const document of documents) {
    const folder = document.folderTitle ?? document.relativePath?.split(/[\\/]/).slice(0, -1).filter(Boolean).join(" / ") ?? "";
    if (!folders.has(folder)) folders.set(folder, []);
    folders.get(folder).push(document);
  }

  const folderGroups = [...folders.entries()].filter(([title]) => title);
  const topLevel = folders.get("") ?? [];

  return <div className="download-list">
    {topLevel.length > 0 && <ul className="document-list">{topLevel.map((document) => <DownloadItem key={document.href} document={document} />)}</ul>}
    {folderGroups.map(([title, folderDocuments]) => <DocumentFolder key={title} folder={{ title, documents: folderDocuments }} />)}
  </div>;
}
