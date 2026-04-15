"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useCrosshairFocus, CrosshairToggle } from "@/hooks/useCrosshairFocus";


type Tab = "appointments" | "surgeries" | "reports";
type ApptFilter = "all" | "incoming" | "completed";
type ViewMode = "table" | "grid";

const APPOINTMENTS = [
  { id: 1, patient: "Sarah Mitchell", date: "Mar 25, 2026", time: "9:00 AM", type: "Post-Op Follow-up", location: "Manhattan", status: "Confirmed", notes: "8-week post-op rotator cuff repair", completed: false },
  { id: 2, patient: "David Ross", date: "Mar 24, 2026", time: "10:30 AM", type: "Follow-up Consultation", location: "Manhattan", status: "Confirmed", notes: "Hip replacement discussion", completed: false },
  { id: 3, patient: "Emily Chen", date: "Mar 26, 2026", time: "11:00 AM", type: "Follow-up — OT", location: "Manhattan", status: "Confirmed", notes: "Wrist rehab check", completed: false },
  { id: 4, patient: "Lisa Strassberg", date: "Mar 28, 2026", time: "2:00 PM", type: "Final Follow-up", location: "Brooklyn", status: "Pending", notes: "12-week knee arthroscopy final", completed: false },
  { id: 5, patient: "Michael Brown", date: "Apr 2, 2026", time: "9:30 AM", type: "Follow-up", location: "Manhattan", status: "Pending", notes: "Ankle sprain recheck", completed: false },
  { id: 6, patient: "Maria Lopez", date: "Apr 1, 2026", time: "3:00 PM", type: "Post-Op Follow-up", location: "Manhattan", status: "Confirmed", notes: "6-week ACL follow-up", completed: false },
  { id: 7, patient: "Sarah Mitchell", date: "Feb 10, 2026", time: "9:00 AM", type: "Post-Op Follow-up", location: "Manhattan", status: "Completed", notes: "4-week rotator cuff check", completed: true },
  { id: 8, patient: "James Kim", date: "Feb 15, 2026", time: "10:00 AM", type: "Pre-Op Evaluation", location: "Manhattan", status: "Completed", notes: "ACL reconstruction pre-op", completed: true },
  { id: 9, patient: "Emily Chen", date: "Feb 20, 2026", time: "2:30 PM", type: "Initial Consultation", location: "Manhattan", status: "Completed", notes: "Wrist pain evaluation", completed: true },
];

const SURGERIES = [
  { id: 1, patient: "James Kim", date: "Mar 22, 2026", time: "7:30 AM", procedure: "ACL Reconstruction (BPTB Autograft)", facility: "Manhattan Surgical Center", pos: "24", anesthesia: "General", status: "Scheduled", preOp: true, authObtained: true, codes: ["29888", "S83.511A"] },
  { id: 2, patient: "David Ross", date: "Apr 15, 2026", time: "8:00 AM", procedure: "Total Hip Arthroplasty", facility: "NYP/Weill Cornell — OR Suite", pos: "22", anesthesia: "General + Regional", status: "Pending Auth", preOp: false, authObtained: false, codes: ["27130", "M16.11"] },
  { id: 3, patient: "TBD", date: "Apr 22, 2026", time: "7:30 AM", procedure: "Knee Arthroscopy — Meniscus Repair", facility: "Manhattan Surgical Center", pos: "24", anesthesia: "General", status: "Tentative", preOp: false, authObtained: false, codes: ["29882"] },
];

const statusColors: Record<string, { bg: string; color: string }> = {
  Confirmed: { bg: "rgba(34,197,94,0.12)", color: "#22c55e" },
  Pending: { bg: "rgba(251,191,36,0.12)", color: "#fbbf24" },
  Completed: { bg: "rgba(99,102,241,0.12)", color: "#818cf8" },
  Scheduled: { bg: "rgba(34,197,94,0.12)", color: "#22c55e" },
  "Pending Auth": { bg: "rgba(239,68,68,0.12)", color: "#f87171" },
  Tentative: { bg: "rgba(148,163,184,0.12)", color: "#94a3b8" },
};

function parseDateTime(dateStr: string, timeStr: string): Date {
  return new Date(`${dateStr} ${timeStr}`);
}

