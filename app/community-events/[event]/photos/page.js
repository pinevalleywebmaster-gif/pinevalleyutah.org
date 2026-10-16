import { notFound } from "next/navigation";
import { CommunityEventPhotos } from "../../../../components/community-event-photos";
import { getCommunityEvent, getCommunityEvents } from "../../../../lib/community-events";

export const dynamicParams = false;

export function generateStaticParams() {
  return getCommunityEvents().map(({ slug }) => ({ event: slug }));
}

export async function generateMetadata({ params }) {
  const { event: eventSlug } = await params;
  const event = getCommunityEvent(eventSlug);
  return event ? { title: `${event.title} Photos` } : {};
}

export default async function EventPhotosPage({ params }) {
  const { event: eventSlug } = await params;
  const event = getCommunityEvent(eventSlug);
  if (!event) notFound();

  return <CommunityEventPhotos event={event} />;
}
