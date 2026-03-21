import { Link } from "react-router";
import { Locations } from "~/components/Locations";

export function meta() {
  return [
    { title: "Contact | Dr. Sam Elguizaoui, M.D." },
    { name: "description", content: "Contact Dr. Sameh Elguizaoui's orthopedic surgery offices in Manhattan, Brooklyn, and Scarsdale." },
  ];
}

export default function ContactPage() {
  return (
    <>
      <section className="service-hero">
        <div className="container">
          <h1>Contact Us</h1>
          <p>Schedule an appointment or reach out with questions</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="service-content">
            <div className="service-main">
              <h2>Get in Touch</h2>
              <p>
                We&rsquo;re here to help you get back to the activities you love. Whether you have a question about a condition, want to learn about treatment options, or are ready to schedule an appointment, we&rsquo;re available to assist.
              </p>

              <h3>Phone</h3>
              <p>
                <a href="tel:+19179059370" style={{ color: "var(--primary)", fontWeight: 600, fontSize: "1.2rem" }}>
                  +1-917-905-9370
                </a>
              </p>

              <h3>Book Online</h3>
              <p>
                The fastest way to schedule is through Zocdoc for instant appointment confirmation:
              </p>
              <a href="https://www.zocdoc.com/doctor/sam-elguizaoui-md-236423" target="_blank" rel="noopener" className="btn btn-primary" style={{ marginBottom: "2rem", display: "inline-block" }}>
                Book on Zocdoc
              </a>

              <h3>Office Hours</h3>
              <p>Monday &ndash; Friday: 8:00 AM &ndash; 5:00 PM</p>
              <p>Saturday &ndash; Sunday: Closed</p>
            </div>
            <aside className="service-sidebar">
              <div className="sidebar-card">
                <h4>Quick Contact</h4>
                <p><strong>Phone:</strong> <a href="tel:+19179059370">+1-917-905-9370</a></p>
                <Link to="/book" className="btn btn-primary btn-block" style={{ marginTop: "16px" }}>Book Now</Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <Locations />
    </>
  );
}
