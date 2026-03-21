import { Link } from "react-router";

export function meta() {
  return [
    { title: "Book Appointment | Dr. Sam Elguizaoui, M.D." },
    { name: "description", content: "Schedule an appointment with Dr. Sameh Elguizaoui, orthopedic surgeon in NYC." },
  ];
}

export default function BookPage() {
  return (
    <>
      <section className="service-hero">
        <div className="container">
          <h1>Book an Appointment</h1>
          <p>Schedule your consultation with Dr. Elguizaoui</p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: "700px", textAlign: "center" }}>
          <div style={{ padding: "60px 32px", borderRadius: "var(--radius)", border: "1px solid var(--border)", background: "var(--bg-alt)" }}>
            <h2 style={{ marginBottom: "16px" }}>Book on Zocdoc</h2>
            <p style={{ color: "var(--text-light)", marginBottom: "32px", maxWidth: "500px", margin: "0 auto 32px" }}>
              The fastest way to schedule is through Zocdoc. Choose your preferred location, select a time that works for you, and receive instant confirmation.
            </p>
            <a
              href="https://www.zocdoc.com/doctor/sam-elguizaoui-md-236423"
              target="_blank"
              rel="noopener"
              className="btn btn-primary btn-lg"
              style={{ fontSize: "1.1rem", padding: "16px 48px" }}
            >
              Book on Zocdoc
            </a>

            <div style={{ marginTop: "40px", paddingTop: "30px", borderTop: "1px solid var(--border)" }}>
              <p style={{ color: "var(--text-muted)", marginBottom: "12px" }}>Or call us directly:</p>
              <a href="tel:+19179059370" style={{ fontSize: "1.3rem", fontWeight: 600, color: "var(--primary)" }}>
                +1-917-905-9370
              </a>
            </div>
          </div>

          <div style={{ marginTop: "40px" }}>
            <h3 style={{ marginBottom: "16px" }}>Office Locations</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", textAlign: "left" }}>
              <div style={{ padding: "20px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                <strong>Upper East Side</strong>
                <p style={{ color: "var(--text-light)", fontSize: "0.9rem" }}>159 East 74th St, New York, NY</p>
              </div>
              <div style={{ padding: "20px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                <strong>Greenwich Village</strong>
                <p style={{ color: "var(--text-light)", fontSize: "0.9rem" }}>200 West 13th St, New York, NY</p>
              </div>
              <div style={{ padding: "20px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                <strong>Brooklyn Heights</strong>
                <p style={{ color: "var(--text-light)", fontSize: "0.9rem" }}>161 Atlantic Ave, Brooklyn, NY</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
