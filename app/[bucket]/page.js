import Link from "next/link";
import { notFound } from "next/navigation";
import { communityBuckets } from "../../data/community-content";
import { districtGroups } from "../../data/site-content";
import { ContactGroup } from "../../components/contact-group";

export const dynamicParams = false;
export function generateStaticParams() {
  return communityBuckets.filter((bucket) => bucket.sections).map((bucket) => ({ bucket: bucket.slug }));
}
export async function generateMetadata({ params }) {
  const { bucket } = await params;
  const content = communityBuckets.find((item) => item.slug === bucket);
  return { title: content?.title, description: content?.description };
}
export default async function CommunityPage({ params }) {
  const { bucket } = await params;
  const content = communityBuckets.find((item) => item.slug === bucket && item.sections);
  if (!content) notFound();
  return <>
    <div className="page-intro"><Link href="/#community">← Community services</Link><p className="eyebrow">{content.category}</p><h1>{content.title}</h1><p className="intro">{content.description}</p></div>
    <div className="detail-layout"><aside className="page-menu" aria-label="Community services"><p className="eyebrow">Explore Pine Valley</p>{communityBuckets.map((item) => <Link key={item.slug} href={`/${item.slug}/`} aria-current={item.slug === bucket ? "page" : undefined}>{item.title}</Link>)}</aside><div>{content.sections.map((section) => <section className="detail-section" key={section.title}><h2>{section.title}</h2><p>{section.text}</p>{section.href && <p><Link href={section.href}>{section.label} →</Link></p>}{section.contact && <a href={`mailto:${section.contact}`}>{section.contact}</a>}</section>)}{bucket === "pvlad" && <ContactGroup group={districtGroups[2]} />}</div></div>
  </>;
}
