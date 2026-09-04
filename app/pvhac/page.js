import { historicalDocuments } from "../../data/site-content";

export const metadata = { title: "Historical Advisory Committee" };

export default function PvhacPage() {
  return (
    <article>
      <h1>Pine Valley Historical Advisory Committee</h1>
      <section><h2>About the Committee</h2><p>The Pine Valley Historical Advisory Committee was created by the Washington County Commission on June 4, 2002, to advise the commission and appropriate county departments on matters relating to the historical preservation of Pine Valley.</p><h3>The Committeeâ€™s Duties</h3><ul><li>Initiate and promote historic preservation of the historic character of the area.</li><li>Prepare proposals for preserving and enhancing the areaâ€™s historic character, public spaces, and buildings.</li><li>Coordinate with people, agencies, and organizations whose work affects the historic nature of the area.</li><li>Submit proposals for consideration in county plans and ordinances.</li></ul></section>
      <section><h2>Community Planning</h2><p>The committee reviewed existing facilities and services, completed a land-use survey, and gathered community input to support long-term planning.</p><ul className="document-list">{historicalDocuments.map((document) => <li key={document.href}><a href={document.href}>{document.label}</a></li>)}</ul><p>The Pine Valley Community General Plan was approved by the Washington County Commission on November 3, 2003, as a guide for future building, development, and historical preservation in the valley.</p></section>
    </article>
  );
}
