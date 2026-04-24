import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getServiceBySlug as getStaticServiceBySlug,
  services,
  type Service,
} from "@/data/services";
import { getServiceBySlug as getDbServiceBySlug } from "@/lib/db/services";
import { conditionToBlogSlug } from "@/data/condition-blogs";
import { SpecialtyCanvas } from "@/components/SpecialtyCanvas";
import { GetStarted } from "@/components/GetStarted";
import { Locations } from "@/components/Locations";
import { serviceFaqs, serviceStats } from "@/data/service-content";
import { logError } from "@/lib/log";
import { serviceJsonLd } from "@/lib/seo/structured-data";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://samelguizaoui.vercel.app";

// Pre-render every service at build time.
export async function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

// Prefer live DB row, fall back to the bundled static data so the page
// still renders during build / if Supabase is unreachable.
async function resolveService(slug: string): Promise<Service | undefined> {
  try {
    const row = await getDbServiceBySlug(slug);
    if (row) return row;
  } catch (err) {
    logError("services.resolveService", err, { slug });
  }
  return getStaticServiceBySlug(slug);
}

function seoDescription(text: string, max = 160): string {
  if (text.length <= max) return text;
  const cut = text.lastIndexOf(" ", max - 1);
  return text.slice(0, cut > 80 ? cut : max - 1) + ".";
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const svc = await resolveService(slug);
  if (!svc) return { title: "Service Not Found" };
  const url = `${SITE_URL}/services/${slug}`;
  const desc = seoDescription(svc.description);
  return {
    title: `${svc.title} | Dr. Sameh Elguizaoui, M.D.`,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      title: svc.title,
      description: desc,
      url,
      type: "article",
      images: [{ url: "/images/header.jpg", width: 1200, height: 630, alt: svc.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: svc.title,
      description: desc,
    },
  };
}

export default async function ServicePage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const service = await resolveService(slug);
  if (!service) notFound();

  const stats = serviceStats[slug] ?? [];
  const faqs = serviceFaqs[slug] ?? [];

  const jsonLd = serviceJsonLd(service, slug, faqs);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="svc-hero">
        <div className="svc-hero-visual">
          <SpecialtyCanvas slug={slug} />
          <div className="svc-hero-visual-overlay" />
        </div>
        <div className="svc-hero-content">
          <Link href="/#specialties" className="svc-back-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
            <a href="https://www.zocdoc.com/doctor/sam-elguizaoui-md-236423" target="_blank" rel="noopener" className="btn btn-zocdoc">Book Consultation</a>
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
                const condSlug = c
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/(^-|-$)/g, "");
                const linkTo = blogSlug ? `/blog/${blogSlug}` : `/conditions/${condSlug}`;
                return (
                  <Link href={linkTo} className="svc-condition-row" key={i}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    <span className="svc-condition-name">{c}</span>
                    <svg className="svc-condition-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="9 6 15 12 9 18" />
                    </svg>
                  </Link>
                );
              })}
            </div>
            <div className="svc-conditions-sidebar">
              <div className="svc-sidebar-card">
                <div className="svc-sidebar-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                </div>
                <h4>Expert Diagnosis</h4>
                <p>Advanced imaging and hands-on evaluation to pinpoint the exact issue</p>
              </div>
              <div className="svc-sidebar-card">
                <div className="svc-sidebar-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <h4>Personalized Plan</h4>
                <p>Treatment tailored to your activity level, goals, and lifestyle</p>
              </div>
              <div className="svc-sidebar-card">
                <div className="svc-sidebar-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                </div>
                <h4>Faster Recovery</h4>
                <p>Evidence-based protocols to get you back to what you love sooner</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {slug === "regenerative-medicine" && (
        <section className="svc-procedures">
          <div className="container">
            <div className="svc-section-header">
              <p className="section-label">Treatment Options</p>
              <h2>Stem Cell Procedures</h2>
              <p className="svc-section-desc">Dr. Elguizaoui offers advanced stem cell treatments that use your body&rsquo;s own regenerative cells to help heal injured tissue and relieve pain &mdash; without surgery.</p>
            </div>
            <div className="svc-procedures-grid">
              <div className="svc-procedure-card">
                <div className="svc-procedure-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 2v6" />
                    <path d="M12 22v-6" />
                    <circle cx="12" cy="12" r="4" />
                    <path d="M4.93 4.93l4.24 4.24" />
                    <path d="M14.83 14.83l4.24 4.24" />
                    <path d="M4.93 19.07l4.24-4.24" />
                    <path d="M14.83 9.17l4.24-4.24" />
                  </svg>
                </div>
                <h3>Bone Marrow Stem Cells</h3>
                <p>Also known as Bone Marrow Aspirate Concentrate (BMAC), this procedure harvests stem cells from your own bone marrow &mdash; typically from the pelvis &mdash; and concentrates them for injection into damaged joints or soft tissue. These mesenchymal stem cells release growth factors and anti-inflammatory proteins that promote healing and reduce pain.</p>
                <ul className="svc-procedure-list">
                  <li>Treats arthritis, cartilage injuries, and tendon damage</li>
                  <li>Minimally invasive, performed in-office</li>
                  <li>Uses your own cells &mdash; no rejection risk</li>
                  <li>Minimal downtime, return to daily activity quickly</li>
                </ul>
              </div>
              <div className="svc-procedure-card">
                <div className="svc-procedure-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 2a9 9 0 0 1 9 9c0 4-3 7-6 9-1 .67-2 1-3 1s-2-.33-3-1c-3-2-6-5-6-9a9 9 0 0 1 9-9z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <h3>Lipogems Procedure</h3>
                <p>Lipogems is an FDA-cleared technology that harvests and gently processes a small sample of your own adipose (fat) tissue to deliver cushioning and support to injured areas. The fat tissue contains a rich supply of regenerative cells that help reduce inflammation and promote natural healing.</p>
                <ul className="svc-procedure-list">
                  <li>Excellent for osteoarthritis and tendon injuries</li>
                  <li>Single outpatient procedure</li>
                  <li>Uses your own adipose tissue &mdash; minimal manipulation</li>
                  <li>Can delay or avoid the need for joint replacement</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

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
            <a href="https://www.zocdoc.com/doctor/sam-elguizaoui-md-236423" target="_blank" rel="noopener" className="btn btn-zocdoc">Book Appointment</a>
            <Link href="/contact" className="btn btn-outline" style={{ borderColor: "rgba(255,255,255,0.3)", color: "#fff" }}>Contact Us</Link>
          </div>
        </div>
      </section>

      <GetStarted />
      <Locations />
    </>
  );
}
