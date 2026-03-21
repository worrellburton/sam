import { Link, useParams } from "react-router";
import { getServiceBySlug, services } from "~/data/services";
import { GetStarted } from "~/components/GetStarted";
import { Locations } from "~/components/Locations";

const serviceHeroImages: Record<string, string> = {
  "sports-medicine": "https://images.unsplash.com/photo-1461896836934-bd45ba55ae57?w=1600&h=600&fit=crop&q=80",
  "arthroscopic-surgery": "https://images.unsplash.com/photo-1551190822-a9ce113ac100?w=1600&h=600&fit=crop&q=80",
  "regenerative-medicine": "https://images.unsplash.com/photo-1579684453423-f84349ef60b0?w=1600&h=600&fit=crop&q=80",
  "joint-preservation": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1600&h=600&fit=crop&q=80",
  "cartilage-repair": "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=1600&h=600&fit=crop&q=80",
  "shoulder-knee-surgery": "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=1600&h=600&fit=crop&q=80",
};

const serviceStats: Record<string, { stat: string; label: string }[]> = {
  "sports-medicine": [
    { stat: "1,400+", label: "Athletes Treated" },
    { stat: "NFL & NHL", label: "Team Physician" },
    { stat: "98%", label: "Return to Sport" },
  ],
  "arthroscopic-surgery": [
    { stat: "5,000+", label: "Procedures" },
    { stat: "Same Day", label: "Go Home" },
    { stat: "95%", label: "Success Rate" },
  ],
  "regenerative-medicine": [
    { stat: "Non-Surgical", label: "Treatment" },
    { stat: "PRP", label: "Therapy" },
    { stat: "Minimal", label: "Downtime" },
  ],
  "joint-preservation": [
    { stat: "International", label: "Fellowship" },
    { stat: "3 Countries", label: "Trained In" },
    { stat: "Preserve", label: "Natural Joints" },
  ],
  "cartilage-repair": [
    { stat: "European", label: "Fellowship" },
    { stat: "Advanced", label: "Techniques" },
    { stat: "Restore", label: "Joint Function" },
  ],
  "shoulder-knee-surgery": [
    { stat: "Lenox Hill", label: "Fellowship" },
    { stat: "Expert", label: "Surgical Care" },
    { stat: "Comprehensive", label: "Rehab Plans" },
  ],
};

export function meta({ params }: { params: { slug: string } }) {
  const service = getServiceBySlug(params.slug);
  return [
    { title: service ? `${service.title} | Dr. Sam Elguizaoui, M.D.` : "Service Not Found" },
    { name: "description", content: service?.description || "" },
  ];
}

export default function ServicePage() {
  const { slug } = useParams();
  const service = getServiceBySlug(slug || "");

  if (!service) {
    return (
      <main style={{ padding: "4rem 2rem", textAlign: "center" }}>
        <h1>Service Not Found</h1>
        <Link to="/">Return Home</Link>
      </main>
    );
  }

  const stats = serviceStats[slug || ""] || [];
  const otherServices = services.filter((s) => s.slug !== service.slug);

  return (
    <>
      <section className="service-hero has-bg" style={{ backgroundImage: `url('${serviceHeroImages[slug || ""] || ""}')` }}>
        <div className="container">
          <Link to="/#specialties" className="service-back-link">
            &larr; Back to Services
          </Link>
          <h1>{service.title}</h1>
          <p className="service-hero-desc">{service.subtitle}</p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="service-stats-bar">
        <div className="container">
          <div className="service-stats-grid">
            {stats.map((s, i) => (
              <div className="service-stat" key={i}>
                <span className="service-stat-value">{s.stat}</span>
                <span className="service-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="section">
        <div className="container">
          <div className="service-content">
            <div className="service-main">
              {/* Overview */}
              <div className="service-section">
                <h2>Overview</h2>
                <p className="service-lead">{service.description}</p>
              </div>

              {/* Conditions */}
              <div className="service-section">
                <h2>Conditions Treated</h2>
                <p style={{ color: "var(--text-light)", marginBottom: "20px" }}>
                  Click any condition below to book an appointment for that specific concern.
                </p>
                <div className="conditions-grid">
                  {service.conditions.map((c, i) => (
                    <Link
                      to={`/book?condition=${encodeURIComponent(c)}&service=${encodeURIComponent(service.title)}`}
                      className="condition-card"
                      key={i}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 11 12 14 22 4" />
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                      </svg>
                      <span>{c}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Approach */}
              {service.approach && (
                <div className="service-section">
                  <h2>Our Approach</h2>
                  <div className="approach-steps">
                    {service.approach.map((a, i) => (
                      <div className="approach-step" key={i}>
                        <div className="approach-number">{i + 1}</div>
                        <p>{a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Why Choose */}
              <div className="service-section">
                <h2>Why Choose Dr. Elguizaoui</h2>
                <div className="benefits-grid">
                  {service.benefits.map((b, i) => (
                    <div className="benefit-card" key={i}>
                      <div className="benefit-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                          <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                      </div>
                      <p>{b}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="service-sidebar">
              <div className="sidebar-card sidebar-cta">
                <h4>Schedule a Consultation</h4>
                <p>Discuss your condition with Dr. Elguizaoui and explore treatment options.</p>
                <Link to="/book" className="btn btn-primary btn-block">
                  Book Now
                </Link>
                <a href="tel:+19179059370" className="sidebar-phone">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  +1-917-905-9370
                </a>
              </div>

              <div className="sidebar-card">
                <h4>Other Services</h4>
                <div className="sidebar-services-list">
                  {otherServices.map((s) => (
                    <Link key={s.slug} to={`/services/${s.slug}`} className="sidebar-service-link">
                      <span>{s.title}</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="sidebar-card sidebar-insurance">
                <h4>Insurance Accepted</h4>
                <p>We accept most major insurance plans including Aetna, BlueCross BlueShield, UnitedHealthcare, Cigna, and 200+ more.</p>
                <Link to="/contact" className="btn btn-outline btn-block" style={{ marginTop: "12px" }}>
                  Verify Coverage
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <GetStarted />
      <Locations />
    </>
  );
}
