export function ActivityFlyer({ title, href, previewImage, previewLabel, downloadLabel }) {
  return (
    <article>
      <h3>{title}</h3>
      <a href={href} target="_blank" rel="noreferrer">
        {previewImage
          ? <img src={previewImage} alt={previewLabel} loading="lazy" />
          : <span>{previewLabel}</span>}
      </a>
      <a className="button" href={href} download>
        {downloadLabel}
      </a>
    </article>
  );
}
