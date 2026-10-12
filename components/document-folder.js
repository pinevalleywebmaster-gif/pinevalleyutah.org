import { DownloadItem } from "./download-item";

export function DocumentFolder({ folder }) {
  return <details className="document-folder" open>
    <summary>{folder.title}<span>{folder.documents.length} {folder.documents.length === 1 ? "document" : "documents"}</span></summary>
    <ul className="document-list">{folder.documents.map((document) => <DownloadItem key={document.href} document={document} />)}</ul>
  </details>;
}
