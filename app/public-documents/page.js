import { publicDocumentRepository } from "../../data/site-content";

export const metadata = { title: "Public Documents" };

export default function PublicDocumentsPage() {
  return <section><h1>Public Documents</h1><p>All public records, agendas, minutes, ordinances, and policies are available in the document repository below.</p><iframe src={publicDocumentRepository} title="Pine Valley public document repository" /><p><a href={publicDocumentRepository}>Open the public document repository in a new window</a></p></section>;
}
