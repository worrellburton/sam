import { useState } from "react";
import { Sidebar, useDzPrefs } from "./doczoc-dashboard";
import { PlatformBg } from "~/components/PlatformBg";

export function meta() {
  return [{ title: "RCM Pipeline | DocZoc" }];
}

type Step = 1 | 2 | 3 | 4 | 5 | 6;

interface Claim {
  id: number;
  patient: string;
  procedure: string;
  cpt: string;
  amount: string;
  payer: string;
  step: Step;
}

const COLUMNS: { id: Step; title: string; color: string; timeline: string }[] = [
  { id: 1, title: "Clearinghouse", color: "#6366f1", timeline: "0–48h" },
  { id: 2, title: "Adjudication", color: "#a78bfa", timeline: "14–30d" },
  { id: 3, title: "ERA Posting", color: "#22c55e", timeline: "1–3d" },
  { id: 4, title: "Denials", color: "#ef4444", timeline: "As needed" },
  { id: 5, title: "Patient Billing", color: "#f59e0b", timeline: "Ongoing" },
  { id: 6, title: "Closed", color: "#22d3ee", timeline: "Final" },
];

const STEP_INFO: Record<Step, { fullTitle: string; description: string; whatHappens: string[]; keyTerms: { term: string; def: string }[]; automations: string[] }> = {
  1: {
    fullTitle: "Clearinghouse Scrub",
    description: "Before the claim reaches the insurance company, the clearinghouse acts as the first gatekeeper. It runs automated checks against millions of coding rules to catch errors before submission.",
    whatHappens: [
      "Claim is transmitted from your billing system to the clearinghouse",
      "Automated validation checks NPI numbers, patient demographics, and coding combinations",
      "Formatting is verified against ANSI X12 837 standards",
      "Claims are either Accepted (forwarded to payer) or Rejected (returned for correction)",
    ],
    keyTerms: [
      { term: "Rejection", def: "NOT the same as a denial. Means a formatting error (missing NPI, blank DOB). Fix the typo and resend immediately." },
      { term: "Clean Claim", def: "A claim that passes all clearinghouse edits and is forwarded to the payer without errors." },
      { term: "837P/837I", def: "The electronic claim file formats — Professional (physician) and Institutional (facility)." },
    ],
    automations: [
      "Auto-flag rejected claims with specific error codes",
      "One-click correction and resubmission",
      "Real-time tracking of claim acceptance status",
    ],
  },
  2: {
    fullTitle: "Payer Adjudication",
    description: "Once the insurance company receives the clean claim, it goes through their internal review engine. This is where the payer decides what they will pay based on the patient's plan, your contract, and coding accuracy.",
    whatHappens: [
      "Payer verifies the patient's active coverage and eligibility",
      "Checks for required prior authorizations",
      "Applies their contracted fee schedules to each CPT code",
      "Runs NCCI edits — scrutinizing modifiers like -59 and -RT",
      "Claim is either Paid, Denied, or Pended (requesting medical records)",
    ],
    keyTerms: [
      { term: "NCCI Edits", def: "National Correct Coding Initiative — rules that prevent improper code pairs from being billed together." },
      { term: "Pended", def: "The payer is requesting additional documentation (like an Operative Report) to prove medical necessity before paying." },
      { term: "Fee Schedule", def: "The contracted rate between your practice and the insurance company for each procedure code." },
    ],
    automations: [
      "Track adjudication timelines per payer",
      "Alert when claims exceed expected processing windows",
      "Auto-attach operative reports for pended claims",
    ],
  },
  3: {
    fullTitle: "ERA & Payment Posting",
    description: "Once adjudication is complete, the insurance company sends the money and the receipt. The ERA (Electronic Remittance Advice) is the digital receipt detailing exactly what they paid for each CPT code.",
    whatHappens: [
      "Payer transmits ERA (835 file) back to your system",
      "ERA details payment amount per CPT code, adjustments, and patient responsibility",
      "System automatically reads ERA data and posts payments to the patient's ledger",
      "Contractual adjustments are applied (difference between billed and allowed amounts)",
    ],
    keyTerms: [
      { term: "ERA / 835", def: "Electronic Remittance Advice — the digital version of an Explanation of Benefits (EOB) sent directly to your software." },
      { term: "Contractual Adjustment", def: "The write-off between what you billed and what the insurance contract allows. This is normal and expected." },
      { term: "Auto-Posting", def: "The system reads ERA data and posts payments without manual entry, eliminating human error." },
    ],
    automations: [
      "Zero-touch payment posting from ERA data",
      "Automatic contractual adjustment calculations",
      "Exception flagging for underpayments vs. fee schedule",
    ],
  },
  4: {
    fullTitle: "Denial Management & Appeals",
    description: "If the insurance company denies a line item — for example, they bundle the debridement code despite your -59 modifier — the biller must step in to defend the claim with documentation.",
    whatHappens: [
      "Biller reviews the denial reason code on the ERA",
      "Identifies whether the denial is clinical (medical necessity) or technical (coding error)",
      "Pulls the Operative Report and highlights distinct anatomical compartments",
      "Submits a formal written appeal to force the payer to overturn the denial",
      "Tracks appeal deadlines (typically 60–180 days depending on payer)",
    ],
    keyTerms: [
      { term: "Denial Reason Code", def: "A standardized code (CARC/RARC) explaining exactly why the payer denied the claim." },
      { term: "Appeal", def: "A formal request to the payer to reconsider a denied claim, supported by medical documentation." },
      { term: "Timely Filing", def: "Each payer has a deadline for appeals. Miss it and the denial becomes permanent." },
    ],
    automations: [
      "Auto-categorize denials by reason code",
      "Generate appeal letter templates with claim details",
      "Track appeal deadlines with countdown alerts",
    ],
  },
  5: {
    fullTitle: "Patient Billing",
    description: "Insurance rarely pays 100% of the bill. Once the insurance portion is posted, the remaining balance shifts to the patient based on their plan's deductible, coinsurance, or copay amounts.",
    whatHappens: [
      "System calculates patient's exact responsibility from the ERA",
      "Deductibles, coinsurance, and copay amounts are determined",
      "Digital statement is generated and sent (email, SMS, or patient portal)",
      "Patient can view itemized charges and make payments online",
    ],
    keyTerms: [
      { term: "Deductible", def: "The amount the patient must pay out-of-pocket before insurance starts covering costs." },
      { term: "Coinsurance", def: "The percentage the patient pays after the deductible is met (e.g., patient pays 20%, insurance pays 80%)." },
      { term: "Copay", def: "A fixed amount the patient pays per visit, regardless of total charges." },
    ],
    automations: [
      "Auto-generate and send patient statements",
      "Payment plan setup with automated installment reminders",
      "Integrated payment gateway for online payments",
    ],
  },
  6: {
    fullTitle: "Account Close Out",
    description: "The lifecycle of the claim ends when the math balances out. The patient pays their remaining balance and the ledger for that specific surgical encounter hits exactly $0.00.",
    whatHappens: [
      "Patient pays remaining balance via the integrated payment gateway",
      "Payment is posted to the patient's account",
      "System verifies all insurance payments + patient payments = total allowed amount",
      "Encounter is automatically marked as 'Closed' or 'Settled'",
      "Revenue cycle for this encounter is complete",
    ],
    keyTerms: [
      { term: "Zero Balance", def: "The account has no remaining amount owed — all payments and adjustments equal the total charges." },
      { term: "Bad Debt", def: "Patient balance that remains unpaid after exhausting collection efforts. Must be written off." },
      { term: "Days in A/R", def: "Days in Accounts Receivable — a key metric measuring how long it takes to collect payment. Lower is better." },
    ],
    automations: [
      "Automatic account closure when balance reaches $0.00",
      "Aging reports for outstanding patient balances",
      "Integration with collection agencies for bad debt",
    ],
  },
};

