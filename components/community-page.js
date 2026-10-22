import Link from "next/link";
import { notFound } from "next/navigation";
import { communityBuckets, resourceLinks } from "../data/community-content";
import { featuredDocuments, topicDocuments as registeredTopicDocuments, topicFolders } from "../data/documents";
import { getDocuments, groupDocumentsByDriveFolder, mergeDocuments } from "../lib/documents";
import { DocumentList } from "./document-list";
import { PageIntro } from "./page-intro";
import { ResourceList } from "./resource-list";
import { CommunityEventList } from "./community-event-list";
import { getCommunityEvents } from "../lib/community-events";

const documentHeadings = {
  "community-events": "Community activity downloads",
  "overlay-zone": "Overlay Zone documents",
  pvlad: "PVLAD documents",
  pvssd: "PVSSD documents",
};

function getCommunityDocuments(bucket) {
  const folderDocuments = topicFolders[bucket]
    ? getDocuments(topicFolders[bucket])
    : [];

  return mergeDocuments(
    groupDocumentsByDriveFolder(folderDocuments),
    registeredTopicDocuments[bucket] ?? [],
    featuredDocuments[bucket] ?? [],
  );
}

function CommunityNavigation({ currentBucket }) {
  return (
    <aside className="page-menu" aria-label="Community services">
      <p className="eyebrow">Explore Pine Valley</p>
      {communityBuckets.map((bucket) => (
        <Link
          key={bucket.slug}
          href={`/${bucket.slug}/`}
          aria-current={bucket.slug === currentBucket ? "page" : undefined}
        >
          {bucket.title}
        </Link>
      ))}
    </aside>
  );
}

function CommunitySection({ section }) {
  return (
    <section className="detail-section">
      <h2>{section.title}</h2>
      <p>{section.text}</p>
      {section.href && (
        <p>
          <Link href={section.href}>{section.label} →</Link>
        </p>
      )}
      {section.contact && <a href={`mailto:${section.contact}`}>{section.contact}</a>}
    </section>
  );
}

function CommunityDocuments({ bucket, documents }) {
  if (documents.length === 0) return null;

  return (
    <section className="detail-section">
      <h2>{documentHeadings[bucket] ?? "Community documents"}</h2>
      {bucket === "community-events" && <p>Preview each flyer below, or download a copy.</p>}
      <DocumentList documents={documents} preview={bucket === "community-events"} />
    </section>
  );
}

function CommunityEventsSection() {
  const events = getCommunityEvents();
  if (events.length === 0) return null;

  return (
    <section className="detail-section">
      <h2>Community activities</h2>
      <p>Preview event flyers and browse photos from each event.</p>
      <CommunityEventList events={events} />
    </section>
  );
}

function CommunityResources() {
  const resources = resourceLinks.map((resource) => ({
    ...resource,
    external: resource.href.startsWith("https://"),
  }));

  return (
    <section className="detail-section">
      <h2>Useful links</h2>
      <ResourceList resources={resources} className="resource-grid" />
    </section>
  );
}

