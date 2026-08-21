import Image from "next/image";
import Link from "next/link";
import { navigation } from "../data/site-content";

export function SiteHeader() {
  return (
    <header className="site-header">
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
      <Image className="hero-image" src="/assets/pine-valley-snowy-mountain.png" alt="Snow-covered Pine Valley Mountain" width={1800} height={520} priority />
    </header>
  );
}
