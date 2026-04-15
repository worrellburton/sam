"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DevSidebar } from "../DevSidebar";
import { ScanPanel, type ScanBaseResult } from "../ScanPanel";
import { locations } from "@/data/locations";

// ─────────────────────────────────────────────────────────────────────
// Dev-only GEO / local SEO dashboard.
//
// Surfaces everything we ship for local-pack eligibility so we can
// eyeball consistency in one place:
//   - Office NAP (name / address / phone) across the site
//   - Google Business profile links & Place IDs (the same ones
//     consumed by /api/places/all)
//   - Schema.org MedicalBusiness / Physician JSON-LD preview
//   - Service-area keywords actually in use
// ─────────────────────────────────────────────────────────────────────

// Canonical NAP. When these change, search them across the codebase
// and update every occurrence — inconsistency hurts ranking.
const PRACTICE_NAME = "Dr. Sameh Elguizaoui, M.D.";
const PRACTICE_PHONE = "+1-212-828-3838";
const PRACTICE_PHONE_DISPLAY = "(917) 905-9370";

// The three Google Place IDs the homepage/reviews hit via /api/places/all.
// Keep in sync with src/app/api/places/all/route.ts.
const PLACE_IDS: Record<string, string> = {
  "Upper East Side": "ChIJmQNsqXpZwokRoKDGBL8w9LM",
  "West Village": "ChIJFTfVAb5ZwokRuFvoKEMtQag",
  Brooklyn: "ChIJzeD6h0VawokRCfzPOz9Oi7E",
};

// Every geographic keyword we actively target in page copy. Not an
// exhaustive list — just the one we audit against quarterly.
const GEO_KEYWORDS = [
  "NYC",
  "New York City",
  "Manhattan",
  "Brooklyn",
  "Upper East Side",
  "Greenwich Village",
  "West Village",
  "Brooklyn Heights",
  "Scarsdale",
  "Westchester",
  "Lenox Hill",
];

const cardStyle: React.CSSProperties = {
  background: "#111827",
  border: "1px solid #1e293b",
  borderRadius: 12,
  padding: 24,
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.72rem",
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  margin: 0,
};

interface GeoScanResult extends ScanBaseResult {
  checks: { id: string; label: string; ok: boolean; detail: string }[];
}

