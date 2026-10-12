import Link from "next/link";
import { notFound } from "next/navigation";
import { communityBuckets } from "../data/community-content";
import { districtGroups } from "../data/site-content";
import { ContactGroup } from "./contact-group";
import { DocumentList } from "./document-list";
import { featuredDocuments, topicDocuments as registeredTopicDocuments, topicFolders } from "../data/documents";
import { getDocuments, groupDocumentsByDriveFolder, mergeDocuments } from "../lib/documents";

export function CommunityPage({ bucket }) {
  const content = communityBuckets.find((item) => item.slug === bucket);
  if (!content?.sections) notFound();
  const topicDocuments = mergeDocuments(groupDocumentsByDriveFolder([
    ...(topicFolders[bucket] ? getDocuments(topicFolders[bucket]) : []),
  ]), registeredTopicDocuments[bucket] ?? [], featuredDocuments[bucket] ?? []);

  return <>
    <div className="page-intro"><Link href="/#community">← Community services</Link><p className="eyebrow">{content.category}</p><h1>{content.title}</h1><p className="intro">{content.description}</p></div>
    <div className="detail-layout"><aside className="page-menu" aria-label="Community services"><p className="eyebrow">Explore Pine Valley</p>{communityBuckets.map((item) => <Link key={item.slug} href={`/${item.slug}/`} aria-current={item.slug === bucket ? "page" : undefined}>{item.title}</Link>)}</aside><div>{content.sections.map((section) => <section className="detail-section" key={section.title}><h2>{section.title}</h2><p>{section.text}</p>{section.href && <p><Link href={section.href}>{section.label} →</Link></p>}{section.contact && <a href={`mailto:${section.contact}`}>{section.contact}</a>}</section>)}{(topicFolders[bucket] || registeredTopicDocuments[bucket] || featuredDocuments[bucket]) && <section className="detail-section"><h2>{bucket === "pvlad" ? "PVLAD documents" : bucket === "overlay-zone" ? "Overlay Zone documents" : "Community activity downloads"}</h2><p>Choose a document to download.</p><DocumentList documents={topicDocuments} emptyMessage={`No ${bucket === "pvlad" ? "PVLAD" : "Overlay Zone"} PDFs are synced yet. Files will appear after the Drive sync has access to the source folder.`} /></section>}{bucket === "pvlad" && <ContactGroup group={districtGroups[2]} />}</div></div>
  </>;
}
