import Link from "next/link";
import { navigation } from "../data/site-content";

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

function PrimaryNavigation() {
  return (
    <nav aria-label="Primary navigation">
      <ul>
        {navigation.map((item) => (
          <li key={item.href}>
            <Link href={item.href}>{item.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function SiteHeader() {
  return (
    <header className="site-header">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <AnnouncementBar />
      <div className="brand-wrap">
        <Link className="brand" href="/">Pine Valley Utah</Link>
        <p>Community information and public resources</p>
      </div>
      <PrimaryNavigation />
    </header>
  );
}
