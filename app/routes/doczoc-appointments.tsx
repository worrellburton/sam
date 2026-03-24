import { useState, useMemo, useCallback } from "react";
import { Link } from "react-router";
import { Sidebar, useDzPrefs } from "./doczoc-dashboard";
import { PlatformBg } from "~/components/PlatformBg";
import { PATIENTS, type Patient } from "~/data/patients";
import { useCrosshairFocus, CrosshairToggle } from "~/hooks/useCrosshairFocus";
import { getCodeDescription } from "~/data/medical-codes";

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

// Demo future appointments so "upcoming" isn't empty
const FUTURE_APPTS: { patientIdx: number; type: string; daysOut: number; notes: string; codes: string[] }[] = [
  { patientIdx: 0, type: "Post-Op Follow-up (6 weeks)", daysOut: 2, notes: "6-week check ACL reconstruction. Assess ROM and stability.", codes: ["S83.511A", "Z96.651"] },
  { patientIdx: 1, type: "New Patient Consultation", daysOut: 3, notes: "Right shoulder pain x 2 months, MRI pending review.", codes: ["M75.111", "99203"] },
  { patientIdx: 2, type: "Pre-Op Evaluation", daysOut: 5, notes: "Pre-op clearance for knee arthroscopy. Labs ordered.", codes: ["M23.211", "99213"] },
  { patientIdx: 3, type: "Surgery — Hip Arthroscopy", daysOut: 7, notes: "Arthroscopic labral repair, right hip. NPO after midnight.", codes: ["M16.11", "29916"] },
  { patientIdx: 4, type: "Follow-up — Wrist", daysOut: 10, notes: "8-week follow-up distal radius fracture. X-ray in office.", codes: ["S52.501A", "Z87.39"] },
  { patientIdx: 5, type: "Initial Consultation", daysOut: 12, notes: "New referral — left knee meniscus tear, failed conservative tx.", codes: ["M23.211", "99203"] },
  { patientIdx: 0, type: "Physical Therapy Eval", daysOut: 14, notes: "PT progression check, advance to phase III protocol.", codes: ["S83.511A", "97161"] },
  { patientIdx: 6, type: "Surgery — Rotator Cuff Repair", daysOut: 16, notes: "Arthroscopic RCR, right shoulder. Nerve block planned.", codes: ["M75.111", "29827"] },
];

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
  // Add demo future appointments
  for (const fa of FUTURE_APPTS) {
    const p = PATIENTS[fa.patientIdx % PATIENTS.length];
    if (!p) continue;
    const d = new Date(now);
    d.setDate(d.getDate() + fa.daysOut);
    const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    records.push({ patient: p, date: dateStr, type: fa.type, notes: fa.notes, codes: fa.codes, isPast: false });
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
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("upcoming");
  const DATA_COLS = useMemo(() => new Set([0, 1, 2, 3, 4]), []);
  const { focusMode, toggleFocus, onCellEnter, onCellLeave, getRowStyle } = useCrosshairFocus(DATA_COLS);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"table" | "list">("table");
  const [sortCol, setSortCol] = useState<"patient" | "type" | "date" | "status" | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const handleSort = (col: typeof sortCol) => {
    if (sortCol === col) {
      if (sortDir === "desc") { setSortCol(null); setSortDir("asc"); }
      else setSortDir("desc");
    } else { setSortCol(col); setSortDir("asc"); }
  };

  const filtered = appointments
    .filter(a => filter === "all" ? true : filter === "upcoming" ? !a.isPast : a.isPast)
    .filter(a => !search || a.patient.name.toLowerCase().includes(search.toLowerCase()) || a.type.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (!sortCol) return 0;
      const dir = sortDir === "asc" ? 1 : -1;
      switch (sortCol) {
        case "patient": return a.patient.name.localeCompare(b.patient.name) * dir;
        case "type": return a.type.localeCompare(b.type) * dir;
        case "date": return (parseDateLoose(a.date).getTime() - parseDateLoose(b.date).getTime()) * dir;
        case "status": return ((a.isPast ? 1 : 0) - (b.isPast ? 1 : 0)) * dir;
        default: return 0;
      }
    });

  const upcomingCount = appointments.filter(a => !a.isPast).length;
  const pastCount = appointments.filter(a => a.isPast).length;

  return (
    <div className="dz-platform">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <PlatformBg bgId={bgId} />
      <main className={`dz-platform-main${collapsed ? " dz-main-expanded" : ""}`} style={{ padding: "32px 36px" }}>
        {/* Header */}
        <div className="dz-platform-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.15)",
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div>
              <h1>Appointments</h1>
              <p>{upcomingCount} upcoming · {pastCount} past</p>
            </div>
          </div>
        </div>

        {/* Controls — single row */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 6 }}>
            {(["all", "upcoming", "past"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                  fontSize: "0.75rem", fontWeight: 700, textTransform: "capitalize",
                  background: filter === f ? "rgba(99,102,241,0.15)" : "var(--dz-input-bg)",
                  color: filter === f ? "var(--dz-accent)" : "var(--dz-text-muted)",
                }}
              >
                {f === "all" ? `All (${appointments.length})` : f === "upcoming" ? `Upcoming (${upcomingCount})` : `Past (${pastCount})`}
              </button>
            ))}
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", gap: 2 }}>
            <button onClick={() => setView("table")} style={{
              padding: "6px 8px", borderRadius: "6px 0 0 6px", border: "none", cursor: "pointer",
              background: view === "table" ? "rgba(99,102,241,0.15)" : "var(--dz-input-bg)",
              color: view === "table" ? "var(--dz-accent)" : "var(--dz-text-dim)",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <button onClick={() => setView("list")} style={{
              padding: "6px 8px", borderRadius: "0 6px 6px 0", border: "none", cursor: "pointer",
              background: view === "list" ? "rgba(99,102,241,0.15)" : "var(--dz-input-bg)",
              color: view === "list" ? "var(--dz-accent)" : "var(--dz-text-dim)",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            </button>
          </div>
          {view === "table" && <CrosshairToggle active={focusMode} onClick={toggleFocus} />}
        </div>

        {/* Search bar — full width */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8,
            background: "var(--dz-input-bg)", border: "1px solid var(--dz-input-border)", flex: 1,
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--dz-text-dim)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search appointments..." style={{
              background: "transparent", border: "none", outline: "none", width: "100%",
              fontSize: "0.78rem", color: "var(--dz-text-secondary)",
            }} />
          </div>
        </div>

        {/* Table View */}
        {view === "table" ? (
          <div className="dz-card" style={{ padding: 0, overflow: "hidden" }}>
            <div className="dz-table-wrap">
              <table className="dz-table" style={{ margin: 0 }}>
                <thead>
                  <tr>
                    {([
                      { key: "patient" as const, label: "Patient" },
                      { key: "type" as const, label: "Procedure" },
                      { key: "date" as const, label: "Date" },
                      { key: null, label: "Codes" },
                      { key: "status" as const, label: "Status" },
                    ] as const).map((col, i) => (
                      <th
                        key={i}
                        onClick={col.key ? () => handleSort(col.key) : undefined}
                        style={{ cursor: col.key ? "pointer" : "default", userSelect: "none", whiteSpace: "nowrap" }}
                      >
                        {col.label}
                        {col.key && sortCol === col.key && (
                          <span style={{ marginLeft: 4, fontSize: "0.65rem", opacity: 0.7 }}>
                            {sortDir === "asc" ? "\u25B2" : "\u25BC"}
                          </span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a, i) => {
                    const color = getTypeColor(a.type);
                    return (
                      <tr key={`${a.patient.id}-${a.date}-${i}`} style={{ ...getRowStyle(`${a.patient.id}-${i}`), opacity: a.isPast ? 0.7 : 1 }} onMouseEnter={() => onCellEnter(`${a.patient.id}-${i}`, 0)} onMouseLeave={onCellLeave}>
                        <td>
                          <Link to={`/doczoc/patients/${a.patient.id}`} style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--dz-accent-text)", textDecoration: "none", fontSize: "0.82rem" }}>
                            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(99,102,241,0.12)", color: "var(--dz-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", fontWeight: 700, flexShrink: 0 }}>
                              {a.patient.name.split(" ").map(n => n[0]).join("")}
                            </div>
                            {a.patient.name}
                          </Link>
                        </td>
                        <td style={{ fontWeight: 600, fontSize: "0.82rem", borderLeft: `3px solid ${color}` }}>{a.type}</td>
                        <td style={{ fontSize: "0.82rem", whiteSpace: "nowrap" }}>{a.date}</td>
                        <td>
                          <div style={{ display: "flex", gap: 3 }}>
                            {a.codes.slice(0, 2).map(c => (
                              <span key={c} title={getCodeDescription(c)} style={{
                                fontSize: "0.65rem", fontFamily: "'SF Mono', Consolas, monospace",
                                padding: "1px 6px", borderRadius: 4, fontWeight: 600,
                                background: c.match(/^\d{5}$/) ? "rgba(37,99,235,0.12)" : "rgba(124,58,237,0.12)",
                                color: c.match(/^\d{5}$/) ? "#60a5fa" : "#a78bfa",
                              }}>{c}</span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <span style={{
                            display: "inline-flex", alignItems: "center", gap: 5,
                            fontSize: "0.68rem", fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                            background: a.isPast ? "rgba(148,163,184,0.1)" : "rgba(34,197,94,0.12)",
                            color: a.isPast ? "#64748b" : "#22c55e",
                          }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: a.isPast ? "#64748b" : "#22c55e" }} />
                            {a.isPast ? "Completed" : "Upcoming"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "var(--dz-text-dim)" }}>No appointments found</div>}
          </div>
        ) : (
          /* Card/List View */
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
                  }}
                >
                  <div style={{ width: 50, textAlign: "center", flexShrink: 0 }}>
                    <div style={{ fontSize: "0.68rem", color: "var(--dz-text-dim)", fontWeight: 600 }}>
                      {parseDateLoose(a.date).toLocaleDateString("en-US", { month: "short" })}
                    </div>
                    <div style={{ fontSize: "1.2rem", fontWeight: 800, color: a.isPast ? "var(--dz-text-dim)" : "var(--dz-text-primary)" }}>
                      {parseDateLoose(a.date).getDate()}
                    </div>
                  </div>
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
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--dz-text-primary)", marginBottom: 2 }}>{a.type}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--dz-text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {a.notes}
                    </div>
                  </div>
                  <Link to={`/doczoc/patients/${a.patient.id}`} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    fontSize: "0.75rem", fontWeight: 600, color: "var(--dz-accent-text)", textDecoration: "none",
                    padding: "4px 10px", borderRadius: 6, background: "rgba(99,102,241,0.08)", whiteSpace: "nowrap",
                  }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(99,102,241,0.12)", color: "var(--dz-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.5rem", fontWeight: 700, flexShrink: 0 }}>
                      {a.patient.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    {a.patient.name}
                  </Link>
                  <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                    {a.codes.slice(0, 2).map(c => (
                      <span key={c} title={getCodeDescription(c)} style={{
                        fontSize: "0.65rem", fontFamily: "'SF Mono', Consolas, monospace",
                        padding: "2px 6px", borderRadius: 4, fontWeight: 600,
                        background: c.match(/^\d{5}$/) ? "rgba(37,99,235,0.12)" : "rgba(124,58,237,0.12)",
                        color: c.match(/^\d{5}$/) ? "#60a5fa" : "#a78bfa",
                      }}>{c}</span>
                    ))}
                  </div>
                  <span style={{
                    fontSize: "0.65rem", fontWeight: 700, padding: "3px 8px", borderRadius: 20,
                    background: a.isPast ? "rgba(148,163,184,0.1)" : "rgba(34,197,94,0.12)",
                    color: a.isPast ? "#64748b" : "#22c55e", whiteSpace: "nowrap",
                  }}>
                    {a.isPast ? "Completed" : "Upcoming"}
                  </span>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: 60, color: "var(--dz-text-dim)", fontSize: "0.9rem" }}>
                No appointments found
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
