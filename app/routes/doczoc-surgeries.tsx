import { useState, useMemo, useCallback, useRef } from "react";
import { Link } from "react-router";
import { Sidebar, useDzPrefs } from "./doczoc-dashboard";
import { PlatformBg } from "~/components/PlatformBg";
import { PATIENTS, type Patient } from "~/data/patients";
import { useCrosshairFocusByKey, CrosshairToggle } from "~/hooks/useCrosshairFocus";
import { getCodeDescription } from "~/data/medical-codes";

export function meta() {
  return [{ title: "Surgeries | DocZoc" }];
}

type SurgeryRecord = {
  id: string;
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
  let idx = 0;
  for (const p of PATIENTS) {
    for (const v of p.visits) {
      const isSurgery = v.type.toLowerCase().includes("surgery");
      const isPreOp = v.type.toLowerCase().includes("pre-op");
      if (!isSurgery && !isPreOp) continue;
      const d = parseDateLoose(v.date);
      let status: SurgeryRecord["status"] = "completed";
      if (isPreOp && !isSurgery) status = "pre-op";
      else if (d > now) status = "upcoming";
      records.push({ id: `surg-${p.id}-${idx++}`, patient: p, date: v.date, type: v.type, notes: v.notes, codes: v.codes, status });
    }
  }
  records.sort((a, b) => parseDateLoose(b.date).getTime() - parseDateLoose(a.date).getTime());
  return records;
}

// Find related claim data for a surgery
function getClaimForSurgery(surgery: SurgeryRecord) {
  const p = surgery.patient;
  // Match invoice by date proximity or description
  const inv = p.invoices.find(i => {
    const typeLower = surgery.type.toLowerCase();
    const descLower = i.description.toLowerCase();
    return typeLower.includes("surgery") && (
      descLower.includes("arthroscop") || descLower.includes("reconstruct") ||
      descLower.includes("arthroplasty") || descLower.includes("repair")
    );
  });
  const billingEvents = p.billingEvents.filter(e => e.description.toLowerCase().includes("surgery") || e.description.toLowerCase().includes("claim"));
  return { invoice: inv, events: billingEvents };
}

