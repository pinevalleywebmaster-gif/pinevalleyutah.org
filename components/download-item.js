import { DownloadIcon } from "./download-icon";

export function DownloadItem({ document }) {
  const previewLabel = `Preview ${document.title} PDF`;
  const downloadLabel = `Download ${document.title} PDF`;
  const description = document.subtitle ?? document.relativePath ?? "PDF document";

  return (
    <li className="download-item">
      <a
        className="download-item-preview"
        href={document.href}
        target="_blank"
        rel="noreferrer"
        aria-label={previewLabel}
      >
        <span className="download-item-copy">
          <strong>{document.title}</strong>
          <span>{description}</span>
        </span>
      </a>
      <a
        className="download-item-action"
        href={document.href}
        download
        aria-label={downloadLabel}
        title={downloadLabel}
      >
        <span>Download</span>
        <DownloadIcon />
      </a>
    </li>
  );
}
