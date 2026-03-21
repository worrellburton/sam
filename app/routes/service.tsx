import { Link, useParams } from "react-router";
import { getServiceBySlug, services } from "~/data/services";
import { SpecialtyCanvas } from "~/components/SpecialtyCanvas";

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

  return (
    <>
      {/* Hero: Image Left + Content Right */}
      <section className="svc-hero">
        <div className="svc-hero-visual">
          <SpecialtyCanvas slug={slug || ""} />
          <div className="svc-hero-visual-overlay" />
        </div>
        <div className="svc-hero-content">
          <Link to="/#specialties" className="svc-back-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            All Services
          </Link>
          <h1>{service.title}</h1>
          <p className="svc-hero-subtitle">{service.subtitle}</p>
          <p className="svc-hero-desc">{service.description}</p>
          <div className="svc-hero-stats">
            {stats.map((s, i) => (
              <div className="svc-hero-stat" key={i}>
                <span className="svc-stat-value">{s.stat}</span>
                <span className="svc-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
          <div className="svc-hero-actions">
            <Link to="/book" className="btn btn-primary">Book Consultation</Link>
            <a href="tel:+19179059370" className="btn btn-outline">(917) 905-9370</a>
          </div>
        </div>
      </section>

      {/* Conditions Treated */}
      <section className="svc-conditions">
        <div className="container">
          <div className="svc-section-header">
            <p className="section-label">What We Treat</p>
            <h2>Conditions Treated</h2>
          </div>
          <div className="svc-conditions-grid">
            {service.conditions.map((c, i) => (
              <Link
                to={`/book?condition=${encodeURIComponent(c)}&service=${encodeURIComponent(service.title)}`}
                className="svc-condition-item"
                key={i}
              >
                <div className="svc-condition-number">{String(i + 1).padStart(2, "0")}</div>
                <span className="svc-condition-name">{c}</span>
                <svg className="svc-condition-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Approach */}
      {service.approach && (
        <section className="svc-approach">
          <div className="container">
            <div className="svc-section-header">
              <p className="section-label">How It Works</p>
              <h2>Our Approach</h2>
            </div>
            <div className="svc-approach-grid">
              {service.approach.map((a, i) => (
                <div className="svc-approach-card" key={i}>
                  <div className="svc-approach-num">{i + 1}</div>
                  <p>{a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why Choose */}
      <section className="svc-why">
        <div className="container">
          <div className="svc-why-inner">
            <div className="svc-why-left">
              <p className="section-label">Why Choose Us</p>
              <h2>Why Dr. Elguizaoui</h2>
              <p className="svc-why-desc">World-class training combined with a patient-first philosophy. Every treatment plan is tailored to your specific goals.</p>
              <Link to="/book" className="btn btn-primary" style={{ marginTop: "20px" }}>Schedule a Visit</Link>
            </div>
            <div className="svc-why-right">
              {service.benefits.map((b, i) => (
                <div className="svc-benefit-row" key={i}>
                  <div className="svc-benefit-check">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="svc-cta">
        <div className="container" style={{ textAlign: "center" }}>
          <h2>Ready to Get Started?</h2>
          <p>Book a consultation to discuss your condition and explore treatment options with Dr. Elguizaoui.</p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "24px", flexWrap: "wrap" }}>
            <Link to="/book" className="btn btn-primary">Book Appointment</Link>
            <Link to="/contact" className="btn btn-outline" style={{ borderColor: "rgba(255,255,255,0.3)", color: "#fff" }}>Contact Us</Link>
          </div>
        </div>
      </section>
    </>
  );
}