export default function SurgeriesPage() {
  const [collapsed, setCollapsed] = useState(false);
  const { bgId } = useDzPrefs();
  const surgeries = useMemo(() => getAllSurgeries(), []);
  const [view, setView] = useState<"table" | "list">("table");
  const [subPage, setSubPage] = useState<"upcoming" | "completed" | "database" | "detail">("upcoming");
  const [filter, setFilter] = useState<"all" | "completed" | "upcoming" | "pre-op">("all");
  const [selectedSurgery, setSelectedSurgery] = useState<SurgeryRecord | null>(null);
  const [search, setSearch] = useState("");
  const [addedSurgeries, setAddedSurgeries] = useState<SurgeryRecord[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSurgery, setNewSurgery] = useState({ patient: "", type: "", date: "", notes: "" });
  const [selectedProcedure, setSelectedProcedure] = useState<string | null>(null);
  const [focusMode, setFocusMode] = useState(false);

  const allSurgeries = useMemo(() => [...surgeries, ...addedSurgeries], [surgeries, addedSurgeries]);
  const filtered = allSurgeries
    .filter(s => {
      if (subPage === "upcoming") return s.status === "upcoming" || s.status === "pre-op";
      if (subPage === "completed") return s.status === "completed";
      return true; // database shows all
    })
    .filter(s => !search || s.patient.name.toLowerCase().includes(search.toLowerCase()) || s.type.toLowerCase().includes(search.toLowerCase()));

  const completedCount = allSurgeries.filter(s => s.status === "completed").length;
  const upcomingCount = allSurgeries.filter(s => s.status === "upcoming").length;
  const preOpCount = allSurgeries.filter(s => s.status === "pre-op").length;

  const handleAddSurgery = useCallback(() => {
    if (!newSurgery.patient || !newSurgery.type || !newSurgery.date) return;
    const matchedPatient = PATIENTS.find(p => p.name.toLowerCase().includes(newSurgery.patient.toLowerCase()));
    if (!matchedPatient) return;
    const s: SurgeryRecord = {
      id: `surg-new-${Date.now()}`,
      patient: matchedPatient,
      date: new Date(newSurgery.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      type: `Surgery — ${newSurgery.type}`,
      notes: newSurgery.notes || "Scheduled procedure",
      codes: [],
      status: "upcoming",
    };
    setAddedSurgeries(prev => [s, ...prev]);
    setNewSurgery({ patient: "", type: "", date: "", notes: "" });
    setShowAddForm(false);
  }, [newSurgery]);

  const openDetail = (s: SurgeryRecord) => {
    setSelectedSurgery(s);
    setSubPage("detail");
  };

  return (
    <div className="dz-platform">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <PlatformBg bgId={bgId} />
      <main className={`dz-platform-main${collapsed ? " dz-main-expanded" : ""}`} style={{ padding: "32px 36px" }}>

        {subPage === "detail" && selectedSurgery ? (
          <SurgeryDetailView surgery={selectedSurgery} onBack={() => setSubPage("upcoming")} />
        ) : (
          <>
            {/* Header */}
            <div className="dz-platform-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <div>
                <h1>Surgeries</h1>
                <p>{completedCount} completed · {upcomingCount + preOpCount} upcoming</p>
              </div>
              {subPage === "database" && (
                <button onClick={() => setShowAddForm(!showAddForm)} style={{
                  padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer",
                  background: "linear-gradient(135deg, #ef4444, #a855f7)", color: "#fff",
                  fontSize: "0.78rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 5,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Add Surgery
                </button>
              )}
            </div>

            {/* 3-Tab Navigation */}
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 20, borderBottom: "1px solid rgba(148,163,184,0.08)", paddingBottom: 0 }}>
              {([
                { key: "upcoming" as const, label: "Upcoming", count: upcomingCount + preOpCount, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
                { key: "completed" as const, label: "Completed", count: completedCount, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
              ]).map(tab => (
                <button key={tab.key} onClick={() => setSubPage(tab.key)} style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "10px 18px", border: "none", cursor: "pointer",
                  fontSize: "0.8rem", fontWeight: 600, background: "transparent",
                  color: subPage === tab.key ? "#f87171" : "var(--dz-text-muted, #64748b)",
                  borderBottom: subPage === tab.key ? "2px solid #f87171" : "2px solid transparent",
                  transition: "all 0.15s", marginBottom: -1,
                }}>
                  {tab.icon}
                  {tab.label}
                  <span style={{
                    fontSize: "0.65rem", fontWeight: 700, padding: "1px 6px", borderRadius: 10,
                    background: subPage === tab.key ? "rgba(239,68,68,0.12)" : "rgba(148,163,184,0.08)",
                    color: subPage === tab.key ? "#f87171" : "var(--dz-text-dim, #475569)",
                  }}>{tab.count}</span>
                </button>
              ))}
              <button onClick={() => setSubPage("database")} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 14px", marginLeft: 8, cursor: "pointer",
                fontSize: "0.78rem", fontWeight: 700, marginBottom: 2,
                background: subPage === "database" ? "rgba(168,85,247,0.15)" : "var(--dz-input-bg, rgba(148,163,184,0.06))",
                color: subPage === "database" ? "#c084fc" : "var(--dz-text-muted, #64748b)",
                border: subPage === "database" ? "1px solid rgba(168,85,247,0.3)" : "1px solid var(--dz-input-border, rgba(148,163,184,0.12))",
                borderRadius: 8, transition: "all 0.15s",
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
                Procedures
                <span style={{
                  fontSize: "0.65rem", fontWeight: 700, padding: "1px 6px", borderRadius: 10,
                  background: subPage === "database" ? "rgba(168,85,247,0.15)" : "rgba(148,163,184,0.08)",
                  color: subPage === "database" ? "#c084fc" : "var(--dz-text-dim, #475569)",
                }}>{allSurgeries.length}</span>
              </button>
            </div>

            {/* Search + view controls row */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8,
                background: "var(--dz-input-bg)", border: "1px solid var(--dz-input-border)", flex: 1,
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--dz-text-dim)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search surgeries..." style={{
                  background: "transparent", border: "none", outline: "none", width: "100%",
                  fontSize: "0.78rem", color: "var(--dz-text-secondary)",
                }} />
              </div>
              <CrosshairToggle active={focusMode} onClick={() => setFocusMode(f => !f)} />
              <div style={{ display: "flex", gap: 0 }}>
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
            </div>

            {/* Add form */}
            {showAddForm && (
              <div className="dz-card" style={{ padding: "18px 22px", marginBottom: 16 }}>
                <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#f1f5f9", marginBottom: 12 }}>Schedule New Surgery</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>Patient</label>
                    <select value={newSurgery.patient} onChange={e => setNewSurgery({ ...newSurgery, patient: e.target.value })} style={{
                      width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid rgba(99,102,241,0.15)",
                      background: "var(--dz-input-bg, rgba(15,23,42,0.4))", color: "var(--dz-text, #e2e8f0)", fontSize: "0.78rem",
                    }}>
                      <option value="">Select patient...</option>
                      {PATIENTS.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>Procedure</label>
                    <input value={newSurgery.type} onChange={e => setNewSurgery({ ...newSurgery, type: e.target.value })} placeholder="e.g. ACL Reconstruction"
                      style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid rgba(99,102,241,0.15)", background: "var(--dz-input-bg, rgba(15,23,42,0.4))", color: "var(--dz-text, #e2e8f0)", fontSize: "0.78rem" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>Date</label>
                    <input type="date" value={newSurgery.date} onChange={e => setNewSurgery({ ...newSurgery, date: e.target.value })}
                      style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid rgba(99,102,241,0.15)", background: "var(--dz-input-bg, rgba(15,23,42,0.4))", color: "var(--dz-text, #e2e8f0)", fontSize: "0.78rem" }} />
                  </div>
                </div>
                <div style={{ marginTop: 10 }}>
                  <label style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>Notes</label>
                  <textarea value={newSurgery.notes} onChange={e => setNewSurgery({ ...newSurgery, notes: e.target.value })} placeholder="Surgical notes..."
                    style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid rgba(99,102,241,0.15)", background: "var(--dz-input-bg, rgba(15,23,42,0.4))", color: "var(--dz-text, #e2e8f0)", fontSize: "0.78rem", minHeight: 60, resize: "vertical" }} />
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end" }}>
                  <button onClick={() => setShowAddForm(false)} style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid rgba(148,163,184,0.15)", background: "transparent", color: "#94a3b8", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                  <button onClick={handleAddSurgery} disabled={!newSurgery.patient || !newSurgery.type || !newSurgery.date} style={{
                    padding: "6px 14px", borderRadius: 6, border: "none", background: "linear-gradient(135deg, #ef4444, #a855f7)", color: "#fff",
                    fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", opacity: (!newSurgery.patient || !newSurgery.type || !newSurgery.date) ? 0.4 : 1,
                  }}>Schedule Surgery</button>
                </div>
              </div>
            )}

            {/* Procedure Catalog — Database tab */}
            {subPage === "database" && !selectedProcedure && (
              <ProcedureCatalog allSurgeries={allSurgeries} onSelectProcedure={setSelectedProcedure} view={view} />
            )}

            {/* Procedure Detail */}
            {subPage === "database" && selectedProcedure && (
              <ProcedureDetail procedureName={selectedProcedure} allSurgeries={allSurgeries} onBack={() => setSelectedProcedure(null)} />
            )}

            {/* Table/List View — shown on Upcoming / Completed tabs */}
            {subPage !== "database" && (
              view === "table" ? (
                <DraggableSurgeryTable surgeries={filtered} onView={openDetail} focusMode={focusMode} />
              ) : (
                /* List/Card View */
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 }}>
                  {filtered.map(s => {
                    const statusColor = s.status === "completed" ? "#22c55e" : s.status === "upcoming" ? "#f59e0b" : "#818cf8";
                    return (
                      <div key={s.id} className="dz-surgery-btn dz-card" onClick={() => openDetail(s)} style={{
                        padding: "16px 18px", cursor: "pointer", borderLeft: `3px solid ${statusColor}`,
                      }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                          <span style={{
                            fontSize: "0.65rem", fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                            background: `${statusColor}18`, color: statusColor, textTransform: "capitalize",
                          }}>
                            {s.status.replace("-", " ")}
                          </span>
                          <span style={{ fontSize: "0.75rem", color: "#818cf8", fontWeight: 600 }}>{s.date}</span>
                        </div>
                        <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#f1f5f9", marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
                          {(() => { const pm = getProcedureIcon(s.type); return pm ? <div style={{ width: 26, height: 26, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", background: `${pm.color}15`, color: pm.color, flexShrink: 0 }}>{pm.icon}</div> : null; })()}
                          {stripSurgeryPrefix(s.type)}
                        </div>
                        <div style={{ fontSize: "0.78rem", color: "#94a3b8", marginBottom: 8 }}>{s.patient.name}</div>
                        <div style={{ fontSize: "0.75rem", color: "#64748b", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {s.notes}
                        </div>
                        {s.codes.length > 0 && (
                          <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
                            {s.codes.slice(0, 3).map(c => (
                              <span key={c} title={getCodeDescription(c)} style={{
                                fontSize: "0.65rem", fontFamily: "'SF Mono', Consolas, monospace",
                                padding: "2px 6px", borderRadius: 4, fontWeight: 600,
                                background: c.match(/^\d{5}$/) ? "rgba(37,99,235,0.12)" : "rgba(124,58,237,0.12)",
                                color: c.match(/^\d{5}$/) ? "#60a5fa" : "#a78bfa",
                              }}>{c}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {filtered.length === 0 && <div style={{ textAlign: "center", padding: 60, color: "#64748b", gridColumn: "1/-1" }}>No surgeries found</div>}
                </div>
              )
            )}
          </>
        )}
      </main>
    </div>
  );
}

// ── Procedure Catalog (top 10 orthopedic) ───────────────────────────
const PROCEDURES = [
  { name: "ACL Reconstruction", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v8l4 4"/><path d="M12 10l-4 4"/><circle cx="12" cy="18" r="4"/></svg>, color: "#ef4444", desc: "Anterior cruciate ligament repair using graft tissue" },
  { name: "Rotator Cuff Repair", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5"/><path d="M7 13l-3 8h16l-3-8"/><line x1="12" y1="3" x2="12" y2="13"/></svg>, color: "#f59e0b", desc: "Reattachment of torn shoulder tendons" },
  { name: "Knee Arthroscopy", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="3" x2="12" y2="9"/><line x1="12" y1="15" x2="12" y2="21"/></svg>, color: "#3b82f6", desc: "Minimally invasive knee joint inspection and repair" },
  { name: "Total Knee Replacement", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="2" width="8" height="8" rx="1"/><rect x="8" y="14" width="8" height="8" rx="1"/><line x1="12" y1="10" x2="12" y2="14"/><line x1="9" y1="12" x2="15" y2="12"/></svg>, color: "#8b5cf6", desc: "Full joint replacement with prosthetic implant" },
  { name: "Total Shoulder Arthroplasty", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="7" r="5"/><path d="M5 12c0 5 3 10 7 10s7-5 7-10"/><circle cx="12" cy="7" r="2"/></svg>, color: "#06b6d4", desc: "Shoulder joint replacement surgery" },
  { name: "Meniscus Repair", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 12c0-4 3-8 6-8s6 4 6 8-3 8-6 8-6-4-6-8z"/><path d="M6 12h12"/><path d="M9 8c1 2 1 6 0 8"/><path d="M15 8c-1 2-1 6 0 8"/></svg>, color: "#22c55e", desc: "Torn cartilage repair in the knee" },
  { name: "Hip Replacement", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M8 12l-2 10"/><path d="M16 12l2 10"/><circle cx="12" cy="8" r="1.5"/></svg>, color: "#ec4899", desc: "Total hip arthroplasty with prosthesis" },
  { name: "Carpal Tunnel Release", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l4-2v16l-4-2z"/><path d="M10 4l4 2v12l-4 2"/><path d="M14 6l4-2v16l-4-2z"/></svg>, color: "#f97316", desc: "Decompression of the median nerve in the wrist" },
  { name: "Spinal Fusion", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="2" width="6" height="4" rx="1"/><rect x="9" y="9" width="6" height="4" rx="1"/><rect x="9" y="16" width="6" height="4" rx="1"/><line x1="12" y1="6" x2="12" y2="9"/><line x1="12" y1="13" x2="12" y2="16"/><line x1="7" y1="11" x2="9" y2="11"/><line x1="15" y1="11" x2="17" y2="11"/></svg>, color: "#a855f7", desc: "Vertebrae fusion to stabilize the spine" },
  { name: "Fracture Fixation (ORIF)", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20L10 4"/><path d="M14 20L20 4"/><line x1="7" y1="12" x2="17" y2="12"/><circle cx="7" cy="12" r="1.5"/><circle cx="17" cy="12" r="1.5"/></svg>, color: "#14b8a6", desc: "Open reduction and internal fixation of broken bones" },
];

function getProcedureIcon(type: string): { icon: React.ReactNode; color: string } | null {
  const normalized = type.replace(/^Surgery\s*[—–-]\s*/i, "").toLowerCase();
  const match = PROCEDURES.find(p => normalized.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(normalized));
  return match ? { icon: match.icon, color: match.color } : null;
}

function stripSurgeryPrefix(type: string): string {
  return type.replace(/^Surgery\s*[—–-]\s*/i, "");
}

function getProcedureStats(name: string, allSurgeries: SurgeryRecord[]) {
  const keywords = name.toLowerCase().split(/\s+/);
  const matches = allSurgeries.filter(s => {
    const t = s.type.toLowerCase();
    return keywords.some(kw => t.includes(kw));
  });
  const completed = matches.filter(s => s.status === "completed").length;
  const upcoming = matches.filter(s => s.status === "upcoming" || s.status === "pre-op").length;
  return { total: matches.length, completed, upcoming, matches };
}

function ProcedureCatalog({ allSurgeries, onSelectProcedure, view }: { allSurgeries: SurgeryRecord[]; onSelectProcedure: (name: string) => void; view: "table" | "list" }) {
  if (view === "table") {
    return (
      <div className="dz-card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="dz-table-wrap">
          <table className="dz-table" style={{ width: "100%" }}>
            <thead>
              <tr>
                <th style={{ padding: "10px 16px", fontSize: "0.72rem", fontWeight: 700, color: "var(--dz-text-muted, #64748b)", textAlign: "left" }}>Procedure</th>
                <th style={{ padding: "10px 16px", fontSize: "0.72rem", fontWeight: 700, color: "var(--dz-text-muted, #64748b)", textAlign: "left" }}>Description</th>
                <th style={{ padding: "10px 16px", fontSize: "0.72rem", fontWeight: 700, color: "var(--dz-text-muted, #64748b)", textAlign: "center" }}>Total</th>
                <th style={{ padding: "10px 16px", fontSize: "0.72rem", fontWeight: 700, color: "var(--dz-text-muted, #64748b)", textAlign: "center" }}>Completed</th>
                <th style={{ padding: "10px 16px", fontSize: "0.72rem", fontWeight: 700, color: "var(--dz-text-muted, #64748b)", textAlign: "center" }}>Upcoming</th>
              </tr>
            </thead>
            <tbody>
              {PROCEDURES.map(proc => {
                const stats = getProcedureStats(proc.name, allSurgeries);
                return (
                  <tr
                    key={proc.name}
                    className="dz-surgery-btn"
                    onClick={() => onSelectProcedure(proc.name)}
                    style={{ cursor: "pointer", borderLeft: `3px solid ${proc.color}` }}
                  >
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                          background: `${proc.color}15`, color: proc.color, flexShrink: 0,
                        }}>{proc.icon}</div>
                        <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--dz-text-primary, #f1f5f9)" }}>{proc.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "0.75rem", color: "var(--dz-text-muted, #64748b)", maxWidth: 280 }}>{proc.desc}</td>
                    <td style={{ padding: "12px 16px", textAlign: "center", fontSize: "0.9rem", fontWeight: 800, color: "var(--dz-text-primary, #f1f5f9)" }}>{stats.total}</td>
                    <td style={{ padding: "12px 16px", textAlign: "center" }}>
                      {stats.completed > 0 ? <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#22c55e" }}>{stats.completed}</span> : <span style={{ color: "#475569" }}>—</span>}
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "center" }}>
                      {stats.upcoming > 0 ? <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#f59e0b" }}>{stats.upcoming}</span> : <span style={{ color: "#475569" }}>—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
        {PROCEDURES.map(proc => {
          const stats = getProcedureStats(proc.name, allSurgeries);
          return (
            <div
              key={proc.name}
              className="dz-card dz-surgery-btn"
              onClick={() => onSelectProcedure(proc.name)}
              style={{ padding: "18px 20px", cursor: "pointer", borderLeft: `3px solid ${proc.color}`, transition: "all 0.15s" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                  background: `${proc.color}15`, color: proc.color,
                }}>{proc.icon}</div>
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--dz-text-primary, #f1f5f9)" }}>{proc.name}</div>
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--dz-text-muted, #64748b)", lineHeight: 1.5, marginBottom: 12 }}>{proc.desc}</div>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ fontSize: "0.7rem" }}>
                  <span style={{ fontWeight: 800, color: "var(--dz-text-primary, #f1f5f9)", fontSize: "1rem" }}>{stats.total}</span>
                  <span style={{ color: "var(--dz-text-muted, #64748b)", marginLeft: 4 }}>total</span>
                </div>
                {stats.completed > 0 && (
                  <div style={{ fontSize: "0.7rem" }}>
                    <span style={{ fontWeight: 700, color: "#22c55e" }}>{stats.completed}</span>
                    <span style={{ color: "var(--dz-text-muted, #64748b)", marginLeft: 4 }}>done</span>
                  </div>
                )}
                {stats.upcoming > 0 && (
                  <div style={{ fontSize: "0.7rem" }}>
                    <span style={{ fontWeight: 700, color: "#f59e0b" }}>{stats.upcoming}</span>
                    <span style={{ color: "var(--dz-text-muted, #64748b)", marginLeft: 4 }}>upcoming</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProcedureDetail({ procedureName, allSurgeries, onBack }: { procedureName: string; allSurgeries: SurgeryRecord[]; onBack: () => void }) {
  const proc = PROCEDURES.find(p => p.name === procedureName) || PROCEDURES[0];
  const stats = getProcedureStats(procedureName, allSurgeries);
  const avgRecovery = proc.name.includes("Knee") ? "6–9 months" : proc.name.includes("Shoulder") ? "4–6 months" : proc.name.includes("ACL") ? "6–12 months" : proc.name.includes("Hip") ? "3–6 months" : "4–8 weeks";
  const successRate = proc.name.includes("Replacement") ? "95%" : proc.name.includes("ACL") ? "90%" : "92%";

  return (
    <div>
      <button onClick={onBack} style={{
        display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8,
        border: "1px solid rgba(99,102,241,0.15)", background: "rgba(99,102,241,0.06)",
        color: "#a5b4fc", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", marginBottom: 20,
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        Back to Procedures
      </button>

      {/* Procedure header */}
      <div className="dz-card" style={{ padding: "24px 28px", marginBottom: 20, borderLeft: `3px solid ${proc.color}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center",
            background: `${proc.color}15`, color: proc.color,
          }}>{proc.icon}</div>
          <div>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--dz-text-primary, #f1f5f9)", margin: 0 }}>{proc.name}</h2>
            <p style={{ fontSize: "0.82rem", color: "var(--dz-text-muted, #64748b)", margin: "4px 0 0" }}>{proc.desc}</p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Times Performed", value: String(stats.total), color: "var(--dz-text-primary, #f1f5f9)" },
          { label: "Completed", value: String(stats.completed), color: "#22c55e" },
          { label: "Avg Recovery", value: avgRecovery, color: "#60a5fa" },
          { label: "Success Rate", value: successRate, color: "#a78bfa" },
        ].map(s => (
          <div key={s.label} className="dz-card" style={{ padding: "16px 18px", textAlign: "center" }}>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "0.68rem", color: "var(--dz-text-muted, #64748b)", marginTop: 4, fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent cases */}
      <div className="dz-card" style={{ padding: "18px 22px" }}>
        <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--dz-text-primary, #f1f5f9)", marginBottom: 14 }}>
          Recent Cases ({stats.matches.length})
        </h3>
        {stats.matches.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {stats.matches.map(s => {
              const sc = s.status === "completed" ? "#22c55e" : s.status === "upcoming" ? "#f59e0b" : "#818cf8";
              return (
                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 8, background: "rgba(99,102,241,0.04)" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(99,102,241,0.12)", color: "var(--dz-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", fontWeight: 700, flexShrink: 0 }}>
                    {s.patient.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--dz-text-primary, #f1f5f9)" }}>{s.patient.name}</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--dz-text-muted, #64748b)" }}>{stripSurgeryPrefix(s.type)} · {s.date}</div>
                  </div>
                  <span style={{ fontSize: "0.65rem", fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: `${sc}18`, color: sc, textTransform: "capitalize" }}>
                    {s.status.replace("-", " ")}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ fontSize: "0.78rem", color: "#64748b" }}>No cases recorded for this procedure yet.</p>
        )}
      </div>
    </div>
  );
}

// ── Surgery Detail View ──────────────────────────────────────────────
function SurgeryDetailView({ surgery, onBack }: { surgery: SurgeryRecord; onBack: () => void }) {
  const s = surgery;
  const claim = getClaimForSurgery(s);
  const statusColor = s.status === "completed" ? "#22c55e" : s.status === "upcoming" ? "#f59e0b" : "#818cf8";

  return (
    <div>
      {/* Back button */}
      <button onClick={onBack} style={{
        display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8,
        border: "1px solid rgba(99,102,241,0.15)", background: "rgba(99,102,241,0.06)",
        color: "#a5b4fc", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", marginBottom: 20,
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        Back to Surgeries
      </button>

      {/* Header */}
      <div className="dz-card" style={{ padding: "22px 26px", marginBottom: 20, borderLeft: `3px solid ${statusColor}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
              background: `${statusColor}15`, border: `1px solid ${statusColor}22`,
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={statusColor} strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </div>
            <div>
              <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#f1f5f9", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                {(() => { const pm = getProcedureIcon(s.type); return pm ? <div style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: `${pm.color}15`, color: pm.color, flexShrink: 0 }}>{pm.icon}</div> : null; })()}
                {stripSurgeryPrefix(s.type)}
              </h2>
              <p style={{ fontSize: "0.82rem", color: "#94a3b8", margin: 0 }}>{s.date}</p>
            </div>
          </div>
          <span style={{
            fontSize: "0.72rem", fontWeight: 700, padding: "4px 12px", borderRadius: 20,
            background: `${statusColor}18`, color: statusColor, textTransform: "capitalize",
          }}>
            {s.status.replace("-", " ")}
          </span>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <Link to={`/doczoc/patients/${s.patient.id}`} style={{
            fontSize: "0.78rem", fontWeight: 600, color: "#a5b4fc", textDecoration: "none",
            padding: "6px 14px", borderRadius: 8, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.12)",
          }}>
            Patient: {s.patient.name}
          </Link>
          <div style={{ fontSize: "0.78rem", color: "#64748b", padding: "6px 0" }}>
            Insurance: {s.patient.insurance} · ID: {s.patient.memberId}
          </div>
        </div>
      </div>

      {/* Two column: Notes + Codes | Claim Data */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Left: Operative details */}
        <div>
          <div className="dz-card" style={{ padding: "18px 22px", marginBottom: 16 }}>
            <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#f1f5f9", marginBottom: 10 }}>Operative Notes</div>
            <p style={{ fontSize: "0.82rem", color: "#cbd5e1", lineHeight: 1.7, margin: 0 }}>{s.notes}</p>
          </div>
          <div className="dz-card" style={{ padding: "18px 22px" }}>
            <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#f1f5f9", marginBottom: 10 }}>Procedure & Diagnosis Codes</div>
            {s.codes.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {s.codes.map(c => (
                  <div key={c} title={getCodeDescription(c)} style={{
                    padding: "8px 14px", borderRadius: 8,
                    background: c.match(/^\d{5}$/) ? "rgba(37,99,235,0.08)" : "rgba(124,58,237,0.08)",
                    border: `1px solid ${c.match(/^\d{5}$/) ? "rgba(37,99,235,0.15)" : "rgba(124,58,237,0.15)"}`,
                  }}>
                    <div style={{
                      fontSize: "0.88rem", fontWeight: 700,
                      fontFamily: "'SF Mono', Consolas, monospace",
                      color: c.match(/^\d{5}$/) ? "#60a5fa" : "#a78bfa",
                    }}>{c}</div>
                    <div style={{ fontSize: "0.68rem", color: "#64748b", marginTop: 2 }}>
                      {c.match(/^\d{5}$/) ? "CPT" : "ICD-10"}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: "0.78rem", color: "#64748b" }}>No codes assigned</p>
            )}
          </div>
        </div>

        {/* Right: Claim & billing insights */}
        <div>
          <div className="dz-card" style={{
            padding: "18px 22px", marginBottom: 16,
            background: "linear-gradient(135deg, rgba(99,102,241,0.04), rgba(168,85,247,0.06))",
            border: "1px solid rgba(99,102,241,0.12)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#f1f5f9" }}>Claim & Billing Insights</span>
            </div>
            {claim.invoice ? (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                  <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(15,23,42,0.3)" }}>
                    <div style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 600 }}>Total Charged</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#f1f5f9", fontFamily: "'SF Mono', Consolas, monospace" }}>
                      ${claim.invoice.totalCharged.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(15,23,42,0.3)" }}>
                    <div style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 600 }}>Insurance Paid</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#22c55e", fontFamily: "'SF Mono', Consolas, monospace" }}>
                      ${claim.invoice.insurancePaid.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(15,23,42,0.3)" }}>
                    <div style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 600 }}>Patient Owes</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#f59e0b", fontFamily: "'SF Mono', Consolas, monospace" }}>
                      ${claim.invoice.patientOwes.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(15,23,42,0.3)" }}>
                    <div style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 600 }}>Status</div>
                    <div style={{
                      fontSize: "0.82rem", fontWeight: 700, marginTop: 2,
                      color: claim.invoice.status === "Paid" ? "#22c55e" : claim.invoice.status === "Overdue" ? "#f87171" : "#f59e0b",
                    }}>
                      {claim.invoice.status}
                    </div>
                  </div>
                </div>
                {claim.invoice.claimId && (
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                    Claim ID: <span style={{ fontFamily: "'SF Mono', Consolas, monospace", color: "#a5b4fc" }}>{claim.invoice.claimId}</span>
                    {" · "}{claim.invoice.id}
                  </div>
                )}
              </>
            ) : (
              <p style={{ fontSize: "0.78rem", color: "#64748b" }}>No claim data linked to this surgery</p>
            )}
          </div>

          {/* Billing timeline */}
          {claim.events.length > 0 && (
            <div className="dz-card" style={{ padding: "18px 22px" }}>
              <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#f1f5f9", marginBottom: 12 }}>Billing History</div>
              {claim.events.map((e, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0",
                  borderBottom: i < claim.events.length - 1 ? "1px solid rgba(99,102,241,0.06)" : "none",
                }}>
                  <div style={{
                    width: 6, height: 6, borderRadius: "50%", marginTop: 6, flexShrink: 0,
                    background: e.type === "claim_paid" || e.type === "payment_received" ? "#22c55e" : "#818cf8",
                  }} />
                  <div>
                    <div style={{ fontSize: "0.78rem", color: "#e2e8f0" }}>{e.description}</div>
                    <div style={{ fontSize: "0.68rem", color: "#64748b" }}>
                      {e.date}
                      {e.amount ? ` · $${e.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : ""}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Patient summary */}
          <div className="dz-card" style={{ padding: "18px 22px", marginTop: 16 }}>
            <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#f1f5f9", marginBottom: 10 }}>Patient Summary</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Name</span>
                <span style={{ fontSize: "0.75rem", color: "#e2e8f0", fontWeight: 600 }}>{s.patient.name}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Age / DOB</span>
                <span style={{ fontSize: "0.75rem", color: "#e2e8f0", fontWeight: 600 }}>{s.patient.age} · {s.patient.dob}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Condition</span>
                <span style={{ fontSize: "0.75rem", color: "#e2e8f0", fontWeight: 600 }}>{s.patient.condition}</span>
              </div>
              {s.patient.allergies.length > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Allergies</span>
                  <span style={{ fontSize: "0.75rem", color: "#f87171", fontWeight: 600 }}>{s.patient.allergies.join(", ")}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Prior Auth</span>
                <span style={{ fontSize: "0.75rem", color: "#e2e8f0", fontWeight: 600 }}>{s.patient.priorAuth || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Draggable Surgery Table ──────────────────────────────────────────
type SurgColKey = "patient" | "status" | "procedure" | "date" | "codes";
const SURG_DATA_KEYS = new Set<SurgColKey>(["date", "codes"]);

function DraggableSurgeryTable({ surgeries, onView, searchNode, focusMode: externalFocusMode }: { surgeries: SurgeryRecord[]; onView: (s: SurgeryRecord) => void; searchNode?: React.ReactNode; focusMode?: boolean }) {
  const [columns, setColumns] = useState<SurgColKey[]>(["patient", "status", "procedure", "date", "codes"]);
  const dragCol = useRef<number | null>(null);
  const dragOverCol = useRef<number | null>(null);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [sortCol, setSortCol] = useState<SurgColKey | null>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const crosshair = useCrosshairFocusByKey(columns, SURG_DATA_KEYS);
  const focusMode = externalFocusMode ?? crosshair.focusMode;
  const { onCellEnter, onCellLeave, getCellStyle, getRowStyle } = crosshair;

  const handleSort = (col: SurgColKey) => {
    if (sortCol === col) { setSortDir(d => d === "asc" ? "desc" : "asc"); }
    else { setSortCol(col); setSortDir("asc"); }
  };

  const sorted = useMemo(() => {
    if (!sortCol) return surgeries;
    const arr = [...surgeries];
    const dir = sortDir === "asc" ? 1 : -1;
    arr.sort((a, b) => {
      switch (sortCol) {
        case "patient": return dir * a.patient.name.localeCompare(b.patient.name);
        case "status": return dir * a.status.localeCompare(b.status);
        case "procedure": return dir * a.type.localeCompare(b.type);
        case "date": return dir * (parseDateLoose(a.date).getTime() - parseDateLoose(b.date).getTime());
        case "codes": return dir * ((a.codes[0] || "").localeCompare(b.codes[0] || ""));
        default: return 0;
      }
    });
    return arr;
  }, [surgeries, sortCol, sortDir]);

  const handleDragStart = (idx: number) => { dragCol.current = idx; setDraggingIdx(idx); };
  const handleDragEnter = (idx: number) => { dragOverCol.current = idx; };
  const handleDragEnd = () => {
    if (dragCol.current !== null && dragOverCol.current !== null && dragCol.current !== dragOverCol.current) {
      setColumns(prev => { const c = [...prev]; const d = c.splice(dragCol.current!, 1)[0]; c.splice(dragOverCol.current!, 0, d); return c; });
    }
    dragCol.current = null; dragOverCol.current = null; setDraggingIdx(null);
  };

  const headers: Record<SurgColKey, { label: string; style?: React.CSSProperties }> = {
    patient: { label: "Patient" }, status: { label: "Status" }, procedure: { label: "Procedure" },
    date: { label: "Date" }, codes: { label: "Codes" },
  };

  const renderCell = (s: SurgeryRecord, key: SurgColKey, colIdx: number) => {
    const sc = s.status === "completed" ? "#22c55e" : s.status === "upcoming" ? "#f59e0b" : "#818cf8";
    const rowId = s.id;
    const cs = getCellStyle(rowId, colIdx);
    const h = { onMouseEnter: () => onCellEnter(rowId, colIdx), onMouseLeave: onCellLeave };
    switch (key) {
      case "status": return (
        <td key={key} {...h} style={{ ...cs, transition: "opacity 0.2s ease" }}><span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: "0.68rem", fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: `${sc}18`, color: sc, textTransform: "capitalize" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: sc }} />{s.status.replace("-", " ")}
        </span></td>
      );
      case "procedure": {
        const procMatch = getProcedureIcon(s.type);
        return <td key={key} {...h} style={{ fontWeight: 600, fontSize: "0.82rem", ...cs, transition: "opacity 0.2s ease" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {procMatch && <div style={{ width: 26, height: 26, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", background: `${procMatch.color}15`, color: procMatch.color, flexShrink: 0 }}>{procMatch.icon}</div>}
            {stripSurgeryPrefix(s.type)}
          </div>
        </td>;
      }
      case "patient": return (
        <td key={key} {...h} style={{ ...cs, transition: "opacity 0.2s ease" }}>
          <Link to={`/doczoc/patients/${s.patient.id}`} onClick={e => e.stopPropagation()} style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--dz-accent-text)", textDecoration: "none", fontSize: "0.82rem" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(99,102,241,0.12)", color: "var(--dz-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", fontWeight: 700, flexShrink: 0 }}>
              {s.patient.name.split(" ").map(n => n[0]).join("")}
            </div>
            {s.patient.name}
          </Link>
        </td>
      );
      case "date": return <td key={key} {...h} style={{ fontSize: "0.82rem", whiteSpace: "nowrap", ...cs, transition: "opacity 0.2s ease" }}>{s.date}</td>;
      case "codes": return (
        <td key={key} {...h} style={{ ...cs, transition: "opacity 0.2s ease" }}><div style={{ display: "flex", gap: 3 }}>
          {s.codes.slice(0, 3).map(c => <span key={c} title={getCodeDescription(c)} style={{ fontSize: "0.65rem", fontFamily: "'SF Mono', Consolas, monospace", padding: "1px 6px", borderRadius: 4, fontWeight: 600, background: c.match(/^\d{5}$/) ? "rgba(37,99,235,0.12)" : "rgba(124,58,237,0.12)", color: c.match(/^\d{5}$/) ? "#60a5fa" : "#a78bfa" }}>{c}</span>)}
        </div></td>
      );
      default: return <td key={key} />;
    }
  };

  return (
    <div>
      {searchNode && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          {searchNode}
        </div>
      )}
      <div className="dz-card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="dz-table-wrap">
          <table className="dz-table" style={{ margin: 0 }}>
            <thead>
              <tr>
                {columns.map((key, i) => (
                  <th key={key} style={{ ...headers[key].style, cursor: "pointer", opacity: draggingIdx === i ? 0.4 : 1, transition: "opacity 0.15s", userSelect: "none" }}
                    draggable onDragStart={() => handleDragStart(i)} onDragEnter={() => handleDragEnter(i)} onDragEnd={handleDragEnd} onDragOver={e => e.preventDefault()}
                    onClick={() => handleSort(key)}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      {headers[key].label}
                      {sortCol === key && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ transform: sortDir === "asc" ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.15s" }}>
                          <polyline points="6 9 12 15 18 9"/>
                        </svg>
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map(s => (
                <tr key={s.id} onClick={() => onView(s)} style={{ cursor: "pointer", ...getRowStyle(s.id) }} onMouseEnter={() => onCellEnter(s.id, 0)} onMouseLeave={onCellLeave}>
                  {columns.map((key, i) => renderCell(s, key, i))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {sorted.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "#64748b" }}>No surgeries found</div>}
      </div>
    </div>
  );
}
