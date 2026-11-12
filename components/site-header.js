import Link from "next/link";
import { HomeAnnouncement, HomeSubtitle } from "./home-subtitle";
import { PrimaryNavigation } from "./primary-navigation";

function AnnouncementBar() {
  return (
    <div className="announcement">
      <div className="content-width">
        <span>PVLAD: second Wednesday at 6:00 pm · PVSSD: second Wednesday at 7:00 pm</span>
        <Link href="/pvssd/#meetings">Meeting details →</Link>
      </div>
    </div>
  );
}

export function SiteHeader() {
  return (
    <header className="site-header">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <HomeAnnouncement>
        <AnnouncementBar />
      </HomeAnnouncement>
      <div className="brand-wrap">
        <Link className="brand" href="/">Pine Valley Utah</Link>
        <HomeSubtitle />
      </div>
      <PrimaryNavigation />
    </header>
  );
}
