import { DownloadIcon } from "./download-icon";

export function DocumentPreview({ document }) {
  const downloadLabel = `Download ${document.title} PDF`;

  return (
    <article className="document-preview-card">
      <div className="document-preview-heading">
        <div>
          <h3>{document.title}</h3>
          <p>{document.subtitle ?? "PDF document"}</p>
        </div>
        <a
          className="document-preview-download"
          href={document.href}
          download
          aria-label={downloadLabel}
          title={downloadLabel}
        >
          <DownloadIcon />
        </a>
      </div>
      {document.previewImage && (
        <img
          className="document-preview-image"
          src={document.previewImage}
          alt={`${document.title} flyer`}
          loading="lazy"
        />
      )}
    </article>
  );
}
