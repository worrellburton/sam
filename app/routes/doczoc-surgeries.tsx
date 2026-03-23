import { useState, useMemo } from "react";
import { Link } from "react-router";
import { Sidebar, useDzPrefs } from "./doczoc-dashboard";
import { PlatformBg } from "~/components/PlatformBg";
import { PATIENTS, type Patient } from "~/data/patients";

export function meta() {
  return [{ title: "Surgeries | DocZoc" }];
}

type SurgeryRecord = {
  patient: Patient;
  date: string;
  type: string;
  notes: string;
  codes: string[];
  status: "completed" | "upcoming" | "pre-op";
};

function parseDateLoose(s: string) {
  const d = new Date(s);
  return isNaN(d.getTime()) ? new Date() : d;
}

function getAllSurgeries(): SurgeryRecord[] {
  const now = new Date();
  const records: SurgeryRecord[] = [];
  for (const p of PATIENTS) {
    for (const v of p.visits) {
      const isSurgery = v.type.toLowerCase().includes("surgery");
      const isPreOp = v.type.toLowerCase().includes("pre-op");
      if (!isSurgery && !isPreOp) continue;
      const d = parseDateLoose(v.date);
      let status: SurgeryRecord["status"] = "completed";
      if (isPreOp && !isSurgery) status = "pre-op";
      else if (d > now) status = "upcoming";
      records.push({ patient: p, date: v.date, type: v.type, notes: v.notes, codes: v.codes, status });
    }
  }
  records.sort((a, b) => parseDateLoose(b.date).getTime() - parseDateLoose(a.date).getTime());
  return records;
}

