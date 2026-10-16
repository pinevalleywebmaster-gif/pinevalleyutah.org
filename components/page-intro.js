export function PageIntro({ eyebrow, title, description, children }) {
  return (
    <header className="page-intro">
      {children}
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1>{title}</h1>
      {description && <p className="intro">{description}</p>}
    </header>
  );
}
