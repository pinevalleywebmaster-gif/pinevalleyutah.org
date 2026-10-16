import { resourceLinks } from "../data/community-content";

function FooterResources() {
  return (
    <div>
      <strong>Community resources</strong>
      <ul>
        {resourceLinks.map((link) => (
          <li key={link.href}>
            <a href={link.href}>{link.label}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FooterContact() {
  return (
    <div>
      <strong>Contact</strong>
      <p>
        <a href="mailto:pine.valley.webmaster@gmail.com">
          Website questions &amp; suggestions
        </a>
      </p>
      <a href="/pvssd/">District contacts →</a>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer>
      <div className="content-width">
        <div className="footer-grid">
          <div>
            <strong className="footer-brand">Pine Valley Utah</strong>
            <p>Community information and public resources</p>
          </div>
          <FooterResources />
          <FooterContact />
        </div>
        <p>
          All trademarks and copyrights are held by their respective owners.
          Materials not otherwise credited are public domain or © 2000–2026,
          PVSSD Board of Trustees.
        </p>
      </div>
    </footer>
  );
}
