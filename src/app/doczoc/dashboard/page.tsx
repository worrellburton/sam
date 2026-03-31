"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect, useMemo, type ReactNode } from "react";
import { PlatformBg } from "@/components/PlatformBg";
import { PATIENTS } from "@/data/patients";
import { Sidebar } from "@/lib/doczoc/Sidebar";
import { useDzPrefs } from "@/lib/doczoc/useDzPrefs";

export function AiSummaryExpand({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {open && (
        <div style={{ marginTop: 6 }}>{children}</div>
      )}
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          marginTop: 6, padding: "3px 10px", borderRadius: 6,
          fontSize: "0.65rem", fontWeight: 700, cursor: "pointer",
          background: open ? "rgba(99,102,241,0.12)" : "rgba(99,102,241,0.06)",
          color: "#818cf8", border: "1px solid rgba(99,102,241,0.15)",
          transition: "all 0.15s",
        }}
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
        {open ? "Less" : "More insight"}
      </button>
    </>
  );
}

function SplashScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<"enter" | "hold" | "exit">("enter");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    // Particle animation on canvas
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.scale(dpr, dpr);
    const W = canvas.clientWidth;
    const H = canvas.clientHeight;

    const particles: { x: number; y: number; vx: number; vy: number; r: number; alpha: number; color: string }[] = [];
    const colors = ["#6366f1", "#818cf8", "#a78bfa", "#34d399", "#22d3ee"];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: W / 2 + (Math.random() - 0.5) * 40,
        y: H / 2 + (Math.random() - 0.5) * 40,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        r: 1.5 + Math.random() * 3,
        alpha: 0,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let t = 0;
    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      t++;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.99;
        p.vy *= 0.99;
        p.alpha = Math.min(1, t / 30) * (1 - Math.max(0, (t - 90) / 30));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha * 0.7);
        ctx.fill();
      }

      // Draw connecting lines
      ctx.globalAlpha = 0.1;
      ctx.strokeStyle = "#818cf8";
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      animRef.current = requestAnimationFrame(draw);
    }
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("hold"), 100);
    const t2 = setTimeout(() => setPhase("exit"), 2000);
    const t3 = setTimeout(() => onDone(), 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <div className={`dz-splash dz-splash-${phase}`}>
      <canvas ref={canvasRef} className="dz-splash-canvas" />
      <div className="dz-splash-content">
        <div className="dz-splash-logo-ring">
          <div className="dz-splash-logo-inner">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
        </div>
        <h1 className="dz-splash-title">DocZoc</h1>
        <p className="dz-splash-subtitle">Welcome back, Dr. Elguizaoui</p>
      </div>
    </div>
  );
}



// ── Google Reviews (Dashboard Card) ─────────────────────────────────
import { GOOGLE_REVIEWS, GOOGLE_RATING, GOOGLE_REVIEW_COUNT } from "@/data/google-reviews";

