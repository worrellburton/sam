export function meta() {
  return [
    { title: "Patient Reviews | Dr. Sam Elguizaoui, M.D." },
    { name: "description", content: "Read patient reviews for Dr. Sameh Elguizaoui. 4.8/5 stars on Zocdoc with 1,400+ reviews." },
  ];
}

const platforms = [
  { name: "Zocdoc", rating: "4.8", reviews: "1,466", url: "https://www.zocdoc.com/doctor/sam-elguizaoui-md-236423", color: "#FF7043" },
  { name: "Google", rating: "4.9", reviews: "150+", url: "https://www.google.com/search?q=Dr+Sam+Elguizaoui+orthopedic+surgeon+NYC", color: "#4285F4" },
  { name: "Vitals", rating: "4.9", reviews: "200+", url: "https://www.vitals.com/doctors/Dr_Sam_Elguizaoui.html", color: "#00BFA5" },
  { name: "Healthgrades", rating: "5.0", reviews: "50+", url: "https://www.healthgrades.com/physician/dr-sam-elguizaoui", color: "#1976D2" },
];

export default function ReviewsPage() {
  return (
    <>
      <section className="service-hero">
        <div className="container">
          <h1>Patient Reviews</h1>
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

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px", marginTop: "40px" }}>
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
                <div style={{ fontSize: "2.5rem", fontWeight: 700, color: p.color }}>{p.rating}</div>
                <div style={{ fontSize: "1.2rem", color: "#f59e0b", marginBottom: "8px" }}>&#9733;&#9733;&#9733;&#9733;&#9733;</div>
                <div style={{ fontWeight: 600, fontSize: "1.1rem" }}>{p.name}</div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{p.reviews} reviews</div>
              </a>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "60px" }}>
            <p style={{ fontSize: "1.1rem", marginBottom: "20px", color: "var(--text-light)" }}>
              Read the full reviews on Zocdoc
            </p>
            <a href="https://www.zocdoc.com/doctor/sam-elguizaoui-md-236423" target="_blank" rel="noopener" className="btn btn-primary btn-lg">
              View All Reviews on Zocdoc
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
