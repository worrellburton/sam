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

const INITIAL_CLAIMS: Claim[] = [
  { id: 1, patient: "James Kim", procedure: "ACL Reconstruction", cpt: "29888", amount: "$8,450.00", payer: "Aetna", step: 1 },
  { id: 2, patient: "Sarah Mitchell", procedure: "Rotator Cuff Repair", cpt: "29827", amount: "$6,200.00", payer: "UnitedHealthcare", step: 2 },
  { id: 3, patient: "David Ross", procedure: "Total Hip Arthroplasty", cpt: "27130", amount: "$14,800.00", payer: "Blue Cross", step: 1 },
];

export default function RcmPage() {
  const [collapsed, setCollapsed] = useState(false);
  const { bgId } = useDzPrefs();
  const [claims, setClaims] = useState<Claim[]>(INITIAL_CLAIMS);

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
            <p>Revenue Cycle Management — drag claims through the process</p>
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
      </main>
    </div>
  );
}
