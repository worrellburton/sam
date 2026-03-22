import { Link, useParams } from "react-router";
import { getConditionBySlug, conditions } from "~/data/conditions";
import { GetStarted } from "~/components/GetStarted";
import { Locations } from "~/components/Locations";

export function meta({ params }: { params: { slug: string } }) {
  const condition = getConditionBySlug(params.slug);
  return [
    { title: `${condition?.title || "Condition"} | Dr. Sam Elguizaoui, M.D.` },
    { name: "description", content: condition?.overview.slice(0, 160) },
  ];
}

export default function ConditionPage() {
  const { slug } = useParams();
  const condition = getConditionBySlug(slug || "");

  if (!condition) {
    return (
      <main style={{ padding: "4rem 2rem", textAlign: "center" }}>
        <h1>Condition Not Found</h1>
        <p>The condition you're looking for doesn't exist.</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: "20px" }}>Go Home</Link>
      </main>
    );
  }

  return (
    <>
      {/* Hero */}
      <section className="cond-hero has-bg" style={{ backgroundImage: `url('${condition.heroImage}')` }}>
        <div className="container">
          <Link to={`/services/${condition.relatedService}`} className="cond-breadcrumb">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back to Services
          </Link>
          <p className="cond-tagline reveal">{condition.tagline}</p>
          <h1 className="reveal">{condition.title}</h1>
        </div>
      </section>

      {/* Overview */}
      <section className="section cond-overview">
        <div className="container" style={{ maxWidth: "900px" }}>
          <div className="cond-overview-card reveal">
            <div className="cond-overview-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>
            <p>{condition.overview}</p>
          </div>
        </div>
      </section>

      {/* Symptoms & Treatments — side by side */}
      <section className="section cond-details">
        <div className="container" style={{ maxWidth: "900px" }}>
          <div className="cond-grid">
            {/* Symptoms */}
            <div className="cond-card reveal">
              <div className="cond-card-header">
                <div className="cond-card-icon cond-card-icon-symptoms">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </div>
                <h2>What You Might Feel</h2>
              </div>
              <ul className="cond-list">
                {condition.symptoms.map((s, i) => (
                  <li key={i} className="cond-list-item" style={{ animationDelay: `${i * 0.1}s` }}>
                    <div className="cond-list-dot"></div>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Treatments */}
            <div className="cond-card reveal">
              <div className="cond-card-header">
                <div className="cond-card-icon cond-card-icon-treatments">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                </div>
                <h2>How We Help</h2>
              </div>
              <ul className="cond-list">
                {condition.treatments.map((t, i) => (
                  <li key={i} className="cond-list-item" style={{ animationDelay: `${i * 0.1 + 0.2}s` }}>
                    <div className="cond-list-check">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Recovery */}
      <section className="section cond-recovery">
        <div className="container" style={{ maxWidth: "900px" }}>
          <div className="cond-recovery-card reveal">
            <div className="cond-recovery-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
              </svg>
            </div>
            <h2>Your Recovery</h2>
            <p>{condition.recovery}</p>
          </div>
        </div>
      </section>

      {/* Reassurance */}
      <section className="section cond-reassure">
        <div className="container" style={{ maxWidth: "900px" }}>
          <div className="cond-reassure-card reveal">
            <div className="cond-reassure-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <p>{condition.reassurance}</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cond-cta">
        <div className="container" style={{ maxWidth: "900px", textAlign: "center" }}>
          <h2 className="reveal">Ready to Take the Next Step?</h2>
          <p className="reveal">Schedule a consultation with Dr. Elguizaoui. He'll listen, explain your options clearly, and help you decide what's right for you.</p>
          <div className="cond-cta-buttons reveal">
            <Link to="/book" className="btn btn-primary btn-lg">Book a Consultation</Link>
            <a href="tel:+19179059370" className="btn btn-outline">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              Call (917) 905-9370
            </a>
          </div>
        </div>
      </section>

      {/* Other Conditions */}
      <section className="section">
        <div className="container" style={{ maxWidth: "900px" }}>
          <h3 style={{ marginBottom: "16px" }}>Other Conditions We Treat</h3>
          <div className="cond-other-grid">
            {conditions.filter(c => c.slug !== condition.slug).slice(0, 4).map((c) => (
              <Link to={`/conditions/${c.slug}`} className="cond-other-card" key={c.slug}>
                <span className="cond-other-title">{c.title}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 6 15 12 9 18"/></svg>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <GetStarted />
      <Locations />
    </>
  );
}
