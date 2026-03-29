"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { getConditionBySlug } from "@/data/conditions";
import { GetStarted } from "@/components/GetStarted";
import { Locations } from "@/components/Locations";

export default function ConditionPage() {
  const params = useParams();
  const slug = params.slug as string;
  const condition = getConditionBySlug(slug || "");

  if (!condition) {
    return (
      <main style={{ padding: "4rem 2rem", textAlign: "center" }}>
        <h1>Condition Not Found</h1>
        <p>The condition you&rsquo;re looking for doesn&rsquo;t exist.</p>
        <Link href="/" className="btn btn-primary" style={{ marginTop: "20px" }}>Go Home</Link>
      </main>
    );
  }

  return (
    <>
      <section className="cond-hero has-bg" style={{ backgroundImage: `url('${condition.heroImage}')` }}>
        <div className="container">
          <Link href={`/services/${condition.relatedService}`} className="cond-breadcrumb">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back to Services
          </Link>
          <p className="cond-tagline reveal">{condition.tagline}</p>
          <h1 className="reveal">{condition.title}</h1>
        </div>
      </section>

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

      <section className="section cond-details">
        <div className="container" style={{ maxWidth: "900px" }}>
          <div className="cond-grid">
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

      <section className="section cond-seo">
        <div className="container" style={{ maxWidth: "900px" }}>
          <p className="cond-seo-text">{condition.seoText}</p>
        </div>
      </section>

      <GetStarted />
      <Locations />
    </>
  );
}
