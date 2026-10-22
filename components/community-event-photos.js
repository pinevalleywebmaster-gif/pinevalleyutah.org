import Link from "next/link";
import { PageIntro } from "./page-intro";
import { DownloadIcon } from "./download-icon";

function PhotoDownload({ photo }) {
  const label = `Download ${photo.title} photo`;

  return (
    <figure className="community-event-photo">
      <img src={photo.href} alt={photo.title} loading="lazy" />
      <figcaption>
        <a className="event-photo-download" href={photo.href} download aria-label={label}>
          <DownloadIcon />
          <span>Download photo</span>
        </a>
      </figcaption>
    </figure>
  );
}

export function CommunityEventPhotos({ event }) {
  return (
    <>
      <PageIntro
        eyebrow="Community activities"
        title={`${event.title} photos`}
        description={`Photos shared from ${event.title}.`}
      >
        <Link href="/community-events/">← Community activities</Link>
      </PageIntro>
      <section className="detail-section">
        {event.photos.length > 0 ? (
          <div className="community-event-photo-grid">
            {event.photos.map((photo) => <PhotoDownload key={photo.href} photo={photo} />)}
          </div>
        ) : (
          <p className="community-event-empty">No photos have been posted for this event yet.</p>
        )}
      </section>
    </>
  );
}
