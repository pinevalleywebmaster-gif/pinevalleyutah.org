export function ContactGroup({ group }) {
  return <section className="contact-card"><h2>{group.title}</h2><ul className="contact-list">{group.people.map((person) => <li key={`${person.name}-${person.role}`}><strong>{person.name}</strong><span>{person.role}</span><a href={`mailto:${person.email}`}>{person.email}</a></li>)}</ul></section>;
}
