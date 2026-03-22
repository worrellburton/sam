import { useState } from "react";
import { Sidebar, useDzPrefs } from "./doczoc-dashboard";
import { PlatformBg } from "~/components/PlatformBg";

export function meta() {
  return [{ title: "In-Person | DocZoc" }];
}

type Tab = "appointments" | "surgeries" | "reports";

const APPOINTMENTS = [
  { id: 1, patient: "Sarah Mitchell", date: "Mar 25, 2026", time: "9:00 AM", type: "Post-Op Follow-up", location: "Manhattan", status: "Confirmed", notes: "8-week post-op rotator cuff repair" },
  { id: 2, patient: "David Ross", date: "Mar 24, 2026", time: "10:30 AM", type: "Follow-up Consultation", location: "Manhattan", status: "Confirmed", notes: "Hip replacement discussion" },
  { id: 3, patient: "Emily Chen", date: "Mar 26, 2026", time: "11:00 AM", type: "Follow-up — OT", location: "Manhattan", status: "Confirmed", notes: "Wrist rehab check" },
  { id: 4, patient: "Lisa Strassberg", date: "Mar 28, 2026", time: "2:00 PM", type: "Final Follow-up", location: "Brooklyn", status: "Pending", notes: "12-week knee arthroscopy final" },
  { id: 5, patient: "Michael Brown", date: "Apr 2, 2026", time: "9:30 AM", type: "Follow-up", location: "Manhattan", status: "Pending", notes: "Ankle sprain recheck" },
  { id: 6, patient: "Maria Lopez", date: "Apr 1, 2026", time: "3:00 PM", type: "Post-Op Follow-up", location: "Manhattan", status: "Confirmed", notes: "6-week ACL follow-up" },
];

const SURGERIES = [
  { id: 1, patient: "James Kim", date: "Mar 22, 2026", time: "7:30 AM", procedure: "ACL Reconstruction (BPTB Autograft)", facility: "Manhattan Surgical Center", pos: "24", anesthesia: "General", status: "Scheduled", preOp: true, authObtained: true, codes: ["29888", "S83.511A"] },
  { id: 2, patient: "David Ross", date: "Apr 15, 2026", time: "8:00 AM", procedure: "Total Hip Arthroplasty", facility: "NYP/Weill Cornell — OR Suite", pos: "22", anesthesia: "General + Regional", status: "Pending Auth", preOp: false, authObtained: false, codes: ["27130", "M16.11"] },
  { id: 3, patient: "TBD", date: "Apr 22, 2026", time: "7:30 AM", procedure: "Knee Arthroscopy — Meniscus Repair", facility: "Manhattan Surgical Center", pos: "24", anesthesia: "General", status: "Tentative", preOp: false, authObtained: false, codes: ["29882"] },
];

const statusColors: Record<string, { bg: string; color: string }> = {
  Confirmed: { bg: "rgba(34,197,94,0.12)", color: "#22c55e" },
  Pending: { bg: "rgba(251,191,36,0.12)", color: "#fbbf24" },
  Scheduled: { bg: "rgba(34,197,94,0.12)", color: "#22c55e" },
  "Pending Auth": { bg: "rgba(239,68,68,0.12)", color: "#f87171" },
  Tentative: { bg: "rgba(148,163,184,0.12)", color: "#94a3b8" },
};

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
    // Body
    preparation: "", incisionApproach: "", findings: "",
    operativeDetails: "", closure: "",
    // Footer
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
        {/* Section 1: Header */}
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

        {/* Section 2: Body */}
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

        {/* Section 3: Footer */}
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
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────
export default function InPersonPage() {
  const [collapsed, setCollapsed] = useState(false);
  const { bgId } = useDzPrefs();
  const [tab, setTab] = useState<Tab>("appointments");

  return (
    <div className="dz-platform">
      <PlatformBg bgId={bgId} />
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className={`dz-platform-main${collapsed ? " dz-main-expanded" : ""}`}>
        <header className="dz-platform-header">
          <div>
            <h1>In-Person</h1>
            <p>Appointments, surgeries, and operative reports</p>
          </div>
        </header>

        {/* Tabs */}
        <div style={{ marginBottom: 20 }}>
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

        {/* Appointments */}
        {tab === "appointments" && (
          <div className="dz-table-wrap">
            <table className="dz-table">
              <thead>
                <tr><th>Patient</th><th>Date</th><th>Time</th><th>Type</th><th>Location</th><th>Status</th><th>Notes</th></tr>
              </thead>
              <tbody>
                {APPOINTMENTS.map((a) => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 600, color: "#f1f5f9" }}>{a.patient}</td>
                    <td style={{ fontWeight: 600, color: "#818cf8", whiteSpace: "nowrap" }}>{a.date}</td>
                    <td style={{ fontFamily: "'SF Mono', Consolas, monospace", fontWeight: 600, color: "#f1f5f9", whiteSpace: "nowrap" }}>{a.time}</td>
                    <td><span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 6, fontSize: "0.72rem", fontWeight: 700, background: "rgba(99,102,241,0.1)", color: "#a5b4fc" }}>{a.type}</span></td>
                    <td style={{ color: "#94a3b8" }}>{a.location}</td>
                    <td><Badge label={a.status} /></td>
                    <td style={{ fontSize: "0.82rem", color: "#64748b", maxWidth: 200 }}>{a.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Surgeries */}
        {tab === "surgeries" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {SURGERIES.map((s) => (
              <div key={s.id} className="dz-card" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ padding: "18px 22px", borderBottom: "1px solid rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                      <span style={{ fontSize: "1.05rem", fontWeight: 700, color: "#f1f5f9" }}>{s.procedure}</span>
                      <Badge label={s.status} />
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "#94a3b8" }}>{s.patient}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "#818cf8" }}>{s.date}</div>
                    <div style={{ fontSize: "0.82rem", fontFamily: "'SF Mono', Consolas, monospace", color: "#94a3b8" }}>{s.time}</div>
                  </div>
                </div>
                <div style={{ padding: "16px 22px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
                  <div>
                    <div style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>Facility</div>
                    <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "#f1f5f9" }}>{s.facility}</div>
                    <div style={{ fontSize: "0.78rem", color: "#64748b" }}>POS {s.pos}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>Anesthesia</div>
                    <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "#f1f5f9" }}>{s.anesthesia}</div>
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
            ))}
          </div>
        )}

        {/* Reports */}
        {tab === "reports" && <OperativeReportBuilder />}
      </main>
    </div>
  );
}
