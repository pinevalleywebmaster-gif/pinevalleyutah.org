import Link from "next/link";
import { DocumentList } from "./document-list";

function CommunityEventCard({ event }) {
  const photosHref = `/community-events/${event.slug}/photos/`;

  return (
    <article className="community-event-card">
      <h3>{event.title}</h3>
      {event.flyers.length > 0 ? (
        <DocumentList documents={event.flyers} preview />
      ) : (
        <p className="community-event-empty">No flyers have been posted for this event yet.</p>
      )}
      <div className="community-event-footer">
        {event.photos.length > 0 ? (
          <Link className="button" href={photosHref}>View event photos</Link>
        ) : (
          <button className="button" type="button" disabled>
            No photos posted for this event yet
          </button>
        )}
      </div>
    </article>
  );
}

export function CommunityEventList({ events }) {
  return (
    <div className="community-event-list">
      {events.map((event) => <CommunityEventCard key={event.slug} event={event} />)}
    </div>
  );
}
