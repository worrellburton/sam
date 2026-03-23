import { useMemo, useState, useRef, useCallback } from "react";
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
        {/* Header with avatar */}
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
            <div style={{
              width: 52, height: 52, borderRadius: "50%", flexShrink: 0,
              background: `linear-gradient(135deg, ${sc.color}22, ${sc.color}44)`,
              border: `2px solid ${sc.color}44`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.1rem", fontWeight: 800, color: sc.color,
            }}>
              {patient.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <h1 style={{ margin: 0 }}>{patient.name}</h1>
                <span style={{
                  display: "inline-block", padding: "3px 10px", borderRadius: 6,
                  fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.05em", background: sc.bg, color: sc.color,
                }}>
                  {patient.status}
                </span>
              </div>
              <p style={{ margin: 0, marginTop: 2, color: "#8a8a9a", fontSize: "0.82rem" }}>
                {patient.condition} &middot; {patient.age} years old &middot; {patient.dob}
              </p>
            </div>
          </div>
        </header>

        {/* Patient Details — collapsible */}
        <PatientDetailsSection patient={patient} />

        {/* Invoices — collapsible, default collapsed */}
        <InvoicesSection patient={patient} />

        {/* Documents — unified section with drag-and-drop */}
        <DocumentsSection patient={patient} />

        {/* Timeline — collapsible, default collapsed */}
        <TimelineSection events={allTimelineEvents} />

        {/* Consent & Signatures — at the bottom */}
        <ConsentSection patient={patient} />
      </main>
    </div>
  );
}

