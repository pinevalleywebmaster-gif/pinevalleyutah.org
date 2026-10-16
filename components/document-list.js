import { DocumentFolder } from "./document-folder";
import { DocumentPreview } from "./document-preview";
import { DownloadItem } from "./download-item";

function getFolderSegments(document) {
  const folderPath =
    document.folderTitle ??
    document.relativePath?.split(/[\\/]/).slice(0, -1).filter(Boolean).join(" / ") ??
    "";

  return folderPath
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean);
}

function buildFolderTree(documents) {
  const root = { title: "", documents: [], folders: [] };

  for (const document of documents) {
    let currentFolder = root;

    for (const title of getFolderSegments(document)) {
      let childFolder = currentFolder.folders.find((folder) => folder.title === title);

      if (!childFolder) {
        childFolder = { title, documents: [], folders: [] };
        currentFolder.folders.push(childFolder);
      }

      currentFolder = childFolder;
    }

    currentFolder.documents.push(document);
  }

  return root;
}

function addDocumentCounts(folder) {
  folder.documentCount = folder.documents.length + folder.folders.reduce(
    (total, childFolder) => total + addDocumentCounts(childFolder),
    0,
  );

  return folder.documentCount;
}

function FolderContents({ folder }) {
  return (
    <div className="download-list">
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
  );
}

export function DocumentList({ documents, preview = false }) {
  if (!documents?.length) return null;

  if (preview) {
    return (
      <div className="document-preview-grid">
        {documents.map((document) => (
          <DocumentPreview key={document.href} document={document} />
        ))}
      </div>
    );
  }

  const rootFolder = buildFolderTree(documents);
  addDocumentCounts(rootFolder);

  return <FolderContents folder={rootFolder} />;
}
