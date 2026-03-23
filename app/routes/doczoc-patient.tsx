import { useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { Sidebar, useDzPrefs } from "./doczoc-dashboard";
import { PlatformBg } from "~/components/PlatformBg";
import { getPatientBySlug, type Patient } from "~/data/patients";

type TimelineEvent = {
  date: string;
  sortDate: number;
  badge: string;
  badgeBg: string;
  badgeColor: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  description: string;
  linkTo?: string;
  amount?: string;
  amountColor?: string;
  codes?: string[];
};

const iconSvg = {
  signup: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>,
  message: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  appointment: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  surgery: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  claim: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  payment: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  invoice: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="2" y1="7" x2="22" y2="7"/><line x1="2" y1="11" x2="22" y2="11"/></svg>,
  auth: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
};

function parseDate(dateStr: string): number {
  return new Date(dateStr).getTime() || 0;
}

function buildTimeline(patient: Patient): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  // Signed up
  events.push({
    date: patient.signedUpDate,
    sortDate: parseDate(patient.signedUpDate),
    badge: "Signed Up",
    badgeBg: "rgba(34,197,94,0.12)", badgeColor: "#22c55e",
    icon: iconSvg.signup,
    iconBg: "rgba(34,197,94,0.15)", iconColor: "#22c55e",
    description: `${patient.name} registered as a new patient.`,
  });

  // Intro message
  events.push({
    date: patient.signedUpDate,
    sortDate: parseDate(patient.signedUpDate) + 1,
    badge: "Intro Message",
    badgeBg: "rgba(99,102,241,0.12)", badgeColor: "#818cf8",
    icon: iconSvg.message,
    iconBg: "rgba(99,102,241,0.15)", iconColor: "#818cf8",
    description: `"${patient.introMessage}"`,
  });

  // Visits (appointments and surgeries)
  for (const visit of patient.visits) {
    const isSurgery = visit.type.toLowerCase().includes("surgery");
    events.push({
      date: visit.date,
      sortDate: parseDate(visit.date),
      badge: isSurgery ? "Surgery" : "Appointment",
      badgeBg: isSurgery ? "rgba(239,68,68,0.12)" : "rgba(99,102,241,0.12)",
      badgeColor: isSurgery ? "#f87171" : "#a5b4fc",
      icon: isSurgery ? iconSvg.surgery : iconSvg.appointment,
      iconBg: isSurgery ? "rgba(239,68,68,0.15)" : "rgba(99,102,241,0.15)",
      iconColor: isSurgery ? "#f87171" : "#818cf8",
      description: `${visit.type} — ${visit.notes}`,
      linkTo: isSurgery ? "/doczoc/in-person" : "/doczoc/in-person",
      codes: visit.codes,
    });
  }

  // Billing events
  for (const be of patient.billingEvents) {
    const cfg = {
      claim_filed: { badge: "Claim Filed", bg: "rgba(251,191,36,0.12)", color: "#fbbf24", iconBg: "rgba(251,191,36,0.15)", iconColor: "#fbbf24", icon: iconSvg.claim },
      claim_paid: { badge: "Claim Paid", bg: "rgba(34,197,94,0.12)", color: "#22c55e", iconBg: "rgba(34,197,94,0.15)", iconColor: "#22c55e", icon: iconSvg.payment },
      payment_received: { badge: "Payment Received", bg: "rgba(34,197,94,0.12)", color: "#22c55e", iconBg: "rgba(34,197,94,0.15)", iconColor: "#22c55e", icon: iconSvg.payment },
      invoice_sent: { badge: "Invoice Sent", bg: "rgba(99,102,241,0.12)", color: "#818cf8", iconBg: "rgba(99,102,241,0.15)", iconColor: "#818cf8", icon: iconSvg.invoice },
      prior_auth_approved: { badge: "Prior Auth Approved", bg: "rgba(34,197,94,0.12)", color: "#22c55e", iconBg: "rgba(34,197,94,0.15)", iconColor: "#22c55e", icon: iconSvg.auth },
    }[be.type];

    events.push({
      date: be.date,
      sortDate: parseDate(be.date) + 0.5,
      badge: cfg.badge,
      badgeBg: cfg.bg, badgeColor: cfg.color,
      icon: cfg.icon,
      iconBg: cfg.iconBg, iconColor: cfg.iconColor,
      description: be.description,
      amount: be.amount ? `$${be.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : undefined,
      amountColor: be.type === "payment_received" || be.type === "claim_paid" ? "#22c55e" : "#818cf8",
    });
  }

  // Sort chronologically (newest first)
  events.sort((a, b) => b.sortDate - a.sortDate);
  return events;
}

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

  const allTimelineEvents = useMemo(() => patient ? buildTimeline(patient) : [], [patient]);

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

        {/* Invoices */}
        <div className="dz-card" style={{ padding: 0, overflow: "hidden", marginBottom: 24 }}>
          <div style={{
            padding: "16px 20px", borderBottom: "1px solid rgba(99,102,241,0.1)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="18" rx="2" /><line x1="2" y1="7" x2="22" y2="7" /><line x1="2" y1="11" x2="22" y2="11" />
              </svg>
              <span className="dz-text-primary" style={{ fontWeight: 700, fontSize: "0.88rem" }}>Invoices</span>
            </div>
            <span className="dz-text-muted" style={{ fontSize: "0.72rem", fontWeight: 600 }}>{patient.invoices.length} invoices</span>
          </div>
          <div className="dz-table-wrap">
            <table className="dz-table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Date</th>
                  <th>Description</th>
                  <th style={{ textAlign: "right" }}>Charged</th>
                  <th style={{ textAlign: "right" }}>Insurance Paid</th>
                  <th style={{ textAlign: "right" }}>Deductible</th>
                  <th style={{ textAlign: "right" }}>Copay</th>
                  <th style={{ textAlign: "right" }}>Patient Owes</th>
                  <th>Status</th>
                  <th style={{ textAlign: "center" }}>PDF</th>
                </tr>
              </thead>
              <tbody>
                {patient.invoices.map((inv) => {
                  const invStatusColors: Record<string, { bg: string; color: string }> = {
                    Paid: { bg: "rgba(34,197,94,0.12)", color: "#22c55e" },
                    Pending: { bg: "rgba(251,191,36,0.12)", color: "#fbbf24" },
                    Overdue: { bg: "rgba(239,68,68,0.12)", color: "#f87171" },
                    "Insurance Processing": { bg: "rgba(99,102,241,0.12)", color: "#818cf8" },
                  };
                  const isc = invStatusColors[inv.status] || invStatusColors.Pending;
                  return (
                    <tr key={inv.id}>
                      <td style={{ fontFamily: "'SF Mono', Consolas, monospace", fontSize: "0.75rem", fontWeight: 600 }}>{inv.id}</td>
                      <td style={{ whiteSpace: "nowrap", fontSize: "0.82rem" }}>{inv.date}</td>
                      <td style={{ fontSize: "0.82rem", maxWidth: 260 }}>{inv.description}</td>
                      <td style={{ textAlign: "right", fontFamily: "'SF Mono', Consolas, monospace", fontSize: "0.82rem", fontWeight: 600 }}>${inv.totalCharged.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                      <td style={{ textAlign: "right", fontFamily: "'SF Mono', Consolas, monospace", fontSize: "0.82rem", color: "#22c55e" }}>${inv.insurancePaid.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                      <td style={{ textAlign: "right", fontFamily: "'SF Mono', Consolas, monospace", fontSize: "0.82rem", color: "#f59e0b" }}>${inv.deductibleApplied.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                      <td style={{ textAlign: "right", fontFamily: "'SF Mono', Consolas, monospace", fontSize: "0.82rem" }}>${inv.copay.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                      <td style={{ textAlign: "right", fontFamily: "'SF Mono', Consolas, monospace", fontSize: "0.82rem", fontWeight: 700 }}>${inv.patientOwes.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                      <td><span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 6, fontSize: "0.7rem", fontWeight: 700, background: isc.bg, color: isc.color, whiteSpace: "nowrap" }}>{inv.status}</span></td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 4,
                            padding: "4px 10px", borderRadius: 6, border: "1px solid rgba(99,102,241,0.2)",
                            background: "rgba(99,102,241,0.08)", color: "#818cf8",
                            fontSize: "0.7rem", fontWeight: 700, cursor: "pointer",
                          }}
                          title={`Download ${inv.id}.pdf`}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                          PDF
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Totals */}
          <div style={{
            padding: "14px 20px", borderTop: "1px solid rgba(99,102,241,0.1)",
            display: "flex", justifyContent: "flex-end", gap: 32, flexWrap: "wrap",
          }}>
            <div style={{ textAlign: "right" }}>
              <div className="dz-text-muted" style={{ fontSize: "0.68rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Total Charged</div>
              <div style={{ fontSize: "1rem", fontWeight: 800, fontFamily: "'SF Mono', Consolas, monospace" }}>
                ${patient.invoices.reduce((s, i) => s + i.totalCharged, 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="dz-text-muted" style={{ fontSize: "0.68rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Insurance Paid</div>
              <div style={{ fontSize: "1rem", fontWeight: 800, fontFamily: "'SF Mono', Consolas, monospace", color: "#22c55e" }}>
                ${patient.invoices.reduce((s, i) => s + i.insurancePaid, 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="dz-text-muted" style={{ fontSize: "0.68rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Patient Owes</div>
              <div style={{ fontSize: "1rem", fontWeight: 800, fontFamily: "'SF Mono', Consolas, monospace", color: "#f59e0b" }}>
                ${patient.invoices.reduce((s, i) => s + i.patientOwes, 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>

        {/* Patient Journey Timeline */}
        <div className="dz-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{
            padding: "16px 20px", borderBottom: "1px solid rgba(99,102,241,0.1)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              <span className="dz-text-primary" style={{ fontWeight: 700, fontSize: "0.88rem" }}>Patient Journey</span>
            </div>
            <span className="dz-text-muted" style={{ fontSize: "0.72rem", fontWeight: 600 }}>
              {allTimelineEvents.length} events
            </span>
          </div>

          <div style={{ padding: "0 20px 20px" }}>
            {allTimelineEvents.map((event, i) => {
              const isLast = i === allTimelineEvents.length - 1;
              return (
                <div
                  key={i}
                  style={{
                    position: "relative",
                    paddingLeft: 36,
                    paddingTop: 20,
                  }}
                >
                  {/* Timeline line */}
                  {!isLast && (
                    <div style={{
                      position: "absolute", left: 11, top: 40, bottom: -20,
                      width: 2, background: "rgba(99,102,241,0.12)",
                    }} />
                  )}
                  {/* Timeline icon */}
                  <div style={{
                    position: "absolute", left: 0, top: 22,
                    width: 24, height: 24, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: event.iconBg, color: event.iconColor,
                  }}>
                    {event.icon}
                  </div>

                  <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.76rem", color: "#818cf8", fontWeight: 700, whiteSpace: "nowrap" }}>
                      {event.date}
                    </span>
                    <span style={{
                      fontSize: "0.7rem", padding: "2px 8px", borderRadius: 4,
                      background: event.badgeBg, color: event.badgeColor, fontWeight: 700,
                      whiteSpace: "nowrap",
                    }}>
                      {event.badge}
                    </span>
                  </div>

                  {event.linkTo ? (
                    <Link to={event.linkTo} style={{ textDecoration: "none" }}>
                      <p className="dz-text-secondary" style={{
                        fontSize: "0.82rem", lineHeight: 1.55, margin: "0 0 4px",
                        cursor: "pointer",
                      }}>
                        {event.description}
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 6, verticalAlign: "middle" }}>
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </p>
                    </Link>
                  ) : (
                    <p className="dz-text-secondary" style={{ fontSize: "0.82rem", lineHeight: 1.55, margin: "0 0 4px" }}>
                      {event.description}
                    </p>
                  )}

                  {event.amount !== undefined && (
                    <span style={{
                      fontSize: "0.75rem", fontFamily: "'SF Mono', Consolas, monospace",
                      fontWeight: 700, color: event.amountColor || "#22c55e",
                    }}>
                      {event.amount}
                    </span>
                  )}

                  {event.codes && event.codes.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
                      {event.codes.map((code) => (
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
                  )}
                </div>
              );
            })}
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