// ── Patient Details Section (collapsible) ──────────────────────────
function PatientDetailsSection({ patient }: { patient: Patient }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="dz-card" style={{ padding: 0, overflow: "hidden", marginBottom: 24 }}>
      <CollapsibleHeader
        title="Patient Details"
        icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>}
        count={3}
        countLabel="sections"
        open={open}
        onToggle={() => setOpen(!open)}
      />
      {open && (
        <div style={{ padding: "16px 20px" }}>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
          }}>
            {/* Demographics */}
            <CopyableCard title="Demographics" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>}
              copyText={`${patient.name}\nDOB: ${patient.dob}\nSex: ${patient.sex}\nPhone: ${patient.phone}\nEmail: ${patient.email}\nAddress: ${patient.address}`}>
              <InfoRow label="Date of Birth" value={patient.dob} />
              <InfoRow label="Sex" value={patient.sex} />
              <InfoRow label="Phone" value={patient.phone} />
              <InfoRow label="Email" value={patient.email} />
              <InfoRow label="Address" value={patient.address} />
              {patient.emergencyContact && (
                <>
                  <div style={{ borderTop: "1px solid rgba(99,102,241,0.1)", margin: "8px 0 4px" }} />
                  <InfoRow label="Emergency Contact" value={patient.emergencyContact} />
                  {patient.emergencyPhone && <InfoRow label="Emergency Phone" value={patient.emergencyPhone} />}
                </>
              )}
              {patient.primaryLanguage && <InfoRow label="Language" value={patient.primaryLanguage} />}
              <div style={{ borderTop: "1px solid rgba(99,102,241,0.1)", margin: "8px 0 4px" }} />
              <button
                onClick={() => {
                  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Driver's License — ${patient.name}</title><style>*{margin:0;padding:0;box-sizing:border-box}@page{size:landscape;margin:0.5in}body{font-family:'Helvetica Neue',Arial,sans-serif;padding:0.5in}.card{width:500px;border:2px solid #1e40af;border-radius:12px;padding:24px;background:linear-gradient(135deg,#eff6ff 0%,#dbeafe 100%)}.card-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid #93c5fd}.card-header h2{font-size:13pt;color:#1e40af}.row{display:flex;justify-content:space-between;margin-bottom:6px}.label{font-size:8pt;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em}.value{font-size:10pt;color:#1e293b;font-weight:700}</style></head><body><div class="card"><div class="card-header"><h2>NEW YORK STATE</h2><span style="font-size:8pt;color:#64748b;font-weight:700">DRIVER LICENSE</span></div><div class="row"><span class="label">Name</span><span class="value">${patient.name}</span></div><div class="row"><span class="label">Date of Birth</span><span class="value">${patient.dob}</span></div><div class="row"><span class="label">Sex</span><span class="value">${patient.sex}</span></div><div class="row"><span class="label">Address</span><span class="value">${patient.address}</span></div><div class="row"><span class="label">License No.</span><span class="value">DL-${patient.memberId.replace(/[^0-9]/g, "").slice(0, 9)}</span></div><div class="row"><span class="label">Expires</span><span class="value">${patient.dob.split("/")[0]}/${patient.dob.split("/")[1]}/2030</span></div></div></body></html>`;
                  const win = window.open("", "_blank"); if (!win) return; win.document.write(html); win.document.close(); setTimeout(() => win.print(), 400);
                }}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "5px 10px", borderRadius: 6, border: "1px solid rgba(30,64,175,0.2)",
                  background: "rgba(30,64,175,0.08)", color: "#60a5fa",
                  fontSize: "0.72rem", fontWeight: 700, cursor: "pointer", marginTop: 4,
                }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2" /><circle cx="8" cy="12" r="2" /><line x1="14" y1="10" x2="20" y2="10" /><line x1="14" y1="14" x2="18" y2="14" />
                </svg>
                Driver's License
              </button>
            </CopyableCard>

            {/* Insurance */}
            <CopyableCard title="Insurance" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>}
              copyText={`Plan: ${patient.insurance}\nMember ID: ${patient.memberId}\nGroup: ${patient.groupNumber}${patient.priorAuth ? `\nPrior Auth: ${patient.priorAuth}` : ""}`}>
              <InfoRow label="Plan" value={patient.insurance} />
              <InfoRow label="Member ID" value={patient.memberId} />
              <InfoRow label="Group Number" value={patient.groupNumber} />
              {patient.priorAuth && <InfoRow label="Prior Auth #" value={patient.priorAuth} />}
              {patient.priorAuthExpiration && <InfoRow label="Auth Expires" value={patient.priorAuthExpiration} />}
              <InfoRow label="Provider" value={patient.provider} />
              <InfoRow label="Referred By" value={patient.referredBy} />
              {patient.copayAmount && <InfoRow label="Copay" value={`$${patient.copayAmount}`} />}
              {patient.deductible && <InfoRow label="Deductible" value={patient.deductible} />}
              {patient.subscriberRelationship && patient.subscriberRelationship !== "Self" && (
                <>
                  <div style={{ borderTop: "1px solid rgba(99,102,241,0.1)", margin: "8px 0 4px" }} />
                  <InfoRow label="Subscriber" value={patient.subscriberName || "—"} />
                  {patient.subscriberDob && <InfoRow label="Subscriber DOB" value={patient.subscriberDob} />}
                  <InfoRow label="Relationship" value={patient.subscriberRelationship} />
                </>
              )}
              <div style={{ borderTop: "1px solid rgba(99,102,241,0.1)", margin: "8px 0 4px" }} />
              <button
                onClick={() => generateInsuranceCardPDF(patient)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "5px 10px", borderRadius: 6, border: "1px solid rgba(99,102,241,0.2)",
                  background: "rgba(99,102,241,0.08)", color: "#818cf8",
                  fontSize: "0.72rem", fontWeight: 700, cursor: "pointer", marginTop: 4,
                }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
                </svg>
                Insurance Card
              </button>
            </CopyableCard>

            {/* Medical History */}
            <CopyableCard title="Medical History" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>}
              copyText={`Allergies: ${patient.allergies.length > 0 ? patient.allergies.join(", ") : "None"}\nMedications: ${patient.medications.length > 0 ? patient.medications.join(", ") : "None"}`}>
              <InfoRow
                label="Allergies"
                value={patient.allergies.length > 0 ? patient.allergies.join(", ") : "None reported"}
                warn={patient.allergies.length > 0}
              />
              {patient.smokingStatus && <InfoRow label="Smoking" value={patient.smokingStatus} warn={patient.smokingStatus !== "Never"} />}
              {patient.bmi && <InfoRow label="BMI" value={patient.bmi} />}
              {patient.bloodType && <InfoRow label="Blood Type" value={patient.bloodType} />}
              {patient.implantedDevices && <InfoRow label="Implants" value={patient.implantedDevices} />}
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: "0.75rem", color: "#5a5a6e", fontWeight: 600, marginBottom: 4 }}>
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
            </CopyableCard>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Consent & Signatures Section (at bottom) ───────────────────────
