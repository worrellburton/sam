import { useState, useMemo } from "react";
import { Link } from "react-router";
import { Sidebar, useDzPrefs } from "./doczoc-dashboard";
import { PlatformBg } from "~/components/PlatformBg";
import { PATIENTS, type Patient } from "~/data/patients";

export function meta() {
  return [{ title: "Appointments | DocZoc" }];
}

type ApptRecord = {
  patient: Patient;
  date: string;
  type: string;
  notes: string;
  codes: string[];
  isPast: boolean;
};

function parseDateLoose(s: string) {
  const d = new Date(s);
  return isNaN(d.getTime()) ? new Date() : d;
}

function getAllAppointments(): ApptRecord[] {
  const now = new Date();
  const records: ApptRecord[] = [];
  for (const p of PATIENTS) {
    for (const v of p.visits) {
      if (v.type.startsWith("claim_") || v.type.startsWith("payment_") || v.type.startsWith("invoice_") || v.type.startsWith("prior_auth")) continue;
      const d = parseDateLoose(v.date);
      records.push({ patient: p, date: v.date, type: v.type, notes: v.notes, codes: v.codes, isPast: d < now });
    }
  }
  records.sort((a, b) => parseDateLoose(b.date).getTime() - parseDateLoose(a.date).getTime());
  return records;
}

function getTypeColor(type: string) {
  const t = type.toLowerCase();
  if (t.includes("surgery")) return "#ef4444";
  if (t.includes("pre-op")) return "#f59e0b";
  if (t.includes("post-op") || t.includes("follow")) return "#22c55e";
  if (t.includes("consult") || t.includes("initial")) return "#6366f1";
  if (t.includes("mri") || t.includes("imaging")) return "#06b6d4";
  return "#818cf8";
}

export default function AppointmentsPage() {
  const [collapsed, setCollapsed] = useState(false);
  const { bgId } = useDzPrefs();
  const appointments = useMemo(() => getAllAppointments(), []);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");
  const [search, setSearch] = useState("");

  const filtered = appointments
    .filter(a => filter === "all" ? true : filter === "upcoming" ? !a.isPast : a.isPast)
    .filter(a => !search || a.patient.name.toLowerCase().includes(search.toLowerCase()) || a.type.toLowerCase().includes(search.toLowerCase()));

  const upcomingCount = appointments.filter(a => !a.isPast).length;
  const pastCount = appointments.filter(a => a.isPast).length;

  return (
    <div className="dz-layout">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <PlatformBg id={bgId} />
      <main className={`dz-main${collapsed ? " dz-main-collapsed" : ""}`} style={{ padding: "32px 36px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.15)",
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div>
              <h1 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#f1f5f9", margin: 0 }}>Appointments</h1>
              <p style={{ fontSize: "0.82rem", color: "#94a3b8", margin: 0 }}>
                {upcomingCount} upcoming &middot; {pastCount} past
              </p>
            </div>
          </div>
          {/* Search */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 10,
            background: "rgba(148,163,184,0.06)", border: "1px solid rgba(99,102,241,0.1)", width: 260,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search appointments..."
              style={{
                background: "transparent", border: "none", outline: "none", width: "100%",
                fontSize: "0.82rem", color: "#e2e8f0",
              }}
            />
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {(["all", "upcoming", "past"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "7px 16px", borderRadius: 8, border: "none", cursor: "pointer",
                fontSize: "0.78rem", fontWeight: 700, textTransform: "capitalize",
                background: filter === f ? "rgba(99,102,241,0.15)" : "rgba(148,163,184,0.06)",
                color: filter === f ? "#818cf8" : "#94a3b8",
                transition: "all 0.2s",
              }}
            >
              {f === "all" ? `All (${appointments.length})` : f === "upcoming" ? `Upcoming (${upcomingCount})` : `Past (${pastCount})`}
            </button>
          ))}
        </div>

        {/* Appointment list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((a, i) => {
            const color = getTypeColor(a.type);
            return (
              <div
                key={`${a.patient.id}-${a.date}-${i}`}
                className="dz-card"
                style={{
                  padding: "14px 18px", display: "flex", alignItems: "center", gap: 14,
                  borderLeft: `3px solid ${color}`, opacity: a.isPast ? 0.7 : 1,
                  transition: "all 0.15s",
                }}
              >
                {/* Date badge */}
                <div style={{
                  width: 50, textAlign: "center", flexShrink: 0,
                }}>
                  <div style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 600 }}>
                    {parseDateLoose(a.date).toLocaleDateString("en-US", { month: "short" })}
                  </div>
                  <div style={{ fontSize: "1.2rem", fontWeight: 800, color: a.isPast ? "#64748b" : "#f1f5f9" }}>
                    {parseDateLoose(a.date).getDate()}
                  </div>
                </div>

                {/* Type indicator */}
                <div style={{
                  width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: `${color}15`, border: `1px solid ${color}22`,
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {a.type.toLowerCase().includes("surgery")
                      ? <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                      : <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></>
                    }
                  </svg>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#f1f5f9", marginBottom: 2 }}>{a.type}</div>
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {a.notes}
                  </div>
                </div>

                {/* Patient */}
                <Link
                  to={`/doczoc/patients/${a.patient.id}`}
                  style={{
                    fontSize: "0.75rem", fontWeight: 600, color: "#a5b4fc", textDecoration: "none",
                    padding: "4px 10px", borderRadius: 6,
                    background: "rgba(99,102,241,0.08)", whiteSpace: "nowrap",
                  }}
                >
                  {a.patient.name}
                </Link>

                {/* Codes */}
                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                  {a.codes.slice(0, 2).map(c => (
                    <span key={c} style={{
                      fontSize: "0.65rem", fontFamily: "'SF Mono', Consolas, monospace",
                      padding: "2px 6px", borderRadius: 4, fontWeight: 600,
                      background: c.match(/^\d{5}$/) ? "rgba(37,99,235,0.12)" : "rgba(124,58,237,0.12)",
                      color: c.match(/^\d{5}$/) ? "#60a5fa" : "#a78bfa",
                    }}>{c}</span>
                  ))}
                </div>

                {/* Status */}
                <span style={{
                  fontSize: "0.65rem", fontWeight: 700, padding: "3px 8px", borderRadius: 20,
                  background: a.isPast ? "rgba(148,163,184,0.1)" : "rgba(34,197,94,0.12)",
                  color: a.isPast ? "#64748b" : "#22c55e",
                  whiteSpace: "nowrap",
                }}>
                  {a.isPast ? "Completed" : "Upcoming"}
                </span>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: 60, color: "#64748b", fontSize: "0.9rem" }}>
              No appointments found
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
