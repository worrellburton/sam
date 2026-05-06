"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DevSidebar } from "../DevSidebar";
import { ScanPanel, type ScanBaseResult } from "../ScanPanel";
import { services } from "@/data/services";
import { conditions } from "@/data/conditions";
import { blogPosts, isPostReleased } from "@/data/blog";

// ─────────────────────────────────────────────────────────────────────
// Dev-only SEO dashboard. Walks every route we know about and reports:
//   - what metadata (title/description/canonical) we ship
//   - whether the page has a JSON-LD structured-data block
//   - overall status against a target length (titles 50-60, desc 140-160)
//
// Purely a static read of src/data/* + src/app/**/page.tsx file sniffing
// done at module scope via the static imports above. No live crawling —
// the page is intended as a quick "what's shipping" reference before
// editing metadata.
// ─────────────────────────────────────────────────────────────────────

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.sportsorthomd.com";

type RouteRow = {
  path: string;
  label: string;
  title?: string;
  description?: string;
  hasJsonLd: boolean;
  hasCanonical: boolean;
  source: "server" | "client" | "layout";
};

// The canonical metadata the site ships today. Hand-maintained against
// what's in src/app/**/page.tsx — keep in sync when editing those.
const staticRoutes: RouteRow[] = [
  {
    path: "/",
    label: "Homepage",
    title: "Sameh Elguizaoui, M.D. | Orthopedic Surgeon & Sports Medicine | NYC",
    description:
      "Board-certified orthopedic surgeon Dr. Sameh Elguizaoui specializes in sports medicine, knee & shoulder surgery, and cartilage repair in NYC.",
    hasJsonLd: true,
    hasCanonical: true,
    source: "layout",
  },
  {
    path: "/about",
    label: "About",
    title: "About Dr. Sameh Elguizaoui, M.D. | NYC Orthopedic Surgeon",
    description:
      "Board-certified orthopedic surgeon fellowship-trained at Lenox Hill. Former team physician for the NY Jets and Islanders.",
    hasJsonLd: false,
    hasCanonical: true,
    source: "server",
  },
  {
    path: "/contact",
    label: "Contact",
    title: "Contact | Dr. Sameh Elguizaoui, M.D.",
    description:
      "Contact Dr. Sameh Elguizaoui's orthopedic practice to schedule an appointment, ask about insurance, or request a second opinion in NYC.",
    hasJsonLd: true,
    hasCanonical: true,
    source: "server",
  },
  {
    path: "/reviews",
    label: "Reviews",
    title: "Patient Reviews | Dr. Sameh Elguizaoui, M.D.",
    description:
      "Verified patient reviews for Dr. Elguizaoui across Zocdoc, Google, Healthgrades, Vitals, and U.S. News — 4.8/5 stars across 1,400+ reviews.",
    hasJsonLd: true,
    hasCanonical: true,
    source: "server",
  },
  {
    path: "/faq",
    label: "FAQ",
    title: "FAQ | Dr. Sameh Elguizaoui, M.D.",
    description:
      "Frequently asked questions about Dr. Elguizaoui's orthopedic practice, treatments, insurance, and appointments.",
    hasJsonLd: true,
    hasCanonical: true,
    source: "server",
  },
  {
    path: "/blog",
    label: "Blog index",
    title: "Clinical Clarity | Orthopedic Blog by Dr. Sameh Elguizaoui",
    description:
      "Deep-dive investigative reports on orthopedic surgery, sports medicine, and joint preservation — written by a board-certified surgeon.",
    hasJsonLd: true,
    hasCanonical: true,
    source: "server",
  },
  {
    path: "/book",
    label: "Booking",
    hasJsonLd: false,
    hasCanonical: false,
    source: "client",
  },
];

