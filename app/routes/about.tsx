import { Link } from "react-router";
import { GetStarted } from "~/components/GetStarted";
import { Locations } from "~/components/Locations";
import { Insurance } from "~/components/Insurance";
import { seoMeta } from "~/seo";

export function meta() {
  return seoMeta({
    title: "About Dr. Sam Elguizaoui | Orthopedic Surgeon NYC",
    description: "Dr. Sameh Elguizaoui is a fellowship-trained orthopedic surgeon in NYC specializing in Sports Medicine, Joint Preservation, and Cartilage Repair. Former NY Jets & NY Islanders team physician.",
    path: "/about",
  });
}

const timeline = [
  { label: "International Fellowship", title: "Joint Preservation Traveling Fellowship", place: "Switzerland, Netherlands & Italy", detail: "Mastered European techniques in joint preservation and cartilage restoration at premier centers across three countries." },
  { label: "Fellowship", title: "Sports Medicine Fellowship", place: "Lenox Hill Hospital, New York City", detail: "Assistant team physician for the NY Jets (NFL), NY Islanders (NHL), Manhattanville College, and Hunter College." },
  { label: "Residency", title: "Orthopedic Surgery Residency", place: "Cleveland Clinic Akron General Hospital" },
  { label: "Medical School", title: "Doctor of Medicine (M.D.)", place: "The Ohio State University College of Medicine" },
  { label: "Undergraduate", title: "B.S. Biology, Minor in Psychology", place: "The Ohio State University", detail: "Graduated magna cum laude." },
];

const specializations = [
  {
    title: "Joint Preservation",
    desc: "Advanced cartilage repair (MACI, OATS) and meniscus transplantation to save the native knee.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
  {
    title: "Regenerative Medicine",
    desc: "Biologic alternatives such as PRP and stem cells to augment healing without major surgery.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
      </svg>
    ),
  },
  {
    title: "Sports Reconstruction",
    desc: "Arthroscopic repair of the shoulder (rotator cuff, labrum) and knee (ACL, ligaments).",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    ),
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="service-hero has-bg" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1600&h=600&fit=crop&q=80')" }}>
        <div className="container">
          <p className="hero-label">About</p>
          <h1>Meet Dr. Sameh Elguizaoui, M.D.</h1>
          <p>Sports Medicine Surgeon &amp; Joint Preservation Specialist</p>
        </div>
      </section>

      {/* Quote + Intro */}
      <section className="section">
        <div className="container">
          <div className="about-quote reveal">
            <blockquote>&ldquo;Preserving the Joint. Restoring the Athlete.&rdquo;</blockquote>
          </div>

          <div className="service-content">
            <div className="service-main">
              <p className="about-lead">
                Dr. Sameh (Sam) Elguizaoui is a fellowship-trained orthopedic surgeon specializing in Sports Medicine, Arthroscopy, and the advanced field of Joint Preservation. Based in New York City, Dr. Elguizaoui is dedicated to a unique clinical philosophy: helping young, active patients delay or avoid joint replacement through cutting-edge biologics, cartilage repair, and minimally invasive techniques.
              </p>

              <h2>Elite Training &amp; Team Coverage</h2>
              <p>
                A native of Northeast Ohio, Dr. Elguizaoui's foundation in excellence began at <strong>The Ohio State University</strong>, where he graduated magna cum laude with a degree in Biology and a minor in Psychology — a background that deeply informs his compassionate, patient-centered approach to care. He earned his medical degree from Ohio State before completing his orthopedic surgery residency at <strong>Cleveland Clinic Akron General Hospital</strong>.
              </p>
              <p>
                Dr. Elguizaoui then moved to New York City for the prestigious <strong>Sports Medicine Fellowship at Lenox Hill Hospital</strong>. During this time, he served as an assistant team physician for professional organizations including the <strong>New York Jets</strong> and the <strong>New York Islanders</strong>, as well as collegiate athletes at Manhattanville and Hunter College.
              </p>

              <h2>International Expertise</h2>
              <p>
                To bring the world's best techniques to his patients, Dr. Elguizaoui pursued an <strong>international traveling fellowship</strong>. He trained at premier centers in <strong>Switzerland, The Netherlands, and Italy</strong>, mastering European techniques in joint preservation and cartilage restoration that are often at the forefront of orthopedic innovation.
              </p>

              <h2>Clinical Specialization</h2>
              <p>
                Dr. Elguizaoui's practice is tailored to the "physician-athlete" and the "weekend warrior" alike:
              </p>

              <div className="about-specs">
                {specializations.map((s, i) => (
                  <div className="about-spec-card reveal" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
                    <div className="about-spec-icon">{s.icon}</div>
                    <div>
                      <h3>{s.title}</h3>
                      <p>{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <h2>Global Health Leadership</h2>
              <p>
                Beyond the operating room in NYC, Dr. Elguizaoui is a committed global health leader. Through <strong>Orthonations</strong>, he participates in medical missions to countries like Vietnam and Nepal. These missions focus on collaborative learning, where Dr. Elguizaoui teaches complex surgical techniques to local surgeons to help build sustainable healthcare systems abroad.
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
            </div>

            <aside className="service-sidebar">
              <div className="sidebar-card">
                <h4>Board Certified</h4>
                <ul className="service-list">
                  <li>American Board of Orthopaedic Surgery</li>
                  <li>Fellowship-trained Sports Medicine</li>
                  <li>International Joint Preservation Training</li>
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
                <h4>Accolades</h4>
                <ul className="service-list">
                  <li>Ohio State Magna Cum Laude</li>
                  <li>Orthonations Global Health Leader</li>
                  <li>Former NY Jets & Islanders Team Physician</li>
                </ul>
              </div>
              <div className="sidebar-card">
                <h4>Schedule a Consultation</h4>
                <p>Book your appointment with Dr. Elguizaoui today.</p>
                <Link to="/book" className="btn btn-primary btn-block">Book Now</Link>
                <a href="tel:+19179059370" style={{ display: "block", textAlign: "center", marginTop: "12px", color: "var(--text-light)" }}>
                  (917) 905-9370
                </a>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <Insurance />
      <GetStarted />
      <Locations />
    </>
  );
}
