import { Link } from "react-router";
import { GetStarted } from "~/components/GetStarted";

export function meta() {
  return [
    { title: "About Dr. Sam Elguizaoui | Orthopedic Surgeon NYC" },
    { name: "description", content: "Board-certified orthopedic surgeon Dr. Sameh Elguizaoui specializes in sports medicine, joint preservation, and cartilage repair. Lenox Hill fellowship trained." },
  ];
}

const timeline = [
  { label: "Fellowship", title: "Sports Medicine Fellowship", place: "Lenox Hill Hospital, New York City", detail: "Advanced training in minimally invasive and arthroscopic techniques. Care of NY Jets and NY Islanders athletes." },
  { label: "International Fellowship", title: "Joint Preservation Traveling Fellowship", place: "Switzerland, Netherlands & Italy", detail: "Specialized training in cartilage repair and transplant techniques at leading European clinics." },
  { label: "Residency", title: "Orthopedic Surgery Residency", place: "Cleveland Clinic Akron General Hospital" },
  { label: "Medical School", title: "Doctor of Medicine (M.D.)", place: "The Ohio State University College of Medicine", detail: "Graduated cum laude." },
  { label: "Undergraduate", title: "Bachelor of Science, Biology", place: "The Ohio State University", detail: "Graduated magna cum laude, Psychology minor." },
];

export default function AboutPage() {
  return (
    <>
      <section className="service-hero">
        <div className="container">
          <p className="hero-label">About</p>
          <h1>About Dr. Elguizaoui</h1>
          <p>Board-certified orthopedic surgeon and fellowship-trained sports medicine specialist serving Manhattan, Brooklyn, and NYC.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="service-content">
            <div className="service-main">
              <h2>Orthopedic Excellence, <span className="text-accent">Patient-First Approach</span></h2>
              <p className="about-lead">
                Board-certified orthopedic surgeon and fellowship-trained sports medicine specialist in New York City, combining world-class surgical training with conservative, patient-centered care.
              </p>

              <p>
                Trained at <strong>Cleveland Clinic</strong> and <strong>Lenox Hill Hospital</strong>, with an international fellowship across <strong>Switzerland, the Netherlands, and Italy</strong> in joint preservation and cartilage repair.
              </p>
              <p>
                Former team physician for the <strong>New York Jets (NFL)</strong> and <strong>New York Islanders (NHL)</strong>.
              </p>

              <h2>Training &amp; Credentials</h2>
              <div className="credentials-timeline">
                {timeline.map((item, i) => (
                  <div className="timeline-item" key={i}>
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <span className="timeline-label">{item.label}</span>
                      <h3>{item.title}</h3>
                      <p>{item.place}</p>
                      {item.detail && <p className="timeline-detail">{item.detail}</p>}
                    </div>
                  </div>
                ))}
              </div>

              <h2>Philosophy of Care</h2>
              <p>
                Dr. Elguizaoui believes in exhausting conservative and non-surgical options before recommending surgery. When surgery is necessary, he uses minimally invasive arthroscopic techniques to reduce pain, scarring, and recovery time. Every treatment plan begins with a thorough evaluation and honest discussion about all available options.
              </p>
            </div>

            <aside className="service-sidebar">
              <div className="sidebar-card">
                <h4>Board Certified</h4>
                <ul className="service-list">
                  <li>American Board of Orthopaedic Surgery</li>
                  <li>Fellowship-trained sports medicine specialist</li>
                  <li>International joint preservation training</li>
                </ul>
              </div>
              <div className="sidebar-card">
                <h4>Hospital Affiliations</h4>
                <ul className="service-list">
                  <li>Lenox Hill Hospital</li>
                  <li>Mount Sinai West</li>
                  <li>NYP Brooklyn Methodist Hospital</li>
                </ul>
              </div>
              <div className="sidebar-card">
                <h4>Schedule a Consultation</h4>
                <p>Book your appointment with Dr. Elguizaoui today.</p>
                <Link to="/book" className="btn btn-primary btn-block">Book Now</Link>
                <a href="tel:+19179059370" style={{ display: "block", textAlign: "center", marginTop: "12px", color: "var(--text-light)" }}>
                  +1-917-905-9370
                </a>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <GetStarted />
    </>
  );
}