function CommunityWatchDetails() {
  return (
    <>
      <section className="detail-section">
        <h2>What is Community Watch?</h2>
        <p>Programs similar to Community Watch have been around for many years. It is a program that enlists community members to work with local law enforcement to reduce crime. Residents protect their neighborhood by observing and reporting suspicious or unusual activities.</p>
      </section>
      <section className="detail-section">
        <h2>Benefits of Community Watch</h2>
        <p>Many communities with active programs have experienced substantial decreases in burglary and vandalism. Neighborhood Watch also:</p>
        <ul>
          <li>Creates greater awareness of crime</li>
          <li>Increases reporting of crime and suspicious activities</li>
          <li>Serves as a warning to criminals</li>
          <li>Promotes neighborliness</li>
          <li>Provides residents with information about crime patterns and trends</li>
          <li>Helps increase arrests and convictions by making eyewitnesses available</li>
        </ul>
      </section>
      <section className="detail-section">
        <h2>Neighborhood blocks</h2>
        <p>Pine Valley is divided into four blocks, each with block captains who are a first contact in their area when there is a problem or emergency.</p>
        <ul>
          <li>Block 1: Tom Nielsen, 760-415-2063; Bob Bailey, 435-599-2360 (<a href="https://drive.google.com/file/d/1gWKAAPPIv6NkUdxoBHF3x92KlxjWzhHD/view?usp=sharing">Block 1 map</a>)</li>
          <li>Block 2: Brad Esposito, 702-830-2662; Renee Stucki, 435-668-5432 (<a href="https://drive.google.com/file/d/1ccRE4Z3u-HnZfgxqNiPLoqp_LVyPt_f0/view?usp=sharing">Block 2 map</a>)</li>
          <li>Block 3: Earl Snow, 435-862-7161; Allen Cannon, 949-322-9558 (<a href="https://drive.google.com/file/d/1sefxe_MduYOYXUhizbLQoWLckjDfdWOO/view?usp=sharing">Block 3 map</a>)</li>
          <li>Block 4: Layne Christensen, 435-669-4423; Scott Cragun, 435-619-0960 (<a href="https://drive.google.com/file/d/1XdZ9sgkixcsAgOFWXtqsJnzXfDPbSyzH/view?usp=sharing">Block 4 map</a>)</li>
        </ul>
        <p>Community Watch director: Gene Phillips, <a href="tel:+17023758005">702-375-8005</a>.</p>
        <p><a href="https://drive.google.com/file/d/1EWmLpL7hM-eA2wy-Z0-LZadPhzdvZ5XM/view?usp=sharing">View the Pine Valley block areas map</a></p>
      </section>
      <section className="detail-section">
        <h2>Sign up and emergency communication</h2>
        <p>Sign-up information is kept confidential. <a href="https://drive.google.com/file/d/1YnfViJk6FiwPr510G-f2J3V-kdUYc4hx/view?usp=sharing">Open the Community Watch sign-up sheet</a>.</p>
        <p>In an emergency, a Call to Action may be announced on Nextdoor. Residents can turn on their radios and tune to their block channel for more information. Block captains share updates with the program director and their blocks. The community also uses 96.1 FM at 4:00 pm local time for Call to Action updates.</p>
        <ul>
          <li>Block 1: GMRS channel 15, 462.5500 MHz</li>
          <li>Block 2: GMRS channel 16, 462.5750 MHz</li>
          <li>Block 3: GMRS channel 17, 462.6000 MHz</li>
          <li>Block 4: GMRS channel 18, 462.6250 MHz</li>
        </ul>
        <p>Medical or safety emergencies: <a href="tel:911">911</a>. Sheriff dispatch non-emergency: <a href="tel:+14356345730">435-634-5730</a>.</p>
        <p><a href="/documents/PVLAD%20Policies%20and%20Procedures/Community%20Watch%20-%20Public.pdf">Read the PVLAD Community Watch policy (PDF)</a></p>
      </section>
    </>
  );
}

function OverlayZoneDetails() {
  return (
    <>
      <section className="detail-section">
        <h2>About the Overlay Zone</h2>
        <p>The Pine Valley Overlay Zone was adopted on July 19, 2022. It was the first overlay zone approved in Washington County and was developed by Pine Valley property owners over nearly two years. The process began with a <a href="https://drive.google.com/file/d/1csIPECnuOx3WfKY3EQuOG1rBZ9NX4VvL/view">community survey</a> to identify the characteristics that define Pine Valley’s “sense of place” and should be preserved as the town grew. Community meetings followed, and drafts were shared with the community and county staff for review and input.</p>
        <p>The goal of the Pine Valley Overlay Zone is “to guide future development in a way that maintains the rural, historical and mountain village characteristics of Pine Valley and to preserve the open meadows, agricultural lands and scenic vistas.”</p>
      </section>
      <section className="detail-section">
        <h2>Review process and meetings</h2>
        <p>The Pine Valley Local Administrative District (PVLAD) serves as the Overlay Zone review and recommendation committee. Applications submitted to the Washington County Community Development Department that are governed by the Overlay Zone are referred to the PVLAD board first. The board reviews each application and provides a recommendation to the county.</p>
        <p>PVLAD meets on the second Wednesday of each month at 6:00 pm at the Pine Valley Fire Station, 680 East Main Street, Pine Valley, Utah. In-person attendance is encouraged. If needed, participants may join by phone or Zoom.</p>
        <p>To be placed on the agenda, contact Teri Forbes (Treasurer) at <a href="mailto:tforbesgroup@hotmail.com">tforbesgroup@hotmail.com</a> or 435-231-4820, or Frank Davie (Chair) at <a href="mailto:frankernstdavie@gmail.com">frankernstdavie@gmail.com</a> or 435-668-9279.</p>
      </section>
      <section className="detail-section">
        <h2>Applicant materials and resources</h2>
        <p>Applicants must complete a <a href="https://drive.google.com/drive/u/0/folders/170MXN4YzhWN2e4QS-kPnzq7dY_UMtVkb?ths=true">Project Information Sheet</a> and a site plan at least 48 hours before the public meeting. In-person attendance is encouraged so questions can be answered; phone or Zoom attendance is also available if needed.</p>
        <p><a href="https://drive.google.com/drive/u/0/folders/170MXN4YzhWN2e4QS-kPnzq7dY_UMtVkb?ths=true">View the Pine Valley Overlay Zone section of Washington County code</a>.</p>
        <p>New homes and additions also pay a one-time impact fee to the Pine Valley Fire Department. <a href="https://drive.google.com/drive/u/0/folders/170MXN4YzhWN2e4QS-kPnzq7dY_UMtVkb?ths=true">Find impact fee information and resources</a>. New residents may also find general information in the same resource folder.</p>
        <p><a href="/documents/Other%20Public%20Documents/Final%20Overlay%20Ordinance%20July%202022.pdf">Download the adopted Overlay Zone ordinance (PDF)</a></p>
      </section>
    </>
  );
}

