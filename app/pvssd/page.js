import Link from "next/link";
import { ContactGroup } from "../../components/contact-group";
import { DocumentList } from "../../components/document-list";
import { PageIntro } from "../../components/page-intro";
import { districtGroups, meetings } from "../../data/site-content";
import { topicDocuments as registeredDocuments, topicFolders } from "../../data/documents";
import { getDocuments, groupDocumentsByDriveFolder } from "../../lib/documents";

export const metadata = { title: "Pine Valley Special Service District" };

function PublicMeetings() {
  return (
    <section id="meetings" className="updates-panel">
      <div>
        <p className="eyebrow">Take part</p>
        <h2>Public meetings</h2>
      </div>
      <div>
        <p>{meetings.district}</p>
        <p>{meetings.access}</p>
      </div>
    </section>
  );
}

function DistrictHelp() {
  return (
    <section className="help-panel">
      <div>
        <h2>Fees &amp; annual assessments</h2>
        <p>
          Contact the district treasurer for current impact fee, annual
          assessment, and payment instructions.
        </p>
        <a href="mailto:tforbesgroup@hotmail.com">
          Contact Teri Forbes, Treasurer →
        </a>
      </div>
      <div>
        <h3>Looking for PVLAD?</h3>
        <p>
          The Local Administration District has its own page for contacts and
          meeting inquiries.
        </p>
        <Link href="/pvlad/">Visit the Local Administration District →</Link>
      </div>
    </section>
  );
}

export default function PvssdPage() {
  const documents = [
    ...groupDocumentsByDriveFolder(getDocuments(topicFolders.pvssd)),
    ...registeredDocuments.pvssd,
  ];

  return (
    <>
      <PageIntro
        eyebrow="PVSSD"
        title="Pine Valley Special Service District"
        description="Connect with the district’s board and staff, find public meeting information, and access district records."
      >
        <Link href="/#community">← Community services</Link>
      </PageIntro>
      <PublicMeetings />
      {documents.length > 0 && (
        <section className="detail-section">
          <h2>PVSSD documents</h2>
          <p>Download district records, agendas, minutes, and policies.</p>
          <DocumentList documents={documents} />
        </section>
      )}
      <div className="contact-grid">
        {districtGroups.slice(0, 2).map((group) => (
          <ContactGroup key={group.title} group={group} />
        ))}
      </div>
      <DistrictHelp />
    </>
  );
}
