export function SectionHeading({ eyebrow, title, description, id, headingLevel = 2 }) {
  const Heading = headingLevel === 1 ? "h1" : "h2";

  return (
    <div className="section-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <Heading id={id}>{title}</Heading>
      </div>
      {description && <p>{description}</p>}
    </div>
  );
}
