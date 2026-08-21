import { meetings } from "../data/site-content";

export function Meetings() {
  return (
    <section>
      <h2>Meetings Schedule</h2>
      <h3>Pine Valley Special Service District Board of Trustees</h3>
      <p>{meetings.district}</p>
      <p>{meetings.access}</p>
      <h3>Pine Valley Heritage Center</h3>
      <p>{meetings.heritage}</p>
    </section>
  );
}
