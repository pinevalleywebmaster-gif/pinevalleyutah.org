import { Meetings } from "../../components/meetings";
import { districtGroups } from "../../data/site-content";

export const metadata = { title: "PVSSD Board of Trustees" };

export default function PvssdPage() {
  return <div><h1>Pine Valley Special Service District</h1><div className="contact-grid">{districtGroups.map((group) => <section className="contact-card" key={group.title}><h2>{group.title}</h2><ul className="contact-list">{group.people.map((person) => <li key={`${group.title}-${person.name}-${person.role}`}><strong>{person.name}</strong><span>{person.role}</span><a href={`mailto:${person.email}`}>{person.email}</a></li>)}</ul></section>)}</div><Meetings /></div>;
}
