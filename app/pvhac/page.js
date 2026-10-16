import { DocumentList } from "../../components/document-list";
import { PageIntro } from "../../components/page-intro";
import { ResourceList } from "../../components/resource-list";
import { archivedDocuments, topicDocuments as registeredDocuments, topicFolders } from "../../data/documents";
import { historicalDocuments } from "../../data/site-content";
import { getDocuments, groupDocumentsByDriveFolder, mergeDocuments } from "../../lib/documents";

export const metadata = { title: "Historical Advisory Committee" };

function AboutCommittee() {
  return (
    <section>
      <h2>About the Committee</h2>
      <p>
        The Pine Valley Historical Advisory Committee was created by the
        Washington County Commission on June 4, 2002, to advise the commission
        and appropriate county departments on matters relating to the historical
        preservation of Pine Valley.
      </p>
      <h3>The Committee’s Duties</h3>
      <ul>
        <li>Initiate and promote historic preservation of the historic character of the area.</li>
        <li>Prepare proposals for preserving and enhancing the area’s historic character, public spaces, and buildings.</li>
        <li>Coordinate with people, agencies, and organizations whose work affects the historic nature of the area.</li>
        <li>Submit proposals for consideration in county plans and ordinances.</li>
      </ul>
    </section>
  );
}

function CommunityPlanning() {
  return (
    <section>
      <h2>Community Planning</h2>
      <p>
        The committee reviewed existing facilities and services, completed a
        land-use survey, and gathered community input to support long-term
        planning.
      </p>
      <ResourceList
        resources={historicalDocuments.map((document) => ({
          href: document.href,
          label: document.label,
          description: "Download PDF ↗",
        }))}
      />
      <p>
        The Pine Valley Community General Plan was approved by the Washington
        County Commission on November 3, 2003, as a guide for future building,
        development, and historical preservation in the valley.
      </p>
    </section>
  );
}

export default function PvhacPage() {
  const heritageDocuments = mergeDocuments(
    groupDocumentsByDriveFolder(getDocuments(topicFolders.pvhac)),
    registeredDocuments.pvhac,
    archivedDocuments,
  );

  return (
    <article>
      <PageIntro title="Pine Valley Historical Advisory Committee" />
      <AboutCommittee />
      <CommunityPlanning />
      {heritageDocuments.length > 0 && (
        <section>
          <h2>Additional committee records</h2>
          <DocumentList documents={heritageDocuments} />
        </section>
      )}
    </article>
  );
}