export default function SurgeriesPage() {
  const [collapsed, setCollapsed] = useState(false);
  const { bgId } = useDzPrefs();
  const surgeries = useMemo(() => getAllSurgeries(), []);
  const [filter, setFilter] = useState<"all" | "completed" | "upcoming" | "pre-op">("all");
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const filtered = filter === "all" ? surgeries : surgeries.filter(s => s.status === filter);
  const completedCount = surgeries.filter(s => s.status === "completed").length;
  const upcomingCount = surgeries.filter(s => s.status === "upcoming").length;
  const preOpCount = surgeries.filter(s => s.status === "pre-op").length;

  return (
    <div className="dz-layout">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <PlatformBg id={bgId} />
      <main className={`dz-main${collapsed ? " dz-main-collapsed" : ""}`} style={{ padding: "32px 36px" }}>
        {/* Hero header with liquid glass */}
        <div className="dz-surgery-hero" style={{
          position: "relative", overflow: "hidden", borderRadius: 20, padding: "32px 36px",
          marginBottom: 28,
          background: "linear-gradient(135deg, rgba(239,68,68,0.06) 0%, rgba(168,85,247,0.1) 40%, rgba(99,102,241,0.08) 100%)",
          backdropFilter: "blur(20px)",
          isolation: "isolate",
        }}>
          {/* Animated border */}
          <div style={{
            position: "absolute", inset: 0, borderRadius: 20, padding: 1,
            background: "linear-gradient(135deg, #ef4444, #a855f7, #6366f1, #ec4899, #ef4444)",
            backgroundSize: "300% 300%",
            animation: "dz-surgery-border 4s ease infinite",
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor" as any,
            maskComposite: "exclude",
            pointerEvents: "none", zIndex: 1,
          }} />
          {/* Shimmer */}
          <div style={{
            position: "absolute", top: 0, left: "-100%", width: "60%", height: "100%",
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)",
            animation: "dz-surgery-shimmer 3s ease-in-out infinite",
            pointerEvents: "none", zIndex: 2,
          }} />
          {/* Floating orbs */}
          <div style={{
            position: "absolute", top: -30, right: 80, width: 100, height: 100, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(239,68,68,0.12) 0%, transparent 70%)",
            animation: "dz-surgery-float 6s ease-in-out infinite", pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", bottom: -20, left: "40%", width: 80, height: 80, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)",
            animation: "dz-surgery-float 5s ease-in-out infinite 1s", pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", top: 20, left: "20%", width: 50, height: 50, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
            animation: "dz-surgery-float 7s ease-in-out infinite 2s", pointerEvents: "none",
          }} />

          <div style={{ position: "relative", zIndex: 3 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center",
                background: "linear-gradient(135deg, rgba(239,68,68,0.2), rgba(168,85,247,0.2))",
                border: "1px solid rgba(239,68,68,0.2)",
                animation: "dz-surgery-pulse 2s ease-in-out infinite",
              }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              </div>
              <div>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#f1f5f9", margin: 0 }}>Surgical Center</h1>
                <p style={{ fontSize: "0.85rem", color: "#94a3b8", margin: 0, marginTop: 2 }}>
                  All procedures, pre-ops, and operative records
                </p>
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <StatChip label="Completed" count={completedCount} color="#22c55e" icon="check" />
              <StatChip label="Upcoming" count={upcomingCount} color="#f59e0b" icon="clock" />
              <StatChip label="Pre-Op" count={preOpCount} color="#818cf8" icon="file" />
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {(["all", "completed", "upcoming", "pre-op"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "7px 16px", borderRadius: 8, border: "none", cursor: "pointer",
                fontSize: "0.78rem", fontWeight: 700, textTransform: "capitalize",
                background: filter === f ? "rgba(239,68,68,0.15)" : "rgba(148,163,184,0.06)",
                color: filter === f ? "#f87171" : "#94a3b8",
                transition: "all 0.2s",
              }}
            >
              {f === "all" ? `All (${surgeries.length})` : `${f.replace("-", " ")} (${f === "completed" ? completedCount : f === "upcoming" ? upcomingCount : preOpCount})`}
            </button>
          ))}
        </div>

        {/* Surgery cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((s, i) => (
            <SurgeryCard
              key={`${s.patient.id}-${s.date}-${i}`}
              surgery={s}
              expanded={expandedIdx === i}
              onToggle={() => setExpandedIdx(expandedIdx === i ? null : i)}
            />
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: 60, color: "#64748b", fontSize: "0.9rem" }}>
              No {filter === "all" ? "" : filter} surgeries found
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatChip({ label, count, color, icon }: { label: string; count: number; color: string; icon: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 10,
      background: `${color}11`, border: `1px solid ${color}22`,
    }}>
      {icon === "check" && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>}
      {icon === "clock" && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
      {icon === "file" && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
      <span style={{ fontSize: "1.1rem", fontWeight: 800, color, fontFamily: "'SF Mono', Consolas, monospace" }}>{count}</span>
      <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#94a3b8" }}>{label}</span>
    </div>
  );
}

function SurgeryCard({ surgery, expanded, onToggle }: { surgery: SurgeryRecord; expanded: boolean; onToggle: () => void }) {
  const s = surgery;
  const statusColors = { completed: "#22c55e", upcoming: "#f59e0b", "pre-op": "#818cf8" };
  const statusColor = statusColors[s.status];

  return (
    <div className="dz-surgery-btn" style={{
      borderRadius: 14, overflow: "hidden",
      background: "rgba(15,23,42,0.4)", backdropFilter: "blur(12px)",
      border: `1px solid ${statusColor}22`,
      transition: "transform 0.2s, box-shadow 0.2s",
    }}>
      <button
        onClick={onToggle}
        style={{
          width: "100%", border: "none", cursor: "pointer", textAlign: "left",
          background: "transparent", padding: "18px 22px",
          display: "flex", alignItems: "center", gap: 16,
        }}
      >
        {/* Status indicator */}
        <div style={{
          width: 10, height: 10, borderRadius: "50%", flexShrink: 0,
          background: statusColor,
          boxShadow: `0 0 8px ${statusColor}66`,
          animation: s.status === "upcoming" ? "dz-surgery-pulse 2s ease-in-out infinite" : undefined,
        }} />

        {/* Surgery icon */}
        <div style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: `${statusColor}15`, border: `1px solid ${statusColor}22`,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={statusColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
            <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#f1f5f9" }}>{s.type}</span>
            <span style={{
              fontSize: "0.65rem", fontWeight: 700, padding: "2px 8px", borderRadius: 20,
              background: `${statusColor}20`, color: statusColor, textTransform: "capitalize",
            }}>
              {s.status.replace("-", " ")}
            </span>
          </div>
          <div style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
            <Link to={`/doczoc/patients/${s.patient.id}`} onClick={e => e.stopPropagation()} style={{ color: "#a5b4fc", textDecoration: "none" }}>
              {s.patient.name}
            </Link>
            {" "}&middot; {s.date}
          </div>
        </div>

        {/* Codes preview */}
        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
          {s.codes.slice(0, 2).map(c => (
            <span key={c} style={{
              fontSize: "0.68rem", fontFamily: "'SF Mono', Consolas, monospace",
              padding: "2px 7px", borderRadius: 4, fontWeight: 600,
              background: c.match(/^\d{5}$/) ? "rgba(37,99,235,0.12)" : "rgba(124,58,237,0.12)",
              color: c.match(/^\d{5}$/) ? "#60a5fa" : "#a78bfa",
            }}>{c}</span>
          ))}
          {s.codes.length > 2 && (
            <span style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 600 }}>+{s.codes.length - 2}</span>
          )}
        </div>

        {/* Chevron */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ flexShrink: 0, transition: "transform 0.2s", transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div style={{
          padding: "0 22px 18px", borderTop: `1px solid ${statusColor}11`,
        }}>
          <p style={{ fontSize: "0.82rem", color: "#cbd5e1", lineHeight: 1.6, marginTop: 14 }}>{s.notes}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
            {s.codes.map(c => (
              <span key={c} style={{
                fontSize: "0.72rem", fontFamily: "'SF Mono', Consolas, monospace",
                padding: "3px 10px", borderRadius: 6, fontWeight: 600,
                background: c.match(/^\d{5}$/) ? "rgba(37,99,235,0.12)" : "rgba(124,58,237,0.12)",
                color: c.match(/^\d{5}$/) ? "#60a5fa" : "#a78bfa",
              }}>{c}</span>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <Link
              to={`/doczoc/patients/${s.patient.id}`}
              style={{
                fontSize: "0.75rem", fontWeight: 700, padding: "6px 14px", borderRadius: 8,
                background: "rgba(99,102,241,0.1)", color: "#a5b4fc", textDecoration: "none",
                border: "1px solid rgba(99,102,241,0.15)",
              }}
            >
              View Patient
            </Link>
            <Link
              to="/doczoc/in-person"
              style={{
                fontSize: "0.75rem", fontWeight: 700, padding: "6px 14px", borderRadius: 8,
                background: "linear-gradient(135deg, #ef4444, #a855f7)", color: "#fff", textDecoration: "none",
                boxShadow: "0 0 16px rgba(239,68,68,0.2)",
              }}
            >
              Operative Report
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
