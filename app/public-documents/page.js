import { DocumentList } from "../../components/document-list";
import { archivedDocuments, featuredDocuments } from "../../data/documents";
import { getAllDocuments, groupDocumentsByDriveFolder, mergeDocuments } from "../../lib/documents";

export const metadata = { title: "Public Documents" };

export default function PublicDocumentsPage() {
  const documents = mergeDocuments(groupDocumentsByDriveFolder(getAllDocuments()), archivedDocuments, ...Object.values(featuredDocuments));
  return <section><h1>Public Documents</h1><p>Browse public records by topic. Topic pages include the documents most relevant to each district and community service.</p><ul className="document-list">
    <li><a href="/pvssd/">PVSSD documents<span>Agendas, minutes, policies, and district records →</span></a></li>
    <li><a href="/pvlad/">PVLAD documents<span>Local Administration District records →</span></a></li>
    <li><a href="/overlay-zone/">Overlay Zone documents<span>Planning and preservation materials →</span></a></li>
    <li><a href="/pvhac/">Heritage Center documents<span>Community planning and historical materials →</span></a></li>
  </ul><h2>All documents</h2><p>PDF exports retain the folder structure of the Google Drive repository.</p><DocumentList documents={documents} emptyMessage="PDFs will be available after the first Drive sync runs." /></section>;
}
