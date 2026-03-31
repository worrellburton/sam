"use client";
import { useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/lib/doczoc/Sidebar";
import { useDzPrefs } from "@/lib/doczoc/useDzPrefs";
import { PlatformBg } from "@/components/PlatformBg";
import { GOOGLE_REVIEWS, GOOGLE_RATING, GOOGLE_REVIEW_COUNT, type GoogleReview } from "@/data/google-reviews";


function StarRating({ rating, size = 12 }: { rating: number; size?: number }) {
  return (
    <span style={{ display: "inline-flex", gap: 1 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i <= rating ? "#fbbf24" : "none"} stroke="#fbbf24" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function GoogleIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

// Rating distribution (demo)
const RATING_DIST = [
  { stars: 5, count: 108 },
  { stars: 4, count: 14 },
  { stars: 3, count: 3 },
  { stars: 2, count: 1 },
  { stars: 1, count: 1 },
];

export default function GoogleReviewsPage() {
  const [collapsed, setCollapsed] = useState(false);
  const { bgId } = useDzPrefs();
  const [filterRating, setFilterRating] = useState<number | null>(null);

  const reviews = filterRating
    ? GOOGLE_REVIEWS.filter(r => r.rating === filterRating)
    : GOOGLE_REVIEWS;

  // Already sorted most recent first in data file

  return (
    <div className="dz-platform">
      <PlatformBg bgId={bgId} />
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className={`dz-platform-main${collapsed ? " dz-main-expanded" : ""}`}>
        <header className="dz-platform-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link href="/doczoc/dashboard" style={{ color: "var(--dz-text-muted)", textDecoration: "none", display: "flex", alignItems: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            </Link>
            <div>
              <h1 style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <GoogleIcon size={24} />
                Google Reviews
              </h1>
              <p>Patient feedback from Google Business Profile</p>
            </div>
          </div>
        </header>

        {/* Summary card */}
        <div className="dz-card" style={{ padding: "28px 32px", marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 40, alignItems: "center", flexWrap: "wrap" }}>
            {/* Overall rating */}
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "3rem", fontWeight: 900, color: "#fbbf24", lineHeight: 1 }}>{GOOGLE_RATING}</div>
              <StarRating rating={5} size={18} />
              <div style={{ fontSize: "0.78rem", color: "var(--dz-text-muted)", marginTop: 6 }}>{GOOGLE_REVIEW_COUNT} reviews</div>
            </div>

            {/* Rating distribution bars */}
            <div style={{ flex: 1, minWidth: 200, maxWidth: 360 }}>
              {RATING_DIST.map(d => {
                const pct = (d.count / GOOGLE_REVIEW_COUNT) * 100;
                const isActive = filterRating === d.stars;
                return (
                  <div
                    key={d.stars}
                    onClick={() => setFilterRating(isActive ? null : d.stars)}
                    style={{
                      display: "flex", alignItems: "center", gap: 8, marginBottom: 6, cursor: "pointer",
                      opacity: filterRating && !isActive ? 0.4 : 1,
                      transition: "opacity 0.15s",
                    }}
                  >
                    <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--dz-text-muted)", width: 12, textAlign: "right" }}>{d.stars}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="1.5">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <div style={{ flex: 1, height: 8, borderRadius: 4, background: "var(--dz-input-bg, rgba(148,163,184,0.1))", overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", borderRadius: 4, background: "#fbbf24", transition: "width 0.3s" }} />
                    </div>
                    <span style={{ fontSize: "0.68rem", fontWeight: 600, color: "var(--dz-text-muted)", width: 24 }}>{d.count}</span>
                  </div>
                );
              })}
            </div>

            {/* Google attribution */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <GoogleIcon size={40} />
              <div style={{ fontSize: "0.72rem", color: "var(--dz-text-muted)", textAlign: "center" }}>
                Dr. Sameh Elguizaoui, M.D.<br />
                Orthopedic Surgery & Sports Medicine
              </div>
            </div>
          </div>

          {filterRating && (
            <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: "0.78rem", color: "var(--dz-text-muted)" }}>
                Showing {reviews.length} review{reviews.length !== 1 ? "s" : ""} with {filterRating} star{filterRating !== 1 ? "s" : ""}
              </span>
              <button
                onClick={() => setFilterRating(null)}
                style={{
                  fontSize: "0.68rem", fontWeight: 600, padding: "2px 10px", borderRadius: 12,
                  background: "rgba(99,102,241,0.1)", color: "#818cf8", border: "none", cursor: "pointer",
                }}
              >Clear filter</button>
            </div>
          )}
        </div>

        {/* Reviews list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {reviews.map((r, i) => (
            <div key={i} className="dz-card" style={{ padding: "20px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.82rem", fontWeight: 700, color: "#fbbf24", flexShrink: 0,
                }}>{r.author_name.charAt(0)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--dz-text-primary)" }}>{r.author_name}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                    <StarRating rating={r.rating} size={13} />
                    <span style={{ fontSize: "0.75rem", color: "var(--dz-text-muted)" }}>{formatDate(r.date)}</span>
                  </div>
                </div>
                <GoogleIcon size={16} />
              </div>
              <div style={{ fontSize: "0.85rem", color: "var(--dz-text-secondary)", lineHeight: 1.65 }}>{r.text}</div>
            </div>
          ))}
        </div>

        {reviews.length === 0 && (
          <div className="dz-card" style={{ padding: 40, textAlign: "center" }}>
            <div style={{ fontSize: "0.85rem", color: "var(--dz-text-muted)" }}>No reviews match this filter.</div>
          </div>
        )}
      </main>
    </div>
  );
}
