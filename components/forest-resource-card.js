export function ForestResourceCard() {
  return (
    <section aria-label="Explore nearby">
      <a
        className="forest-resource-card"
        href="https://www.fs.usda.gov/detailfull/dixie/home/?cid=fseprd1013358"
        target="_blank"
        rel="noreferrer"
      >
        <span className="eyebrow">Explore nearby</span>
        <strong>Dixie National Forest</strong>
        <span className="forest-resource-action">
          Visit the U.S. Forest Service website <span aria-hidden="true">↗</span>
        </span>
      </a>
    </section>
  );
}
