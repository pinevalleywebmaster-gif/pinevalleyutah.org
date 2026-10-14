export function DocumentPreview({ document }) {
  const label = `Download ${document.title} PDF`;

  return <article className="document-preview-card">
    <div className="document-preview-heading">
      <div>
        <h3>{document.title}</h3>
        <p>{document.subtitle ?? "PDF document"}</p>
      </div>
      <a className="document-preview-download" href={document.href} download aria-label={label} title={label}>
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M12 3v11m0 0 4-4m-4 4-4-4M5 17v3h14v-3" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </svg>
      </a>
    </div>
    <iframe className="document-preview-frame" src={`${document.href}#view=FitH`} title={`${document.title} PDF preview`} loading="lazy">
      <a href={document.href} download>{label}</a>
    </iframe>
  </article>;
}
