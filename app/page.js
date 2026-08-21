import Image from "next/image";
import { Meetings } from "../components/meetings";

export default function HomePage() {
  return (
    <div className="card-grid">
      <section>
        <h1>Welcome to Pine Valley</h1>
        <p>Find community information, public records, meeting details, and local resources for Pine Valley, Utah.</p>
        <p>If you have comments or suggestions, email <a href="mailto:pine.valley.webmaster@gmail.com">pine.valley.webmaster@gmail.com</a>.</p>
      </section>
      <Meetings />
      <section>
        <h2>Report Fraud, Waste, or Abuse</h2>
        <p>Use the Washington County Auditor’s reporting page or scan the QR code.</p>
        <a href="https://www.washco.utah.gov/departments/auditor/report-fraud-waste-abuse/">Washington County reporting form</a>
        <Image className="qr-code" src="/assets/report-abuse-qr-code.png" alt="QR code for reporting fraud, waste, or abuse" width={400} height={400} />
      </section>
    </div>
  );
}
