import Link from "next/link";
import { navigation } from "../data/site-content";

export function SiteHeader() {
  return (
    <header className="site-header">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div className="announcement"><div className="content-width"><span>Public meetings · First Wednesday of each month at 6:00 pm</span><Link href="/pvssd/#meetings">Meeting details →</Link></div></div>
      <div className="brand-wrap">
        <Link className="brand" href="/">Pine Valley Utah</Link>
        <p>Community information and public resources</p>
      </div>
      <nav aria-label="Primary navigation">
        <ul>
          {navigation.map((item) => (
            <li key={item.href}><Link href={item.href}>{item.label}</Link></li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
