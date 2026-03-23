import { useState, useCallback, useEffect, useRef } from "react";
import { Sidebar, useDzPrefs } from "./doczoc-dashboard";
import { PlatformBg } from "~/components/PlatformBg";
import { useApiStatus, useICD10Search } from "~/hooks/useApiStatus";
import type { ApiStatus } from "~/hooks/useApiStatus";
import { useStediClaims, buildClaimPayload } from "~/hooks/useStedi";
import type { ClaimRecord } from "~/hooks/useStedi";
import { useCrosshairFocus, CrosshairToggle } from "~/hooks/useCrosshairFocus";

export function meta() {
  return [{ title: "Billing & Claims | DocZoc" }];
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

// ── API Status Indicator ───────────────────────────────────────────
function ApiStatusDot({ api }: { api: ApiStatus }) {
  const colorMap: Record<string, string> = {
    checking: "#fbbf24",
    connected: "#22c55e",
    degraded: "#f59e0b",
    offline: "#ef4444",
  };
  const labelMap: Record<string, string> = {
    checking: "Checking...",
    connected: "Connected",
    degraded: "Slow",
    offline: "Offline",
  };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{
        width: 8, height: 8, borderRadius: "50%",
        background: colorMap[api.status],
        boxShadow: api.status === "connected" ? `0 0 6px ${colorMap[api.status]}` : "none",
        display: "inline-block",
        animation: api.status === "checking" ? "pulse 1.5s ease-in-out infinite" : "none",
      }} />
      <span style={{ fontSize: "0.7rem", color: "#8a8a9a", fontWeight: 500 }}>
        {api.name}
      </span>
      <span style={{ fontSize: "0.65rem", color: colorMap[api.status], fontWeight: 600 }}>
        {labelMap[api.status]}
      </span>
      {api.latency != null && (
        <span style={{ fontSize: "0.6rem", color: "#5a5a6e" }}>
          {api.latency}ms
        </span>
      )}
    </div>
  );
}

function ApiStatusBar({ statuses, onRefresh }: { statuses: ApiStatus[]; onRefresh: () => void }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 16,
      padding: "6px 14px", borderRadius: 8,
      background: "rgba(30, 30, 45, 0.6)",
      border: "1px solid rgba(99, 102, 241, 0.15)",
      backdropFilter: "blur(8px)",
    }}>
      <span style={{ fontSize: "0.65rem", color: "#5a5a6e", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        APIs
      </span>
      {statuses.map((s) => (
        <ApiStatusDot key={s.name} api={s} />
      ))}
      <button
        onClick={onRefresh}
        style={{
          background: "none", border: "none", cursor: "pointer", color: "#6366f1",
          padding: 2, display: "flex", alignItems: "center",
        }}
        title="Refresh status"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </svg>
      </button>
    </div>
  );
}

// ── ICD-10 Search Panel ────────────────────────────────────────────
function ICD10SearchPanel() {
  const { results, loading, error, search } = useICD10Search();
  const [query, setQuery] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleChange = useCallback((val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 300);
  }, [search]);

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  return (
    <div className="dz-billing-codes-section">
      <div className="dz-billing-section-label">
        ICD-10 Code Lookup
        <span style={{ fontSize: "0.65rem", color: "#5a5a6e", fontWeight: 400, marginLeft: 8 }}>
          Powered by NLM Clinical Tables
        </span>
      </div>
      <div style={{ position: "relative", marginBottom: 8 }}>
        <input
          type="text"
          placeholder="Search ICD-10 codes (e.g. &quot;ACL tear&quot;, &quot;M75&quot;, &quot;rotator cuff&quot;)..."
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          className="dz-search-input"
          style={{ width: "100%", fontSize: "0.82rem" }}
        />
        {loading && (
          <span style={{
            position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
            fontSize: "0.7rem", color: "#6366f1",
          }}>
            Searching...
          </span>
        )}
      </div>
      {error && (
        <div style={{ padding: "8px 12px", borderRadius: 6, background: "rgba(239,68,68,0.1)", color: "#ef4444", fontSize: "0.75rem", marginBottom: 8 }}>
          {error}
        </div>
      )}
      {results.length > 0 && (
        <div className="dz-billing-codes-list">
          {results.map((r) => (
            <div key={r.code} className="dz-billing-code-row">
              <span className="dz-billing-code-badge icd">{r.code}</span>
              <span className="dz-billing-code-desc">{r.description}</span>
            </div>
          ))}
        </div>
      )}
      {query.length >= 2 && !loading && !error && results.length === 0 && (
        <div style={{ padding: 12, textAlign: "center", color: "#5a5a6e", fontSize: "0.78rem" }}>
          No codes found for "{query}"
        </div>
      )}
    </div>
  );
}

