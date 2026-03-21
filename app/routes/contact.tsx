import { Link } from "react-router";
import { Locations } from "~/components/Locations";
import { GetStarted } from "~/components/GetStarted";

export function meta() {
  return [
    { title: "Contact | Dr. Sam Elguizaoui, M.D." },
    { name: "description", content: "Contact Dr. Sameh Elguizaoui's orthopedic surgery offices in Manhattan, Brooklyn, and Scarsdale." },
  ];
}

const offices = [
  { name: "Upper East Side", address: "159 East 74th St, New York, NY" },
  { name: "Greenwich Village", address: "200 West 13th St, New York, NY" },
  { name: "Brooklyn Heights", address: "161 Atlantic Ave, Brooklyn, NY" },
];

export default function ContactPage() {
  return (
    <>
      <section className="service-hero">
        <div className="container">
          <p className="hero-label">Get in Touch</p>
          <h1>Contact Us</h1>
          <p>Schedule an appointment or reach out to Dr. Elguizaoui&rsquo;s practice. Multiple convenient locations across Manhattan and Brooklyn.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="service-content">
            <div className="service-main">
              <h2>Schedule Your Appointment</h2>
              <p>
                The easiest way to schedule with Dr. Elguizaoui is through Zocdoc. Same-week appointments are often available for urgent orthopedic concerns.
              </p>
              <div style={{ marginBottom: "2rem" }}>
                <Link to="/book" className="btn btn-primary" style={{ marginRight: "12px" }}>Book Appointment</Link>
                <a href="https://www.zocdoc.com/doctor/sam-elguizaoui-md-236423" target="_blank" rel="noopener" className="btn btn-outline">
                  Book on Zocdoc
                </a>
              </div>

              <h3>Office Locations</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "2rem" }}>
                {offices.map((office) => (
                  <div key={office.name} style={{
                    padding: "20px",
                    borderRadius: "var(--radius)",
                    border: "1px solid var(--border)",
                    background: "var(--bg-alt)",
                  }}>
                    <h4 style={{ margin: "0 0 8px" }}>{office.name}</h4>
                    <p style={{ margin: 0, color: "var(--text-light)", fontSize: "0.95rem" }}>{office.address}</p>
                  </div>
                ))}
              </div>

              <h3>What to Bring to Your First Visit</h3>
              <ul className="service-list">
                <li>Insurance card</li>
                <li>Photo ID</li>
                <li>Any relevant imaging (X-rays, MRI)</li>
                <li>List of current medications</li>
                <li>Referral paperwork if required by insurance</li>
              </ul>
            </div>

            <aside className="service-sidebar">
              <div className="sidebar-card">
                <h4>Contact Information</h4>
                <p><strong>Phone:</strong> <a href="tel:+19179059370">+1-917-905-9370</a></p>
                <p><strong>Website:</strong> SportsOrthoMD.com</p>
              </div>
              <div className="sidebar-card">
                <h4>Office Hours</h4>
                <p>Monday&ndash;Friday, by appointment</p>
                <p style={{ color: "var(--accent)", fontWeight: 600 }}>Same-week appointments available</p>
              </div>
              <div className="sidebar-card">
                <h4>Follow Us</h4>
                <p>
                  <a href="https://www.instagram.com/sportsdocsam" target="_blank" rel="noopener" style={{ display: "block", marginBottom: "8px" }}>
                    Instagram @sportsdocsam
                  </a>
                  <a href="https://www.linkedin.com/in/samelguizaoui" target="_blank" rel="noopener">
                    LinkedIn
                  </a>
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <Locations />
      <GetStarted />
    </>
  );
}