function scoreTitle(t?: string): { ok: boolean; note: string } {
  if (!t) return { ok: false, note: "missing" };
  if (t.length < 30) return { ok: false, note: `${t.length} chars — too short (aim 50–60)` };
  if (t.length > 65) return { ok: false, note: `${t.length} chars — too long (aim 50–60)` };
  return { ok: true, note: `${t.length} chars` };
}

function scoreDesc(d?: string): { ok: boolean; note: string } {
  if (!d) return { ok: false, note: "missing" };
  if (d.length < 120) return { ok: false, note: `${d.length} chars — too short (aim 140–160)` };
  if (d.length > 170) return { ok: false, note: `${d.length} chars — too long (aim 140–160)` };
  return { ok: true, note: `${d.length} chars` };
}

const cardStyle: React.CSSProperties = {
  background: "#111827",
  border: "1px solid #1e293b",
  borderRadius: 12,
  padding: 24,
};

const pillStyle = (ok: boolean): React.CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "3px 8px",
  borderRadius: 6,
  fontSize: "0.72rem",
  fontWeight: 600,
  background: ok ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
  color: ok ? "#4ade80" : "#f87171",
});

interface SeoScanResult extends ScanBaseResult {
  pages: {
    path: string;
    label: string;
    status: number;
    score: number;
    title?: string;
    description?: string;
    checks: { id: string; label: string; ok: boolean; note?: string }[];
    error?: string;
  }[];
}

