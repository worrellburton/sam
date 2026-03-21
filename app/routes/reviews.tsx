import { GetStarted } from "~/components/GetStarted";

export function meta() {
  return [
    { title: "Patient Reviews | Dr. Sam Elguizaoui, M.D." },
    { name: "description", content: "Read patient reviews for Dr. Sameh Elguizaoui. 4.8/5 stars on Zocdoc with 1,400+ reviews." },
  ];
}

const platforms = [
  { name: "Zocdoc", rating: "4.78", reviews: "1,400+", url: "https://www.zocdoc.com/doctor/sam-elguizaoui-md-236423", color: "#FF7043" },
  { name: "Google Reviews", rating: "4.8", reviews: "150+", url: "https://www.google.com/search?q=Dr+Sam+Elguizaoui+orthopedic+surgeon+NYC", color: "#4285F4" },
  { name: "Healthgrades", rating: "5.0", reviews: "50+", url: "https://www.healthgrades.com/physician/dr-sam-elguizaoui", color: "#1976D2" },
  { name: "U.S. News", rating: "—", reviews: "Doctor profile & rankings", url: "https://health.usnews.com/doctors", color: "#1B3A5C" },
  { name: "Vitals", rating: "4.9", reviews: "200+", url: "https://www.vitals.com/doctors/Dr_Sam_Elguizaoui.html", color: "#00BFA5" },
];

export default function ReviewsPage() {
  return (
    <>
      <section className="service-hero">
        <div className="container">
          <h1>Reviews &amp; Ratings</h1>
          <p>See why patients trust Dr. Elguizaoui with their orthopedic care</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>
              Rated Among NYC&rsquo;s <span className="text-accent">Top Orthopedic Surgeons</span>
            </h2>
            <p className="section-desc">
              Dr. Elguizaoui is consistently praised for his expertise, bedside manner, and outstanding patient outcomes across every major review platform.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px", marginTop: "40px" }}>
            {platforms.map((p) => (
              <a
                key={p.name}
                href={p.url}
                target="_blank"
                rel="noopener"
                style={{
                  display: "block",
                  padding: "32px 24px",
                  borderRadius: "var(--radius)",
                  border: "1px solid var(--border)",
                  background: "var(--bg-alt)",
                  textDecoration: "none",
                  color: "var(--text)",
                  textAlign: "center",
                  transition: "transform var(--transition), box-shadow var(--transition)",
                }}
              >
                {p.rating !== "—" && (
                  <div style={{ fontSize: "2.5rem", fontWeight: 700, color: p.color }}>{p.rating}</div>
                )}
                {p.rating !== "—" && (
                  <div style={{ fontSize: "1.2rem", color: "#f59e0b", marginBottom: "8px" }}>&#9733;&#9733;&#9733;&#9733;&#9733;</div>
                )}
                <div style={{ fontWeight: 600, fontSize: "1.1rem" }}>{p.name}</div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{p.reviews}</div>
              </a>
            ))}
          </div>

          {/* Patient Choice Badge */}
          <div style={{
            marginTop: "48px",
            padding: "24px 32px",
            borderRadius: "var(--radius)",
            border: "2px solid #f59e0b",
            background: "var(--bg-alt)",
            display: "flex",
            alignItems: "center",
            gap: "20px",
            maxWidth: "600px",
            marginLeft: "auto",
            marginRight: "auto",
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <div>
              <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>Zocdoc Patient Choice Award</div>
              <p style={{ margin: "4px 0 0", color: "var(--text-light)", fontSize: "0.95rem" }}>
                Providers with this badge are highly rated, reliable, and recommended by other patients.
              </p>
            </div>
          </div>

          {/* Reviews description */}
          <div className="section-header" style={{ marginTop: "60px" }}>
            <h2>What Do Patients Say About <span className="text-accent">Dr. Elguizaoui&rsquo;s Orthopedic Care?</span></h2>
            <p className="section-desc">
              Dr. Sameh Elguizaoui, M.D., a board-certified orthopedic surgeon in NYC, has earned 1,400+ five-star reviews across platforms for his expertise in knee surgery, shoulder repair, and sports medicine treatment at locations in Manhattan and Brooklyn.
            </p>
          </div>

          <div style={{ textAlign: "center", marginTop: "40px" }}>
            <a href="https://www.zocdoc.com/doctor/sam-elguizaoui-md-236423" target="_blank" rel="noopener" className="btn btn-primary btn-lg">
              View All Reviews on Zocdoc
            </a>
          </div>
        </div>
      </section>

      <GetStarted />
    </>
  );
}
