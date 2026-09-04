import Link from "next/link";
import { districtGroups, meetings } from "../../data/site-content";
import { ContactGroup } from "../../components/contact-group";

export const metadata = { title: "Pine Valley Special Service District" };

export default function PvssdPage() {
  return <>
    <div className="page-intro"><Link href="/#community">← Community services</Link><p className="eyebrow">PVSSD</p><h1>Pine Valley Special Service District</h1><p className="intro">Connect with the district’s board and staff, find public meeting information, and access district records.</p></div>
    <section id="meetings" className="updates-panel"><div><p className="eyebrow">Take part</p><h2>Public meetings</h2></div><div><p>{meetings.district}</p><p>{meetings.access}</p><Link href="/public-documents/">Public records, agendas & minutes →</Link></div></section>
    <div className="contact-grid">{districtGroups.slice(0, 2).map((group) => <ContactGroup key={group.title} group={group} />)}</div>
    <section className="help-panel"><div><h2>Fees & annual assessments</h2><p>For the current one-time impact fee, annual assessment, and payment instructions, contact the district treasurer. A fee schedule and online payment link have not been posted here.</p><a href="mailto:tforbesgroup@hotmail.com">Contact Teri Forbes, Treasurer →</a></div><div><h3>Looking for PVLAD?</h3><p>The Local Administration District has its own page for contacts and meeting inquiries.</p><Link href="/pvlad/">Visit the Local Administration District →</Link></div></section>
  </>;
}
