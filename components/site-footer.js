import { resourceLinks } from "../data/community-content";

export function SiteFooter() {
  return (
    <footer><div className="content-width">
      <div className="footer-grid"><div><strong className="footer-brand">Pine Valley Utah</strong><p>Community information and public resources</p></div><div><strong>Community resources</strong><ul>{resourceLinks.map((link) => <li key={link.href}><a href={link.href}>{link.label}</a></li>)}</ul></div><div><strong>Contact</strong><p><a href="mailto:pine.valley.webmaster@gmail.com">Website questions & suggestions</a></p><a href="/pvssd/">District contacts →</a></div></div>
      <p>All trademarks and copyrights are held by their respective owners. Materials not otherwise credited are public domain or Â© 2000â€“2026, PVSSD Board of Trustees.</p>
    </div></footer>
  );
}
