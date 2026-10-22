import Link from "next/link";
import { DocumentList } from "../../components/document-list";
import { PageIntro } from "../../components/page-intro";
import { meetings } from "../../data/site-content";
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
        <a href="mailto:teri.forbes@pinevalleyutah.org">
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
        description="The PVSSD oversees the Pine Valley Fire Department."
      >
        <Link href="/#community">← Community services</Link>
      </PageIntro>
      <section className="detail-section">
        <h2>About the district</h2>
        <p>The Pine Valley Public Service District (PVSSD) is a five-person board established by Washington County to oversee the Pine Valley Fire Department. Its mission is:</p>
        <blockquote>To equip and train a volunteer fire and rescue organization in a fiscally responsible way, enabling the organization to provide safe, prompt, effective fire suppression; emergency medical services; and proactive prevention education to residents and visitors in the Pine Valley community.</blockquote>
        <p>The Fire Department’s mission statement is:</p>
        <blockquote>
          We proudly serve the changing needs of our community by providing emergency medical response, structure, and wildland safety, and support these services with:
          <ul>
            <li>Professionalism</li>
            <li>Enthusiasm</li>
            <li>Organizational integrity</li>
            <li>Pride</li>
            <li>Leadership effectiveness</li>
          </ul>
          Our people pledge a commitment to protecting lives, property, and the environment with compassion, vigilance, and dedication to excellence.
        </blockquote>
        <p>Department volunteers contributed nearly 4,000 hours of service in 2025.</p>
        <p><Link href="/fire-department/">Learn more about the Pine Valley Fire Department →</Link></p>
      </section>
      <PublicMeetings />
      <section className="detail-section">
        <h2>Current board and district contacts</h2>
        <ul>
          <li>Robert Dalley, Chair — 801-231-5321 · <a href="mailto:bob.dalley@pinevalleyutah.org">bob.dalley@pinevalleyutah.org</a></li>
          <li>Emily Neilson, Vice Chair — 702-249-1726 · <a href="mailto:emily.neilson@pinevalleyutah.org">emily.neilson@pinevalleyutah.org</a></li>
          <li>Allen Cannon — 949-322-9558 · <a href="mailto:allen.cannon@pinevalleyutah.org">allen.cannon@pinevalleyutah.org</a></li>
          <li>Steve Shakespeare — 435-680-5800 · <a href="mailto:steve.shakespeare@pinevalleyutah.org">steve.shakespeare@pinevalleyutah.org</a></li>
          <li>Mark Owens — 435-703-5363 · <a href="mailto:mark.owens@pinevalleyutah.org">mark.owens@pinevalleyutah.org</a></li>
          <li>Treasurer: Teri Forbes — 435-231-4820 · <a href="mailto:teri.forbes@pinevalleyutah.org">teri.forbes@pinevalleyutah.org</a></li>
          <li>Clerk: Rick Peetz — 702-748-6058 · <a href="mailto:rick.peetz@pinevalleyutah.org">rick.peetz@pinevalleyutah.org</a></li>
          <li>Fire Chief: Robert Hardy — 435-632-6764 · <a href="mailto:robert.hardy@pinevalleyutah.org">robert.hardy@pinevalleyutah.org</a></li>
        </ul>
        <p>PVSSD board members are appointed by the Washington County Commission for four-year terms. Members must be U.S. citizens and registered voters whose primary residence is within the Pine Valley boundaries. Board members are not compensated. For information about serving, contact the <a href="tel:+14353017000">Washington County Commission at 435-301-7000</a>.</p>
      </section>
      <section className="detail-section">
        <h2>Fire Department funding</h2>
        <p>The Fire Department is funded through annual assessment fees and one-time impact fees.</p>
        <p><a href="https://www.washco.utah.gov/departments/auditor/report-fraud-waste-abuse/">Report fraud, waste, or abuse to Washington County</a>.</p>
        <h3>Annual assessment fee</h3>
        <ul>
          <li>Residential homes: $250 per year</li>
          <li>Vacant lots: $100 per year</li>
          <li>Commercial buildings and short-term rentals: $475 per year</li>
        </ul>
        <h3>One-time impact fee</h3>
        <p>A one-time impact fee applies to new construction, additions, and outbuildings larger than 200 square feet. Square footage is calculated from the home, garage, connected covered patios, and outbuildings. These funds can only be used for Pine Valley Fire Department capital expenses.</p>
        <ul>
          <li>New homes up to 2,500 square feet: $2,500</li>
          <li>New homes larger than 2,500 square feet: $1 per square foot</li>
          <li>Additions and outbuildings over 200 square feet: $1 per square foot</li>
        </ul>
      </section>
      {documents.length > 0 && (
        <section className="detail-section">
          <h2>PVSSD public documents</h2>
          <p>Browse district records, agendas, minutes, policies, and budget materials. The Fire Department budget is considered during public hearings in November and December.</p>
          <DocumentList documents={documents} />
        </section>
      )}
      <DistrictHelp />
    </>
  );
}
