export function DownloadItem({ document }) {
  const previewLabel = `Preview ${document.title} PDF`;
  const downloadLabel = `Download ${document.title} PDF`;

  return <li className="download-item">
    <a className="download-item-preview" href={document.href} target="_blank" rel="noreferrer" aria-label={previewLabel}>
      <span className="download-item-copy">
        <strong>{document.title}</strong>
        <span>{document.subtitle ?? document.relativePath ?? "PDF document"}</span>
      </span>
    </a>
    <a className="download-item-action" href={document.href} download aria-label={downloadLabel} title={downloadLabel}>
      <span>Download</span>
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M12 3v11m0 0 4-4m-4 4-4-4M5 17v3h14v-3" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      </svg>
    </a>
  </li>;
}