function ConsentSection({ patient }: { patient: Patient }) {
  const [open, setOpen] = useState(false);

  const totalSigned = [patient.aobSigned, patient.roiSigned, patient.hipaaSigned, patient.financialSigned, patient.surgicalConsentSigned].filter(Boolean).length;

  return (
    <div className="dz-card" style={{ padding: 0, overflow: "hidden", marginTop: 24 }}>
      <CollapsibleHeader
        title="Consent & Signatures"
        icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>}
        count={totalSigned}
        countLabel={`of 5 signed`}
        open={open}
        onToggle={() => setOpen(!open)}
      />
      {open && (
        <div style={{ padding: "16px 20px" }}>
          <SignatureRow label="Assignment of Benefits" signed={patient.aobSigned} date={patient.aobDate} />
          <SignatureRow label="Release of Information" signed={patient.roiSigned} date={patient.roiDate} />
          <SignatureRow label="HIPAA Privacy Notice" signed={patient.hipaaSigned ?? false} date={patient.hipaaDate} />
          <SignatureRow label="Financial Responsibility" signed={patient.financialSigned ?? false} date={patient.financialDate} />
          <SignatureRow label="Surgical Consent" signed={patient.surgicalConsentSigned ?? false} date={patient.surgicalConsentDate} />
        </div>
      )}
    </div>
  );
}

// ── Copyable Card Wrapper ──────────────────────────────────────────
function CopyableCard({ title, icon, copyText, children }: {
  title: string; icon: React.ReactNode; copyText: string; children: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(copyText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <div className="dz-card dz-card-copyable" style={{ position: "relative" }}>
      <div className="dz-card-title" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {icon}
          {title}
        </div>
        <button
          onClick={handleCopy}
          className="dz-copy-btn"
          title="Copy card info"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 26, height: 26, borderRadius: 6, border: "none",
            background: copied ? "rgba(34,197,94,0.15)" : "rgba(99,102,241,0.1)",
            color: copied ? "#22c55e" : "#818cf8",
            cursor: "pointer", opacity: 0, transition: "opacity 0.15s",
          }}
        >
          {copied ? (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          )}
        </button>
      </div>
      {children}
    </div>
  );
}

// ── Signature Row ──────────────────────────────────────────────────
function SignatureRow({ label, signed, date }: { label: string; signed: boolean; date?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0" }}>
      <span style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 600 }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {signed ? (
          <>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 6, fontSize: "0.72rem", fontWeight: 700, background: "rgba(34,197,94,0.12)", color: "#22c55e" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Signed
            </span>
            {date && <span style={{ fontSize: "0.72rem", color: "#64748b" }}>{date}</span>}
          </>
        ) : (
          <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 6, fontSize: "0.72rem", fontWeight: 700, background: "rgba(239,68,68,0.12)", color: "#f87171" }}>
            Missing
          </span>
        )}
      </div>
    </div>
  );
}

