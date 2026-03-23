import { useState } from "react";
import { Sidebar, useDzPrefs } from "./doczoc-dashboard";
import { PlatformBg } from "~/components/PlatformBg";

export function meta() {
  return [{ title: "RCM Pipeline | DocZoc" }];
}

type Step = 1 | 2 | 3 | 4 | 5 | 6;

const STEPS: { id: Step; title: string; subtitle: string; timeline: string; color: string; icon: React.ReactNode }[] = [
  {
    id: 1, title: "Clearinghouse Scrub", subtitle: "Format validation & rule checks", timeline: "0–48 Hours", color: "#6366f1",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  },
  {
    id: 2, title: "Payer Adjudication", subtitle: "Insurance review & fee schedules", timeline: "14–30 Days", color: "#a78bfa",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,
  },
  {
    id: 3, title: "ERA & Payment Posting", subtitle: "Automatic remittance processing", timeline: "1–3 Days", color: "#22c55e",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  },
  {
    id: 4, title: "Denial Management", subtitle: "Appeals & documentation defense", timeline: "As Needed", color: "#ef4444",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  },
  {
    id: 5, title: "Patient Billing", subtitle: "Deductibles, copays & statements", timeline: "Ongoing", color: "#f59e0b",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/></svg>,
  },
  {
    id: 6, title: "Account Close Out", subtitle: "Ledger balanced to $0.00", timeline: "Final", color: "#22d3ee",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  },
];

const STEP_DETAILS: Record<Step, { description: string; action: string; outcome: string; items: { label: string; status: string }[] }> = {
  1: {
    description: "Before the claim reaches the insurance company, the clearinghouse acts as the first gatekeeper, running automated checks against millions of coding rules.",
    action: "The clearinghouse validates formatting, NPI numbers, patient demographics, and coding combinations.",
    outcome: "Claims are either Accepted (forwarded to payer) or Rejected (returned for correction).",
    items: [
      { label: "James Kim — ACL Reconstruction (29888)", status: "Accepted" },
      { label: "David Ross — Hip Arthroplasty (27130)", status: "Pending" },
      { label: "Sarah Mitchell — Rotator Cuff (29827)", status: "Accepted" },
    ],
  },
  2: {
    description: "The insurance company verifies coverage, checks prior authorizations, applies fee schedules, and runs NCCI edits to scrutinize modifiers (-59, -RT).",
    action: "Payer reviews active coverage, prior auth, fee schedules, and modifier accuracy.",
    outcome: "Claims are Paid, Denied, or Pended (requesting medical records/operative report).",
    items: [
      { label: "Sarah Mitchell — Follow-up Visit", status: "Paid" },
      { label: "James Kim — ACL Reconstruction", status: "In Review" },
      { label: "Emily Chen — Wrist Eval", status: "Paid" },
    ],
  },
  3: {
    description: "The payer transmits an Electronic Remittance Advice (ERA) back to the software — a digital receipt detailing payment per CPT code.",
    action: "System automatically reads ERA data and posts payments to patient ledgers.",
    outcome: "Payments are reconciled without manual data entry.",
    items: [
      { label: "ERA #8847201 — Sarah Mitchell", status: "Posted" },
      { label: "ERA #8847199 — Emily Chen", status: "Posted" },
      { label: "ERA #8847195 — Michael Brown", status: "Queued" },
    ],
  },
  4: {
    description: "When insurance denies a line item (e.g., bundling despite a -59 modifier), the biller reviews the denial reason code and prepares an appeal.",
    action: "Pull the operative report, highlight distinct anatomical compartments, submit formal written appeal.",
    outcome: "Payer overturns denial or provides detailed explanation for upholding.",
    items: [
      { label: "David Ross — Code 29881 Bundled", status: "Appeal Filed" },
      { label: "James Kim — Missing Auth", status: "Resolved" },
    ],
  },
  5: {
    description: "Insurance rarely pays 100%. The remaining balance (deductible, coinsurance, copay) shifts to the patient based on the ERA.",
    action: "System calculates patient responsibility and sends digital statements via email, SMS, or patient portal.",
    outcome: "Patient receives clear, itemized statement with integrated payment options.",
    items: [
      { label: "Sarah Mitchell — $45.00 Copay", status: "Sent" },
      { label: "Emily Chen — $120.00 Deductible", status: "Paid" },
      { label: "Michael Brown — $85.00 Coinsurance", status: "Pending" },
    ],
  },
  6: {
    description: "The lifecycle of the claim ends when the patient pays their remaining balance and the ledger hits exactly $0.00.",
    action: "Patient pays via integrated payment gateway.",
    outcome: "Encounter is automatically marked as 'Closed' or 'Settled' — revenue cycle complete.",
    items: [
      { label: "Sarah Mitchell — Encounter #4021", status: "Closed" },
      { label: "Emily Chen — Encounter #4019", status: "Closed" },
      { label: "David Ross — Encounter #4015", status: "Open" },
    ],
  },
};