export default function DevSeoPage() {
  const [filter, setFilter] = useState<"all" | "missing" | "ok">("all");
  const [scan, setScan] = useState<SeoScanResult | null>(null);

  // Dynamic routes: auto-generated SEO titles/descriptions (the actual
  // pages call generateMetadata() so we preview the same formula here).
  const serviceRoutes: RouteRow[] = services.map((s) => ({
    path: `/services/${s.slug}`,
    label: s.title,
    title: `${s.title} | Dr. Sameh Elguizaoui, M.D.`,
    description: s.description,
    hasJsonLd: true,
    hasCanonical: true,
    source: "server",
  }));

  const conditionRoutes: RouteRow[] = conditions.map((c) => ({
    path: `/conditions/${c.slug}`,
    label: c.title,
    title: `${c.title} | Dr. Sameh Elguizaoui, M.D.`,
    description: c.overview,
    hasJsonLd: true,
    hasCanonical: true,
    source: "server",
  }));

  const blogRoutes: RouteRow[] = blogPosts
    .filter((p) => isPostReleased(p))
    .map((p) => ({
      path: `/blog/${p.slug}`,
      label: p.title,
      title: `${p.title} | Clinical Clarity`,
      description: p.excerpt,
      hasJsonLd: true,
      hasCanonical: true,
      source: "server",
    }));

  const allRoutes: RouteRow[] = useMemo(
    () => [...staticRoutes, ...serviceRoutes, ...conditionRoutes, ...blogRoutes],
    [serviceRoutes, conditionRoutes, blogRoutes],
  );

  const rows = useMemo(() => {
    if (filter === "all") return allRoutes;
    return allRoutes.filter((r) => {
      const t = scoreTitle(r.title);
      const d = scoreDesc(r.description);
      const healthy = t.ok && d.ok && r.hasCanonical;
      return filter === "ok" ? healthy : !healthy;
    });
  }, [allRoutes, filter]);

  const missingCount = allRoutes.filter((r) => {
    const t = scoreTitle(r.title);
    const d = scoreDesc(r.description);
    return !(t.ok && d.ok && r.hasCanonical);
  }).length;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0a0e1a", color: "#e2e8f0" }}>
      <DevSidebar />
      <main style={{ flex: 1, marginLeft: 220, padding: "40px 48px" }} className="dev-main">
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 700, color: "#f1f5f9", margin: 0 }}>SEO</h1>
          <p style={{ color: "#64748b", fontSize: "0.9rem", marginTop: 4 }}>
            Site-wide metadata health. {allRoutes.length} routes · {missingCount} need attention.
          </p>
        </div>

        <ScanPanel<SeoScanResult>
          endpoint="/api/dev/seo-scan"
          label="SEO"
          result={scan}
          onResult={setScan}
        />

        {scan && (
          <div style={{ ...cardStyle, padding: 0, overflow: "hidden", marginBottom: 24 }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid #1e293b" }}>
              <p style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>
                Live scan results
              </p>
              <p style={{ fontSize: "0.9rem", color: "#f1f5f9", margin: "2px 0 0" }}>
                {scan.pages.filter((p) => p.score === 100).length} / {scan.pages.length} pages passing all checks.
              </p>
            </div>
            <div className="dev-seo-table-wrap" style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.02)", textAlign: "left" }}>
                    <th style={{ padding: "12px 16px", color: "#64748b", fontSize: "0.72rem", textTransform: "uppercase" }}>Route</th>
                    <th style={{ padding: "12px 16px", color: "#64748b", fontSize: "0.72rem", textTransform: "uppercase" }}>Score</th>
                    <th style={{ padding: "12px 16px", color: "#64748b", fontSize: "0.72rem", textTransform: "uppercase" }}>Failing checks</th>
                  </tr>
                </thead>
                <tbody>
                  {scan.pages
                    .slice()
                    .sort((a, b) => a.score - b.score)
                    .map((p) => {
                      const fails = p.checks.filter((c) => !c.ok);
                      const color = p.score >= 90 ? "#4ade80" : p.score >= 70 ? "#fbbf24" : "#f87171";
                      return (
                        <tr key={p.path} style={{ borderTop: "1px solid #1e293b" }}>
                          <td style={{ padding: "12px 16px", verticalAlign: "top" }}>
                            <Link href={p.path} target="_blank" rel="noopener" style={{ color: "#c7d2fe", fontWeight: 600, textDecoration: "none" }}>
                              {p.path}
                            </Link>
                            <div style={{ fontSize: "0.74rem", color: "#64748b", marginTop: 2 }}>{p.label}</div>
                          </td>
                          <td style={{ padding: "12px 16px", verticalAlign: "top", color, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                            {p.error ? "ERR" : p.score}
                          </td>
                          <td style={{ padding: "12px 16px", verticalAlign: "top", color: "#94a3b8" }}>
                            {p.error ? (
                              <span style={{ color: "#fca5a5" }}>{p.error}</span>
                            ) : fails.length === 0 ? (
                              <span style={{ color: "#4ade80" }}>All passing</span>
                            ) : (
                              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 4 }}>
                                {fails.map((f) => (
                                  <li key={f.id} style={{ fontSize: "0.8rem" }}>
                                    <span style={{ color: "#f87171", fontWeight: 600 }}>{f.label}:</span>{" "}
                                    <span style={{ color: "#94a3b8" }}>{f.note}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Summary strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }} className="dev-seo-stats">
          <div style={{ ...cardStyle, padding: "14px 18px" }}>
            <p style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>Routes tracked</p>
            <p style={{ fontSize: "1.4rem", fontWeight: 700, color: "#f1f5f9", margin: "4px 0 0" }}>{allRoutes.length}</p>
          </div>
          <div style={{ ...cardStyle, padding: "14px 18px" }}>
            <p style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>Healthy</p>
            <p style={{ fontSize: "1.4rem", fontWeight: 700, color: "#4ade80", margin: "4px 0 0" }}>{allRoutes.length - missingCount}</p>
          </div>
          <div style={{ ...cardStyle, padding: "14px 18px" }}>
            <p style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>Need work</p>
            <p style={{ fontSize: "1.4rem", fontWeight: 700, color: "#f87171", margin: "4px 0 0" }}>{missingCount}</p>
          </div>
          <div style={{ ...cardStyle, padding: "14px 18px" }}>
            <p style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>Sitemap</p>
            <p style={{ fontSize: "0.9rem", fontWeight: 600, color: "#818cf8", margin: "4px 0 0" }}>
              <a href="/sitemap.xml" target="_blank" rel="noopener" style={{ color: "#818cf8", textDecoration: "none" }}>
                /sitemap.xml ↗
              </a>
            </p>
            <p style={{ fontSize: "0.72rem", color: "#64748b", margin: "2px 0 0" }}>
              <a href="/robots.txt" target="_blank" rel="noopener" style={{ color: "#64748b", textDecoration: "none" }}>
                /robots.txt ↗
              </a>
            </p>
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
          {(["all", "missing", "ok"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "6px 14px",
                background: filter === f ? "rgba(99,102,241,0.15)" : "transparent",
                color: filter === f ? "#c7d2fe" : "#94a3b8",
                border: "1px solid " + (filter === f ? "rgba(99,102,241,0.3)" : "#1e293b"),
                borderRadius: 6,
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {f === "ok" ? "Healthy" : f}
            </button>
          ))}
        </div>

        {/* Route table */}
        <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
          <div className="dev-seo-table-wrap" style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.02)", textAlign: "left" }}>
                  <th style={{ padding: "12px 16px", color: "#64748b", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Route</th>
                  <th style={{ padding: "12px 16px", color: "#64748b", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Title</th>
                  <th style={{ padding: "12px 16px", color: "#64748b", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Description</th>
                  <th style={{ padding: "12px 16px", color: "#64748b", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Meta</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const t = scoreTitle(r.title);
                  const d = scoreDesc(r.description);
                  return (
                    <tr key={r.path} style={{ borderTop: "1px solid #1e293b" }}>
                      <td style={{ padding: "12px 16px", verticalAlign: "top" }}>
                        <Link
                          href={r.path}
                          target="_blank"
                          rel="noopener"
                          style={{ color: "#c7d2fe", fontWeight: 600, textDecoration: "none" }}
                        >
                          {r.path}
                        </Link>
                        <div style={{ fontSize: "0.74rem", color: "#64748b", marginTop: 2 }}>{r.label}</div>
                      </td>
                      <td style={{ padding: "12px 16px", verticalAlign: "top", maxWidth: 360 }}>
                        <div style={{ color: "#e2e8f0" }}>{r.title || <span style={{ color: "#64748b" }}>—</span>}</div>
                        <div style={{ marginTop: 4 }}><span style={pillStyle(t.ok)}>{t.note}</span></div>
                      </td>
                      <td style={{ padding: "12px 16px", verticalAlign: "top", maxWidth: 420 }}>
                        <div style={{ color: "#94a3b8", lineHeight: 1.4 }}>
                          {r.description || <span style={{ color: "#64748b" }}>—</span>}
                        </div>
                        <div style={{ marginTop: 4 }}><span style={pillStyle(d.ok)}>{d.note}</span></div>
                      </td>
                      <td style={{ padding: "12px 16px", verticalAlign: "top" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          <span style={pillStyle(r.hasCanonical)}>canonical {r.hasCanonical ? "✓" : "✗"}</span>
                          <span style={pillStyle(r.hasJsonLd)}>JSON-LD {r.hasJsonLd ? "✓" : "✗"}</span>
                          <span style={{ fontSize: "0.7rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>{r.source}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ marginTop: 24, fontSize: "0.78rem", color: "#64748b" }}>
          Base URL: <code style={{ background: "#1e293b", padding: "1px 6px", borderRadius: 4 }}>{SITE_URL}</code>
        </div>

        {/* Mobile: stack table stats vertically */}
        <style>{`
          @media (max-width: 768px) {
            .dev-main { margin-left: 0 !important; padding: 24px 16px !important; padding-top: 64px !important; }
            .dev-seo-stats { grid-template-columns: repeat(2, 1fr) !important; }
          }
        `}</style>
      </main>
    </div>
  );
}
