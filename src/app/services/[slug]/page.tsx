"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { getServiceBySlug } from "@/data/services";
import { conditionToBlogSlug } from "@/data/condition-blogs";
import { SpecialtyCanvas } from "@/components/SpecialtyCanvas";
import { GetStarted } from "@/components/GetStarted";
import { Locations } from "@/components/Locations";

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

export default function ServicePage() {
  const params = useParams();
  const slug = params.slug as string;
  const service = getServiceBySlug(slug || "");

  if (!service) {
    return (
      <main style={{ padding: "4rem 2rem", textAlign: "center" }}>
        <h1>Service Not Found</h1>
        <Link href="/">Return Home</Link>
      </main>
    );
  }

  const stats = serviceStats[slug || ""] || [];

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: service.title,
    description: service.description,
    provider: {
      "@type": "Physician",
      name: "Dr. Sameh Elguizaoui, M.D.",
      medicalSpecialty: "Orthopedic Surgery",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />
      <section className="svc-hero">
        <div className="svc-hero-visual">
          <SpecialtyCanvas slug={slug || ""} />
          <div className="svc-hero-visual-overlay" />
        </div>
        <div className="svc-hero-content">
          <Link href="/#specialties" className="svc-back-link">
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
            <Link href="/book" className="btn btn-primary">Book Consultation</Link>
            <a href="tel:+19179059370" className="btn btn-outline">(917) 905-9370</a>
          </div>
        </div>
      </section>

      <section className="svc-conditions">
        <div className="container">
          <div className="svc-section-header">
            <p className="section-label">What We Treat</p>
            <h2>Conditions Treated</h2>
          </div>
          <div className="svc-conditions-row">
            <div className="svc-conditions-list">
              {service.conditions.map((c, i) => {
                const blogSlug = conditionToBlogSlug[c];
                const condSlug = c.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                const linkTo = blogSlug ? `/blog/${blogSlug}` : `/conditions/${condSlug}`;
                return (
                  <Link
                    href={linkTo}
                    className="svc-condition-row"
                    key={i}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    <span className="svc-condition-name">{c}</span>
                    <svg className="svc-condition-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 6 15 12 9 18" />
                    </svg>
                  </Link>
                );
              })}
            </div>
            <div className="svc-conditions-sidebar">
              <div className="svc-sidebar-card">
                <div className="svc-sidebar-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                </div>
                <h4>Expert Diagnosis</h4>
                <p>Advanced imaging and hands-on evaluation to pinpoint the exact issue</p>
              </div>
              <div className="svc-sidebar-card">
                <div className="svc-sidebar-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <h4>Personalized Plan</h4>
                <p>Treatment tailored to your activity level, goals, and lifestyle</p>
              </div>
              <div className="svc-sidebar-card">
                <div className="svc-sidebar-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                </div>
                <h4>Faster Recovery</h4>
                <p>Evidence-based protocols to get you back to what you love sooner</p>
              </div>
            </div>
          </div>
        </div>
      </section>

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

      <section className="svc-cta">
        <div className="container" style={{ textAlign: "center" }}>
          <h2>Ready to Get Started?</h2>
          <p>Book a consultation to discuss your condition and explore treatment options with Dr. Elguizaoui.</p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "24px", flexWrap: "wrap" }}>
            <Link href="/book" className="btn btn-primary">Book Appointment</Link>
            <Link href="/contact" className="btn btn-outline" style={{ borderColor: "rgba(255,255,255,0.3)", color: "#fff" }}>Contact Us</Link>
          </div>
        </div>
      </section>

      <GetStarted />
      <Locations />
    </>
  );
}