// ── Claim Status Badge ────────────────────────────────────────────
function ClaimStatusBadge({ status }: { status: ClaimRecord["status"] }) {
  const colors: Record<string, { bg: string; color: string }> = {
    draft: { bg: "rgba(148, 163, 184, 0.12)", color: "#94a3b8" },
    submitting: { bg: "rgba(251, 191, 36, 0.12)", color: "#fbbf24" },
    accepted: { bg: "rgba(34, 197, 94, 0.12)", color: "#22c55e" },
    rejected: { bg: "rgba(239, 68, 68, 0.12)", color: "#ef4444" },
    error: { bg: "rgba(239, 68, 68, 0.12)", color: "#ef4444" },
  };
  const c = colors[status] || colors.draft;
  return (
    <span style={{
      display: "inline-block", padding: "3px 10px", borderRadius: 6,
      fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase",
      letterSpacing: "0.05em", background: c.bg, color: c.color,
    }}>
      {status === "submitting" ? "Sending..." : status}
    </span>
  );
}

// ── Payer Logo ──────────────────────────────────────────────────
const PAYER_BRANDS: Record<string, { color: string; initial: string; bg: string }> = {
  UnitedHealthcare: { color: "#fff", initial: "U", bg: "#002677" },
  "UnitedHealthcare Choice Plus": { color: "#fff", initial: "U", bg: "#002677" },
  Aetna: { color: "#fff", initial: "A", bg: "#7b2d8e" },
  "Aetna PPO": { color: "#fff", initial: "A", bg: "#7b2d8e" },
  Cigna: { color: "#fff", initial: "C", bg: "#e47e30" },
  "Blue Cross Blue Shield": { color: "#fff", initial: "BC", bg: "#0075c9" },
  Humana: { color: "#fff", initial: "H", bg: "#4fad32" },
  Medicare: { color: "#fff", initial: "M", bg: "#003da5" },
};

function PayerLogo({ name, size = 36 }: { name: string; size?: number }) {
  const brand = PAYER_BRANDS[name] || Object.entries(PAYER_BRANDS).find(([k]) => name.toLowerCase().includes(k.toLowerCase()))?.[1] || { color: "#fff", initial: name.charAt(0), bg: "#475569" };
  return (
    <div style={{
      width: size, height: size, borderRadius: 8, flexShrink: 0,
      background: brand.bg, color: brand.color,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.35, fontWeight: 900, letterSpacing: "-0.02em",
    }}>
      {brand.initial}
    </div>
  );
}

