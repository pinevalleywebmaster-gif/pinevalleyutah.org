import Link from "next/link";
import { DownloadIcon } from "./download-icon";

function EventFlyers({ flyers }) {
  return (
    <div className="community-event-flyers">
      {flyers.map((flyer) => flyer.previewImage ? (
        <a
          className="community-event-flyer"
          key={flyer.href}
          href={flyer.href}
          aria-label={`Open ${flyer.title} flyer PDF`}
        >
          <img src={flyer.previewImage} alt={`${flyer.title} flyer`} loading="lazy" />
        </a>
      ) : (
        <a key={flyer.href} href={flyer.href}>{flyer.title}</a>
      ))}
    </div>
  );
}

function CommunityEventCard({ event }) {
  const photosHref = `/community-events/${event.slug}/photos/`;

  return (
    <article className="community-event-card">
      <div className="community-event-heading">
        <h3>{event.title}</h3>
        {event.flyers.length > 0 && (
          <div className="community-event-downloads">
            {event.flyers.map((flyer) => (
              <a
                className="document-preview-download"
                key={flyer.href}
                href={flyer.href}
                download
                aria-label={`Download ${flyer.title} PDF`}
                title={`Download ${flyer.title} PDF`}
              >
                <DownloadIcon />
              </a>
            ))}
          </div>
        )}
      </div>
      {event.flyers.length > 0 ? (
        <EventFlyers flyers={event.flyers} />
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