function StarRating({ rating, size = 10 }: { rating: number; size?: number }) {
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

function DashGoogleReviews() {
  return (
    <div className="dz-card" style={{ height: "100%", display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
      {/* Header */}
      <Link href="/doczoc/google-reviews" style={{ textDecoration: "none", color: "inherit", padding: "16px 18px 12px", borderBottom: "1px solid rgba(148,163,184,0.06)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--dz-text-muted, #64748b)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Latest Reviews</span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
            <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#fbbf24" }}>{GOOGLE_RATING}</span>
            <StarRating rating={5} size={9} />
          </div>
        </div>
        <span style={{ fontSize: "0.65rem", color: "#22c55e", fontWeight: 600 }}>{GOOGLE_REVIEW_COUNT} reviews</span>
      </Link>

      {/* Scrollable review list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 10px" }}>
        {GOOGLE_REVIEWS.slice(0, 8).map((review, i) => (
          <div key={i} style={{
            padding: "10px 10px", borderRadius: 8,
            background: i % 2 === 0 ? "transparent" : "var(--dz-input-bg, rgba(148,163,184,0.03))",
            borderBottom: i < 7 ? "1px solid rgba(148,163,184,0.04)" : "none",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
              <div>
                <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--dz-text-primary, #f1f5f9)" }}>{review.author_name}</span>
                <span style={{ fontSize: "0.55rem", color: "var(--dz-text-dim, #475569)", marginLeft: 6 }}>{new Date(review.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                <span style={{ fontSize: "0.5rem", color: "var(--dz-text-dim, #475569)", marginLeft: 4, opacity: 0.7 }}>· {review.location}</span>
              </div>
              <StarRating rating={review.rating} size={7} />
            </div>
            <div style={{
              fontSize: "0.62rem", color: "var(--dz-text-muted, #64748b)", lineHeight: 1.45,
              overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const,
            }}>
              {review.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Next Patient with live countdown ────────────────────────────────
function DashNextPatient() {
  const [secondsLeft, setSecondsLeft] = useState(90);
  const [insightExpanded, setInsightExpanded] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const countdownText = `${mins}:${secs.toString().padStart(2, "0")}`;
  const urgent = secondsLeft < 60;

  return (
    <div style={{ marginTop: 24, marginBottom: 24 }}>
      <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 12, color: "var(--dz-text-primary, #f1f5f9)" }}>Upcoming Patients</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 14, alignItems: "start" }}>

        {/* ── Next Patient Card ─────────────────────────── */}
        <div className="dz-card" style={{ padding: "18px 20px" }}>
          {/* Top row: avatar, name, time, countdown */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(59,130,246,0.12)", color: "#60a5fa", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0 }}>JK</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: "0.6rem", fontWeight: 700, color: "var(--dz-text-muted, #64748b)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Next Patient</span>
                <span style={{ fontSize: "0.55rem", fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "rgba(59,130,246,0.12)", color: "#60a5fa" }}>New Patient</span>
              </div>
              <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--dz-text-primary, #f1f5f9)" }}>James Kim</div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#818cf8", fontFamily: "'SF Mono', Consolas, monospace" }}>9:30 AM</div>
              <div style={{
                fontSize: "0.65rem", fontWeight: 700, color: urgent ? "#f87171" : "var(--dz-text-muted, #64748b)",
                fontFamily: "'SF Mono', Consolas, monospace",
              }}>in {countdownText}</div>
            </div>
          </div>

          {/* Type + tags */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: "0.75rem", color: "var(--dz-text-secondary, #94a3b8)" }}>Initial Consultation — Knee (ACL)</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.58rem", fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "rgba(99,102,241,0.1)", color: "#818cf8" }}>
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
              Appointment
            </span>
          </div>

          {/* AI Summary */}
          <div
            onClick={() => setInsightExpanded(!insightExpanded)}
            style={{
              fontSize: "0.72rem", lineHeight: 1.6, color: "var(--dz-text-secondary, #94a3b8)",
              padding: "10px 12px", borderRadius: 8,
              background: "rgba(99,102,241,0.04)",
              border: "1px solid rgba(99,102,241,0.08)",
              cursor: "pointer", transition: "all 0.15s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M20 12a8 8 0 0 0-8-8v8h8z"/></svg>
              <span style={{ fontSize: "0.6rem", fontWeight: 700, color: "#818cf8", textTransform: "uppercase", letterSpacing: "0.03em" }}>AI Summary</span>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2.5" style={{ marginLeft: "auto", transform: insightExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
            ACL tear (left), positive Lachman. Scheduled for reconstruction consult.
            {insightExpanded && (
              <div style={{ marginTop: 6, paddingTop: 6, borderTop: "1px solid rgba(99,102,241,0.1)", fontSize: "0.68rem" }}>
                MRI confirmed complete tear with lateral meniscus involvement. Anterior drawer test positive. Conservative management (bracing + PT x 8 weeks) showed minimal improvement. Recommend discussing autograft vs allograft options. Insurance pre-auth submitted to UHC (pending).
              </div>
            )}
          </div>
        </div>

        {/* ── Time Gap ──────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, padding: "20px 4px", alignSelf: "stretch" }}>
          <div style={{ width: 1, flex: 1, background: "rgba(148,163,184,0.12)" }} />
          <span style={{ fontSize: "0.6rem", fontWeight: 600, color: "#475569", whiteSpace: "nowrap" }}>45 min</span>
          <div style={{ width: 1, flex: 1, background: "rgba(148,163,184,0.12)" }} />
        </div>

        {/* ── After Next Card ───────────────────────────── */}
        <div className="dz-card" style={{ padding: "18px 20px", opacity: 0.85 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(34,197,94,0.12)", color: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0 }}>ML</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: "0.6rem", fontWeight: 700, color: "var(--dz-text-muted, #64748b)", textTransform: "uppercase", letterSpacing: "0.04em" }}>After Next</span>
                <span style={{ fontSize: "0.55rem", fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>Confirmed</span>
              </div>
              <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--dz-text-primary, #f1f5f9)" }}>Maria Lopez</div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#22c55e", fontFamily: "'SF Mono', Consolas, monospace" }}>10:15 AM</div>
            </div>
          </div>

          <div style={{ fontSize: "0.75rem", color: "var(--dz-text-secondary, #94a3b8)", marginBottom: 12 }}>
            Post-Op — ACL Reconstruction
          </div>

          <div style={{
            fontSize: "0.72rem", lineHeight: 1.5, color: "var(--dz-text-secondary, #94a3b8)",
            padding: "10px 12px", borderRadius: 8,
            background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.06)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M20 12a8 8 0 0 0-8-8v8h8z"/></svg>
              <span style={{ fontSize: "0.6rem", fontWeight: 700, color: "#22c55e", textTransform: "uppercase" }}>AI Summary</span>
            </div>
            6-week post-op ACL reconstruction. ROM improving, PT reports good progress.
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Appointment Type Over Time Graph ──────────────────────────────────
const APPT_TYPE_COLORS: Record<string, string> = {
  "Surgery": "#ef4444",
  "Initial Consultation": "#6366f1",
};

function categorizeVisitType(type: string): string {
  const t = type.toLowerCase();
  if (t.includes("surgery")) return "Surgery";
  return "Initial Consultation";
}

type TimeRange = "3mo" | "6mo" | "1yr";
type GraphMode = "appt-types" | "total-volume" | "new-vs-returning";

function getMonthlyApptData(range: TimeRange) {
  const now = new Date();
  const monthCount = range === "3mo" ? 3 : range === "6mo" ? 6 : 12;
  const months: { label: string; key: string }[] = [];
  for (let i = monthCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      label: d.toLocaleDateString("en-US", { month: "short" }),
      key: `${d.getFullYear()}-${d.getMonth()}`,
    });
  }

  const categories = Object.keys(APPT_TYPE_COLORS);
  const data: Record<string, number[]> = {};
  for (const cat of categories) data[cat] = new Array(monthCount).fill(0);

  // Also track total and new vs returning
  const totalByMonth = new Array(monthCount).fill(0);
  const newByMonth = new Array(monthCount).fill(0);
  const returningByMonth = new Array(monthCount).fill(0);

  for (const p of PATIENTS) {
    let visitCount = 0;
    for (const v of p.visits) {
      const d = new Date(v.date);
      if (isNaN(d.getTime())) continue;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const idx = months.findIndex(m => m.key === key);
      visitCount++;
      if (idx === -1) continue;
      const cat = categorizeVisitType(v.type);
      data[cat][idx]++;
      totalByMonth[idx]++;
      if (visitCount === 1) newByMonth[idx]++;
      else returningByMonth[idx]++;
    }
  }

  const totals = months.map((_, i) => categories.reduce((sum, cat) => sum + data[cat][i], 0));
  const avg = totals.reduce((s, v) => s + v, 0) / monthCount;

  return { months, data, categories, totals, avg, totalByMonth, newByMonth, returningByMonth, monthCount };
}

const GRAPH_MODES: { key: GraphMode; label: string }[] = [
  { key: "appt-types", label: "Appointment Types" },
  { key: "total-volume", label: "Total Volume" },
  { key: "new-vs-returning", label: "New vs Returning" },
];
const TIME_RANGES: { key: TimeRange; label: string }[] = [
  { key: "3mo", label: "3M" },
  { key: "6mo", label: "6M" },
  { key: "1yr", label: "1Y" },
];

const NVR_COLORS: Record<string, string> = { "New Patients": "#8b5cf6", "Returning": "#22c55e" };

function AppointmentGraph({ ready = true }: { ready?: boolean }) {
  const [animated, setAnimated] = useState(false);
  const [hoveredCat, setHoveredCat] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; cat: string; month: string; value: number } | null>(null);
  const [range, setRange] = useState<TimeRange>("6mo");
  const [mode, setMode] = useState<GraphMode>("appt-types");
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRefs = useRef<Map<string, SVGPathElement>>(new Map());

  const { months, data, categories, avg, totalByMonth, newByMonth, returningByMonth, monthCount } = useMemo(() => getMonthlyApptData(range), [range]);

  // Build lines based on mode
  const lines: { key: string; values: number[]; color: string }[] = useMemo(() => {
    if (mode === "appt-types") return categories.filter(c => data[c].some(v => v > 0)).map(c => ({ key: c, values: data[c], color: APPT_TYPE_COLORS[c] }));
    if (mode === "total-volume") return [{ key: "Total", values: totalByMonth, color: "#6366f1" }];
    return [{ key: "New Patients", values: newByMonth, color: "#8b5cf6" }, { key: "Returning", values: returningByMonth, color: "#22c55e" }];
  }, [mode, data, categories, totalByMonth, newByMonth, returningByMonth]);

  const colorMap: Record<string, string> = useMemo(() => {
    const m: Record<string, string> = {};
    lines.forEach(l => { m[l.key] = l.color; });
    return m;
  }, [lines]);

  // Animate on mount and when range/mode changes — wait for splash to finish
  useEffect(() => {
    if (!ready) { setAnimated(false); return; }
    setAnimated(false);
    const timer = setTimeout(() => setAnimated(true), 80);
    return () => clearTimeout(timer);
  }, [range, mode, ready]);

  // Measure path lengths for left-to-right animation
  useEffect(() => {
    if (!animated) return;
    pathRefs.current.forEach((el) => {
      const len = el.getTotalLength();
      el.style.strokeDasharray = `${len}`;
      el.style.strokeDashoffset = `${len}`;
      el.getBoundingClientRect(); // force reflow
      el.style.transition = "stroke-dashoffset 2.2s cubic-bezier(0.25, 0.1, 0.25, 1)";
      el.style.strokeDashoffset = "0";
    });
  }, [animated, lines]);

  const W = 800, H = 200, PL = 32, PR = 12, PT = 8, PB = 22;
  const chartW = W - PL - PR;
  const chartH = H - PT - PB;
  const allVals = lines.flatMap(l => l.values);
  const maxVal = Math.max(...allVals, 1);
  const yMax = maxVal <= 3 ? Math.ceil(maxVal) + 1 : maxVal <= 10 ? Math.ceil(maxVal / 2) * 2 : Math.ceil(maxVal / 5) * 5;
  const xStep = chartW / Math.max(monthCount - 1, 1);
  const yScale = (v: number) => PT + chartH - (v / yMax) * chartH;
  const xPos = (i: number) => PL + i * xStep;

  const buildPath = (values: number[]) =>
    values.map((v, i) => `${i === 0 ? "M" : "L"}${xPos(i).toFixed(1)},${yScale(v).toFixed(1)}`).join(" ");

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = W / rect.width;
    const x = (e.clientX - rect.left) * scaleX;
    const idx = Math.round((x - PL) / xStep);
    if (idx < 0 || idx >= monthCount) { setTooltip(null); return; }
    const scaleY = H / rect.height;
    const y = (e.clientY - rect.top) * scaleY;
    let closestLine = lines[0];
    let closestDist = Infinity;
    for (const line of lines) {
      const cy = yScale(line.values[idx]);
      const dist = Math.abs(y - cy);
      if (dist < closestDist) { closestDist = dist; closestLine = line; }
    }
    if (closestDist < 50) {
      setTooltip({ x: xPos(idx), y: yScale(closestLine.values[idx]), cat: closestLine.key, month: months[idx].label, value: closestLine.values[idx] });
    } else {
      setTooltip(null);
    }
  };

  const yTicks = 4;
  const modeLabel = GRAPH_MODES.find(m => m.key === mode)?.label || "";
  const rangeLabel = range === "3mo" ? "3 months" : range === "6mo" ? "6 months" : "12 months";

  const pillStyle = (active: boolean): React.CSSProperties => ({
    padding: "4px 12px", borderRadius: 20, border: "1px solid " + (active ? "var(--dz-accent, #6366f1)" : "rgba(148,163,184,0.15)"),
    background: active ? "rgba(99,102,241,0.15)" : "transparent",
    color: active ? "var(--dz-accent, #818cf8)" : "var(--dz-text-muted, #64748b)",
    fontSize: "0.62rem", fontWeight: 700, cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit",
  });

  return (
    <div className="dz-card" style={{ padding: "14px 18px", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            {GRAPH_MODES.map(m => (
              <button key={m.key} onClick={() => setMode(m.key)} style={pillStyle(mode === m.key)}>{m.label}</button>
            ))}
          </div>
          <div style={{ fontSize: "0.68rem", color: "var(--dz-text-muted, #64748b)", marginTop: 6 }}>Last {rangeLabel} · Avg {avg.toFixed(1)}/mo</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {TIME_RANGES.map(t => (
            <button key={t.key} onClick={() => setRange(t.key)} style={pillStyle(range === t.key)}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px", marginBottom: 6 }}>
        {lines.map(line => (
          <button
            key={line.key}
            onMouseEnter={() => setHoveredCat(line.key)}
            onMouseLeave={() => setHoveredCat(null)}
            style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", padding: "2px 0", opacity: hoveredCat && hoveredCat !== line.key ? 0.3 : 1, transition: "opacity 0.2s", fontFamily: "inherit" }}
          >
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: line.color }} />
            <span style={{ fontSize: "0.62rem", fontWeight: 600, color: "var(--dz-text-muted, #94a3b8)" }}>{line.key}</span>
          </button>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 16, height: 2, background: "#64748b", display: "inline-block", borderTop: "1px dashed #64748b" }} />
          <span style={{ fontSize: "0.62rem", fontWeight: 600, color: "var(--dz-text-muted, #64748b)" }}>Avg</span>
        </div>
      </div>

      {/* Chart */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ display: "block", overflow: "visible" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
      >
        <defs>
          {lines.map(line => (
            <linearGradient key={line.key} id={`grad-${line.key.replace(/\s+/g, "")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={line.color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={line.color} stopOpacity="0" />
            </linearGradient>
          ))}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Y-axis grid */}
        {Array.from({ length: yTicks + 1 }, (_, i) => {
          const val = (yMax / yTicks) * i;
          const y = yScale(val);
          return (
            <g key={i}>
              <line x1={PL} y1={y} x2={W - PR} y2={y} stroke="var(--dz-border, rgba(148,163,184,0.08))" strokeWidth="1" />
              <text x={PL - 6} y={y + 3} textAnchor="end" fontSize="9" fill="var(--dz-text-muted, #64748b)" fontFamily="inherit">{Math.round(val)}</text>
            </g>
          );
        })}

        {/* X-axis labels */}
        {months.map((m, i) => (
          <text key={m.key} x={xPos(i)} y={H - 6} textAnchor="middle" fontSize="9" fill="var(--dz-text-muted, #64748b)" fontFamily="inherit">{m.label}</text>
        ))}

        {/* Average line */}
        <line
          x1={PL} y1={yScale(avg)} x2={W - PR} y2={yScale(avg)}
          stroke="#64748b" strokeWidth="1" strokeDasharray="6 4"
          opacity={animated ? 0.6 : 0}
          style={{ transition: "opacity 1s ease 1s" }}
        />

        {/* Lines */}
        {lines.map(line => {
          const path = buildPath(line.values);
          const lastIdx = monthCount - 1;
          const areaPath = `${path} L${xPos(lastIdx).toFixed(1)},${yScale(0).toFixed(1)} L${xPos(0).toFixed(1)},${yScale(0).toFixed(1)} Z`;
          const isHovered = hoveredCat === line.key;
          const dimmed = hoveredCat && !isHovered;
          return (
            <g key={line.key} style={{ transition: "opacity 0.25s", opacity: dimmed ? 0.12 : 1 }}>
              <path d={areaPath} fill={`url(#grad-${line.key.replace(/\s+/g, "")})`} opacity={animated ? (isHovered ? 0.5 : 0.2) : 0} style={{ transition: "opacity 1.2s ease 0.5s" }} />
              {/* Glow */}
              <path
                ref={el => { if (el) pathRefs.current.set(`glow-${line.key}`, el); }}
                d={path} fill="none" stroke={line.color}
                strokeWidth={isHovered ? 3.5 : 2.5} strokeLinecap="round" strokeLinejoin="round"
                filter="url(#glow)"
                strokeDasharray="2000" strokeDashoffset="2000"
              />
              {/* Solid */}
              <path
                ref={el => { if (el) pathRefs.current.set(`line-${line.key}`, el); }}
                d={path} fill="none" stroke={line.color}
                strokeWidth={isHovered ? 2.5 : 1.8} strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray="2000" strokeDashoffset="2000"
              />
              {/* Dots */}
              {line.values.map((v, i) => (
                <circle key={i} cx={xPos(i)} cy={yScale(v)} r={isHovered ? 4 : 2.5}
                  fill={line.color} stroke="var(--dz-card-bg, #0f1021)" strokeWidth={1.5}
                  opacity={animated ? 1 : 0}
                  style={{ transition: `opacity 0.4s ease ${1.2 + i * 0.08}s, r 0.2s` }}
                />
              ))}
            </g>
          );
        })}

        {/* Tooltip */}
        {tooltip && (
          <g>
            <line x1={tooltip.x} y1={PT} x2={tooltip.x} y2={PT + chartH} stroke="var(--dz-text-muted, #64748b)" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
            <circle cx={tooltip.x} cy={tooltip.y} r={5} fill={colorMap[tooltip.cat] || "#818cf8"} stroke="white" strokeWidth="2" />
            <rect x={tooltip.x - 60} y={tooltip.y - 34} width={120} height={24} rx={6} fill="var(--dz-card-bg, #1a1a2e)" stroke="var(--dz-border, rgba(148,163,184,0.15))" strokeWidth="1" />
            <text x={tooltip.x} y={tooltip.y - 19} textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--dz-text-primary, #f1f5f9)" fontFamily="inherit">
              {tooltip.cat}: {tooltip.value} ({tooltip.month})
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

export default function DashboardPage() {
  const [collapsed, setCollapsed] = useState(false);
  const { bgId } = useDzPrefs();
  const pathname = usePathname();
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(false);

  const recentPatients = [
    { id: 1, name: "Sarah Mitchell", type: "Follow-up — Shoulder", time: "9:00 AM", status: "Confirmed" },
    { id: 2, name: "James Kim", type: "New Patient — Knee", time: "9:30 AM", status: "New" },
    { id: 3, name: "Maria Lopez", type: "Post-Op — ACL", time: "10:15 AM", status: "Confirmed" },
    { id: 4, name: "David Ross", type: "Consultation — Hip", time: "11:00 AM", status: "Pending" },
    { id: 5, name: "Emily Chen", type: "Follow-up — Wrist", time: "1:00 PM", status: "Confirmed" },
    { id: 6, name: "Michael Brown", type: "Sports Injury — Ankle", time: "2:30 PM", status: "New" },
  ];

  const fromLogin = false;
  const contentReady = true;


  return (
    <div className="dz-platform">
      {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}
      <PlatformBg bgId={bgId} />
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className={`dz-platform-main${collapsed ? " dz-main-expanded" : ""} dz-content-visible`}>
        <header className="dz-platform-header">
          <div>
            <h1>Dashboard</h1>
            <p>Welcome back, Dr. Elguizaoui</p>
          </div>
          <div className="dz-platform-header-right">
          </div>
        </header>

        <div className="dz-dash-graph-row">
          <div style={{ flex: 1, minWidth: 0 }}>
            <AppointmentGraph ready={!showSplash} />
          </div>
          <div className="dz-dash-reviews-col">
            <DashGoogleReviews />
          </div>
        </div>

        <DashNextPatient />

        <div className="dz-dash-section" style={{ marginTop: 16 }}>
          <h2>Today's Schedule</h2>
          <div className="dz-table-wrap">
            <table className="dz-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th className="dz-col-patient">Patient</th>
                  <th>Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentPatients.map((p) => {
                  const initials = p.name.split(" ").map(n => n[0]).join("");
                  const colors = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#14b8a6"];
                  const cidx = p.name.charCodeAt(0) % colors.length;
                  return (
                    <tr key={p.name} onClick={() => router.push(`/doczoc/patients/${p.id}`)} style={{ cursor: "pointer" }} className="dz-table-row-link">
                      <td className="dz-table-time">{p.time}</td>
                      <td className="dz-col-patient">
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, background: `${colors[cidx]}18`, color: colors[cidx], display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", fontWeight: 700 }}>{initials}</div>
                          <span className="dz-table-name" style={{ fontSize: "0.82rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                        </div>
                      </td>
                      <td>{p.type}</td>
                      <td><span className={`dz-status-badge dz-status-${p.status.toLowerCase()}`}>{p.status}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
