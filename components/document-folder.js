"use client";

import { DownloadItem } from "./download-item";

function closeSiblingFolders(event) {
  if (!event.currentTarget.open) return;

  const parent = event.currentTarget.parentElement;
  if (!parent?.classList.contains("document-folder-content")) return;

  for (const sibling of parent.querySelectorAll(":scope > details.document-folder")) {
    if (sibling !== event.currentTarget) sibling.open = false;
  }
}

export function DocumentFolder({ folder }) {
  const documentCount = folder.documents.length + folder.folders.reduce(
    (total, childFolder) => total + childFolder.documentCount,
    0,
  );
  const countLabel = documentCount === 1 ? "document" : "documents";

  return (
    <details className="document-folder" onToggle={closeSiblingFolders}>
      <summary>
        {folder.title}
        <span>{documentCount} {countLabel}</span>
      </summary>
      <div className="document-folder-content">
        {folder.documents.length > 0 && (
          <ul className="document-list">
            {folder.documents.map((document) => (
              <DownloadItem key={document.href} document={document} />
            ))}
          </ul>
        )}
        {folder.folders.map((childFolder) => (
          <DocumentFolder key={childFolder.title} folder={childFolder} />
        ))}
      </div>
    </details>
  );
}
