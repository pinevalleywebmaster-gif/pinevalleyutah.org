import Link from "next/link";
import { notFound } from "next/navigation";
import { communityBuckets, resourceLinks } from "../data/community-content";
import { featuredDocuments, topicDocuments as registeredTopicDocuments, topicFolders } from "../data/documents";
import { districtGroups } from "../data/site-content";
import { getDocuments, groupDocumentsByDriveFolder, mergeDocuments } from "../lib/documents";
import { ContactGroup } from "./contact-group";
import { DocumentList } from "./document-list";
import { PageIntro } from "./page-intro";
import { ResourceList } from "./resource-list";

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
          {bucket === "community-resources" && <CommunityResources />}
          <CommunityDocuments bucket={bucket} documents={documents} />
          {bucket === "pvlad" && <ContactGroup group={districtGroups[2]} />}
        </div>
      </div>
    </>
  );
}
