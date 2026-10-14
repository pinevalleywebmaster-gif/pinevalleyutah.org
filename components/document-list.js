import { DocumentFolder } from "./document-folder";
import { DocumentPreview } from "./document-preview";
import { DownloadItem } from "./download-item";

export function DocumentList({ documents, preview = false }) {
  if (!documents?.length) return null;

  if (preview) {
    return <div className="document-preview-grid">
      {documents.map((document) => <DocumentPreview key={document.href} document={document} />)}
    </div>;
  }

  const root = { title: "", documents: [], folders: [] };
  for (const document of documents) {
    const folderPath = document.folderTitle ?? document.relativePath?.split(/[\\/]/).slice(0, -1).filter(Boolean).join(" / ") ?? "";
    const segments = folderPath.split("/").map((segment) => segment.trim()).filter(Boolean);
    let current = root;
    for (const title of segments) {
      let child = current.folders.find((folder) => folder.title === title);
      if (!child) {
        child = { title, documents: [], folders: [] };
        current.folders.push(child);
      }
      current = child;
    }
    current.documents.push(document);
  }

  const addCounts = (folder) => {
    folder.documentCount = folder.documents.length + folder.folders.reduce((total, child) => total + addCounts(child), 0);
    return folder.documentCount;
  };
  addCounts(root);

  return <div className="download-list">
    {root.documents.length > 0 && <ul className="document-list">{root.documents.map((document) => <DownloadItem key={document.href} document={document} />)}</ul>}
    {root.folders.map((folder) => <DocumentFolder key={folder.title} folder={folder} />)}
  </div>;
}
