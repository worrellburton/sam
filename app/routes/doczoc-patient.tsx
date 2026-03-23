import { useState } from "react";
import { Link, useParams } from "react-router";
import { Sidebar, useDzPrefs } from "./doczoc-dashboard";
import { PlatformBg } from "~/components/PlatformBg";
import { getPatientBySlug } from "~/data/patients";

export function meta() {
  return [{ title: "Patient | DocZoc" }];
}

export default function PatientDetailPage() {
  const [collapsed, setCollapsed] = useState(false);
  const { bgId } = useDzPrefs();
  const { id } = useParams();
  const patient = id ? getPatientBySlug(id) : undefined;

  if (!patient) {
    return (
      <div className="dz-platform">
        <PlatformBg bgId={bgId} />
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        <main className={`dz-platform-main${collapsed ? " dz-main-expanded" : ""}`}>
          <header className="dz-platform-header">
            <div>
              <h1>Patient Not Found</h1>
              <p>
                <Link to="/doczoc/patients" style={{ color: "#818cf8" }}>
                  Back to Patients
                </Link>
              </p>
            </div>
          </header>
        </main>
      </div>
    );
  }

  const statusColors: Record<string, { bg: string; color: string }> = {
    Active: { bg: "rgba(34,197,94,0.12)", color: "#22c55e" },
    New: { bg: "rgba(99,102,241,0.12)", color: "#818cf8" },
    Discharged: { bg: "rgba(148,163,184,0.12)", color: "#94a3b8" },
  };
  const sc = statusColors[patient.status] || statusColors.Active;

  return (
    <div className="dz-platform">
      <PlatformBg bgId={bgId} />
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className={`dz-platform-main${collapsed ? " dz-main-expanded" : ""}`}>
        {/* Header */}
        <header className="dz-platform-header">
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Link
              to="/doczoc/patients"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 36, height: 36, borderRadius: 8,
                background: "rgba(99,102,241,0.1)", color: "#818cf8",
                textDecoration: "none", flexShrink: 0,
              }}
              title="Back to Patients"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </Link>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <h1 style={{ margin: 0 }}>{patient.name}</h1>
                <span style={{
                  display: "inline-block", padding: "3px 10px", borderRadius: 6,
                  fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "0.05em", background: sc.bg, color: sc.color,
                }}>
                  {patient.status}
                </span>
              </div>
              <p style={{ margin: 0, marginTop: 2, color: "#8a8a9a", fontSize: "0.82rem" }}>
                {patient.condition} &middot; {patient.age} years old
              </p>
            </div>
          </div>
        </header>

        {/* Info Cards */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16, marginBottom: 24,
        }}>
          {/* Demographics */}
          <div className="dz-card">
            <div className="dz-card-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
              Demographics
            </div>
            <InfoRow label="Date of Birth" value={patient.dob} />
            <InfoRow label="Sex" value={patient.sex} />
            <InfoRow label="Phone" value={patient.phone} />
            <InfoRow label="Email" value={patient.email} />
            <InfoRow label="Address" value={patient.address} />
          </div>

          {/* Insurance */}
          <div className="dz-card">
            <div className="dz-card-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
              </svg>
              Insurance
            </div>
            <InfoRow label="Plan" value={patient.insurance} />
            <InfoRow label="Member ID" value={patient.memberId} />
            <InfoRow label="Group Number" value={patient.groupNumber} />
            {patient.priorAuth && <InfoRow label="Prior Auth #" value={patient.priorAuth} />}
            <InfoRow label="Provider" value={patient.provider} />
            <InfoRow label="Referred By" value={patient.referredBy} />
            {/* Subscriber */}
            {patient.subscriberRelationship && patient.subscriberRelationship !== "Self" && (
              <>
                <div style={{ borderTop: "1px solid rgba(99,102,241,0.1)", margin: "8px 0 4px" }} />
                <InfoRow label="Subscriber" value={patient.subscriberName || "—"} />
                {patient.subscriberDob && <InfoRow label="Subscriber DOB" value={patient.subscriberDob} />}
                <InfoRow label="Relationship" value={patient.subscriberRelationship} />
              </>
            )}
          </div>

          {/* Signatures on File */}
          <div className="dz-card">
            <div className="dz-card-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              Signatures on File
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0" }}>
              <span style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 600 }}>Assignment of Benefits</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {patient.aobSigned ? (
                  <>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 6, fontSize: "0.72rem", fontWeight: 700, background: "rgba(34,197,94,0.12)", color: "#22c55e" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      Signed
                    </span>
                    {patient.aobDate && <span style={{ fontSize: "0.72rem", color: "#64748b" }}>{patient.aobDate}</span>}
                  </>
                ) : (
                  <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 6, fontSize: "0.72rem", fontWeight: 700, background: "rgba(239,68,68,0.12)", color: "#f87171" }}>
                    Missing
                  </span>
                )}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0" }}>
              <span style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 600 }}>Release of Information</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {patient.roiSigned ? (
                  <>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 6, fontSize: "0.72rem", fontWeight: 700, background: "rgba(34,197,94,0.12)", color: "#22c55e" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      Signed
                    </span>
                    {patient.roiDate && <span style={{ fontSize: "0.72rem", color: "#64748b" }}>{patient.roiDate}</span>}
                  </>
                ) : (
                  <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 6, fontSize: "0.72rem", fontWeight: 700, background: "rgba(239,68,68,0.12)", color: "#f87171" }}>
                    Missing
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Medical */}
          <div className="dz-card">
            <div className="dz-card-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
              Medical Info
            </div>
            <InfoRow
              label="Allergies"
              value={patient.allergies.length > 0 ? patient.allergies.join(", ") : "None reported"}
              warn={patient.allergies.length > 0}
            />
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: "0.7rem", color: "#5a5a6e", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>
                Medications
              </div>
              {patient.medications.length > 0 ? (
                <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                  {patient.medications.map((med) => (
                    <li key={med} style={{ fontSize: "0.82rem", color: "#c4c4d4", padding: "2px 0" }}>
                      {med}
                    </li>
                  ))}
                </ul>
              ) : (
                <span style={{ fontSize: "0.82rem", color: "#5a5a6e" }}>None</span>
              )}
            </div>
          </div>
        </div>

        {/* Appointment Quick View */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 16, marginBottom: 24,
        }}>
          <div className="dz-card" style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10, display: "flex",
              alignItems: "center", justifyContent: "center",
              background: "rgba(99,102,241,0.12)", color: "#818cf8", flexShrink: 0,
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: "0.7rem", color: "#5a5a6e", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Last Visit</div>
              <div style={{ fontSize: "1rem", fontWeight: 700, color: "#e4e4ee" }}>{patient.lastVisit}</div>
            </div>
          </div>
          <div className="dz-card" style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10, display: "flex",
              alignItems: "center", justifyContent: "center",
              background: patient.nextAppt === "-" ? "rgba(148,163,184,0.12)" : "rgba(34,197,94,0.12)",
              color: patient.nextAppt === "-" ? "#94a3b8" : "#22c55e", flexShrink: 0,
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: "0.7rem", color: "#5a5a6e", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Next Appointment</div>
              <div style={{ fontSize: "1rem", fontWeight: 700, color: "#e4e4ee" }}>
                {patient.nextAppt === "-" ? "None scheduled" : patient.nextAppt}
              </div>
            </div>
          </div>
        </div>

        {/* Visit History */}
        <div className="dz-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{
            padding: "16px 20px", borderBottom: "1px solid rgba(99,102,241,0.1)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
              </svg>
              <span style={{ fontWeight: 700, color: "#e4e4ee", fontSize: "0.88rem" }}>Visit History</span>
            </div>
            <span style={{ fontSize: "0.72rem", color: "#5a5a6e", fontWeight: 600 }}>{patient.visits.length} visits</span>
          </div>

          <div style={{ padding: "0 20px 20px" }}>
            {patient.visits.map((visit, i) => (
              <div
                key={i}
                style={{
                  position: "relative",
                  paddingLeft: 28,
                  paddingTop: 20,
                  paddingBottom: i < patient.visits.length - 1 ? 0 : 0,
                }}
              >
                {/* Timeline line */}
                {i < patient.visits.length - 1 && (
                  <div style={{
                    position: "absolute", left: 7, top: 36, bottom: -20,
                    width: 2, background: "rgba(99,102,241,0.15)",
                  }} />
                )}
                {/* Timeline dot */}
                <div style={{
                  position: "absolute", left: 2, top: 26,
                  width: 12, height: 12, borderRadius: "50%",
                  background: i === 0 ? "#6366f1" : "rgba(99,102,241,0.25)",
                  border: i === 0 ? "2px solid rgba(99,102,241,0.4)" : "none",
                }} />

                <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 6 }}>
                  <span style={{ fontSize: "0.78rem", color: "#818cf8", fontWeight: 700, whiteSpace: "nowrap" }}>
                    {visit.date}
                  </span>
                  <span style={{
                    fontSize: "0.72rem", padding: "2px 8px", borderRadius: 4,
                    background: "rgba(99,102,241,0.08)", color: "#a5b4fc", fontWeight: 600,
                  }}>
                    {visit.type}
                  </span>
                </div>

                <p style={{ fontSize: "0.82rem", color: "#9a9ab0", lineHeight: 1.55, margin: "0 0 8px" }}>
                  {visit.notes}
                </p>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {visit.codes.map((code) => (
                    <span
                      key={code}
                      style={{
                        fontSize: "0.68rem", fontFamily: "'SF Mono', Consolas, monospace",
                        padding: "2px 7px", borderRadius: 4, fontWeight: 600,
                        background: code.match(/^\d{5}$/) ? "rgba(37,99,235,0.12)" : "rgba(124,58,237,0.12)",
                        color: code.match(/^\d{5}$/) ? "#60a5fa" : "#a78bfa",
                      }}
                    >
                      {code}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function InfoRow({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "4px 0" }}>
      <span style={{ fontSize: "0.72rem", color: "#5a5a6e", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {label}
      </span>
      <span style={{
        fontSize: "0.82rem", fontWeight: 500, textAlign: "right", maxWidth: "60%",
        color: warn ? "#f87171" : "#c4c4d4",
      }}>
        {value}
      </span>
    </div>
  );
}