// ── Generate Invoice PDF ────────────────────────────────────────────
function generateInvoicePDF(inv: Patient["invoices"][0], patient: Patient) {
  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Invoice ${inv.id} — ${patient.name}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  @page { size: letter; margin: 0.6in; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 9.5pt; color: #1a1a2e; line-height: 1.45; padding: 0.6in; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #6366f1; }
  .header-left h1 { font-size: 18pt; font-weight: 800; color: #6366f1; margin-bottom: 2px; }
  .header-left p { font-size: 8.5pt; color: #64748b; }
  .header-right { text-align: right; font-size: 8.5pt; color: #475569; }
  .header-right .inv-id { font-size: 13pt; font-weight: 700; color: #1a1a2e; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
  .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px; }
  .info-box h3 { font-size: 7pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #6366f1; margin-bottom: 8px; }
  .info-row { display: flex; justify-content: space-between; margin-bottom: 3px; }
  .info-label { color: #64748b; font-size: 8.5pt; }
  .info-value { font-weight: 600; font-size: 8.5pt; color: #1e293b; }
  .section { margin-bottom: 18px; }
  .section h2 { font-size: 9pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #6366f1; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #e2e8f0; }
  table { width: 100%; border-collapse: collapse; font-size: 8.5pt; }
  th { background: #f1f5f9; text-align: left; padding: 7px 10px; font-weight: 700; font-size: 7.5pt; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; border-bottom: 1px solid #e2e8f0; }
  td { padding: 7px 10px; border-bottom: 1px solid #f1f5f9; color: #334155; }
  .money { font-family: 'SF Mono', Consolas, monospace; font-weight: 600; text-align: right; }
  .total-row td { border-top: 2px solid #1e293b; font-weight: 800; font-size: 10pt; background: #f8fafc; }
  .status { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 8pt; font-weight: 700; }
  .status-paid { background: #d1fae5; color: #059669; }
  .status-pending { background: #fef3c7; color: #d97706; }
  .status-overdue { background: #fee2e2; color: #dc2626; }
  .status-processing { background: #e0e7ff; color: #4f46e5; }
  .footer { margin-top: 30px; padding-top: 12px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 7.5pt; color: #94a3b8; }
  @media print { body { padding: 0; } }
</style></head><body>
  <div class="header">
    <div class="header-left">
      <h1>DocZoc</h1>
      <p>Orthopedic Surgery & Sports Medicine</p>
      <p>1155 Park Avenue, New York, NY 10128</p>
    </div>
    <div class="header-right">
      <div class="inv-id">${inv.id}</div>
      <p>Date: ${inv.date}</p>
      <p>Status: <span class="status status-${inv.status.toLowerCase().replace(/ /g, "-")}">${inv.status}</span></p>
      ${inv.claimId ? `<p>Claim: ${inv.claimId}</p>` : ""}
    </div>
  </div>
  <div class="info-grid">
    <div class="info-box">
      <h3>Patient Information</h3>
      <div class="info-row"><span class="info-label">Name</span><span class="info-value">${patient.name}</span></div>
      <div class="info-row"><span class="info-label">DOB</span><span class="info-value">${patient.dob}</span></div>
      <div class="info-row"><span class="info-label">Member ID</span><span class="info-value">${patient.memberId}</span></div>
    </div>
    <div class="info-box">
      <h3>Insurance</h3>
      <div class="info-row"><span class="info-label">Plan</span><span class="info-value">${patient.insurance}</span></div>
      <div class="info-row"><span class="info-label">Group</span><span class="info-value">${patient.groupNumber}</span></div>
      <div class="info-row"><span class="info-label">Provider</span><span class="info-value">${patient.provider}</span></div>
    </div>
  </div>
  <div class="section">
    <h2>Invoice Details</h2>
    <table>
      <thead><tr><th>Description</th><th style="text-align:right">Charged</th><th style="text-align:right">Insurance Paid</th><th style="text-align:right">Deductible</th><th style="text-align:right">Copay</th><th style="text-align:right">Patient Owes</th></tr></thead>
      <tbody>
        <tr>
          <td>${inv.description}</td>
          <td class="money">$${inv.totalCharged.toFixed(2)}</td>
          <td class="money" style="color:#059669">$${inv.insurancePaid.toFixed(2)}</td>
          <td class="money">$${inv.deductibleApplied.toFixed(2)}</td>
          <td class="money">$${inv.copay.toFixed(2)}</td>
          <td class="money" style="font-weight:800">$${inv.patientOwes.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class="footer">
    <span>DocZoc Medical Billing &middot; 1155 Park Avenue, New York, NY 10128</span>
    <span>Phone: (212) 828-3838</span>
  </div>
</body></html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  setTimeout(() => win.print(), 400);
}

// ── Generate Insurance Card PDF ────────────────────────────────────
function generateInsuranceCardPDF(patient: Patient) {
  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Insurance Card — ${patient.name}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  @page { size: landscape; margin: 0.5in; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 0.5in; display: flex; flex-direction: column; gap: 24px; }
  .card { width: 500px; border: 2px solid #6366f1; border-radius: 12px; padding: 24px; background: linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%); }
  .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #c7d2fe; }
  .card-header h2 { font-size: 14pt; color: #4f46e5; }
  .card-header .type { font-size: 8pt; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700; }
  .row { display: flex; justify-content: space-between; margin-bottom: 6px; }
  .label { font-size: 8pt; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
  .value { font-size: 10pt; color: #1e293b; font-weight: 700; }
  .back { margin-top: 12px; }
  @media print { body { padding: 0; } }
</style></head><body>
  <div class="card">
    <div class="card-header">
      <h2>${patient.insurance}</h2>
      <span class="type">Front of Card</span>
    </div>
    <div class="row"><span class="label">Member Name</span><span class="value">${patient.name}</span></div>
    <div class="row"><span class="label">Member ID</span><span class="value">${patient.memberId}</span></div>
    <div class="row"><span class="label">Group Number</span><span class="value">${patient.groupNumber}</span></div>
    <div class="row"><span class="label">Plan Type</span><span class="value">PPO</span></div>
    <div class="row"><span class="label">Effective Date</span><span class="value">Jan 01, 2026</span></div>
  </div>
  <div class="card back">
    <div class="card-header">
      <h2>${patient.insurance}</h2>
      <span class="type">Back of Card</span>
    </div>
    <div class="row"><span class="label">Copay — Office Visit</span><span class="value">$40.00</span></div>
    <div class="row"><span class="label">Copay — Specialist</span><span class="value">$60.00</span></div>
    <div class="row"><span class="label">Deductible</span><span class="value">$1,500.00</span></div>
    <div class="row"><span class="label">Out-of-Pocket Max</span><span class="value">$6,000.00</span></div>
    <div class="row"><span class="label">Claims Address</span><span class="value">P.O. Box 981106, El Paso, TX 79998</span></div>
    <div class="row"><span class="label">Customer Service</span><span class="value">1-800-555-0199</span></div>
  </div>
</body></html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  setTimeout(() => win.print(), 400);
}

// ── Collapsible Section Header ─────────────────────────────────────
function CollapsibleHeader({ title, icon, count, countLabel, open, onToggle }: {
  title: string; icon: React.ReactNode; count: number; countLabel: string;
  open: boolean; onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      style={{
        padding: "16px 20px", borderBottom: open ? "1px solid rgba(99,102,241,0.1)" : "none",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        width: "100%", background: "none", border: "none", cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {icon}
        <span className="dz-text-primary" style={{ fontWeight: 700, fontSize: "0.88rem" }}>{title}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span className="dz-text-muted" style={{ fontSize: "0.72rem", fontWeight: 600 }}>{count} {countLabel}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </button>
  );
}

// ── Invoices Section ───────────────────────────────────────────────
function InvoicesSection({ patient }: { patient: Patient }) {
  const [open, setOpen] = useState(false);
  const totalCharged = patient.invoices.reduce((s, i) => s + i.totalCharged, 0);
  const totalInsurancePaid = patient.invoices.reduce((s, i) => s + i.insurancePaid, 0);
  const totalPatientOwes = patient.invoices.reduce((s, i) => s + i.patientOwes, 0);

  return (
    <div className="dz-card" style={{ padding: 0, overflow: "hidden", marginBottom: 24 }}>
      <CollapsibleHeader
        title="Invoices"
        icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="18" rx="2" /><line x1="2" y1="7" x2="22" y2="7" /><line x1="2" y1="11" x2="22" y2="11" /></svg>}
        count={patient.invoices.length}
        countLabel="invoices"
        open={open}
        onToggle={() => setOpen(!open)}
      />
      {open && (
        <div style={{ padding: "16px 20px" }}>
          {/* Invoice document cards row */}
          <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
            {patient.invoices.map((inv) => {
              const isPaid = inv.status === "Paid";
              const isOverdue = inv.status === "Overdue";
              const statusColor = isPaid ? "#22c55e" : isOverdue ? "#ef4444" : "#f59e0b";
              const statusLabel = isPaid ? "Paid" : isOverdue ? "Outstanding" : inv.status === "Insurance Processing" ? "Processing" : "Outstanding";
              return (
                <button
                  key={inv.id}
                  onClick={() => generateInvoicePDF(inv, patient)}
                  style={{
                    flexShrink: 0, width: 160, padding: "16px 14px",
                    borderRadius: 12, border: `1px solid ${statusColor}22`,
                    background: `${statusColor}06`, cursor: "pointer",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                    transition: "all 0.15s", textAlign: "center",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${statusColor}44`; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${statusColor}22`; e.currentTarget.style.transform = "translateY(0)"; }}
                  title={`View ${inv.id} PDF`}
                >
                  {/* PDF icon */}
                  <div style={{
                    width: 40, height: 48, borderRadius: 6, position: "relative",
                    background: `${statusColor}12`, border: `1px solid ${statusColor}20`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={statusColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                    </svg>
                    {/* Corner fold */}
                    <div style={{
                      position: "absolute", top: 0, right: 0, width: 12, height: 12,
                      borderBottomLeft: `1px solid ${statusColor}30`,
                      background: `linear-gradient(135deg, transparent 50%, ${statusColor}15 50%)`,
                      borderRadius: "0 6px 0 0",
                    }} />
                  </div>

                  {/* Invoice ID */}
                  <div style={{
                    fontSize: "0.72rem", fontWeight: 700,
                    fontFamily: "'SF Mono', Consolas, monospace",
                    color: "#a5b4fc",
                  }}>{inv.id}</div>

                  {/* Amount */}
                  <div style={{
                    fontSize: "0.88rem", fontWeight: 800,
                    fontFamily: "'SF Mono', Consolas, monospace",
                    color: "#e2e8f0",
                  }}>${inv.totalCharged.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>

                  {/* Status badge */}
                  <span style={{
                    fontSize: "0.65rem", fontWeight: 700, padding: "2px 10px", borderRadius: 20,
                    background: `${statusColor}18`, color: statusColor,
                  }}>
                    {statusLabel}
                  </span>

                  {/* Date */}
                  <div style={{ fontSize: "0.68rem", color: "#64748b" }}>{inv.date}</div>
                </button>
              );
            })}
          </div>

          {/* Totals bar */}
          <div style={{
            display: "flex", justifyContent: "flex-end", gap: 32, flexWrap: "wrap",
            marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(99,102,241,0.1)",
          }}>
            <div style={{ textAlign: "right" }}>
              <div className="dz-text-muted" style={{ fontSize: "0.72rem", fontWeight: 600 }}>Total Charged</div>
              <div style={{ fontSize: "1rem", fontWeight: 800, fontFamily: "'SF Mono', Consolas, monospace" }}>
                ${totalCharged.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="dz-text-muted" style={{ fontSize: "0.72rem", fontWeight: 600 }}>Insurance Paid</div>
              <div style={{ fontSize: "1rem", fontWeight: 800, fontFamily: "'SF Mono', Consolas, monospace", color: "#22c55e" }}>
                ${totalInsurancePaid.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="dz-text-muted" style={{ fontSize: "0.72rem", fontWeight: 600 }}>Patient Owes</div>
              <div style={{ fontSize: "1rem", fontWeight: 800, fontFamily: "'SF Mono', Consolas, monospace", color: "#f59e0b" }}>
                ${totalPatientOwes.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Documents Section ──────────────────────────────────────────────
function DocumentsSection({ patient }: { patient: Patient }) {
  const [open, setOpen] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [dragOver, setDragOver] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<{ name: string; size: string; date: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const builtInDocs = [
    { name: "Insurance Card", type: "insurance", icon: "card", color: "#6366f1", onClick: () => generateInsuranceCardPDF(patient) },
    ...patient.invoices.map((inv) => ({
      name: `Invoice ${inv.id}`, type: "invoice", icon: "invoice", color: inv.status === "Paid" ? "#22c55e" : inv.status === "Overdue" ? "#f87171" : "#fbbf24",
      onClick: () => generateInvoicePDF(inv, patient),
    })),
    ...(patient.aobSigned ? [{ name: "Assignment of Benefits", type: "signature", icon: "sig", color: "#22c55e", onClick: () => {} }] : []),
    ...(patient.roiSigned ? [{ name: "Release of Information", type: "signature", icon: "sig", color: "#22c55e", onClick: () => {} }] : []),
  ];

  const totalDocs = builtInDocs.length + uploadedDocs.length;

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    const newDocs = files.map((f) => ({
      name: f.name,
      size: f.size < 1024 * 1024 ? `${(f.size / 1024).toFixed(0)} KB` : `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    }));
    setUploadedDocs((prev) => [...prev, ...newDocs]);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newDocs = files.map((f) => ({
      name: f.name,
      size: f.size < 1024 * 1024 ? `${(f.size / 1024).toFixed(0)} KB` : `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    }));
    setUploadedDocs((prev) => [...prev, ...newDocs]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const docIcon = (type: string) => {
    if (type === "card") return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>;
    if (type === "invoice") return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>;
    if (type === "sig") return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
    return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>;
  };

  const allDocs = [
    ...builtInDocs.map(d => ({ ...d, size: "", date: "" })),
    ...uploadedDocs.map(d => ({ name: d.name, type: "file", icon: "file", color: "#a78bfa", onClick: () => {}, size: d.size, date: d.date })),
  ];

  return (
    <div className="dz-card" style={{ padding: 0, overflow: "hidden", marginBottom: 24 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          padding: "16px 20px", borderBottom: open ? "1px solid rgba(99,102,241,0.1)" : "none",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          width: "100%", background: "none", border: "none", cursor: "pointer",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
          <span className="dz-text-primary" style={{ fontWeight: 700, fontSize: "0.88rem" }}>Documents</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* View toggle buttons */}
          {open && (
            <div style={{ display: "flex", gap: 2, marginRight: 8 }} onClick={e => e.stopPropagation()}>
              <button onClick={() => setViewMode("grid")} style={{
                padding: "4px 6px", borderRadius: "4px 0 0 4px", border: "none", cursor: "pointer",
                background: viewMode === "grid" ? "rgba(99,102,241,0.15)" : "rgba(148,163,184,0.06)",
                color: viewMode === "grid" ? "#818cf8" : "#64748b",
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
              </button>
              <button onClick={() => setViewMode("list")} style={{
                padding: "4px 6px", borderRadius: "0 4px 4px 0", border: "none", cursor: "pointer",
                background: viewMode === "list" ? "rgba(99,102,241,0.15)" : "rgba(148,163,184,0.06)",
                color: viewMode === "list" ? "#818cf8" : "#64748b",
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
              </button>
            </div>
          )}
          <span className="dz-text-muted" style={{ fontSize: "0.72rem", fontWeight: 600 }}>{totalDocs} documents</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>
      {open && (
        <div style={{ display: "flex", gap: 0 }}>
          {/* Left: Grid or drag zone */}
          <div style={{ flex: 1, padding: "16px 20px", borderRight: viewMode === "list" ? "1px solid rgba(99,102,241,0.08)" : "none" }}>
            {viewMode === "grid" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10, marginBottom: 16 }}>
                {builtInDocs.map((doc, i) => (
                  <button
                    key={i}
                    onClick={doc.onClick}
                    style={{
                      display: "flex", alignItems: "center", gap: 10, padding: "12px 14px",
                      borderRadius: 10, border: "1px solid rgba(99,102,241,0.12)",
                      background: "rgba(99,102,241,0.04)", cursor: "pointer",
                      textAlign: "left", width: "100%", transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)"; e.currentTarget.style.background = "rgba(99,102,241,0.08)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(99,102,241,0.12)"; e.currentTarget.style.background = "rgba(99,102,241,0.04)"; }}
                    title={`View ${doc.name} PDF`}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: `${doc.color}18`, color: doc.color }}>
                      {docIcon(doc.icon)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#e4e4ee", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{doc.name}</div>
                      <div style={{ fontSize: "0.68rem", color: "#64748b" }}>PDF</div>
                    </div>
                  </button>
                ))}
                {uploadedDocs.map((doc, i) => (
                  <div key={`upload-${i}`} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 10, border: "1px solid rgba(99,102,241,0.12)", background: "rgba(99,102,241,0.04)" }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(167,139,250,0.15)", color: "#a78bfa" }}>{docIcon("file")}</div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#e4e4ee", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{doc.name}</div>
                      <div style={{ fontSize: "0.68rem", color: "#64748b" }}>{doc.size} &middot; {doc.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Drag-and-drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${dragOver ? "#818cf8" : "rgba(99,102,241,0.2)"}`,
                borderRadius: 10, padding: viewMode === "list" ? "16px 20px" : "24px 20px", textAlign: "center",
                cursor: "pointer", transition: "all 0.2s",
                background: dragOver ? "rgba(99,102,241,0.08)" : "transparent",
              }}
            >
              <input ref={fileInputRef} type="file" multiple onChange={handleFileInput} style={{ display: "none" }} />
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={dragOver ? "#818cf8" : "#64748b"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 8 }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <div style={{ fontSize: "0.82rem", fontWeight: 600, color: dragOver ? "#818cf8" : "#94a3b8" }}>
                Drag & drop files here or click to upload
              </div>
              <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: 4 }}>PDF, images, or documents</div>
            </div>
          </div>

          {/* Right: List view */}
          {viewMode === "list" && (
            <div style={{ width: 300, padding: "12px 16px", overflowY: "auto", maxHeight: 400 }}>
              <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>All Documents</div>
              {allDocs.map((doc, i) => (
                <button
                  key={i}
                  onClick={doc.onClick}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
                    borderRadius: 8, border: "none", width: "100%", textAlign: "left",
                    background: "transparent", cursor: "pointer", transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(99,102,241,0.06)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  <div style={{ width: 28, height: 28, borderRadius: 6, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: `${doc.color}15`, color: doc.color }}>
                    {docIcon(doc.icon)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#e2e8f0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{doc.name}</div>
                    <div style={{ fontSize: "0.65rem", color: "#64748b" }}>{doc.size || "PDF"}{doc.date ? ` · ${doc.date}` : ""}</div>
                  </div>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Timeline Section ───────────────────────────────────────────────
function TimelineSection({ events }: { events: TimelineEvent[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="dz-card" style={{ padding: 0, overflow: "hidden" }}>
      <CollapsibleHeader
        title="Timeline"
        icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>}
        count={events.length}
        countLabel="events"
        open={open}
        onToggle={() => setOpen(!open)}
      />
      {open && (
        <div style={{ padding: "0 20px 20px" }}>
          {events.map((event, i) => {
            const isLast = i === events.length - 1;
            return (
              <div
                key={i}
                style={{
                  position: "relative",
                  paddingLeft: 36,
                  paddingTop: 20,
                }}
              >
                {!isLast && (
                  <div style={{
                    position: "absolute", left: 11, top: 40, bottom: -20,
                    width: 2, background: "rgba(99,102,241,0.12)",
                  }} />
                )}
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
      )}
    </div>
  );
}

function InfoRow({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "4px 0" }}>
      <span style={{ fontSize: "0.75rem", color: "#5a5a6e", fontWeight: 600 }}>
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