function useCountdown() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function formatCountdown(now: Date, dateStr: string, timeStr: string, completed: boolean): { text: string; color: string; past: boolean } {
  if (completed) return { text: "Done", color: "#818cf8", past: true };
  const target = parseDateTime(dateStr, timeStr);
  const diff = target.getTime() - now.getTime();
  if (diff < 0) return { text: "Past", color: "#64748b", past: true };

  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    const remHours = hours % 24;
    return { text: `${days}d ${remHours}h`, color: days <= 2 ? "#fbbf24" : "#22c55e", past: false };
  }
  if (hours > 0) {
    const remMins = mins % 60;
    return { text: `${hours}h ${remMins}m`, color: hours <= 2 ? "#f59e0b" : "#fbbf24", past: false };
  }
  return { text: `${mins}m`, color: "#ef4444", past: false };
}

function CountdownBadge({ text, color }: { text: string; color: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "4px 10px", borderRadius: 8, fontSize: "0.75rem", fontWeight: 700,
      fontFamily: "'SF Mono', Consolas, monospace",
      background: `${color}18`, color,
    }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
      {text}
    </span>
  );
}

function Badge({ label }: { label: string }) {
  const c = statusColors[label] || { bg: "rgba(148,163,184,0.12)", color: "#94a3b8" };
  return (
    <span style={{ display: "inline-block", padding: "4px 12px", borderRadius: 8, fontSize: "0.75rem", fontWeight: 700, background: c.bg, color: c.color }}>
      {label}
    </span>
  );
}

function CheckBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 10px", borderRadius: 6, fontSize: "0.7rem", fontWeight: 700,
      background: ok ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
      color: ok ? "#22c55e" : "#f87171",
    }}>
      {ok ? (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      ) : (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      )}
      {label}
    </span>
  );
}

function GridIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={active ? "#818cf8" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}

function TableIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={active ? "#818cf8" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function AddButton({ label, href }: { label: string; href: string }) {
  return (
    <Link href={href} className="dz-add-btn">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
      {label}
    </Link>
  );
}

// ── Operative Report Builder ────────────────────────────────────────
const lbl: React.CSSProperties = { fontSize: "0.72rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4, display: "block" };
const inp: React.CSSProperties = {
  width: "100%", padding: "9px 14px", borderRadius: 10, border: "1px solid rgba(148,163,184,0.12)",
  background: "rgba(15,23,42,0.5)", color: "#e2e8f0", fontSize: "0.88rem", boxSizing: "border-box",
};
const tarea: React.CSSProperties = { ...inp, minHeight: 100, resize: "vertical", fontFamily: "inherit", lineHeight: 1.6 };

function OperativeReportBuilder() {
  const [form, setForm] = useState({
    patientName: "", dateOfSurgery: "", surgeon: "Sameh Elguizaoui, M.D.",
    assistants: "", anesthesiologist: "",
    preOpDiagnosis: "", postOpDiagnosis: "",
    proceduresPerformed: "", anesthesiaType: "General",
    indications: "",
    preparation: "", incisionApproach: "", findings: "",
    operativeDetails: "", closure: "",
    ebl: "", specimens: "", hardware: "",
    tourniquetTime: "", complications: "None",
    disposition: "Patient was extubated and transferred to PACU in stable condition.",
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const [saved, setSaved] = useState(false);
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="dz-card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "18px 22px", borderBottom: "1px solid rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
          </svg>
          <span style={{ fontSize: "1.05rem", fontWeight: 700, color: "#f1f5f9" }}>New Operative Report</span>
        </div>
        <button
          onClick={handleSave}
          style={{
            padding: "8px 20px", borderRadius: 10, border: "1px solid rgba(34,197,94,0.4)",
            background: saved ? "rgba(34,197,94,0.2)" : "rgba(99,102,241,0.15)",
            borderColor: saved ? "rgba(34,197,94,0.4)" : "rgba(99,102,241,0.4)",
            color: saved ? "#22c55e" : "#a5b4fc", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
          }}
        >
          {saved ? (
            <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Saved</>
          ) : "Save Report"}
        </button>
      </div>

      <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 24 }}>
        <div>
          <h3 style={{ fontSize: "0.92rem", fontWeight: 700, color: "#818cf8", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(99,102,241,0.15)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 800, color: "#a5b4fc" }}>1</span>
            Header — Administrative & Clinical
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div><label style={lbl}>Patient Name</label><input style={inp} value={form.patientName} onChange={set("patientName")} placeholder="Full legal name" /></div>
            <div><label style={lbl}>Date of Surgery</label><input style={inp} type="date" value={form.dateOfSurgery} onChange={set("dateOfSurgery")} /></div>
            <div><label style={lbl}>Surgeon</label><input style={inp} value={form.surgeon} onChange={set("surgeon")} /></div>
            <div><label style={lbl}>Assistant(s)</label><input style={inp} value={form.assistants} onChange={set("assistants")} placeholder="Co-surgeon, PA, etc." /></div>
            <div><label style={lbl}>Anesthesiologist</label><input style={inp} value={form.anesthesiologist} onChange={set("anesthesiologist")} placeholder="Attending or CRNA" /></div>
            <div>
              <label style={lbl}>Anesthesia Type</label>
              <select style={inp} value={form.anesthesiaType} onChange={set("anesthesiaType")}>
                <option>General</option><option>MAC</option><option>Regional</option><option>Local</option><option>General + Regional</option>
              </select>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
            <div><label style={lbl}>Pre-Operative Diagnosis</label><textarea style={tarea} value={form.preOpDiagnosis} onChange={set("preOpDiagnosis")} placeholder="Condition(s) suspected before incision" /></div>
            <div><label style={lbl}>Post-Operative Diagnosis</label><textarea style={tarea} value={form.postOpDiagnosis} onChange={set("postOpDiagnosis")} placeholder="Confirmed condition(s) — drives ICD-10 coding" /></div>
          </div>
          <div style={{ marginTop: 14 }}>
            <label style={lbl}>Procedure(s) Performed</label>
            <textarea style={tarea} value={form.proceduresPerformed} onChange={set("proceduresPerformed")} placeholder="Bulleted list of each distinct procedure" />
          </div>
          <div style={{ marginTop: 14 }}>
            <label style={lbl}>Indications for Surgery</label>
            <textarea style={tarea} value={form.indications} onChange={set("indications")} placeholder="Patient history, failed conservative treatments, medical necessity" />
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: "0.92rem", fontWeight: 700, color: "#818cf8", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(99,102,241,0.15)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 800, color: "#a5b4fc" }}>2</span>
            Body — Surgical Narrative
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div><label style={lbl}>Preparation & Positioning</label><textarea style={tarea} value={form.preparation} onChange={set("preparation")} placeholder="Patient positioning, prep (ChloraPrep), draping" /></div>
            <div><label style={lbl}>Incision & Approach</label><textarea style={tarea} value={form.incisionApproach} onChange={set("incisionApproach")} placeholder="Anatomical location, type, size of incision(s) or portal placements. Critical for laterality." /></div>
            <div><label style={lbl}>Findings</label><textarea style={tarea} value={form.findings} onChange={set("findings")} placeholder="Pathology discovered (e.g., 'massive 4cm full-thickness tear of supraspinatus')" /></div>
            <div><label style={lbl}>Operative Details (Step-by-Step)</label><textarea style={{ ...tarea, minHeight: 160 }} value={form.operativeDetails} onChange={set("operativeDetails")} placeholder="Chronological narrative: structures isolated, tools/techniques, separate sites for bundled code justification" /></div>
            <div><label style={lbl}>Closure</label><textarea style={tarea} value={form.closure} onChange={set("closure")} placeholder="Layered closure technique, suture/staple types, dressings applied" /></div>
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: "0.92rem", fontWeight: 700, color: "#818cf8", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(99,102,241,0.15)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 800, color: "#a5b4fc" }}>3</span>
            Footer — Post-Surgical Status
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            <div><label style={lbl}>Estimated Blood Loss</label><input style={inp} value={form.ebl} onChange={set("ebl")} placeholder="cc/ml" /></div>
            <div><label style={lbl}>Tourniquet Time</label><input style={inp} value={form.tourniquetTime} onChange={set("tourniquetTime")} placeholder="Minutes" /></div>
            <div><label style={lbl}>Complications</label><input style={inp} value={form.complications} onChange={set("complications")} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
            <div><label style={lbl}>Specimens Sent to Pathology</label><textarea style={tarea} value={form.specimens} onChange={set("specimens")} placeholder="Tissue or fluid specimens" /></div>
            <div><label style={lbl}>Hardware / Implants Used</label><textarea style={tarea} value={form.hardware} onChange={set("hardware")} placeholder="Plates, screws, suture anchors, grafts — exact specs" /></div>
          </div>
          <div style={{ marginTop: 14 }}>
            <label style={lbl}>Condition / Disposition</label>
            <textarea style={tarea} value={form.disposition} onChange={set("disposition")} />
          </div>
        </div>
      </div>
    </>
  );
}

