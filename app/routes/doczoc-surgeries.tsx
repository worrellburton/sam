import { useState, useMemo, useCallback, useRef } from "react";
import { Link } from "react-router";
import { Sidebar, useDzPrefs } from "./doczoc-dashboard";
import { PlatformBg } from "~/components/PlatformBg";
import { PATIENTS, type Patient } from "~/data/patients";
import { useCrosshairFocusByKey, CrosshairToggle } from "~/hooks/useCrosshairFocus";

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
  const [subPage, setSubPage] = useState<"main" | "database" | "detail">("main");
  const [filter, setFilter] = useState<"all" | "completed" | "upcoming" | "pre-op">("all");
  const [selectedSurgery, setSelectedSurgery] = useState<SurgeryRecord | null>(null);
  const [search, setSearch] = useState("");
  const [addedSurgeries, setAddedSurgeries] = useState<SurgeryRecord[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSurgery, setNewSurgery] = useState({ patient: "", type: "", date: "", notes: "" });

  const allSurgeries = useMemo(() => [...surgeries, ...addedSurgeries], [surgeries, addedSurgeries]);
  const filtered = allSurgeries
    .filter(s => filter === "all" ? true : s.status === filter)
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
          <SurgeryDetailView surgery={selectedSurgery} onBack={() => setSubPage("main")} />
        ) : (
          <>
            {/* Hero header */}
            <div className="dz-surgery-hero" style={{
              position: "relative", overflow: "hidden", borderRadius: 20, padding: "28px 32px",
              marginBottom: 24,
              background: "linear-gradient(135deg, rgba(239,68,68,0.06) 0%, rgba(168,85,247,0.1) 40%, rgba(99,102,241,0.08) 100%)",
              backdropFilter: "blur(20px)", isolation: "isolate",
            }}>
              <div style={{
                position: "absolute", inset: 0, borderRadius: 20, padding: 1,
                background: "linear-gradient(135deg, #ef4444, #a855f7, #6366f1, #ec4899, #ef4444)",
                backgroundSize: "300% 300%", animation: "dz-surgery-border 4s ease infinite",
                WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "xor" as any, maskComposite: "exclude",
                pointerEvents: "none", zIndex: 1,
              }} />
              <div style={{
                position: "absolute", top: 0, left: "-100%", width: "60%", height: "100%",
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)",
                animation: "dz-surgery-shimmer 3s ease-in-out infinite", pointerEvents: "none", zIndex: 2,
              }} />
              <div style={{
                position: "absolute", top: -20, right: 80, width: 90, height: 90, borderRadius: "50%",
                background: "radial-gradient(circle, rgba(239,68,68,0.1) 0%, transparent 70%)",
                animation: "dz-surgery-float 6s ease-in-out infinite", pointerEvents: "none",
              }} />

              <div style={{ position: "relative", zIndex: 3, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center",
                    background: "linear-gradient(135deg, rgba(239,68,68,0.2), rgba(168,85,247,0.2))",
                    animation: "dz-surgery-pulse 2s ease-in-out infinite",
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                  </div>
                  <div>
                    <h1 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#f1f5f9", margin: 0 }}>Surgical Center</h1>
                    <p style={{ fontSize: "0.8rem", color: "#94a3b8", margin: 0 }}>
                      {completedCount} completed · {upcomingCount} upcoming · {preOpCount} pre-op
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => setSubPage(subPage === "database" ? "main" : "database")}
                    style={{
                      padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(99,102,241,0.2)",
                      background: subPage === "database" ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.06)",
                      color: "#a5b4fc", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 6,
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
                    Database
                  </button>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
              <div style={{ display: "flex", gap: 6 }}>
                {(["all", "completed", "upcoming", "pre-op"] as const).map(f => (
                  <button key={f} onClick={() => setFilter(f)} style={{
                    padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                    fontSize: "0.75rem", fontWeight: 700, textTransform: "capitalize",
                    background: filter === f ? "rgba(239,68,68,0.15)" : "rgba(148,163,184,0.06)",
                    color: filter === f ? "#f87171" : "#94a3b8",
                  }}>
                    {f === "all" ? `All (${allSurgeries.length})` : `${f.replace("-", " ")} (${f === "completed" ? completedCount : f === "upcoming" ? upcomingCount : preOpCount})`}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8,
                  background: "rgba(148,163,184,0.06)", border: "1px solid rgba(99,102,241,0.1)", width: 220,
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{
                    background: "transparent", border: "none", outline: "none", width: "100%",
                    fontSize: "0.78rem", color: "#e2e8f0",
                  }} />
                </div>
                <div style={{ display: "flex", gap: 2 }}>
                  <button onClick={() => setView("table")} style={{
                    padding: "6px 8px", borderRadius: "6px 0 0 6px", border: "none", cursor: "pointer",
                    background: view === "table" ? "rgba(99,102,241,0.15)" : "rgba(148,163,184,0.06)",
                    color: view === "table" ? "#818cf8" : "#64748b",
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                  </button>
                  <button onClick={() => setView("list")} style={{
                    padding: "6px 8px", borderRadius: "0 6px 6px 0", border: "none", cursor: "pointer",
                    background: view === "list" ? "rgba(99,102,241,0.15)" : "rgba(148,163,184,0.06)",
                    color: view === "list" ? "#818cf8" : "#64748b",
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                  </button>
                </div>
                {subPage === "database" && (
                  <button onClick={() => setShowAddForm(!showAddForm)} style={{
                    padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                    background: "linear-gradient(135deg, #ef4444, #a855f7)", color: "#fff",
                    fontSize: "0.75rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 4,
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Add Surgery
                  </button>
                )}
              </div>
            </div>

            {/* Add form */}
            {showAddForm && subPage === "database" && (
              <div className="dz-card" style={{ padding: "18px 22px", marginBottom: 16 }}>
                <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#f1f5f9", marginBottom: 12 }}>Schedule New Surgery</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>Patient</label>
                    <select value={newSurgery.patient} onChange={e => setNewSurgery({ ...newSurgery, patient: e.target.value })} style={{
                      width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid rgba(99,102,241,0.15)",
                      background: "rgba(15,23,42,0.4)", color: "#e2e8f0", fontSize: "0.78rem",
                    }}>
                      <option value="">Select patient...</option>
                      {PATIENTS.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>Procedure</label>
                    <input value={newSurgery.type} onChange={e => setNewSurgery({ ...newSurgery, type: e.target.value })} placeholder="e.g. ACL Reconstruction"
                      style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid rgba(99,102,241,0.15)", background: "rgba(15,23,42,0.4)", color: "#e2e8f0", fontSize: "0.78rem" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>Date</label>
                    <input type="date" value={newSurgery.date} onChange={e => setNewSurgery({ ...newSurgery, date: e.target.value })}
                      style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid rgba(99,102,241,0.15)", background: "rgba(15,23,42,0.4)", color: "#e2e8f0", fontSize: "0.78rem" }} />
                  </div>
                </div>
                <div style={{ marginTop: 10 }}>
                  <label style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>Notes</label>
                  <textarea value={newSurgery.notes} onChange={e => setNewSurgery({ ...newSurgery, notes: e.target.value })} placeholder="Surgical notes..."
                    style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid rgba(99,102,241,0.15)", background: "rgba(15,23,42,0.4)", color: "#e2e8f0", fontSize: "0.78rem", minHeight: 60, resize: "vertical" }} />
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

            {/* Table View */}
            {view === "table" ? (
              <DraggableSurgeryTable surgeries={filtered} onView={openDetail} />
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
                      <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#f1f5f9", marginBottom: 4 }}>{s.type}</div>
                      <div style={{ fontSize: "0.78rem", color: "#94a3b8", marginBottom: 8 }}>{s.patient.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {s.notes}
                      </div>
                      {s.codes.length > 0 && (
                        <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
                          {s.codes.slice(0, 3).map(c => (
                            <span key={c} style={{
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
            )}
          </>
        )}
      </main>
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
              <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#f1f5f9", margin: 0 }}>{s.type}</h2>
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
                  <div key={c} style={{
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
type SurgColKey = "status" | "procedure" | "patient" | "date" | "codes" | "action";
const SURG_DATA_KEYS = new Set<SurgColKey>(["date", "codes"]);

function DraggableSurgeryTable({ surgeries, onView }: { surgeries: SurgeryRecord[]; onView: (s: SurgeryRecord) => void }) {
  const [columns, setColumns] = useState<SurgColKey[]>(["status", "procedure", "patient", "date", "codes", "action"]);
  const dragCol = useRef<number | null>(null);
  const dragOverCol = useRef<number | null>(null);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const { focusMode, toggleFocus, onCellEnter, onCellLeave, getCellStyle } = useCrosshairFocusByKey(columns, SURG_DATA_KEYS);

  const handleDragStart = (idx: number) => { dragCol.current = idx; setDraggingIdx(idx); };
  const handleDragEnter = (idx: number) => { dragOverCol.current = idx; };
  const handleDragEnd = () => {
    if (dragCol.current !== null && dragOverCol.current !== null && dragCol.current !== dragOverCol.current) {
      setColumns(prev => { const c = [...prev]; const d = c.splice(dragCol.current!, 1)[0]; c.splice(dragOverCol.current!, 0, d); return c; });
    }
    dragCol.current = null; dragOverCol.current = null; setDraggingIdx(null);
  };

  const headers: Record<SurgColKey, { label: string; style?: React.CSSProperties }> = {
    status: { label: "Status" }, procedure: { label: "Procedure" }, patient: { label: "Patient" },
    date: { label: "Date" }, codes: { label: "Codes" }, action: { label: "Action", style: { textAlign: "center" } },
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
      case "procedure": return <td key={key} {...h} style={{ fontWeight: 600, fontSize: "0.82rem", ...cs, transition: "opacity 0.2s ease" }}>{s.type}</td>;
      case "patient": return <td key={key} {...h} style={{ ...cs, transition: "opacity 0.2s ease" }}><Link to={`/doczoc/patients/${s.patient.id}`} onClick={e => e.stopPropagation()} style={{ color: "#a5b4fc", textDecoration: "none", fontSize: "0.82rem" }}>{s.patient.name}</Link></td>;
      case "date": return <td key={key} {...h} style={{ fontSize: "0.82rem", whiteSpace: "nowrap", ...cs, transition: "opacity 0.2s ease" }}>{s.date}</td>;
      case "codes": return (
        <td key={key} {...h} style={{ ...cs, transition: "opacity 0.2s ease" }}><div style={{ display: "flex", gap: 3 }}>
          {s.codes.slice(0, 3).map(c => <span key={c} style={{ fontSize: "0.65rem", fontFamily: "'SF Mono', Consolas, monospace", padding: "1px 6px", borderRadius: 4, fontWeight: 600, background: c.match(/^\d{5}$/) ? "rgba(37,99,235,0.12)" : "rgba(124,58,237,0.12)", color: c.match(/^\d{5}$/) ? "#60a5fa" : "#a78bfa" }}>{c}</span>)}
        </div></td>
      );
      case "action": return (
        <td key={key} {...h} style={{ textAlign: "center", ...cs, transition: "opacity 0.2s ease" }}><button onClick={e => { e.stopPropagation(); onView(s); }} style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid rgba(99,102,241,0.15)", background: "rgba(99,102,241,0.06)", color: "#818cf8", fontSize: "0.7rem", fontWeight: 700, cursor: "pointer" }}>View</button></td>
      );
      default: return <td key={key} />;
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
        <CrosshairToggle active={focusMode} onClick={toggleFocus} />
      </div>
      <div className="dz-card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="dz-table-wrap">
          <table className="dz-table" style={{ margin: 0 }}>
            <thead>
              <tr>
                {columns.map((key, i) => (
                  <th key={key} style={{ ...headers[key].style, cursor: "grab", opacity: draggingIdx === i ? 0.4 : 1, transition: "opacity 0.15s", userSelect: "none" }}
                    draggable onDragStart={() => handleDragStart(i)} onDragEnter={() => handleDragEnter(i)} onDragEnd={handleDragEnd} onDragOver={e => e.preventDefault()}>
                    {headers[key].label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {surgeries.map(s => (
                <tr key={s.id} onClick={() => onView(s)} style={{ cursor: "pointer" }}>
                  {columns.map((key, i) => renderCell(s, key, i))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {surgeries.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "#64748b" }}>No surgeries found</div>}
      </div>
    </div>
  );
}
