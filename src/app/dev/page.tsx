"use client";

import Link from "next/link";
import { DevSidebar } from "./DevSidebar";
import { blogPosts } from "@/data/blog";
import { services } from "@/data/services";
import { conditions } from "@/data/conditions";

const coreProfiles = [
  { name: "Zocdoc", desc: "Appointments & patient reviews", color: "#ef4444", letter: "Z", url: "https://www.zocdoc.com/doctor/sam-elguizaoui-md-236423" },
  { name: "U.S. News", desc: "Doctor profile & rankings", color: "#3b82f6", letter: "U", url: "https://health.usnews.com/doctors" },
  { name: "Healthgrades", desc: "Physician profile & ratings", color: "#22c55e", letter: "H", url: "https://www.healthgrades.com" },
  { name: "Vitals", desc: "Patient reviews & doctor info", color: "#a87c2e", letter: "V", url: "https://www.vitals.com" },
];

const sitePages = [
  { name: "Homepage", path: "/", desc: "Hero, specialties, about, reviews, locations" },
  { name: "About", path: "/about", desc: "Bio, credentials, affiliations" },
  { name: "Reviews", path: "/reviews", desc: "Patient testimonials & Google reviews" },
  { name: "Contact", path: "/contact", desc: "Contact form & office info" },
  { name: "FAQ", path: "/faq", desc: "Frequently asked questions" },
  { name: "Blog", path: "/blog", desc: `${blogPosts.length} posts (${blogPosts.filter(p => !p.comingSoon).length} published)` },
];

const stats = [
  { label: "Pages", value: 6 + services.length + conditions.length + blogPosts.length, icon: "📄" },
  { label: "Services", value: services.length, icon: "🔬" },
  { label: "Conditions", value: conditions.length, icon: "🩺" },
  { label: "Blog Posts", value: blogPosts.length, icon: "✍️" },
  { label: "Locations", value: 3, icon: "📍" },
];

const cardStyle: React.CSSProperties = {
  background: "#111827",
  border: "1px solid #1e293b",
  borderRadius: 12,
  padding: 24,
};

export default function DevHomePage() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0a0e1a", color: "#e2e8f0" }}>
      <DevSidebar />
      <main style={{ flex: 1, marginLeft: 220, padding: "40px 48px" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 700, color: "#f1f5f9", margin: 0 }}>Welcome back</h1>
          <p style={{ color: "#64748b", fontSize: "0.9rem", marginTop: 4 }}>Site overview &amp; management</p>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 28 }}>
          {stats.map((s) => (
            <div key={s.label} style={{ ...cardStyle, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: "1.4rem" }}>{s.icon}</span>
              <div>
                <p style={{ fontSize: "1.3rem", fontWeight: 700, color: "#f1f5f9", margin: 0, lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: "0.72rem", color: "#64748b", margin: 0, marginTop: 2, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Core Profiles */}
        <div style={{ ...cardStyle, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#f1f5f9", margin: 0 }}>Core Profiles</h2>
            <span style={{ fontSize: "0.65rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", padding: "2px 8px", background: "rgba(99,102,241,0.15)", color: "#818cf8", borderRadius: 4 }}>Essentials</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {coreProfiles.map((p) => (
              <a
                key={p.name}
                href={p.url}
                target="_blank"
                rel="noopener"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 16px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid #1e293b",
                  borderRadius: 10,
                  textDecoration: "none",
                  transition: "border-color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#334155")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1e293b")}
              >
                <div style={{ width: 36, height: 36, borderRadius: 8, background: p.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#fff", fontSize: "0.9rem", flexShrink: 0 }}>
                  {p.letter}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, color: "#f1f5f9", fontSize: "0.88rem", margin: 0 }}>{p.name}</p>
                  <p style={{ color: "#475569", fontSize: "0.75rem", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.desc}</p>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" />
                </svg>
              </a>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
          {/* Site Pages */}
          <div style={cardStyle}>
            <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#f1f5f9", margin: "0 0 16px" }}>Site Pages</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {sitePages.map((p) => (
                <Link
                  key={p.path}
                  href={p.path}
                  target="_blank"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 12px",
                    borderRadius: 8,
                    textDecoration: "none",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div>
                    <span style={{ fontWeight: 500, color: "#e2e8f0", fontSize: "0.88rem" }}>{p.name}</span>
                    <span style={{ color: "#475569", fontSize: "0.78rem", marginLeft: 8 }}>{p.desc}</span>
                  </div>
                  <span style={{ color: "#334155", fontSize: "0.75rem", fontFamily: "monospace" }}>{p.path}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Services */}
          <div style={cardStyle}>
            <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#f1f5f9", margin: "0 0 16px" }}>Services ({services.length})</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {services.map((s) => (
                <Link
                  key={s.slug}
                  href={`/services/${s.slug}`}
                  target="_blank"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 12px",
                    borderRadius: 8,
                    textDecoration: "none",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <span style={{ fontWeight: 500, color: "#e2e8f0", fontSize: "0.88rem" }}>{s.title}</span>
                  <span style={{ color: "#334155", fontSize: "0.75rem", fontFamily: "monospace" }}>/services/{s.slug}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Conditions */}
        <div style={{ ...cardStyle, marginBottom: 20 }}>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#f1f5f9", margin: "0 0 16px" }}>Conditions ({conditions.length})</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
            {conditions.map((c) => (
              <Link
                key={c.slug}
                href={`/conditions/${c.slug}`}
                target="_blank"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 12px",
                  borderRadius: 8,
                  textDecoration: "none",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <span style={{ fontWeight: 500, color: "#e2e8f0", fontSize: "0.88rem" }}>{c.title}</span>
                <span style={{ color: "#334155", fontSize: "0.75rem", fontFamily: "monospace" }}>/conditions/{c.slug}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Blog Posts */}
        <div style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#f1f5f9", margin: 0 }}>Recent Blog Posts</h2>
            <Link href="/dev/blog" style={{ color: "#818cf8", fontSize: "0.82rem", textDecoration: "none" }}>View all &rarr;</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {blogPosts.slice(0, 5).map((p) => (
              <div
                key={p.slug}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 12px",
                  borderRadius: 8,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "2px 7px",
                      borderRadius: 4,
                      fontSize: "0.68rem",
                      fontWeight: 600,
                      background: p.comingSoon ? "rgba(251,191,36,0.12)" : "rgba(52,211,153,0.12)",
                      color: p.comingSoon ? "#fbbf24" : "#34d399",
                    }}
                  >
                    {p.comingSoon ? "Draft" : "Live"}
                  </span>
                  <span style={{ fontWeight: 500, color: "#e2e8f0", fontSize: "0.88rem" }}>{p.title}</span>
                </div>
                <span style={{ color: "#475569", fontSize: "0.78rem", flexShrink: 0 }}>{p.date}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
