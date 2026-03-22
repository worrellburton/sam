import { useState, useCallback } from "react";
import { Sidebar, useDzPrefs } from "./doczoc-dashboard";
import { PlatformBg } from "~/components/PlatformBg";

export function meta() {
  return [{ title: "Coding & Billing | DocZoc" }];
}

// ── ACL Repair Visit Data ──────────────────────────────────────────
interface CodeEntry {
  code: string;
  description: string;
  type: "ICD-10" | "CPT" | "HCPCS";
  fee?: number;
}

interface Visit {
  id: string;
  patient: string;
  dob: string;
  memberId: string;
  insurance: string;
  date: string;
  provider: string;
  npi: string;
  location: string;
  locationAddr: string;
  taxId: string;
  diagnosis: string;
  procedure: string;
  notes: string;
  codes: CodeEntry[];
  status: "ready" | "submitted" | "paid";
}

const VISITS: Visit[] = [
  {
    id: "V-2026-0318",
    patient: "James Kim",
    dob: "04/12/1991",
    memberId: "UHC-884721350",
    insurance: "UnitedHealthcare Choice Plus",
    date: "03/18/2026",
    provider: "Sameh Elguizaoui, M.D.",
    npi: "1234567890",
    location: "Upper East Side",
    locationAddr: "159 East 74th St, New York, NY 10021",
    taxId: "13-4027859",
    diagnosis: "Complete tear of anterior cruciate ligament, right knee",
    procedure: "Arthroscopic ACL reconstruction with autograft",
    notes: `Patient is a 34-year-old male presenting with right knee instability following a non-contact pivoting injury during recreational basketball 3 weeks ago. MRI confirmed complete ACL rupture with associated lateral meniscus tear.

Procedure: Under general anesthesia, standard anterolateral and anteromedial portals established. Diagnostic arthroscopy confirmed complete ACL tear. Bone-patellar tendon-bone autograft harvested from ipsilateral knee. Tibial and femoral tunnels drilled. Graft passed, tensioned, and secured with interference screws. Lateral meniscus tear debrided — partial meniscectomy performed. Knee taken through full ROM — graft stable, no impingement.

Estimated blood loss: <50mL. No complications. Patient tolerated procedure well. Placed in hinged knee brace locked in extension. Weight bearing as tolerated with crutches. Physical therapy to begin at 2 weeks post-op.`,
    codes: [
      { code: "S83.511A", description: "Sprain of anterior cruciate ligament of right knee, initial encounter", type: "ICD-10" },
      { code: "S83.282A", description: "Other tear of lateral meniscus, current injury, right knee, initial encounter", type: "ICD-10" },
      { code: "M23.611", description: "Other spontaneous disruption of anterior cruciate ligament of right knee", type: "ICD-10" },
      { code: "29888", description: "Arthroscopically aided anterior cruciate ligament repair/augmentation or reconstruction", type: "CPT", fee: 8500.00 },
      { code: "29881", description: "Arthroscopy, knee, surgical; with meniscectomy including any meniscal shaving", type: "CPT", fee: 3200.00 },
      { code: "29870", description: "Arthroscopy, knee, diagnostic, with or without synovial biopsy", type: "CPT", fee: 1800.00 },
      { code: "20680", description: "Removal of implant; deep (e.g., buried wire, pin, screw, plate)", type: "CPT", fee: 0 },
      { code: "L8699", description: "Prosthetic implant, not otherwise specified (interference screws)", type: "HCPCS", fee: 1200.00 },
    ],
    status: "ready",
  },
  {
    id: "V-2026-0315",
    patient: "Sarah Mitchell",
    dob: "08/23/1989",
    memberId: "AET-551298437",
    insurance: "Aetna PPO",
    date: "03/15/2026",
    provider: "Sameh Elguizaoui, M.D.",
    npi: "1234567890",
    location: "Upper East Side",
    locationAddr: "159 East 74th St, New York, NY 10021",
    taxId: "13-4027859",
    diagnosis: "Rotator cuff tear, right shoulder — follow-up",
    procedure: "Office visit — post-operative evaluation, 6-week follow-up",
    notes: `6-week post-op follow-up for arthroscopic rotator cuff repair (supraspinatus). Patient reports decreased pain, compliant with PT protocol. Active forward flexion 140°, external rotation 35°. Incisions well-healed. Continue PT, advance to phase 3 strengthening. Return in 6 weeks.`,
    codes: [
      { code: "M75.111", description: "Incomplete rotator cuff tear of right shoulder", type: "ICD-10" },
      { code: "Z96.611", description: "Presence of right artificial shoulder joint", type: "ICD-10" },
      { code: "99214", description: "Office/outpatient visit, established patient, moderate complexity", type: "CPT", fee: 175.00 },
    ],
    status: "submitted",
  },
  {
    id: "V-2026-0312",
    patient: "David Ross",
    dob: "11/05/1978",
    memberId: "CIG-773845219",
    insurance: "Cigna Open Access Plus",
    date: "03/12/2026",
    provider: "Sameh Elguizaoui, M.D.",
    npi: "1234567890",
    location: "West Village",
    locationAddr: "200 West 13th St, New York, NY 10011",
    taxId: "13-4027859",
    diagnosis: "Primary osteoarthritis, right hip",
    procedure: "New patient consultation — hip evaluation",
    notes: `New patient consultation. 47-year-old male with progressive right hip pain x 18 months, worse with activity and prolonged sitting. X-ray shows moderate joint space narrowing with marginal osteophytes. Discussed conservative management: PT, NSAIDs, activity modification. If symptoms persist, consider corticosteroid injection or surgical consultation for total hip arthroplasty.`,
    codes: [
      { code: "M16.11", description: "Unilateral primary osteoarthritis, right hip", type: "ICD-10" },
      { code: "99203", description: "Office/outpatient visit, new patient, low complexity", type: "CPT", fee: 225.00 },
      { code: "73502", description: "Radiologic exam, hip, unilateral; 2-3 views", type: "CPT", fee: 95.00 },
    ],
    status: "paid",
  },
];

