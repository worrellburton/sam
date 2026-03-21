import { Link } from "react-router";

export function meta() {
  return [
    { title: "About Dr. Sam Elguizaoui | Orthopedic Surgeon NYC" },
    { name: "description", content: "Board-certified orthopedic surgeon Dr. Sameh Elguizaoui specializes in sports medicine, joint preservation, and cartilage repair. Lenox Hill fellowship trained." },
  ];
}

export default function AboutPage() {
  return (
    <>
      <section className="service-hero">
        <div className="container">
          <h1>About Dr. Elguizaoui</h1>
          <p>Board-Certified Orthopedic Surgeon &amp; Sports Medicine Specialist</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="service-content">
            <div className="service-main">
              <div className="about-content">
                <p className="about-lead">
                  Dr. Sameh &ldquo;Sam&rdquo; Elguizaoui is a board-certified orthopedic surgeon and fellowship-trained sports medicine specialist practicing in New York City. He is committed to providing patient-centered orthopedic care, combining world-class surgical expertise with a conservative, evidence-based approach.
                </p>
                <h2>Training &amp; Education</h2>
                <p>
                  Dr. Elguizaoui completed his <strong>Sports Medicine Fellowship at Lenox Hill Hospital</strong> in New York City, one of the premier sports medicine training programs in the country. During his fellowship, he served as a team physician for the <strong>New York Jets (NFL)</strong> and <strong>New York Islanders (NHL)</strong>.
                </p>
                <p>
                  He further honed his skills through an <strong>international traveling fellowship</strong> across <strong>Switzerland, the Netherlands, and Italy</strong>, focusing on advanced cartilage repair and transplant techniques at leading European centers.
                </p>
                <p>
                  Dr. Elguizaoui completed his <strong>orthopedic surgery residency at Cleveland Clinic Akron General Hospital</strong> and earned his <strong>Doctor of Medicine from The Ohio State University College of Medicine</strong>, graduating cum laude. He holds a Bachelor of Science in Biology from The Ohio State University, graduating magna cum laude with a minor in Psychology.
                </p>

                <h2>Philosophy</h2>
                <p>
                  Dr. Elguizaoui is a strong advocate for biologic alternatives to surgery and regenerative medicine. He believes in exhausting conservative treatment options before recommending surgical intervention, and when surgery is necessary, he favors minimally invasive arthroscopic techniques for faster recovery and better outcomes.
                </p>

                <h2>Hospital Affiliations</h2>
                <ul className="service-list">
                  <li>Lenox Hill Hospital</li>
                  <li>Mount Sinai Hospital</li>
                  <li>NewYork-Presbyterian Brooklyn Methodist Hospital</li>
                </ul>

                <h2>Professional Memberships</h2>
                <ul className="service-list">
                  <li>American Academy of Orthopaedic Surgeons (AAOS)</li>
                  <li>American Orthopaedic Society for Sports Medicine (AOSSM)</li>
                  <li>Arthroscopy Association of North America (AANA)</li>
                  <li>The New York Cartilage Repair Society</li>
                </ul>
              </div>
            </div>
            <aside className="service-sidebar">
              <div className="sidebar-card">
                <h4>Book a Consultation</h4>
                <p>See Dr. Elguizaoui at one of our NYC locations.</p>
                <Link to="/book" className="btn btn-primary btn-block">Book Now</Link>
                <a href="tel:+19179059370" style={{ display: "block", textAlign: "center", marginTop: "12px", color: "var(--text-light)" }}>
                  +1-917-905-9370
                </a>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