const INITIAL_CLAIMS: Claim[] = [
  { id: 1, patient: "James Kim", procedure: "ACL Reconstruction", cpt: "29888", amount: "$8,450.00", payer: "Aetna", step: 1 },
  { id: 2, patient: "Sarah Mitchell", procedure: "Rotator Cuff Repair", cpt: "29827", amount: "$6,200.00", payer: "UnitedHealthcare", step: 2 },
  { id: 3, patient: "David Ross", procedure: "Total Hip Arthroplasty", cpt: "27130", amount: "$14,800.00", payer: "Blue Cross", step: 1 },
];

function StepInfoModal({ stepId, onClose, onNavigate }: { stepId: Step; onClose: () => void; onNavigate: (s: Step) => void }) {
  const col = COLUMNS.find(c => c.id === stepId)!;
  const info = STEP_INFO[stepId];

  return (
    <div className="dz-rcm-modal-overlay" onClick={onClose}>
      <div className="dz-rcm-modal" onClick={e => e.stopPropagation()}>
        <div className="dz-rcm-modal-header" style={{ borderBottomColor: `${col.color}30` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div className="dz-rcm-modal-num" style={{ background: `${col.color}20`, color: col.color }}>{stepId}</div>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 800, color: "#f1f5f9" }}>Step {stepId}: {info.fullTitle}</h2>
              <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "#64748b" }}>{col.timeline}</p>
            </div>
          </div>
          <button className="dz-rcm-modal-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="dz-rcm-modal-body">
          <p style={{ fontSize: "0.92rem", color: "#cbd5e1", lineHeight: 1.8, margin: "0 0 24px" }}>
            {info.description}
          </p>

          {/* What Happens */}
          <div className="dz-rcm-modal-section">
            <h3 className="dz-rcm-modal-section-title" style={{ color: col.color }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={col.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              What Happens
            </h3>
            <ol className="dz-rcm-modal-list">
              {info.whatHappens.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ol>
          </div>

          {/* Key Terms */}
          <div className="dz-rcm-modal-section">
            <h3 className="dz-rcm-modal-section-title" style={{ color: col.color }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={col.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              Key Terms
            </h3>
            <div className="dz-rcm-terms-grid">
              {info.keyTerms.map((kt, i) => (
                <div key={i} className="dz-rcm-term-card">
                  <div className="dz-rcm-term-name" style={{ color: col.color }}>{kt.term}</div>
                  <div className="dz-rcm-term-def">{kt.def}</div>
                </div>
              ))}
            </div>
          </div>

          {/* DocZoc Automations */}
          <div className="dz-rcm-modal-section">
            <h3 className="dz-rcm-modal-section-title" style={{ color: col.color }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={col.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/></svg>
              DocZoc Automations
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {info.automations.map((a, i) => (
                <div key={i} className="dz-rcm-automation-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>{a}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="dz-rcm-modal-nav">
            {stepId > 1 && (
              <button className="dz-rcm-modal-nav-btn" onClick={() => onNavigate((stepId - 1) as Step)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                Step {stepId - 1}: {STEP_INFO[(stepId - 1) as Step].fullTitle}
              </button>
            )}
            {stepId < 6 && (
              <button className="dz-rcm-modal-nav-btn" style={{ marginLeft: "auto" }} onClick={() => onNavigate((stepId + 1) as Step)}>
                Step {stepId + 1}: {STEP_INFO[(stepId + 1) as Step].fullTitle}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RcmPage() {
  const [collapsed, setCollapsed] = useState(false);
  const { bgId } = useDzPrefs();
  const [claims, setClaims] = useState<Claim[]>(INITIAL_CLAIMS);
  const [infoStep, setInfoStep] = useState<Step | null>(null);

  function moveClaim(claimId: number, direction: "next" | "prev") {
    setClaims(prev => prev.map(c => {
      if (c.id !== claimId) return c;
      const newStep = direction === "next" ? Math.min(6, c.step + 1) : Math.max(1, c.step - 1);
      return { ...c, step: newStep as Step };
    }));
  }

  return (
    <div className="dz-platform">
      <PlatformBg bgId={bgId} />
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className={`dz-platform-main${collapsed ? " dz-main-expanded" : ""}`}>
        <header className="dz-platform-header">
          <div>
            <h1>RCM Pipeline</h1>
            <p>Revenue Cycle Management — move claims through the process</p>
          </div>
          <div className="dz-platform-header-right">
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              {INITIAL_CLAIMS.map(c => (
                <span key={c.id} className="dz-rcm-claim-legend">
                  <span className="dz-rcm-legend-dot" style={{ background: COLUMNS.find(col => col.id === claims.find(cl => cl.id === c.id)?.step)?.color }} />
                  {c.patient}
                </span>
              ))}
            </div>
          </div>
        </header>

        <div className="dz-rcm-board">
          {COLUMNS.map(col => {
            const colClaims = claims.filter(c => c.step === col.id);
            return (
              <div key={col.id} className="dz-rcm-column">
                <div className="dz-rcm-col-header" style={{ "--col-color": col.color } as React.CSSProperties}>
                  <div className="dz-rcm-col-num" style={{ background: `${col.color}25`, color: col.color }}>{col.id}</div>
                  <div className="dz-rcm-col-info">
                    <div className="dz-rcm-col-title">{col.title}</div>
                    <div className="dz-rcm-col-timeline">{col.timeline}</div>
                  </div>
                  <button
                    className="dz-rcm-info-btn"
                    onClick={() => setInfoStep(col.id)}
                    title={`Learn about ${col.title}`}
                    style={{ "--col-color": col.color } as React.CSSProperties}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                  </button>
                  <span className="dz-rcm-col-count" style={{ background: `${col.color}20`, color: col.color }}>{colClaims.length}</span>
                </div>

                <div className="dz-rcm-col-body">
                  {colClaims.map(claim => (
                    <div key={claim.id} className="dz-rcm-claim-card">
                      <div className="dz-rcm-claim-top">
                        <span className="dz-rcm-claim-id">Claim #{claim.id}</span>
                        <span className="dz-rcm-claim-amount">{claim.amount}</span>
                      </div>
                      <div className="dz-rcm-claim-patient">{claim.patient}</div>
                      <div className="dz-rcm-claim-procedure">{claim.procedure}</div>
                      <div className="dz-rcm-claim-meta">
                        <span className="dz-rcm-claim-cpt">CPT {claim.cpt}</span>
                        <span className="dz-rcm-claim-payer">{claim.payer}</span>
                      </div>
                      <div className="dz-rcm-claim-actions">
                        <button
                          className="dz-rcm-move-btn"
                          disabled={claim.step === 1}
                          onClick={() => moveClaim(claim.id, "prev")}
                          title="Move back"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                        </button>
                        <span className="dz-rcm-step-label" style={{ color: col.color }}>Step {claim.step}/6</span>
                        <button
                          className="dz-rcm-move-btn"
                          disabled={claim.step === 6}
                          onClick={() => moveClaim(claim.id, "next")}
                          title="Move forward"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                  {colClaims.length === 0 && (
                    <div className="dz-rcm-empty">No claims</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Modal */}
        {infoStep && (
          <StepInfoModal
            stepId={infoStep}
            onClose={() => setInfoStep(null)}
            onNavigate={(s) => setInfoStep(s)}
          />
        )}
      </main>
    </div>
  );
}
