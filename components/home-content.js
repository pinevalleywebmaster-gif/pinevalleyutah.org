import Link from "next/link";
import { communityBuckets } from "../data/community-content";
import { ActivityFlyer } from "./activity-flyer";
import { SectionHeading } from "./section-heading";
import { getCommunityEvents } from "../lib/community-events";

const activityFlyers = getCommunityEvents().flatMap((event) => event.flyers.map((flyer) => ({
  title: `${event.title}: ${flyer.title}`,
  href: flyer.href,
  previewImage: flyer.previewImage,
  previewLabel: `Open the ${flyer.title} PDF`,
  downloadLabel: "Download flyer PDF",
})));

function CommunityServices() {
  return (
    <section id="community" aria-labelledby="community-heading">
      <SectionHeading
        eyebrow="Your community, at a glance"
        title="How can we help?"
        description={`${communityBuckets.length} places to find what you need.`}
        id="community-heading"
        headingLevel={1}
      />
      <div className="service-grid">
        {communityBuckets.map((bucket, index) => (
          <Link
            className="service-card"
            key={bucket.slug}
            href={`/${bucket.slug}/`}
          >
            <div className="service-meta">
              <span>{bucket.category}</span>
              <span aria-hidden="true">{`0${index + 1}`}</span>
            </div>
            <h3>{bucket.title}</h3>
            <p>{bucket.description}</p>
            <span className="card-action">
              Explore <span aria-hidden="true">→</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function CommunityActivities() {
  return (
    <section className="updates-panel activities-panel" aria-labelledby="updates-heading">
      <div>
        <p className="eyebrow">Stay informed</p>
        <h2 id="updates-heading">Community Activities</h2>
        <p>
          There are numerous community activities planned throughout the year.{' '}
          <Link href="/community-events/">Click here to learn more.</Link>
        </p>
        <p>
          If you are interested in being involved with the community activities
          committee, please contact Mitzi Sullivan at{' '}
          <a href="tel:+14356805988">435-680-5988</a> or Korrie Ford at{' '}
          <a href="tel:+17025778777">702-577-8777</a>.
        </p>
      </div>
      <div className="activity-flyers">
        {activityFlyers.map((flyer) => (
          <ActivityFlyer key={flyer.href} {...flyer} />
        ))}
      </div>
    </section>
  );
}

function HelpPanel() {
  return (
    <section className="help-panel">
      <div>
        <p className="eyebrow">Get in touch</p>
        <h2>Need a hand finding something?</h2>
        <p>
          Send questions or website suggestions to{' '}
          <a href="mailto:pine.valley.webmaster@gmail.com">
            pine.valley.webmaster@gmail.com
          </a>.
        </p>
      </div>
      <div>
        <h3>Report Fraud, Waste, or Abuse</h3>
        <p>Submit a report through the Washington County Auditor.</p>
        <a href="https://www.washco.utah.gov/departments/auditor/report-fraud-waste-abuse/">
          Washington County reporting form →
        </a>
      </div>
    </section>
  );
}

export function HomeContent() {
  return (
    <>
      <CommunityServices />
      <CommunityActivities />
      <HelpPanel />
    </>
  );
}
