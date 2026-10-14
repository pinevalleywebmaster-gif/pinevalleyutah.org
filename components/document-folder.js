'use client';

import { DownloadItem } from "./download-item";

export function DocumentFolder({ folder }) {
  const documentCount = folder.documents.length + folder.folders.reduce((total, child) => total + child.documentCount, 0);
  function handleToggle(event) {
    if (!event.currentTarget.open) return;
    const parent = event.currentTarget.parentElement;
    if (parent?.classList.contains("document-folder-content")) {
      for (const sibling of parent.querySelectorAll(":scope > details.document-folder")) {
        if (sibling !== event.currentTarget) sibling.open = false;
      }
    }
  }

  return <details className="document-folder" onToggle={handleToggle}>
    <summary>{folder.title}<span>{documentCount} {documentCount === 1 ? "document" : "documents"}</span></summary>
    <div className="document-folder-content">
      {folder.documents.length > 0 && <ul className="document-list">{folder.documents.map((document) => <DownloadItem key={document.href} document={document} />)}</ul>}
      {folder.folders.map((child) => <DocumentFolder key={child.title} folder={child} />)}
    </div>
  </details>;
}
