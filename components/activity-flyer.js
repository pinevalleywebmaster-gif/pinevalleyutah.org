export function ActivityFlyer({ title, href, previewLabel, downloadLabel }) {
  return (
    <article>
      <h3>{title}</h3>
      <a href={href} target="_blank" rel="noreferrer">
        <object
          data={`${href}#view=FitH`}
          type="application/pdf"
          aria-label={previewLabel}
        >
          <span>{previewLabel}</span>
        </object>
      </a>
      <a className="button" href={href} download>
        {downloadLabel}
      </a>
    </article>
  );
}
