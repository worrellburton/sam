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

// Appointment type database
const APPT_TYPES = {
  initialConsult: "Initial Consultation",
  followUp: "Follow-up",
  postOp: "Post-Op Follow-up",
  preOp: "Pre-Op Evaluation",
  sportsInjury: "Sports Injury Evaluation",
  imaging: "Imaging Review",
  injection: "Joint Injection",
  castRemoval: "Cast/Splint Removal",
  ptEval: "Physical Therapy Evaluation",
} as const;

// Demo future appointments — diverse mix across patients
const FUTURE_APPTS: { patientIdx: number; type: string; daysOut: number; notes: string; codes: string[] }[] = [
  // Week 1
  { patientIdx: 0, type: APPT_TYPES.postOp, daysOut: 1, notes: "6-week check ACL reconstruction. Assess ROM and stability.", codes: ["S83.511A", "99214"] },
  { patientIdx: 1, type: APPT_TYPES.initialConsult, daysOut: 1, notes: "Right shoulder pain x 2 months, MRI pending review.", codes: ["M75.111", "99203"] },
  { patientIdx: 2, type: APPT_TYPES.followUp, daysOut: 2, notes: "4-week follow-up, wrist fracture healing well.", codes: ["S52.501A", "99213"] },
  { patientIdx: 3, type: APPT_TYPES.preOp, daysOut: 2, notes: "Pre-op clearance for knee arthroscopy. Labs ordered.", codes: ["M23.211", "99213"] },
  { patientIdx: 4, type: APPT_TYPES.injection, daysOut: 3, notes: "Cortisone injection, left knee — OA management.", codes: ["M17.11", "20610"] },
  { patientIdx: 5, type: APPT_TYPES.sportsInjury, daysOut: 3, notes: "Acute ankle sprain during basketball. R/O fracture.", codes: ["S93.401A", "99203"] },
  { patientIdx: 6, type: APPT_TYPES.imaging, daysOut: 4, notes: "MRI review — right shoulder, evaluate rotator cuff.", codes: ["M75.111", "99213"] },
  { patientIdx: 7, type: APPT_TYPES.postOp, daysOut: 4, notes: "2-week post-op rotator cuff repair. Suture check.", codes: ["M75.111", "99213"] },
  // Week 2
  { patientIdx: 8, type: APPT_TYPES.initialConsult, daysOut: 7, notes: "New referral — left knee meniscus tear, failed conservative tx.", codes: ["M23.211", "99203"] },
  { patientIdx: 9, type: APPT_TYPES.preOp, daysOut: 7, notes: "Pre-op evaluation for arthroscopic meniscus repair, right knee.", codes: ["M23.211", "99213"] },
  { patientIdx: 10, type: APPT_TYPES.followUp, daysOut: 8, notes: "8-week follow-up distal radius fracture. X-ray in office.", codes: ["S52.501A", "99213"] },
  { patientIdx: 11, type: APPT_TYPES.preOp, daysOut: 8, notes: "Pre-op clearance for total hip replacement. EKG + labs.", codes: ["M16.11", "99213"] },
  { patientIdx: 12, type: APPT_TYPES.ptEval, daysOut: 9, notes: "PT progression check — advance to phase III protocol.", codes: ["S83.511A", "97161"] },
  { patientIdx: 13, type: APPT_TYPES.castRemoval, daysOut: 9, notes: "Cast removal, 6-week distal radius. X-ray for union.", codes: ["S52.501A", "29085"] },
  { patientIdx: 14, type: APPT_TYPES.initialConsult, daysOut: 10, notes: "Hip pain x 3 months, worse with stairs. R/O labral tear.", codes: ["M25.551", "99203"] },
  { patientIdx: 15, type: APPT_TYPES.injection, daysOut: 10, notes: "Hyaluronic acid injection series, right knee.", codes: ["M17.11", "20610"] },
  // Week 3
  { patientIdx: 16, type: APPT_TYPES.preOp, daysOut: 14, notes: "Final pre-op clearance for total hip arthroplasty, right hip.", codes: ["M16.11", "99213"] },
  { patientIdx: 17, type: APPT_TYPES.postOp, daysOut: 14, notes: "12-week post-op ACL. Return to sport evaluation.", codes: ["S83.511A", "99214"] },
  { patientIdx: 18, type: APPT_TYPES.followUp, daysOut: 15, notes: "Shoulder impingement — conservative tx progress.", codes: ["M75.41", "99213"] },
  { patientIdx: 19, type: APPT_TYPES.sportsInjury, daysOut: 15, notes: "Runner's knee evaluation. Activity modification plan.", codes: ["M76.51", "99203"] },
  { patientIdx: 20, type: APPT_TYPES.preOp, daysOut: 16, notes: "Pre-op for rotator cuff repair. Anesthesia consult.", codes: ["M75.111", "99213"] },
  { patientIdx: 21, type: APPT_TYPES.imaging, daysOut: 16, notes: "CT review — complex tibial plateau fracture planning.", codes: ["S82.101A", "99213"] },
  // Week 4
  { patientIdx: 22, type: APPT_TYPES.preOp, daysOut: 21, notes: "Pre-op for arthroscopic rotator cuff repair, right shoulder.", codes: ["M75.111", "99213"] },
  { patientIdx: 23, type: APPT_TYPES.initialConsult, daysOut: 21, notes: "Chronic knee pain, failed PT. Discuss surgical options.", codes: ["M17.11", "99203"] },
  { patientIdx: 24, type: APPT_TYPES.followUp, daysOut: 22, notes: "Hip injection follow-up — pain level reassessment.", codes: ["M16.11", "99213"] },
  { patientIdx: 25, type: APPT_TYPES.postOp, daysOut: 22, notes: "4-week post-op meniscus repair. ROM check.", codes: ["M23.211", "99213"] },
  { patientIdx: 0, type: APPT_TYPES.ptEval, daysOut: 23, notes: "PT re-evaluation — knee flexion plateau, adjust protocol.", codes: ["S83.511A", "97161"] },
  { patientIdx: 1, type: APPT_TYPES.followUp, daysOut: 23, notes: "Shoulder follow-up — MRI results discussion.", codes: ["M75.111", "99213"] },
  // Week 5-6
  { patientIdx: 26, type: APPT_TYPES.preOp, daysOut: 28, notes: "Pre-op for total knee replacement, left knee. Bilateral staged.", codes: ["M17.11", "99213"] },
  { patientIdx: 27, type: APPT_TYPES.followUp, daysOut: 28, notes: "Follow-up meniscus evaluation, medial compartment.", codes: ["M23.211", "99213"] },
  { patientIdx: 28, type: APPT_TYPES.initialConsult, daysOut: 30, notes: "New patient — elbow pain, possible tennis elbow.", codes: ["M77.11", "99203"] },
  { patientIdx: 29, type: APPT_TYPES.preOp, daysOut: 30, notes: "Pre-op for ACL reconstruction. PT prehab started.", codes: ["S83.511A", "99213"] },
  { patientIdx: 30, type: APPT_TYPES.preOp, daysOut: 35, notes: "Final pre-op for ACL reconstruction with hamstring autograft.", codes: ["S83.511A", "99213"] },
  { patientIdx: 2, type: APPT_TYPES.postOp, daysOut: 35, notes: "8-week post-op wrist fracture. Grip strength test.", codes: ["S52.501A", "99213"] },
  { patientIdx: 3, type: APPT_TYPES.followUp, daysOut: 37, notes: "Knee arthroscopy follow-up — clearing for light activity.", codes: ["M23.211", "99213"] },
  { patientIdx: 4, type: APPT_TYPES.injection, daysOut: 37, notes: "PRP injection, left knee. Regenerative protocol.", codes: ["M17.11", "0232T"] },
  { patientIdx: 5, type: APPT_TYPES.sportsInjury, daysOut: 40, notes: "Hamstring strain evaluation. Soccer player.", codes: ["S76.311A", "99203"] },
  { patientIdx: 6, type: APPT_TYPES.initialConsult, daysOut: 42, notes: "Chronic shoulder instability. Discuss Bankart repair.", codes: ["M24.411", "99203"] },
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
  const [filter, setFilter] = useState<"all" | "upcoming" | "new" | "type">("upcoming");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
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

  const newCount = appointments.filter(a => !a.isPast && (a.type.toLowerCase().includes("new patient") || a.type.toLowerCase().includes("initial consultation") || a.type.toLowerCase().includes("consultation"))).length;

  // Unique procedure types for type filter (exclude surgery types — those belong on Surgeries page)
  const procedureTypes = useMemo(() => {
    const types = new Map<string, number>();
    for (const a of appointments) {
      if (a.type.toLowerCase().startsWith("surgery")) continue;
      const t = a.type;
      types.set(t, (types.get(t) || 0) + 1);
    }
    return Array.from(types.entries()).sort((a, b) => b[1] - a[1]);
  }, [appointments]);

  const filtered = appointments
    .filter(a => {
      if (filter === "all") return true;
      if (filter === "upcoming") return !a.isPast;
      if (filter === "new") return !a.isPast && (a.type.toLowerCase().includes("new patient") || a.type.toLowerCase().includes("initial consultation") || a.type.toLowerCase().includes("consultation"));
      if (filter === "type") return typeFilter ? a.type === typeFilter : true;
      return true;
    })
    .filter(a => {
      if (!search) return true;
      const q = search.toLowerCase();
      return a.patient.name.toLowerCase().includes(q) ||
        a.type.toLowerCase().includes(q) ||
        a.date.toLowerCase().includes(q) ||
        a.notes.toLowerCase().includes(q) ||
        a.codes.some(c => c.toLowerCase().includes(q)) ||
        (a.isPast ? "completed" : "upcoming").includes(q);
    })
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

  return (
    <div className="dz-platform">
      <PlatformBg bgId={bgId} />
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className={`dz-platform-main${collapsed ? " dz-main-expanded" : ""}`}>
        {/* Header */}
        <header className="dz-platform-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1>Appointments</h1>
            <p>{upcomingCount} upcoming · {newCount} new</p>
          </div>
        </header>

        {/* Filter tabs */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 20, borderBottom: "1px solid rgba(148,163,184,0.08)", paddingBottom: 0 }}>
          {([
            { key: "upcoming" as const, label: "Upcoming", count: upcomingCount, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
            { key: "new" as const, label: "New", count: newCount, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg> },
            { key: "all" as const, label: "All", count: appointments.length, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
          ]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", border: "none", cursor: "pointer",
                background: "transparent", fontSize: "0.8rem", fontWeight: 600,
                color: filter === tab.key ? "var(--dz-accent, #6366f1)" : "var(--dz-text-muted)",
                borderBottom: filter === tab.key ? "2px solid var(--dz-accent, #6366f1)" : "2px solid transparent",
                marginBottom: -1,
              }}
            >
              {tab.icon}
              {tab.label}
              <span style={{
                fontSize: "0.65rem", fontWeight: 700, padding: "1px 6px", borderRadius: 10,
                background: filter === tab.key ? "rgba(99,102,241,0.12)" : "rgba(148,163,184,0.08)",
                color: filter === tab.key ? "var(--dz-accent, #6366f1)" : "var(--dz-text-dim, #475569)",
              }}>{tab.count}</span>
            </button>
          ))}
          <button
            onClick={() => { setFilter(filter === "type" ? "upcoming" : "type"); setTypeFilter(null); }}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 14px", marginLeft: 8, cursor: "pointer",
              fontSize: "0.78rem", fontWeight: 700, marginBottom: 2,
              background: filter === "type" ? "rgba(168,85,247,0.15)" : "var(--dz-input-bg, rgba(148,163,184,0.06))",
              color: filter === "type" ? "#c084fc" : "var(--dz-text-muted, #64748b)",
              border: filter === "type" ? "1px solid rgba(168,85,247,0.3)" : "1px solid var(--dz-input-border, rgba(148,163,184,0.12))",
              borderRadius: 8, transition: "all 0.15s",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            Type
            <span style={{
              fontSize: "0.65rem", fontWeight: 700, padding: "1px 6px", borderRadius: 10,
              background: filter === "type" ? "rgba(168,85,247,0.15)" : "rgba(148,163,184,0.08)",
              color: filter === "type" ? "#c084fc" : "var(--dz-text-dim, #475569)",
            }}>{procedureTypes.length}</span>
          </button>
        </div>

        {/* Search bar — always visible */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8,
              background: "var(--dz-input-bg)", border: "1px solid var(--dz-input-border)", flex: 1,
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--dz-text-dim)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search" style={{
                background: "transparent", border: "none", outline: "none", width: "100%",
                fontSize: "0.78rem", color: "var(--dz-text-secondary)",
              }} />
            </div>
            <CrosshairToggle active={focusMode} onClick={toggleFocus} />
            <div className="dz-view-toggle">
              <button className={`dz-view-btn${view === "table" ? " dz-view-active" : ""}`} onClick={() => setView("table")} title="Table view">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={view === "table" ? "#818cf8" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </button>
              <button className={`dz-view-btn${view === "list" ? " dz-view-active" : ""}`} onClick={() => setView("list")} title="Card view">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={view === "list" ? "#818cf8" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                </svg>
              </button>
            </div>
          </div>

        {/* Type Catalog View — shows appointment types, not individual appointments */}
        {filter === "type" && !typeFilter ? (
          view === "table" ? (
            <div className="dz-card" style={{ padding: 0, overflow: "hidden" }}>
              <div className="dz-table-wrap">
                <table className="dz-table" style={{ margin: 0, width: "100%" }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left" }}>Procedure</th>
                      <th style={{ textAlign: "center" }}>Total</th>
                      <th style={{ textAlign: "center" }}>Upcoming</th>
                      <th style={{ textAlign: "center" }}>Completed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {procedureTypes.map(([type, count]) => {
                      const color = getTypeColor(type);
                      const upcoming = appointments.filter(a => a.type === type && !a.isPast).length;
                      const completed = count - upcoming;
                      return (
                        <tr key={type} className="dz-row-clickable" onClick={() => setTypeFilter(type)} style={{ cursor: "pointer", borderLeft: `3px solid ${color}` }}>
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{
                                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                background: `${color}15`, border: `1px solid ${color}22`,
                              }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  {type.toLowerCase().includes("surgery")
                                    ? <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                                    : <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></>
                                  }
                                </svg>
                              </div>
                              <div>
                                <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--dz-text-primary)" }}>{type}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--dz-text-primary)" }}>{count}</span>
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <span style={{
                              fontSize: "0.68rem", fontWeight: 700, padding: "2px 8px", borderRadius: 10,
                              background: "rgba(34,197,94,0.12)", color: "#22c55e",
                            }}>{upcoming}</span>
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <span style={{
                              fontSize: "0.68rem", fontWeight: 700, padding: "2px 8px", borderRadius: 10,
                              background: "rgba(148,163,184,0.1)", color: "#64748b",
                            }}>{completed}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
              {procedureTypes.map(([type, count]) => {
                const color = getTypeColor(type);
                const upcoming = appointments.filter(a => a.type === type && !a.isPast).length;
                const completed = count - upcoming;
                return (
                  <div key={type} className="dz-card" onClick={() => setTypeFilter(type)} style={{
                    padding: "16px 18px", cursor: "pointer", borderLeft: `3px solid ${color}`,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: `${color}15`, border: `1px solid ${color}22`,
                      }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          {type.toLowerCase().includes("surgery")
                            ? <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                            : <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></>
                          }
                        </svg>
                      </div>
                      <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--dz-text-primary)" }}>{type}</div>
                    </div>
                    <div style={{ display: "flex", gap: 12 }}>
                      <div>
                        <div style={{ fontSize: "1.2rem", fontWeight: 800, color }}>{count}</div>
                        <div style={{ fontSize: "0.65rem", color: "var(--dz-text-muted)" }}>Total</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#22c55e" }}>{upcoming}</div>
                        <div style={{ fontSize: "0.65rem", color: "var(--dz-text-muted)" }}>Upcoming</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#64748b" }}>{completed}</div>
                        <div style={{ fontSize: "0.65rem", color: "var(--dz-text-muted)" }}>Completed</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : filter === "type" && typeFilter ? (
          <>
            {/* Back to type catalog + type filter header */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <button onClick={() => setTypeFilter(null)} style={{
                display: "flex", alignItems: "center", gap: 6, padding: "6px 12px",
                borderRadius: 8, border: "1px solid rgba(148,163,184,0.12)",
                background: "transparent", color: "var(--dz-text-muted)", cursor: "pointer",
                fontSize: "0.75rem", fontWeight: 600,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                Back
              </button>
              <span style={{
                fontSize: "0.82rem", fontWeight: 700, color: "var(--dz-text-primary)",
                borderLeft: `3px solid ${getTypeColor(typeFilter)}`, paddingLeft: 10,
              }}>{typeFilter}</span>
              <span style={{ fontSize: "0.68rem", color: "var(--dz-text-muted)" }}>{filtered.length} appointment{filtered.length !== 1 ? "s" : ""}</span>
            </div>
            {/* Table/List of filtered appointments */}
            {view === "table" ? (
              <div className="dz-card" style={{ padding: 0, overflow: "hidden" }}>
                <div className="dz-table-wrap">
                  <table className="dz-table" style={{ margin: 0 }}>
                    <thead>
                      <tr>
                        <th>Patient</th>
                        <th>Procedure</th>
                        <th>Date</th>
                        <th>Codes</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((a, i) => {
                        const color = getTypeColor(a.type);
                        return (
                          <tr key={`${a.patient.id}-${a.date}-${i}`} style={{ opacity: a.isPast ? 0.7 : 1 }}>
                            <td>
                              <Link to={`/doczoc/patients/${a.patient.id}`} style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--dz-accent-text)", textDecoration: "none", fontSize: "0.82rem" }}>
                                <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${["#6366f1","#22c55e","#f59e0b","#ef4444","#8b5cf6","#06b6d4","#ec4899","#14b8a6"][a.patient.name.charCodeAt(0) % 8]}18`, color: ["#6366f1","#22c55e","#f59e0b","#ef4444","#8b5cf6","#06b6d4","#ec4899","#14b8a6"][a.patient.name.charCodeAt(0) % 8], display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", fontWeight: 700, flexShrink: 0 }}>
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
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {filtered.map((a, i) => {
                  const color = getTypeColor(a.type);
                  return (
                    <div key={`${a.patient.id}-${a.date}-${i}`} className="dz-card" style={{
                      padding: "14px 18px", display: "flex", alignItems: "center", gap: 14,
                      borderLeft: `3px solid ${color}`, opacity: a.isPast ? 0.7 : 1,
                    }}>
                      <div style={{ width: 50, textAlign: "center", flexShrink: 0 }}>
                        <div style={{ fontSize: "0.68rem", color: "var(--dz-text-dim)", fontWeight: 600 }}>{parseDateLoose(a.date).toLocaleDateString("en-US", { month: "short" })}</div>
                        <div style={{ fontSize: "1.2rem", fontWeight: 800, color: a.isPast ? "var(--dz-text-dim)" : "var(--dz-text-primary)" }}>{parseDateLoose(a.date).getDate()}</div>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--dz-text-primary)", marginBottom: 2 }}>{a.type}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--dz-text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.notes}</div>
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
                      <span style={{
                        fontSize: "0.65rem", fontWeight: 700, padding: "3px 8px", borderRadius: 20,
                        background: a.isPast ? "rgba(148,163,184,0.1)" : "rgba(34,197,94,0.12)",
                        color: a.isPast ? "#64748b" : "#22c55e", whiteSpace: "nowrap",
                      }}>{a.isPast ? "Completed" : "Upcoming"}</span>
                    </div>
                  );
                })}
                {filtered.length === 0 && <div style={{ textAlign: "center", padding: 60, color: "var(--dz-text-dim)" }}>No appointments found</div>}
              </div>
            )}
          </>
        ) : (
          /* Standard Table/List View — for Upcoming/New/All tabs */
          view === "table" ? (
            <div className="dz-card" style={{ padding: 0, overflow: "hidden" }}>
              <div className="dz-table-wrap">
                <table className="dz-table" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      {([
                        { key: "patient" as const, label: "Patient", className: "dz-col-patient" },
                        { key: "type" as const, label: "Procedure", className: "dz-col-type" },
                        { key: "date" as const, label: "Date", className: "dz-col-date" },
                        { key: null, label: "Codes", className: "dz-col-codes" },
                        { key: "status" as const, label: "Status", className: "dz-col-status" },
                      ] as const).map((col, i) => (
                        <th
                          key={i}
                          className={col.className}
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
                          <td className="dz-col-patient">
                            <Link to={`/doczoc/patients/${a.patient.id}`} style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--dz-accent-text)", textDecoration: "none", fontSize: "0.82rem", overflow: "hidden" }}>
                              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(99,102,241,0.12)", color: "var(--dz-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", fontWeight: 700, flexShrink: 0 }}>
                                {a.patient.name.split(" ").map(n => n[0]).join("")}
                              </div>
                              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.patient.name}</span>
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
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filtered.map((a, i) => {
                const color = getTypeColor(a.type);
                return (
                  <div key={`${a.patient.id}-${a.date}-${i}`} className="dz-card" style={{
                    padding: "14px 18px", display: "flex", alignItems: "center", gap: 14,
                    borderLeft: `3px solid ${color}`, opacity: a.isPast ? 0.7 : 1,
                  }}>
                    <div style={{ width: 50, textAlign: "center", flexShrink: 0 }}>
                      <div style={{ fontSize: "0.68rem", color: "var(--dz-text-dim)", fontWeight: 600 }}>{parseDateLoose(a.date).toLocaleDateString("en-US", { month: "short" })}</div>
                      <div style={{ fontSize: "1.2rem", fontWeight: 800, color: a.isPast ? "var(--dz-text-dim)" : "var(--dz-text-primary)" }}>{parseDateLoose(a.date).getDate()}</div>
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
                      <div style={{ fontSize: "0.75rem", color: "var(--dz-text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.notes}</div>
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
                    }}>{a.isPast ? "Completed" : "Upcoming"}</span>
                  </div>
                );
              })}
              {filtered.length === 0 && <div style={{ textAlign: "center", padding: 60, color: "var(--dz-text-dim)" }}>No appointments found</div>}
            </div>
          )
        )}
      </main>
    </div>
  );
}