function PvladDetails() {
  return (
    <>
      <section className="detail-section">
        <h2>About PVLAD</h2>
        <p>The Pine Valley Local Administration District is a five-person board established by Washington County in 2008. Its mission is:</p>
        <blockquote>To enhance the “sense of place” in the Pine Valley community by interfacing with other government agencies to improve public safety, ensure an effective volunteer Community Watch program, and monitor implementation of the Pine Valley Overlay Zone.</blockquote>
        <p>To improve public safety, the board purchased and maintains four electronic speed signs and contracts with the Washington County Sheriff’s Office for additional patrols during summer holiday weekends. Learn more about <Link href="/community-watch/">Community Watch</Link> and the <Link href="/overlay-zone/">Overlay Zone</Link>.</p>
      </section>
      <section className="detail-section">
        <h2>Meetings and public participation</h2>
        <p>The board meets on the second Wednesday of each month at 6:00 pm at the Fire Station, 680 East Main Street, Pine Valley. Public participation is encouraged in person or electronically.</p>
      </section>
      <section className="detail-section">
        <h2>Board and district contacts</h2>
        <ul>
          <li>Frank Davie, Chair — 435-668-9279 · <a href="mailto:frankernstdavie@gmail.com">frankernstdavie@gmail.com</a></li>
          <li>Tom Nielsen, Vice Chair — 760-415-2063 · <a href="mailto:tom.nielsen@pinevalleyutah.org">tom.nielsen@pinevalleyutah.org</a></li>
          <li>Emily Neilson — 702-249-1726 · <a href="mailto:emily.neilson@pinevalleyutah.org">emily.neilson@pinevalleyutah.org</a></li>
          <li>Cortney Snow — 435-862-8237 · <a href="mailto:cortney.snow@pinevalleyutah.org">cortney.snow@pinevalleyutah.org</a></li>
          <li>Brad Esposito — 702-830-2662 · <a href="mailto:brad.esposito@pinevalleyutah.org">brad.esposito@pinevalleyutah.org</a></li>
          <li>Treasurer: Teri Forbes — 435-231-4820 · <a href="mailto:teri.forbes@pinevalleyutah.org">teri.forbes@pinevalleyutah.org</a></li>
          <li>Clerk: Rick Peetz — 702-748-6058 · <a href="mailto:rick.peetz@pinevalleyutah.org">rick.peetz@pinevalleyutah.org</a></li>
        </ul>
        <p>All PVLAD board members are appointed by the Washington County Commission for four-year terms. Members must be U.S. citizens and registered voters whose primary residence is within the Pine Valley boundaries. Board members are not compensated. For information about serving, contact the <a href="tel:+14353017000">Washington County Commission at 435-301-7000</a>.</p>
      </section>
      <section className="detail-section">
        <h2>District records and reporting</h2>
        <p>The district is funded by an annual fee of $20 for residential homes and commercial businesses; vacant properties are not charged.</p>
        <p>Browse PVLAD agendas, minutes, policies, and procedures in the public documents below. <a href="https://www.washco.utah.gov/departments/auditor/report-fraud-waste-abuse/">Report fraud, waste, or abuse to Washington County</a>.</p>
      </section>
    </>
  );
}

export function CommunityPage({ bucket }) {
  const content = communityBuckets.find((item) => item.slug === bucket);

  if (!content?.sections) notFound();

  const documents = getCommunityDocuments(bucket);

  return (
    <>
      <PageIntro
        eyebrow={content.category}
        title={content.title}
        description={content.description}
      >
        <Link href="/#community">← Community services</Link>
      </PageIntro>

      <div className="detail-layout">
        <CommunityNavigation currentBucket={bucket} />
        <div>
          {content.sections.map((section) => (
            <CommunitySection key={section.title} section={section} />
          ))}
          {bucket === "community-watch" && <CommunityWatchDetails />}
          {bucket === "overlay-zone" && <OverlayZoneDetails />}
          {bucket === "pvlad" && <PvladDetails />}
          {bucket === "community-resources" && <CommunityResources />}
          {bucket === "community-events"
            ? <CommunityEventsSection />
            : <CommunityDocuments bucket={bucket} documents={documents} />}
        </div>
      </div>
    </>
  );
}