function statusBadgeColor(status: string) {
  switch (status) {
    case "Accepted": case "Paid": case "Posted": case "Closed": case "Resolved":
      return { bg: "rgba(34,197,94,0.12)", color: "#22c55e" };
    case "Pending": case "In Review": case "Queued": case "Sent":
      return { bg: "rgba(251,191,36,0.12)", color: "#fbbf24" };
    case "Appeal Filed":
      return { bg: "rgba(239,68,68,0.12)", color: "#f87171" };
    case "Open":
      return { bg: "rgba(99,102,241,0.12)", color: "#818cf8" };
    default:
      return { bg: "rgba(148,163,184,0.12)", color: "#94a3b8" };
  }
}

export default function RcmPage() {
  const [collapsed, setCollapsed] = useState(false);
  const { bgId } = useDzPrefs();
  const [activeStep, setActiveStep] = useState<Step>(1);

  const step = STEPS.find(s => s.id === activeStep)!;
  const detail = STEP_DETAILS[activeStep];

  return (
    <div className="dz-platform">
      <PlatformBg bgId={bgId} />
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className={`dz-platform-main${collapsed ? " dz-main-expanded" : ""}`}>
        <header className="dz-platform-header">
          <div>
            <h1>RCM Pipeline</h1>
            <p>Revenue Cycle Management — claim to close-out</p>
          </div>
        </header>

        {/* Pipeline steps */}
        <div className="dz-rcm-pipeline">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              className={`dz-rcm-step${activeStep === s.id ? " dz-rcm-step-active" : ""}`}
              onClick={() => setActiveStep(s.id)}
              style={{ "--step-color": s.color } as React.CSSProperties}
            >
              <div className="dz-rcm-step-num">{s.id}</div>
              <div className="dz-rcm-step-info">
                <div className="dz-rcm-step-title">{s.title}</div>
                <div className="dz-rcm-step-timeline">{s.timeline}</div>
              </div>
              {i < STEPS.length - 1 && <div className="dz-rcm-step-arrow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
              </div>}
            </button>
          ))}
        </div>

        {/* Step detail */}
        <div className="dz-rcm-detail">
          <div className="dz-rcm-detail-header" style={{ borderColor: `${step.color}30` }}>
            <div className="dz-rcm-detail-icon" style={{ background: `${step.color}18`, color: step.color }}>
              {step.icon}
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "#f1f5f9" }}>
                Step {step.id}: {step.title}
              </h2>
              <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "#94a3b8" }}>{step.subtitle}</p>
            </div>
            <span className="dz-rcm-timeline-badge" style={{ background: `${step.color}18`, color: step.color }}>
              {step.timeline}
            </span>
          </div>

          <div className="dz-rcm-detail-body">
            <p style={{ fontSize: "0.9rem", color: "#cbd5e1", lineHeight: 1.7, margin: "0 0 20px" }}>
              {detail.description}
            </p>

            <div className="dz-rcm-detail-grid">
              <div className="dz-rcm-info-card">
                <div className="dz-rcm-info-label">Action</div>
                <p className="dz-rcm-info-text">{detail.action}</p>
              </div>
              <div className="dz-rcm-info-card">
                <div className="dz-rcm-info-label">Outcome</div>
                <p className="dz-rcm-info-text">{detail.outcome}</p>
              </div>
            </div>

            <div style={{ marginTop: 24 }}>
              <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 12 }}>
                Active Items
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {detail.items.map((item, i) => {
                  const sc = statusBadgeColor(item.status);
                  return (
                    <div key={i} className="dz-rcm-item">
                      <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "#e2e8f0" }}>{item.label}</span>
                      <span style={{ padding: "3px 12px", borderRadius: 8, fontSize: "0.72rem", fontWeight: 700, background: sc.bg, color: sc.color }}>{item.status}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