// ── AI Claim Rating ─────────────────────────────────────────────
function analyzeClaimQuality(visit: Visit) {
  const icd = visit.codes.filter(c => c.type === "ICD-10");
  const cpt = visit.codes.filter(c => c.type === "CPT" || c.type === "HCPCS");
  const issues: { severity: "warn" | "info" | "pass"; text: string }[] = [];
  let score = 10;

  // Check ICD-10 codes
  if (icd.length === 0) { score -= 3; issues.push({ severity: "warn", text: "No ICD-10 diagnosis codes — claim will be rejected" }); }
  else if (icd.length === 1) { score -= 0.5; issues.push({ severity: "info", text: "Single ICD-10 code — consider adding secondary diagnoses for specificity" }); }
  else { issues.push({ severity: "pass", text: `${icd.length} ICD-10 codes linked — good diagnostic specificity` }); }

  // Check CPT codes
  if (cpt.length === 0) { score -= 3; issues.push({ severity: "warn", text: "No CPT/HCPCS procedure codes — claim has no billable services" }); }
  else { issues.push({ severity: "pass", text: `${cpt.length} CPT codes with fees attached` }); }

  // Check modifiers
  const hasModifiers = cpt.some(c => c.code.includes("-") || (c as any).modifier);
  if (cpt.length > 1 && !hasModifiers) { score -= 1; issues.push({ severity: "info", text: "Multiple procedures without modifiers (e.g. -59, -51) — may trigger bundling edits" }); }
  else if (cpt.length > 1) { issues.push({ severity: "pass", text: "Modifier usage detected for multi-procedure claim" }); }

  // Check member ID format
  if (!visit.memberId || visit.memberId.length < 5) { score -= 1.5; issues.push({ severity: "warn", text: "Member ID appears incomplete — verify subscriber identification" }); }
  else { issues.push({ severity: "pass", text: "Member ID format looks valid" }); }

  // Check NPI
  if (!visit.npi || visit.npi.length !== 10) { score -= 1; issues.push({ severity: "warn", text: "Rendering provider NPI should be exactly 10 digits" }); }
  else { issues.push({ severity: "pass", text: "Provider NPI is 10 digits" }); }

  // Check prior auth
  const hasAuth = visit.notes?.toLowerCase().includes("auth") || visit.insurance?.toLowerCase().includes("united");
  if (!hasAuth) { score -= 0.5; issues.push({ severity: "info", text: "No prior authorization reference detected — confirm if required by payer" }); }
  else { issues.push({ severity: "pass", text: "Prior authorization reference present" }); }

  // Check fees
  const totalFees = cpt.reduce((sum, c) => sum + (c.fee || 0), 0);
  if (totalFees === 0) { score -= 2; issues.push({ severity: "warn", text: "Total charges are $0 — fees must be assigned to each service line" }); }
  else { issues.push({ severity: "pass", text: `Total charges: $${totalFees.toLocaleString()} across ${cpt.length} service lines` }); }

  return { score: Math.max(1, Math.min(10, Math.round(score * 10) / 10)), issues };
}

