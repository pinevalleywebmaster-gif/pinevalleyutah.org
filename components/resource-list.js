export function ResourceList({ resources, className = "document-list" }) {
  return (
    <ul className={className}>
      {resources.map((resource) => (
        <li key={resource.href}>
          <a href={resource.href}>
            {resource.label}
            {resource.description && <span>{resource.description}</span>}
            {resource.external && (
              <span className="resource-indicator" aria-hidden="true">↗</span>
            )}
          </a>
        </li>
      ))}
    </ul>
  );
}