// ── Page ─────────────────────────────────────────────────────────────
export default function InPersonPage() {
  const [tab, setTab] = useState<Tab>("appointments");
  const [apptFilter, setApptFilter] = useState<ApptFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const now = useCountdown();

  const incomingAppts = APPOINTMENTS.filter(a => !a.completed);
  const completedAppts = APPOINTMENTS.filter(a => a.completed);
  const filteredAppts = apptFilter === "incoming" ? incomingAppts
    : apptFilter === "completed" ? completedAppts
    : APPOINTMENTS;

  // Crosshair focus for appointments table — data cols: Date(1), Time(2), Countdown(3)
  const apptDataCols = useMemo(() => new Set([1, 2, 3]), []);
  const apptCrosshair = useCrosshairFocus(apptDataCols);

  // Crosshair focus for surgeries table — data cols: Date(2), Time(3), Countdown(4), CPT/ICD-10(7)
  const surgDataCols = useMemo(() => new Set([2, 3, 4, 7]), []);
  const surgCrosshair = useCrosshairFocus(surgDataCols);

  return (
    <>
                  <main className="dz-platform-main">
        <header className="dz-platform-header">
          <div>
            <h1>In-Person</h1>
            <p>Appointments, surgeries, and operative reports</p>
          </div>
          <div className="dz-platform-header-right" style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {tab === "appointments" && (
              <AddButton label="New Appointment" href="/doczoc/calendar" />
            )}
            {tab === "surgeries" && (
              <AddButton label="New Surgery" href="/doczoc/calendar" />
            )}
          </div>
        </header>

        {/* Next Patient Banner */}
        {(() => {
          const nextAppt = APPOINTMENTS.filter(a => !a.completed).sort((a, b) => parseDateTime(a.date, a.time).getTime() - parseDateTime(b.date, b.time).getTime())[0];
          if (!nextAppt) return null;
          const cd = formatCountdown(now, nextAppt.date, nextAppt.time, false);
          if (cd.past) return null;
          return (
            <div style={{
              display: "flex", alignItems: "center", gap: 14, padding: "10px 18px", borderRadius: 12, marginBottom: 16,
              background: `${cd.color}0a`, border: `1px solid ${cd.color}22`,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={cd.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <span style={{ fontSize: "0.82rem", fontWeight: 700, color: cd.color }}>Starts in {cd.text}</span>
              <span style={{ fontSize: "0.78rem", color: "var(--dz-text-muted)" }}>({nextAppt.time})</span>
              <div style={{ width: 1, height: 20, background: "rgba(148,163,184,0.15)", margin: "0 4px" }} />
              <div style={{
                width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                background: "rgba(99,102,241,0.12)", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: "0.62rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>Next Patient</div>
                <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--dz-text-primary)" }}>{nextAppt.patient}</div>
              </div>
            </div>
          );
        })()}

        {/* Tabs + sub-filter + view toggle — single toolbar row */}
        <div className="dz-toolbar-row">
          <div className="dz-toolbar-left">
            <div className="dz-insight-period-tabs" style={{ display: "inline-flex" }}>
              <button className={`dz-insight-period-btn${tab === "appointments" ? " active" : ""}`} onClick={() => setTab("appointments")}>
                Appointments<span className="dz-tab-count">{APPOINTMENTS.length}</span>
              </button>
              <button className={`dz-insight-period-btn${tab === "surgeries" ? " active" : ""}`} onClick={() => setTab("surgeries")}>
                Surgeries<span className="dz-tab-count">{SURGERIES.length}</span>
              </button>
              <button className={`dz-insight-period-btn${tab === "reports" ? " active" : ""}`} onClick={() => setTab("reports")}>
                Reports
              </button>
            </div>
          </div>
          <div className="dz-toolbar-right">
            {tab === "appointments" && (
              <>
                <div className="dz-sub-filter-bar">
                  <button className={`dz-sub-filter-btn${apptFilter === "all" ? " dz-sub-filter-active" : ""}`} onClick={() => setApptFilter("all")}>
                    All <span className="dz-sub-filter-count">{APPOINTMENTS.length}</span>
                  </button>
                  <button className={`dz-sub-filter-btn${apptFilter === "incoming" ? " dz-sub-filter-active" : ""}`} onClick={() => setApptFilter("incoming")}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    Incoming <span className="dz-sub-filter-count">{incomingAppts.length}</span>
                  </button>
                  <button className={`dz-sub-filter-btn${apptFilter === "completed" ? " dz-sub-filter-active" : ""}`} onClick={() => setApptFilter("completed")}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    Completed <span className="dz-sub-filter-count">{completedAppts.length}</span>
                  </button>
                </div>
                <div className="dz-view-toggle">
                  <button className={`dz-view-btn${viewMode === "table" ? " dz-view-active" : ""}`} onClick={() => setViewMode("table")} title="Table view">
                    <TableIcon active={viewMode === "table"} />
                  </button>
                  <button className={`dz-view-btn${viewMode === "grid" ? " dz-view-active" : ""}`} onClick={() => setViewMode("grid")} title="Grid view">
                    <GridIcon active={viewMode === "grid"} />
                  </button>
                </div>
              </>
            )}
            {tab === "surgeries" && (
              <div className="dz-view-toggle">
                <button className={`dz-view-btn${viewMode === "table" ? " dz-view-active" : ""}`} onClick={() => setViewMode("table")} title="Table view">
                  <TableIcon active={viewMode === "table"} />
                </button>
                <button className={`dz-view-btn${viewMode === "grid" ? " dz-view-active" : ""}`} onClick={() => setViewMode("grid")} title="Grid view">
                  <GridIcon active={viewMode === "grid"} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Appointments */}
        {tab === "appointments" && (
          <>

            {viewMode === "table" ? (
              <div className="dz-table-wrap">
                <div style={{ display: "flex", justifyContent: "flex-end", padding: "8px 12px 0", marginTop: -44 }}>
                  <CrosshairToggle active={apptCrosshair.focusMode} onClick={apptCrosshair.toggleFocus} />
                </div>
                <table className="dz-table">
                  <thead>
                    <tr><th className="dz-col-patient">Patient</th><th>Date</th><th>Time</th><th>Countdown</th><th>Type</th><th className="dz-col-hide-lg">Location</th><th>Status</th><th className="dz-col-hide-xl dz-col-notes">Notes</th></tr>
                  </thead>
                  <tbody>
                    {filteredAppts.map((a, index) => {
                      const cd = formatCountdown(now, a.date, a.time, a.completed);
                      const rowId = String(index);
                      return (
                        <tr key={a.id} style={a.completed ? { opacity: 0.6 } : undefined}>
                          <td className="dz-col-patient" {...apptCrosshair.getTdProps(rowId, 0)} style={{ ...apptCrosshair.getTdProps(rowId, 0).style }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, background: "rgba(99,102,241,0.12)", color: "var(--dz-accent, #6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", fontWeight: 700 }}>{a.patient.split(" ").map((n: string) => n[0]).join("")}</div>
                              <span style={{ fontWeight: 600, fontSize: "0.82rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.patient}</span>
                            </div>
                          </td>
                          <td {...apptCrosshair.getTdProps(rowId, 1)} style={{ ...apptCrosshair.getTdProps(rowId, 1).style, fontWeight: 600, color: "#818cf8", whiteSpace: "nowrap" }}>{a.date}</td>
                          <td {...apptCrosshair.getTdProps(rowId, 2)} style={{ ...apptCrosshair.getTdProps(rowId, 2).style, fontFamily: "'SF Mono', Consolas, monospace", fontWeight: 600, whiteSpace: "nowrap" }}>{a.time}</td>
                          <td {...apptCrosshair.getTdProps(rowId, 3)}><CountdownBadge text={cd.text} color={cd.color} /></td>
                          <td {...apptCrosshair.getTdProps(rowId, 4)}>
                            {a.type.toLowerCase().includes("surgery") ? (
                              <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 6, fontSize: "0.72rem", fontWeight: 700, background: "rgba(239,68,68,0.12)", color: "#f87171", whiteSpace: "nowrap" }}>Surgery</span>
                            ) : (
                              <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 6, fontSize: "0.72rem", fontWeight: 700, background: "rgba(99,102,241,0.1)", color: "#a5b4fc", whiteSpace: "nowrap" }}>Appointment</span>
                            )}
                          </td>
                          <td className="dz-col-hide-lg" {...apptCrosshair.getTdProps(rowId, 5)} style={{ ...apptCrosshair.getTdProps(rowId, 5).style, color: "#94a3b8" }}>{a.location}</td>
                          <td {...apptCrosshair.getTdProps(rowId, 6)}><Badge label={a.status} /></td>
                          <td className="dz-col-hide-xl dz-col-notes" {...apptCrosshair.getTdProps(rowId, 7)} style={{ ...apptCrosshair.getTdProps(rowId, 7).style, fontSize: "0.82rem", color: "#64748b" }}>{a.notes}</td>
                        </tr>
                      );
                    })}
                    {filteredAppts.length === 0 && (
                      <tr><td colSpan={8} style={{ textAlign: "center", padding: 32, color: "#64748b" }}>No appointments found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="dz-appt-grid">
                {filteredAppts.map((a) => {
                  const cd = formatCountdown(now, a.date, a.time, a.completed);
                  return (
                    <div key={a.id} className={`dz-appt-card${a.completed ? " dz-appt-completed" : ""}`}>
                      <div className="dz-appt-card-top">
                        <span className="dz-appt-card-name">{a.patient}</span>
                        <Badge label={a.status} />
                      </div>
                      <div className="dz-appt-card-type">{a.type}</div>
                      <div style={{ marginBottom: 8 }}>
                        <CountdownBadge text={cd.text} color={cd.color} />
                      </div>
                      <div className="dz-appt-card-details">
                        <div>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                          <span>{a.date}</span>
                        </div>
                        <div>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                          <span>{a.time}</span>
                        </div>
                        <div>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                          <span>{a.location}</span>
                        </div>
                      </div>
                      <div className="dz-appt-card-notes">{a.notes}</div>
                    </div>
                  );
                })}
                {filteredAppts.length === 0 && (
                  <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 32, color: "#64748b" }}>No appointments found</div>
                )}
              </div>
            )}
          </>
        )}

        {/* Surgeries */}
        {tab === "surgeries" && (
          <>
            {viewMode === "table" ? (
              <div className="dz-table-wrap">
                <div style={{ display: "flex", justifyContent: "flex-end", padding: "8px 12px 0", marginTop: -44 }}>
                  <CrosshairToggle active={surgCrosshair.focusMode} onClick={surgCrosshair.toggleFocus} />
                </div>
                <table className="dz-table">
                  <thead>
                    <tr>
                      <th>Procedure</th>
                      <th className="dz-col-patient">Patient</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Countdown</th>
                      <th className="dz-col-hide-lg">Facility</th>
                      <th className="dz-col-hide-lg">Anesthesia</th>
                      <th>CPT / ICD-10</th>
                      <th>Readiness</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SURGERIES.map((s, index) => {
                      const cd = formatCountdown(now, s.date, s.time, false);
                      const rowId = String(index);
                      return (
                        <tr key={s.id}>
                          <td {...surgCrosshair.getTdProps(rowId, 0)} style={{ ...surgCrosshair.getTdProps(rowId, 0).style, fontWeight: 700, maxWidth: 220 }}>{s.procedure}</td>
                          <td className="dz-col-patient" {...surgCrosshair.getTdProps(rowId, 1)} style={{ ...surgCrosshair.getTdProps(rowId, 1).style }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, background: "rgba(99,102,241,0.12)", color: "var(--dz-accent, #6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", fontWeight: 700 }}>{s.patient.split(" ").map((n: string) => n[0]).join("")}</div>
                              <span style={{ fontWeight: 600, fontSize: "0.82rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.patient}</span>
                            </div>
                          </td>
                          <td {...surgCrosshair.getTdProps(rowId, 2)} style={{ ...surgCrosshair.getTdProps(rowId, 2).style, fontWeight: 600, color: "#818cf8", whiteSpace: "nowrap" }}>{s.date}</td>
                          <td {...surgCrosshair.getTdProps(rowId, 3)} style={{ ...surgCrosshair.getTdProps(rowId, 3).style, fontFamily: "'SF Mono', Consolas, monospace", fontWeight: 600, whiteSpace: "nowrap" }}>{s.time}</td>
                          <td {...surgCrosshair.getTdProps(rowId, 4)}><CountdownBadge text={cd.text} color={cd.color} /></td>
                          <td className="dz-col-hide-lg" {...surgCrosshair.getTdProps(rowId, 5)} style={{ ...surgCrosshair.getTdProps(rowId, 5).style, fontSize: "0.82rem" }}>{s.facility}<br /><span style={{ fontSize: "0.72rem", color: "#64748b" }}>POS {s.pos}</span></td>
                          <td className="dz-col-hide-lg" {...surgCrosshair.getTdProps(rowId, 6)} style={{ ...surgCrosshair.getTdProps(rowId, 6).style, fontSize: "0.82rem" }}>{s.anesthesia}</td>
                          <td {...surgCrosshair.getTdProps(rowId, 7)}>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                              {s.codes.map((code) => (
                                <span key={code} style={{ fontSize: "0.68rem", fontFamily: "'SF Mono', Consolas, monospace", padding: "2px 7px", borderRadius: 4, fontWeight: 600, background: code.match(/^\d{5}$/) ? "rgba(37,99,235,0.12)" : "rgba(124,58,237,0.12)", color: code.match(/^\d{5}$/) ? "#60a5fa" : "#a78bfa" }}>{code}</span>
                              ))}
                            </div>
                          </td>
                          <td {...surgCrosshair.getTdProps(rowId, 8)}>
                            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                              <CheckBadge ok={s.preOp} label="Pre-Op" />
                              <CheckBadge ok={s.authObtained} label="Auth" />
                            </div>
                          </td>
                          <td {...surgCrosshair.getTdProps(rowId, 9)}><Badge label={s.status} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {SURGERIES.map((s) => {
                  const cd = formatCountdown(now, s.date, s.time, false);
                  return (
                    <div key={s.id} className="dz-card" style={{ padding: 0, overflow: "hidden" }}>
                      <div style={{ padding: "18px 22px", borderBottom: "1px solid rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                            <span style={{ fontSize: "1.05rem", fontWeight: 700 }}>{s.procedure}</span>
                            <Badge label={s.status} />
                          </div>
                          <div style={{ fontSize: "0.85rem", color: "#94a3b8" }}>{s.patient}</div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "#818cf8" }}>{s.date}</div>
                            <div style={{ fontSize: "0.82rem", fontFamily: "'SF Mono', Consolas, monospace", color: "#94a3b8" }}>{s.time}</div>
                          </div>
                          <CountdownBadge text={cd.text} color={cd.color} />
                        </div>
                      </div>
                      <div style={{ padding: "16px 22px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
                        <div>
                          <div style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>Facility</div>
                          <div style={{ fontSize: "0.88rem", fontWeight: 600 }}>{s.facility}</div>
                          <div style={{ fontSize: "0.78rem", color: "#64748b" }}>POS {s.pos}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>Anesthesia</div>
                          <div style={{ fontSize: "0.88rem", fontWeight: 600 }}>{s.anesthesia}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>CPT / ICD-10</div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                            {s.codes.map((code) => (
                              <span key={code} style={{ fontSize: "0.72rem", fontFamily: "'SF Mono', Consolas, monospace", padding: "2px 8px", borderRadius: 4, fontWeight: 600, background: code.match(/^\d{5}$/) ? "rgba(37,99,235,0.12)" : "rgba(124,58,237,0.12)", color: code.match(/^\d{5}$/) ? "#60a5fa" : "#a78bfa" }}>{code}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>Readiness</div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <CheckBadge ok={s.preOp} label="Pre-Op Cleared" />
                            <CheckBadge ok={s.authObtained} label="Auth Obtained" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Reports */}
        {tab === "reports" && <OperativeReportBuilder />}
      </main>
    </div>
  );
}