function ClaimRatingCard({ visit }: { visit: Visit }) {
  const { score, issues } = analyzeClaimQuality(visit);
  const scoreColor = score >= 8 ? "#22c55e" : score >= 6 ? "#fbbf24" : "#ef4444";
  const scoreLabel = score >= 8 ? "Excellent" : score >= 6 ? "Needs Review" : "High Risk";
  const [animatedScore, setAnimatedScore] = useState(0);
  const [showItems, setShowItems] = useState<boolean[]>([]);

  useEffect(() => {
    // Animate score counting up
    const duration = 1200;
    const steps = 30;
    const increment = score / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setAnimatedScore(score);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.round(current * 10) / 10);
      }
    }, duration / steps);

    // Fade in issues one by one
    issues.forEach((_, i) => {
      setTimeout(() => {
        setShowItems(prev => { const next = [...prev]; next[i] = true; return next; });
      }, 600 + i * 200);
    });

    return () => clearInterval(timer);
  }, [score, issues.length]);

  const ringProgress = (animatedScore / 10) * 238.76;

  return (
    <div style={{
      background: "rgba(10,10,26,0.6)", border: "1px solid rgba(99,102,241,0.15)",
      borderRadius: 14, padding: 22, display: "flex", flexDirection: "column", gap: 16,
      height: "100%", boxSizing: "border-box",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
        <span style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "#818cf8" }}>AI Claim Analysis</span>
      </div>

      {/* Score ring */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <div style={{ position: "relative", width: 90, height: 90 }}>
          <svg width="90" height="90" viewBox="0 0 90 90">
            <circle cx="45" cy="45" r="38" fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth="6" />
            <circle cx="45" cy="45" r="38" fill="none" stroke={scoreColor} strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${ringProgress} 238.76`}
              transform="rotate(-90 45 45)"
              style={{ transition: "stroke-dasharray 0.1s linear" }}
            />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "1.5rem", fontWeight: 800, color: scoreColor, lineHeight: 1, transition: "color 0.3s" }}>{animatedScore}</span>
            <span style={{ fontSize: "0.6rem", color: "#64748b", fontWeight: 600 }}>/10</span>
          </div>
        </div>
        <span style={{
          fontSize: "0.75rem", fontWeight: 700, color: scoreColor,
          opacity: animatedScore >= score ? 1 : 0,
          transition: "opacity 0.4s ease",
        }}>{scoreLabel}</span>
      </div>

      {/* Issues list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, overflow: "auto" }}>
        {issues.map((issue, i) => (
          <div key={i} style={{
            display: "flex", gap: 8, alignItems: "flex-start",
            opacity: showItems[i] ? 1 : 0,
            transform: showItems[i] ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 0.4s ease, transform 0.4s ease",
          }}>
            <div style={{
              width: 18, height: 18, borderRadius: "50%", flexShrink: 0, marginTop: 1,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: issue.severity === "warn" ? "rgba(239,68,68,0.15)" : issue.severity === "info" ? "rgba(251,191,36,0.15)" : "rgba(34,197,94,0.15)",
            }}>
              {issue.severity === "pass" ? (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              ) : issue.severity === "warn" ? (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              ) : (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              )}
            </div>
            <span style={{
              fontSize: "0.72rem", lineHeight: 1.5,
              color: issue.severity === "warn" ? "#fca5a5" : issue.severity === "info" ? "#fde68a" : "#86efac",
            }}>{issue.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Claim Preview Modal ──────────────────────────────────────────
function ClaimPreviewModal({
  visit,
  onClose,
  onSubmit,
  submitting,
}: {
  visit: Visit;
  onClose: () => void;
  onSubmit: () => void;
  submitting: boolean;
}) {
  const payload = buildClaimPayload(visit);
  const [copied, setCopied] = useState(false);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }} onClick={onClose}>
      <div style={{
        background: "#0f1729", border: "1px solid rgba(99,102,241,0.2)",
        borderRadius: 16, padding: 28, maxWidth: 1060, width: "95vw",
        maxHeight: "85vh", overflow: "auto",
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#e4e4ee" }}>
            837P Claim Preview
          </h3>
          <button onClick={onClose} style={{
            background: "none", border: "none", color: "#5a5a6e", cursor: "pointer", fontSize: "1.2rem",
          }}>&times;</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20, alignItems: "start" }}>
        {/* Left: AI Rating */}
        <ClaimRatingCard visit={visit} />

        {/* Right: Claim Details */}
        <div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <div style={{ background: "rgba(10,10,26,0.4)", border: "1px solid rgba(148,163,184,0.08)", borderRadius: 10, padding: 12 }}>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", color: "#6366f1", marginBottom: 6 }}>Patient</div>
            <div style={{ fontSize: "0.82rem", color: "#e4e4ee", fontWeight: 600 }}>{visit.patient}</div>
            <div style={{ fontSize: "0.72rem", color: "#5a5a6e" }}>DOB: {visit.dob} &middot; {visit.memberId}</div>
          </div>
          <div style={{ background: "rgba(10,10,26,0.4)", border: "1px solid rgba(148,163,184,0.08)", borderRadius: 10, padding: 12 }}>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", color: "#6366f1", marginBottom: 6 }}>Payer</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <PayerLogo name={visit.insurance} />
              <div>
                <div style={{ fontSize: "0.82rem", color: "#e4e4ee", fontWeight: 600 }}>{visit.insurance}</div>
                <div style={{ fontSize: "0.72rem", color: "#5a5a6e" }}>Payer ID: {payload.payer.payerId}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stedi JSON Payload — shown first */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", color: "#6366f1", marginBottom: 6 }}>
            Stedi JSON Payload
          </div>
          <div style={{
            position: "relative", background: "rgba(10,10,26,0.5)",
            border: "1px solid rgba(148,163,184,0.08)", borderRadius: 10,
            padding: 14, maxHeight: 300, overflow: "auto",
          }}>
            <button
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              style={{
                position: "absolute", top: 8, right: 8,
                background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)",
                borderRadius: 6, padding: "4px 10px", fontSize: "0.68rem",
                color: "#a5b4fc", cursor: "pointer", fontWeight: 600,
              }}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
            <pre style={{
              fontSize: "0.72rem", color: "#8b8ba0", fontFamily: "'SF Mono', Consolas, monospace",
              whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0,
            }}>
              {JSON.stringify(payload, null, 2)}
            </pre>
          </div>
        </div>

        {/* Attachments Section */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", color: "#6366f1", marginBottom: 8 }}>
            Attachments (275 Transaction)
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {/* Operative Report */}
            <div style={{
              display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
              background: "rgba(10,10,26,0.4)", border: "1px solid rgba(34,197,94,0.15)",
              borderRadius: 10,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: "rgba(239,68,68,0.12)", color: "#ef4444",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#e4e4ee" }}>Operative_Report_{visit.patient.replace(/\s/g, "_")}.pdf</div>
                <div style={{ fontSize: "0.68rem", color: "#5a5a6e" }}>Operative Report &middot; PWK01: OZ &middot; 245 KB</div>
              </div>
              <span style={{ padding: "3px 10px", borderRadius: 6, fontSize: "0.65rem", fontWeight: 700, background: "rgba(34,197,94,0.12)", color: "#22c55e" }}>Ready</span>
            </div>

            {/* Pre-Op Clearance */}
            <div style={{
              display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
              background: "rgba(10,10,26,0.4)", border: "1px solid rgba(148,163,184,0.08)",
              borderRadius: 10,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: "rgba(99,102,241,0.12)", color: "#818cf8",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#e4e4ee" }}>Prior_Authorization_{visit.memberId.replace(/[^a-zA-Z0-9]/g, "")}.pdf</div>
                <div style={{ fontSize: "0.68rem", color: "#5a5a6e" }}>Prior Auth Letter &middot; PWK01: I5 &middot; 82 KB</div>
              </div>
              <span style={{ padding: "3px 10px", borderRadius: 6, fontSize: "0.65rem", fontWeight: 700, background: "rgba(34,197,94,0.12)", color: "#22c55e" }}>Ready</span>
            </div>

            {/* Add attachment button */}
            <button style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              padding: "10px", borderRadius: 10,
              border: "1px dashed rgba(99,102,241,0.2)", background: "transparent",
              color: "#5a5a6e", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Attachment
            </button>
          </div>
          <div style={{ fontSize: "0.65rem", color: "#475569", marginTop: 6, lineHeight: 1.5 }}>
            Attachments are submitted as a separate 275 transaction linked via the PWK segment&apos;s attachment control number.
          </div>
        </div>
        </div>{/* end right column */}
        </div>{/* end grid */}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
          <button onClick={onClose} style={{
            padding: "10px 20px", borderRadius: 10,
            border: "1px solid rgba(148,163,184,0.15)", background: "transparent",
            color: "#8b8ba0", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer",
          }}>
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={submitting}
            style={{
              padding: "10px 24px", borderRadius: 10,
              border: "1px solid rgba(34,197,94,0.4)",
              background: submitting ? "rgba(34,197,94,0.1)" : "rgba(34,197,94,0.2)",
              color: submitting ? "#5a5a6e" : "#22c55e",
              fontSize: "0.82rem", fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: 8,
              transition: "all 0.15s",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
            {submitting ? "Submitting..." : "Submit to Stedi"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────
export default function BillingPage() {
  const [collapsed, setCollapsed] = useState(false);
  const { bgId } = useDzPrefs();
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [activeTab, setActiveTab] = useState<"billing" | "claims">("billing");
  const [showClaimPreview, setShowClaimPreview] = useState(false);
  const { statuses, refresh } = useApiStatus();
  const { claims, submitting, submitClaim } = useStediClaims();
  const claimsCrosshair = useCrosshairFocus(new Set([3]));
  const cptCrosshair = useCrosshairFocus(new Set([3]));

  const icdCodes = selectedVisit?.codes.filter((c) => c.type === "ICD-10") || [];
  const cptCodes = selectedVisit?.codes.filter((c) => c.type === "CPT" || c.type === "HCPCS") || [];
  const totalCharges = cptCodes.reduce((sum, c) => sum + (c.fee || 0), 0);

  const handleSubmitClaim = useCallback(async () => {
    if (!selectedVisit) return;
    const payload = buildClaimPayload(selectedVisit);
    await submitClaim(
      selectedVisit.id,
      selectedVisit.patient,
      selectedVisit.insurance,
      totalCharges,
      payload
    );
    setShowClaimPreview(false);
  }, [selectedVisit, totalCharges, submitClaim]);

  return (
    <div className="dz-platform">
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
      <PlatformBg bgId={bgId} />
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      {/* Claim Preview Modal */}
      {showClaimPreview && selectedVisit && (
        <ClaimPreviewModal
          visit={selectedVisit}
          onClose={() => setShowClaimPreview(false)}
          onSubmit={handleSubmitClaim}
          submitting={submitting}
        />
      )}

      <main className={`dz-platform-main${collapsed ? " dz-main-expanded" : ""}`}>
        <header className="dz-platform-header">
          <div>
            <h1>Billing & Claims</h1>
            <p>Review visits, submit claims to insurance, and generate bills</p>
          </div>
          {/* API status moved to popup menu */}
        </header>

        {/* Tabs */}
        <div className="dz-insight-period-tabs" style={{ marginBottom: 16, width: "fit-content" }}>
          <button
            className={`dz-insight-period-btn${activeTab === "billing" ? " active" : ""}`}
            onClick={() => setActiveTab("billing")}
          >
            Coding & Billing
          </button>
          <button
            className={`dz-insight-period-btn${activeTab === "claims" ? " active" : ""}`}
            onClick={() => setActiveTab("claims")}
          >
            Claims
            {claims.length > 0 && (
              <span style={{
                marginLeft: 6, background: "rgba(99,102,241,0.2)", color: "#818cf8",
                padding: "1px 6px", borderRadius: 8, fontSize: "0.65rem", fontWeight: 700,
              }}>{claims.length}</span>
            )}
          </button>
        </div>

        {activeTab === "claims" ? (
          /* ── Claims Tab ─────────────────────────────────────── */
          <div className="dz-billing-detail" style={{ minHeight: 400 }}>
            {claims.length === 0 ? (
              <div className="dz-billing-empty">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3d3f4a" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
                <h3>No claims submitted yet</h3>
                <p>Select a visit in the Coding & Billing tab and click "Send to Stedi" to submit a claim</p>
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div className="dz-billing-section-label" style={{ marginBottom: 0 }}>
                    Submitted Claims
                    <span className="dz-billing-code-count">{claims.length}</span>
                  </div>
                  <CrosshairToggle active={claimsCrosshair.focusMode} onClick={claimsCrosshair.toggleFocus} />
                </div>
                <div className="dz-table-wrap">
                  <table className="dz-table">
                    <thead>
                      <tr>
                        <th>Claim ID</th>
                        <th>Patient</th>
                        <th>Payer</th>
                        <th style={{ textAlign: "right" }}>Amount</th>
                        <th>Status</th>
                        <th>Submitted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {claims.map((claim, rowIdx) => (
                        <tr key={claim.id}>
                          <td
                            onMouseEnter={() => claimsCrosshair.onCellEnter(claim.id, 0)}
                            onMouseLeave={claimsCrosshair.onCellLeave}
                            style={{ fontFamily: "'SF Mono', Consolas, monospace", fontSize: "0.78rem", color: "#818cf8", fontWeight: 600, ...claimsCrosshair.getCellStyle(claim.id, 0), transition: "opacity 0.2s ease" }}
                          >
                            {claim.id}
                          </td>
                          <td
                            onMouseEnter={() => claimsCrosshair.onCellEnter(claim.id, 1)}
                            onMouseLeave={claimsCrosshair.onCellLeave}
                            style={{ fontWeight: 600, color: "#e4e4ee", ...claimsCrosshair.getCellStyle(claim.id, 1), transition: "opacity 0.2s ease" }}
                          >{claim.patient}</td>
                          <td
                            onMouseEnter={() => claimsCrosshair.onCellEnter(claim.id, 2)}
                            onMouseLeave={claimsCrosshair.onCellLeave}
                            style={{ color: "#8b8ba0", ...claimsCrosshair.getCellStyle(claim.id, 2), transition: "opacity 0.2s ease" }}
                          >{claim.payer}</td>
                          <td
                            onMouseEnter={() => claimsCrosshair.onCellEnter(claim.id, 3)}
                            onMouseLeave={claimsCrosshair.onCellLeave}
                            style={{ textAlign: "right", fontFamily: "'SF Mono', Consolas, monospace", fontWeight: 600, color: "#22c55e", ...claimsCrosshair.getCellStyle(claim.id, 3), transition: "opacity 0.2s ease" }}
                          >
                            ${claim.totalCharge.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </td>
                          <td
                            onMouseEnter={() => claimsCrosshair.onCellEnter(claim.id, 4)}
                            onMouseLeave={claimsCrosshair.onCellLeave}
                            style={{ ...claimsCrosshair.getCellStyle(claim.id, 4), transition: "opacity 0.2s ease" }}
                          ><ClaimStatusBadge status={claim.status} /></td>
                          <td
                            onMouseEnter={() => claimsCrosshair.onCellEnter(claim.id, 5)}
                            onMouseLeave={claimsCrosshair.onCellLeave}
                            style={{ fontSize: "0.75rem", color: "#5a5a6e", ...claimsCrosshair.getCellStyle(claim.id, 5), transition: "opacity 0.2s ease" }}
                          >
                            {claim.submittedAt ? new Date(claim.submittedAt).toLocaleString() : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Show response details for most recent claim */}
                {claims[0]?.response && (
                  <div style={{ marginTop: 16 }}>
                    <div className="dz-billing-section-label">Latest Response</div>
                    <div className="dz-billing-notes">
                      <strong>Status:</strong> {claims[0].response.status}{"\n"}
                      <strong>Message:</strong> {claims[0].response.message}
                      {claims[0].response.claimId && (
                        <>{"\n"}<strong>Stedi Claim ID:</strong> {claims[0].response.claimId}</>
                      )}
                      {claims[0].response.x12 && (
                        <>{"\n\n"}<strong>277CA Acknowledgment (X12):</strong>{"\n"}{claims[0].response.x12}</>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
        /* ── Billing Tab ──────────────────────────────────────── */
        <div className="dz-billing-layout">
          {/* Visit list */}
          <div className="dz-billing-list">
            <div className="dz-billing-list-header">
              <span>Claims in Progress</span>
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
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className="dz-billing-pdf-btn"
                      onClick={() => setShowClaimPreview(true)}
                      style={{ borderColor: "rgba(34,197,94,0.3)", color: "#22c55e" }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                      </svg>
                      Send to Stedi
                    </button>
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
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div className="dz-billing-section-label">
                      CPT / HCPCS Codes
                      <span className="dz-billing-code-count">{cptCodes.length}</span>
                    </div>
                    <CrosshairToggle active={cptCrosshair.focusMode} onClick={cptCrosshair.toggleFocus} />
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
                        {cptCodes.map((c, rowIdx) => (
                          <tr key={c.code}>
                            <td
                              onMouseEnter={() => cptCrosshair.onCellEnter(c.code, 0)}
                              onMouseLeave={cptCrosshair.onCellLeave}
                              style={{ ...cptCrosshair.getCellStyle(c.code, 0), transition: "opacity 0.2s ease" }}
                            ><span className={`dz-billing-code-badge ${c.type === "HCPCS" ? "hcpcs" : "cpt"}`}>{c.code}</span></td>
                            <td
                              onMouseEnter={() => cptCrosshair.onCellEnter(c.code, 1)}
                              onMouseLeave={cptCrosshair.onCellLeave}
                              style={{ ...cptCrosshair.getCellStyle(c.code, 1), transition: "opacity 0.2s ease" }}
                            >{c.description}</td>
                            <td
                              onMouseEnter={() => cptCrosshair.onCellEnter(c.code, 2)}
                              onMouseLeave={cptCrosshair.onCellLeave}
                              style={{ ...cptCrosshair.getCellStyle(c.code, 2), transition: "opacity 0.2s ease" }}
                            ><span className="dz-billing-type-tag">{c.type}</span></td>
                            <td
                              onMouseEnter={() => cptCrosshair.onCellEnter(c.code, 3)}
                              onMouseLeave={cptCrosshair.onCellLeave}
                              style={{ textAlign: "right", fontFamily: "'SF Mono', Consolas, monospace", fontWeight: 600, color: "#e4e4ee", ...cptCrosshair.getCellStyle(c.code, 3), transition: "opacity 0.2s ease" }}
                            >
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

                {/* ICD-10 Live Search */}
                <ICD10SearchPanel />
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
        )}
      </main>
    </div>
  );
}