// ── PDF Generation ─────────────────────────────────────────────────
function generateBillPDF(visit: Visit) {
  const icdCodes = visit.codes.filter((c) => c.type === "ICD-10");
  const cptCodes = visit.codes.filter((c) => c.type === "CPT" || c.type === "HCPCS");
  const totalCharges = cptCodes.reduce((sum, c) => sum + (c.fee || 0), 0);

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Bill — ${visit.patient} — ${visit.id}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  @page { size: letter; margin: 0.6in; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 9.5pt; color: #1a1a2e; line-height: 1.45; padding: 0.6in; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #6366f1; }
  .header-left h1 { font-size: 18pt; font-weight: 800; color: #6366f1; margin-bottom: 2px; }
  .header-left p { font-size: 8.5pt; color: #64748b; }
  .header-right { text-align: right; font-size: 8.5pt; color: #475569; }
  .header-right .claim { font-size: 11pt; font-weight: 700; color: #1a1a2e; }
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
  .code-cell { font-family: 'SF Mono', Consolas, monospace; font-weight: 700; color: #6366f1; font-size: 9pt; }
  .type-badge { display: inline-block; padding: 1px 6px; border-radius: 3px; font-size: 7pt; font-weight: 700; }
  .type-icd { background: #ede9fe; color: #7c3aed; }
  .type-cpt { background: #dbeafe; color: #2563eb; }
  .type-hcpcs { background: #d1fae5; color: #059669; }
  .fee { text-align: right; font-weight: 600; font-family: 'SF Mono', Consolas, monospace; }
  .total-row td { border-top: 2px solid #1e293b; font-weight: 800; font-size: 10pt; background: #f8fafc; }
  .notes-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px; font-size: 8.5pt; color: #475569; line-height: 1.55; white-space: pre-wrap; }
  .footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 7.5pt; color: #94a3b8; }
  .sig-line { margin-top: 30px; display: flex; gap: 60px; }
  .sig-block { flex: 1; }
  .sig-block .line { border-top: 1px solid #1e293b; padding-top: 4px; font-size: 8pt; color: #64748b; margin-top: 40px; }
  @media print { body { padding: 0; } }
</style></head><body>
  <div class="header">
    <div class="header-left">
      <h1>DocZoc</h1>
      <p>Orthopedic Surgery & Sports Medicine</p>
      <p>${visit.locationAddr}</p>
    </div>
    <div class="header-right">
      <div class="claim">${visit.id}</div>
      <p>Date of Service: ${visit.date}</p>
      <p>Generated: ${new Date().toLocaleDateString()}</p>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-box">
      <h3>Patient Information</h3>
      <div class="info-row"><span class="info-label">Name</span><span class="info-value">${visit.patient}</span></div>
      <div class="info-row"><span class="info-label">Date of Birth</span><span class="info-value">${visit.dob}</span></div>
      <div class="info-row"><span class="info-label">Member ID</span><span class="info-value">${visit.memberId}</span></div>
      <div class="info-row"><span class="info-label">Insurance</span><span class="info-value">${visit.insurance}</span></div>
    </div>
    <div class="info-box">
      <h3>Provider Information</h3>
      <div class="info-row"><span class="info-label">Provider</span><span class="info-value">${visit.provider}</span></div>
      <div class="info-row"><span class="info-label">NPI</span><span class="info-value">${visit.npi}</span></div>
      <div class="info-row"><span class="info-label">Location</span><span class="info-value">${visit.location}</span></div>
      <div class="info-row"><span class="info-label">Tax ID</span><span class="info-value">${visit.taxId}</span></div>
    </div>
  </div>

  <div class="section">
    <h2>Diagnosis Codes (ICD-10)</h2>
    <table>
      <thead><tr><th style="width:90px">Code</th><th>Description</th><th style="width:60px">Type</th></tr></thead>
      <tbody>
        ${icdCodes.map((c) => `<tr><td class="code-cell">${c.code}</td><td>${c.description}</td><td><span class="type-badge type-icd">ICD-10</span></td></tr>`).join("")}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>Procedure Codes (CPT / HCPCS)</h2>
    <table>
      <thead><tr><th style="width:90px">Code</th><th>Description</th><th style="width:60px">Type</th><th style="width:90px;text-align:right">Charge</th></tr></thead>
      <tbody>
        ${cptCodes.map((c) => `<tr><td class="code-cell">${c.code}</td><td>${c.description}</td><td><span class="type-badge ${c.type === "HCPCS" ? "type-hcpcs" : "type-cpt"}">${c.type}</span></td><td class="fee">${c.fee ? "$" + c.fee.toLocaleString("en-US", { minimumFractionDigits: 2 }) : "—"}</td></tr>`).join("")}
        <tr class="total-row"><td></td><td colspan="2" style="text-align:right">Total Charges</td><td class="fee">$${totalCharges.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td></tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>Clinical Notes</h2>
    <div class="notes-box">${visit.notes}</div>
  </div>

  <div class="sig-line">
    <div class="sig-block"><div class="line">Provider Signature / Date</div></div>
    <div class="sig-block"><div class="line">Patient Signature / Date</div></div>
  </div>

  <div class="footer">
    <span>DocZoc Medical Billing &middot; ${visit.locationAddr}</span>
    <span>NPI: ${visit.npi} &middot; Tax ID: ${visit.taxId}</span>
  </div>
</body></html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  setTimeout(() => win.print(), 400);
}

// ── Status badge ───────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; color: string }> = {
    ready: { bg: "rgba(99, 102, 241, 0.12)", color: "#818cf8" },
    submitted: { bg: "rgba(251, 191, 36, 0.12)", color: "#fbbf24" },
    paid: { bg: "rgba(34, 197, 94, 0.12)", color: "#22c55e" },
  };
  const c = colors[status] || colors.ready;
  return (
    <span style={{
      display: "inline-block", padding: "3px 10px", borderRadius: 6,
      fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase",
      letterSpacing: "0.05em", background: c.bg, color: c.color,
    }}>
      {status}
    </span>
  );
}

// ── Page ───────────────────────────────────────────────────────────
export default function BillingPage() {
  const [collapsed, setCollapsed] = useState(false);
  const { bgId } = useDzPrefs();
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);

  const icdCodes = selectedVisit?.codes.filter((c) => c.type === "ICD-10") || [];
  const cptCodes = selectedVisit?.codes.filter((c) => c.type === "CPT" || c.type === "HCPCS") || [];
  const totalCharges = cptCodes.reduce((sum, c) => sum + (c.fee || 0), 0);

  return (
    <div className="dz-platform">
      <PlatformBg bgId={bgId} />
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className={`dz-platform-main${collapsed ? " dz-main-expanded" : ""}`}>
        <header className="dz-platform-header">
          <div>
            <h1>Coding & Billing</h1>
            <p>Review visits, assign codes, and generate bills</p>
          </div>
        </header>

        <div className="dz-billing-layout">
          {/* Visit list */}
          <div className="dz-billing-list">
            <div className="dz-billing-list-header">
              <span>Recent Visits</span>
              <span style={{ fontSize: "0.68rem", color: "#5a5a6e" }}>{VISITS.length} visits</span>
            </div>
            {VISITS.map((v) => (
              <button
                key={v.id}
                className={`dz-billing-visit${selectedVisit?.id === v.id ? " active" : ""}`}
                onClick={() => setSelectedVisit(v)}
              >
                <div className="dz-billing-visit-top">
                  <span className="dz-billing-visit-name">{v.patient}</span>
                  <StatusBadge status={v.status} />
                </div>
                <div className="dz-billing-visit-meta">{v.date} &middot; {v.location}</div>
                <div className="dz-billing-visit-proc">{v.procedure}</div>
              </button>
            ))}
          </div>

          {/* Detail panel */}
          <div className="dz-billing-detail">
            {selectedVisit ? (
              <>
                {/* Patient + visit header */}
                <div className="dz-billing-detail-header">
                  <div>
                    <h2>{selectedVisit.patient}</h2>
                    <p>DOB: {selectedVisit.dob} &middot; {selectedVisit.insurance} &middot; {selectedVisit.memberId}</p>
                  </div>
                  <button
                    className="dz-billing-pdf-btn"
                    onClick={() => generateBillPDF(selectedVisit)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="12" y1="18" x2="12" y2="12"/>
                      <polyline points="9 15 12 18 15 15"/>
                    </svg>
                    Generate PDF
                  </button>
                </div>

                {/* Visit info */}
                <div className="dz-billing-info-row">
                  <div className="dz-billing-info-card">
                    <div className="dz-billing-info-label">Visit ID</div>
                    <div className="dz-billing-info-value">{selectedVisit.id}</div>
                  </div>
                  <div className="dz-billing-info-card">
                    <div className="dz-billing-info-label">Date of Service</div>
                    <div className="dz-billing-info-value">{selectedVisit.date}</div>
                  </div>
                  <div className="dz-billing-info-card">
                    <div className="dz-billing-info-label">Location</div>
                    <div className="dz-billing-info-value">{selectedVisit.location}</div>
                  </div>
                  <div className="dz-billing-info-card">
                    <div className="dz-billing-info-label">Total Charges</div>
                    <div className="dz-billing-info-value" style={{ color: "#22c55e" }}>
                      ${totalCharges.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>

                {/* Diagnosis / procedure summary */}
                <div className="dz-billing-summary">
                  <div className="dz-billing-dx">
                    <div className="dz-billing-section-label">Diagnosis</div>
                    <p>{selectedVisit.diagnosis}</p>
                  </div>
                  <div className="dz-billing-dx">
                    <div className="dz-billing-section-label">Procedure</div>
                    <p>{selectedVisit.procedure}</p>
                  </div>
                </div>

                {/* ICD-10 Codes */}
                <div className="dz-billing-codes-section">
                  <div className="dz-billing-section-label">
                    ICD-10 Codes
                    <span className="dz-billing-code-count">{icdCodes.length}</span>
                  </div>
                  <div className="dz-billing-codes-list">
                    {icdCodes.map((c) => (
                      <div key={c.code} className="dz-billing-code-row">
                        <span className="dz-billing-code-badge icd">{c.code}</span>
                        <span className="dz-billing-code-desc">{c.description}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CPT / HCPCS Codes */}
                <div className="dz-billing-codes-section">
                  <div className="dz-billing-section-label">
                    CPT / HCPCS Codes
                    <span className="dz-billing-code-count">{cptCodes.length}</span>
                  </div>
                  <div className="dz-table-wrap">
                    <table className="dz-table">
                      <thead>
                        <tr>
                          <th>Code</th>
                          <th>Description</th>
                          <th>Type</th>
                          <th style={{ textAlign: "right" }}>Charge</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cptCodes.map((c) => (
                          <tr key={c.code}>
                            <td><span className={`dz-billing-code-badge ${c.type === "HCPCS" ? "hcpcs" : "cpt"}`}>{c.code}</span></td>
                            <td>{c.description}</td>
                            <td><span className="dz-billing-type-tag">{c.type}</span></td>
                            <td style={{ textAlign: "right", fontFamily: "'SF Mono', Consolas, monospace", fontWeight: 600, color: "#e4e4ee" }}>
                              {c.fee ? `$${c.fee.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "—"}
                            </td>
                          </tr>
                        ))}
                        <tr>
                          <td colSpan={3} style={{ textAlign: "right", fontWeight: 700, color: "#e4e4ee", borderTop: "1px solid rgba(99,102,241,0.2)" }}>Total</td>
                          <td style={{ textAlign: "right", fontFamily: "'SF Mono', Consolas, monospace", fontWeight: 800, color: "#22c55e", fontSize: "0.95rem", borderTop: "1px solid rgba(99,102,241,0.2)" }}>
                            ${totalCharges.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Clinical Notes */}
                <div className="dz-billing-codes-section">
                  <div className="dz-billing-section-label">Clinical Notes</div>
                  <div className="dz-billing-notes">{selectedVisit.notes}</div>
                </div>
              </>
            ) : (
              <div className="dz-billing-empty">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3d3f4a" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
                <h3>Select a visit</h3>
                <p>Click on a patient visit to review codes and generate a bill</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