export default function DevGeoPage() {
  const [scan, setScan] = useState<GeoScanResult | null>(null);
  const medicalBusinessJsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "MedicalBusiness",
      name: PRACTICE_NAME,
      telephone: PRACTICE_PHONE,
      url: "https://samelguizaoui.vercel.app",
      medicalSpecialty: "Orthopedic Surgery",
      priceRange: "$$",
      address: locations.map((loc) => ({
        "@type": "PostalAddress",
        streetAddress: loc.address.split(",")[0].trim(),
        addressLocality: loc.address.includes("Brooklyn")
          ? "Brooklyn"
          : "New York",
        addressRegion: "NY",
        addressCountry: "US",
      })),
      geo: locations.map((loc) => ({
        "@type": "GeoCoordinates",
        latitude: loc.lat,
        longitude: loc.lng,
      })),
    }),
    [],
  );

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#0a0e1a",
        color: "#e2e8f0",
      }}
    >
      <DevSidebar />
      <main
        style={{ flex: 1, marginLeft: 220, padding: "40px 48px" }}
        className="dev-main"
      >
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 700, color: "#f1f5f9", margin: 0 }}>
            GEO
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.9rem", marginTop: 4 }}>
            Local SEO health. {locations.length} offices · {GEO_KEYWORDS.length} geo keywords tracked.
          </p>
        </div>

        <ScanPanel<GeoScanResult>
          endpoint="/api/dev/geo-scan"
          label="GEO"
          result={scan}
          onResult={setScan}
        />

        {scan && (
          <div style={{ ...cardStyle, marginBottom: 20 }}>
            <p style={labelStyle}>Live scan results</p>
            <ul
              style={{
                margin: "10px 0 0",
                padding: 0,
                listStyle: "none",
                display: "grid",
                gap: 8,
              }}
            >
              {scan.checks.map((c) => (
                <li
                  key={c.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    padding: "10px 12px",
                    background: c.ok ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
                    border: `1px solid ${c.ok ? "rgba(34,197,94,0.18)" : "rgba(239,68,68,0.18)"}`,
                    borderRadius: 8,
                  }}
                >
                  <span
                    style={{
                      fontWeight: 700,
                      color: c.ok ? "#4ade80" : "#f87171",
                      minWidth: 20,
                    }}
                  >
                    {c.ok ? "✓" : "✗"}
                  </span>
                  <div>
                    <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "#f1f5f9" }}>
                      {c.label}
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: 2 }}>
                      {c.detail}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* NAP card */}
        <div style={{ ...cardStyle, marginBottom: 20 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 12,
            }}
          >
            <div>
              <p style={labelStyle}>Canonical NAP</p>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#f1f5f9", margin: "4px 0 0" }}>
                Name · Address · Phone
              </h2>
            </div>
            <span
              style={{
                padding: "3px 8px",
                background: "rgba(34,197,94,0.12)",
                color: "#4ade80",
                fontSize: "0.72rem",
                fontWeight: 600,
                borderRadius: 6,
              }}
            >
              Source of truth
            </span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 16,
              marginTop: 12,
            }}
            className="dev-geo-nap"
          >
            <div>
              <p style={labelStyle}>Name</p>
              <p style={{ margin: "4px 0 0", fontFamily: "monospace", fontSize: "0.88rem" }}>
                {PRACTICE_NAME}
              </p>
            </div>
            <div>
              <p style={labelStyle}>Phone (tel)</p>
              <p style={{ margin: "4px 0 0", fontFamily: "monospace", fontSize: "0.88rem" }}>
                {PRACTICE_PHONE} · displayed as {PRACTICE_PHONE_DISPLAY}
              </p>
            </div>
          </div>
        </div>

        {/* Offices grid */}
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#f1f5f9", margin: "0 0 12px" }}>
            Offices
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 12,
            }}
            className="dev-geo-offices"
          >
            {locations.map((loc) => {
              const placeId = PLACE_IDS[loc.label];
              return (
                <div key={loc.id} style={cardStyle}>
                  <p style={labelStyle}>{loc.label}</p>
                  <h3
                    style={{
                      fontSize: "0.98rem",
                      fontWeight: 700,
                      color: "#f1f5f9",
                      margin: "4px 0 8px",
                    }}
                  >
                    {loc.display.split(":")[0]}
                  </h3>
                  <p style={{ fontSize: "0.82rem", color: "#94a3b8", margin: "0 0 10px" }}>
                    {loc.address}
                  </p>
                  <div
                    style={{
                      fontSize: "0.78rem",
                      color: "#64748b",
                      lineHeight: 1.6,
                    }}
                  >
                    <div>
                      <span style={{ color: "#64748b" }}>lat/lng:</span>{" "}
                      <code style={{ color: "#c7d2fe" }}>
                        {loc.lat}, {loc.lng}
                      </code>
                    </div>
                    <div>
                      <span style={{ color: "#64748b" }}>place id:</span>{" "}
                      <code style={{ color: "#c7d2fe", fontSize: "0.72rem" }}>
                        {placeId ?? "—"}
                      </code>
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: 12,
                      display: "flex",
                      gap: 6,
                      flexWrap: "wrap",
                    }}
                  >
                    <a
                      href={loc.mapsUrl}
                      target="_blank"
                      rel="noopener"
                      style={{
                        padding: "4px 10px",
                        fontSize: "0.72rem",
                        background: "rgba(99,102,241,0.15)",
                        color: "#c7d2fe",
                        borderRadius: 6,
                        textDecoration: "none",
                      }}
                    >
                      Google Maps ↗
                    </a>
                    {placeId && (
                      <a
                        href={`https://search.google.com/local/reviews?placeid=${placeId}`}
                        target="_blank"
                        rel="noopener"
                        style={{
                          padding: "4px 10px",
                          fontSize: "0.72rem",
                          background: "rgba(99,102,241,0.15)",
                          color: "#c7d2fe",
                          borderRadius: 6,
                          textDecoration: "none",
                        }}
                      >
                        Reviews ↗
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Keywords */}
        <div style={{ ...cardStyle, marginBottom: 20 }}>
          <p style={labelStyle}>Targeted geo keywords</p>
          <div
            style={{
              marginTop: 10,
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
            }}
          >
            {GEO_KEYWORDS.map((k) => (
              <span
                key={k}
                style={{
                  padding: "4px 10px",
                  background: "rgba(99,102,241,0.12)",
                  color: "#c7d2fe",
                  fontSize: "0.78rem",
                  borderRadius: 6,
                  fontWeight: 500,
                }}
              >
                {k}
              </span>
            ))}
          </div>
        </div>

        {/* JSON-LD preview */}
        <div style={cardStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <p style={labelStyle}>MedicalBusiness JSON-LD (preview)</p>
            <Link
              href="/"
              target="_blank"
              rel="noopener"
              style={{
                fontSize: "0.78rem",
                color: "#818cf8",
                textDecoration: "none",
              }}
            >
              View live on homepage →
            </Link>
          </div>
          <pre
            style={{
              background: "#0a0e1a",
              border: "1px solid #1e293b",
              borderRadius: 8,
              padding: 16,
              fontSize: "0.76rem",
              color: "#94a3b8",
              overflowX: "auto",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {JSON.stringify(medicalBusinessJsonLd, null, 2)}
          </pre>
        </div>

        {/* Mobile tweaks */}
        <style>{`
          @media (max-width: 768px) {
            .dev-main { margin-left: 0 !important; padding: 24px 16px !important; padding-top: 64px !important; }
            .dev-geo-nap { grid-template-columns: 1fr !important; }
            .dev-geo-offices { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </main>
    </div>
  );
}
