export function DownloadItem({ document }) {
  return <li className="download-item">
    <a className="download-item-link" href={document.href} download>
      <span className="download-item-copy">
        <strong>{document.title}</strong>
        <span>{document.subtitle ?? document.relativePath ?? "PDF document"}</span>
      </span>
      <span className="download-item-action" aria-hidden="true">Download ↓</span>
    </a>
  </li>;
}
