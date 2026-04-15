"use client";
import { useState, useCallback, useMemo } from "react";
import { useCrosshairFocus, CrosshairToggle } from "@/hooks/useCrosshairFocus";


// ── Icons ───────────────────────────────────────────────────────────
const GridIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);
const ListIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const ArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);
const UploadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

// ── Types ────────────────────────────────────────────────────────────
type Tab = "products" | "campaigns" | "creative" | "audience";

interface Product {
  id: number;
  name: string;
  type: string;
  price: string;
  status: "Active" | "Draft";
  description: string;
  color: string;
}

interface Campaign {
  id: number;
  name: string;
  status: "Active" | "Draft" | "Paused" | "Completed";
  creative: string;
  audience: string;
  reach: number;
  conversions: number;
  spent: string;
  startDate: string;
}

interface Creative {
  id: number;
  name: string;
  type: "Image" | "Video" | "Carousel" | "Email" | "Flyer";
  format: string;
  status: "Ready" | "Draft" | "In Review";
  thumbnail: string;
  lastModified: string;
}

interface Audience {
  id: number;
  name: string;
  size: number;
  type: "Upload" | "Custom" | "Lookalike";
  source: string;
  lastUpdated: string;
  status: "Active" | "Archived";
}

// ── Demo Data ────────────────────────────────────────────────────────
const PRODUCTS: Product[] = [
  { id: 1, name: "ACL Reconstruction Package", type: "Surgical", price: "$14,700", status: "Active", description: "Complete ACL repair with PT follow-up program", color: "#6366f1" },
  { id: 2, name: "Sports Physical", type: "Evaluation", price: "$350", status: "Active", description: "Pre-season clearance exam for athletes", color: "#22c55e" },
  { id: 3, name: "PRP Injection Therapy", type: "Regenerative", price: "$1,200", status: "Active", description: "Platelet-rich plasma treatment for joint pain", color: "#f59e0b" },
  { id: 4, name: "Team Physician Services", type: "Contract", price: "$8,500/mo", status: "Active", description: "On-site coverage for professional sports teams", color: "#a78bfa" },
  { id: 5, name: "Rotator Cuff Repair", type: "Surgical", price: "$12,400", status: "Active", description: "Arthroscopic rotator cuff repair with rehab", color: "#60a5fa" },
  { id: 6, name: "Concierge Ortho Plan", type: "Membership", price: "$500/mo", status: "Draft", description: "Priority access, same-day appointments, direct line", color: "#f472b6" },
];

const CAMPAIGNS: Campaign[] = [
  { id: 1, name: "Spring Sports Season", status: "Active", creative: "Sports Injury Prevention", audience: "NYC Athletes 18-45", reach: 24500, conversions: 312, spent: "$4,200", startDate: "Mar 1, 2026" },
  { id: 2, name: "PRP Awareness", status: "Active", creative: "PRP Benefits Video", audience: "Joint Pain Sufferers 35+", reach: 18200, conversions: 187, spent: "$3,100", startDate: "Feb 15, 2026" },
  { id: 3, name: "Team Physician Outreach", status: "Completed", creative: "Team Med Services Flyer", audience: "NYC Sports Organizations", reach: 450, conversions: 8, spent: "$1,800", startDate: "Jan 5, 2026" },
  { id: 4, name: "Knee Pain Retarget", status: "Paused", creative: "Knee Pain Carousel", audience: "Website Visitors - Knee", reach: 8900, conversions: 94, spent: "$1,450", startDate: "Feb 1, 2026" },
  { id: 5, name: "Scarsdale Launch", status: "Draft", creative: "", audience: "", reach: 0, conversions: 0, spent: "$0", startDate: "" },
];

const CREATIVES: Creative[] = [
  { id: 1, name: "Sports Injury Prevention", type: "Image", format: "1080x1080", status: "Ready", thumbnail: "SI", lastModified: "Mar 18, 2026" },
  { id: 2, name: "PRP Benefits Video", type: "Video", format: "16:9 • 0:45", status: "Ready", thumbnail: "PRP", lastModified: "Feb 12, 2026" },
  { id: 3, name: "Team Med Services Flyer", type: "Flyer", format: "8.5x11 PDF", status: "Ready", thumbnail: "TM", lastModified: "Jan 3, 2026" },
  { id: 4, name: "Knee Pain Carousel", type: "Carousel", format: "4 slides", status: "Ready", thumbnail: "KP", lastModified: "Jan 28, 2026" },
  { id: 5, name: "Patient Testimonial — James K.", type: "Video", format: "9:16 • 1:12", status: "In Review", thumbnail: "JK", lastModified: "Mar 20, 2026" },
  { id: 6, name: "Spring Open House Email", type: "Email", format: "HTML", status: "Draft", thumbnail: "OH", lastModified: "Mar 21, 2026" },
];

const AUDIENCES: Audience[] = [
  { id: 1, name: "NYC Athletes 18-45", size: 34200, type: "Custom", source: "Meta Ads", lastUpdated: "Mar 15, 2026", status: "Active" },
  { id: 2, name: "Joint Pain Sufferers 35+", size: 28400, type: "Custom", source: "Google Ads", lastUpdated: "Feb 20, 2026", status: "Active" },
  { id: 3, name: "NYC Sports Organizations", size: 620, type: "Upload", source: "CSV Import", lastUpdated: "Jan 2, 2026", status: "Active" },
  { id: 4, name: "Website Visitors - Knee", size: 12800, type: "Custom", source: "Pixel Retarget", lastUpdated: "Mar 10, 2026", status: "Active" },
  { id: 5, name: "Past Patients - Ortho", size: 4200, type: "Upload", source: "EHR Export", lastUpdated: "Mar 1, 2026", status: "Active" },
  { id: 6, name: "Lookalike - Converted Patients", size: 156000, type: "Lookalike", source: "Meta Ads", lastUpdated: "Feb 28, 2026", status: "Active" },
  { id: 7, name: "Scarsdale Residents 30-65", size: 18500, type: "Custom", source: "Meta Ads", lastUpdated: "Mar 19, 2026", status: "Active" },
];

// ── Status badge colors ──────────────────────────────────────────────
const statusColors: Record<string, { bg: string; color: string }> = {
  Active: { bg: "rgba(34,197,94,0.12)", color: "#22c55e" },
  Draft: { bg: "rgba(148,163,184,0.12)", color: "#94a3b8" },
  Paused: { bg: "rgba(251,191,36,0.12)", color: "#fbbf24" },
  Completed: { bg: "rgba(99,102,241,0.12)", color: "#818cf8" },
  Ready: { bg: "rgba(34,197,94,0.12)", color: "#22c55e" },
  "In Review": { bg: "rgba(251,191,36,0.12)", color: "#fbbf24" },
  Upload: { bg: "rgba(99,102,241,0.12)", color: "#818cf8" },
  Custom: { bg: "rgba(34,197,94,0.12)", color: "#22c55e" },
  Lookalike: { bg: "rgba(168,85,247,0.12)", color: "#a855f7" },
  Archived: { bg: "rgba(148,163,184,0.12)", color: "#94a3b8" },
};

function Badge({ label }: { label: string }) {
  const c = statusColors[label] || statusColors.Draft;
  return (
    <span style={{
      display: "inline-block", padding: "3px 10px", borderRadius: 6,
      fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase",
      letterSpacing: "0.05em", background: c.bg, color: c.color,
    }}>
      {label}
    </span>
  );
}

// ── View toggle ──────────────────────────────────────────────────────
function ViewToggle({ view, onChange }: { view: "grid" | "list"; onChange: (v: "grid" | "list") => void }) {
  return (
    <div className="dz-view-toggle">
      <button className={`dz-view-btn${view === "grid" ? " active" : ""}`} onClick={() => onChange("grid")} title="Grid view">
        <GridIcon />
      </button>
      <button className={`dz-view-btn${view === "list" ? " active" : ""}`} onClick={() => onChange("list")} title="List view">
        <ListIcon />
      </button>
    </div>
  );
}

// ── Creative Thumbnail ──────────────────────────────────────────────
const thumbColors: Record<string, string> = {
  Image: "#6366f1", Video: "#ef4444", Carousel: "#f59e0b", Email: "#22c55e", Flyer: "#60a5fa",
};

function CreativeThumb({ creative }: { creative: Creative }) {
  return (
    <div style={{
      width: 48, height: 48, borderRadius: 10, flexShrink: 0,
      background: `${thumbColors[creative.type]}22`,
      border: `1px solid ${thumbColors[creative.type]}33`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "0.75rem", fontWeight: 800, color: thumbColors[creative.type],
    }}>
      {creative.thumbnail}
    </div>
  );
}

// ── Products Tab ────────────────────────────────────────────────────
function ProductsTab({ view }: { view: "grid" | "list" }) {
  const productDataCols = useMemo(() => new Set([2]), []);
  const { focusMode, toggleFocus, onCellEnter, onCellLeave, getCellStyle } = useCrosshairFocus(productDataCols);

  if (view === "list") {
    return (
      <div className="dz-table-wrap">
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
          <CrosshairToggle active={focusMode} onClick={toggleFocus} />
        </div>
        <table className="dz-table">
          <thead>
            <tr><th>Product</th><th>Type</th><th>Price</th><th>Status</th><th>Description</th></tr>
          </thead>
          <tbody>
            {PRODUCTS.map((p, index) => {
              const rowId = String(index);
              return (
              <tr key={p.id}>
                <td onMouseEnter={() => onCellEnter(rowId, 0)} onMouseLeave={onCellLeave} style={{ ...getCellStyle(rowId, 0), fontWeight: 600, color: "#e4e4ee" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
                    {p.name}
                  </div>
                </td>
                <td onMouseEnter={() => onCellEnter(rowId, 1)} onMouseLeave={onCellLeave} style={getCellStyle(rowId, 1)}><Badge label={p.type} /></td>
                <td onMouseEnter={() => onCellEnter(rowId, 2)} onMouseLeave={onCellLeave} style={{ ...getCellStyle(rowId, 2), fontFamily: "'SF Mono', Consolas, monospace", fontWeight: 600, color: "#22c55e" }}>{p.price}</td>
                <td onMouseEnter={() => onCellEnter(rowId, 3)} onMouseLeave={onCellLeave} style={getCellStyle(rowId, 3)}><Badge label={p.status} /></td>
                <td onMouseEnter={() => onCellEnter(rowId, 4)} onMouseLeave={onCellLeave} style={{ ...getCellStyle(rowId, 4), color: "#5a5a6e", fontSize: "0.78rem" }}>{p.description}</td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
  return (
    <div className="dz-clients-grid">
      {PRODUCTS.map((p) => (
        <div key={p.id} className="dz-client-card">
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, flexShrink: 0,
              background: `${p.color}22`, border: `1px solid ${p.color}33`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1rem", fontWeight: 800, color: p.color,
            }}>
              {p.name.charAt(0)}
            </div>
            <div>
              <div className="dz-client-name">{p.name}</div>
              <div className="dz-client-type">{p.type}</div>
            </div>
          </div>
          <p style={{ fontSize: "0.78rem", color: "#5a5a6e", marginBottom: 14, lineHeight: 1.5 }}>{p.description}</p>
          <div className="dz-client-footer">
            <Badge label={p.status} />
            <span style={{ fontFamily: "'SF Mono', Consolas, monospace", fontWeight: 700, color: "#22c55e", fontSize: "0.88rem" }}>{p.price}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Campaigns Tab ───────────────────────────────────────────────────
function CampaignsTab({ view, onNewCampaign }: { view: "grid" | "list"; onNewCampaign: () => void }) {
  const campaignDataCols = useMemo(() => new Set([3, 4, 5]), []);
  const { focusMode, toggleFocus, onCellEnter, onCellLeave, getCellStyle } = useCrosshairFocus(campaignDataCols);

  if (view === "list") {
    return (
      <div className="dz-table-wrap">
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
          <CrosshairToggle active={focusMode} onClick={toggleFocus} />
        </div>
        <table className="dz-table">
          <thead>
            <tr><th>Campaign</th><th>Creative</th><th>Audience</th><th style={{ textAlign: "right" }}>Reach</th><th style={{ textAlign: "right" }}>Conv.</th><th style={{ textAlign: "right" }}>Spent</th><th>Status</th></tr>
          </thead>
          <tbody>
            {CAMPAIGNS.map((c, index) => {
              const rowId = String(index);
              return (
              <tr key={c.id}>
                <td onMouseEnter={() => onCellEnter(rowId, 0)} onMouseLeave={onCellLeave} style={getCellStyle(rowId, 0)}>
                  <div style={{ fontWeight: 600, color: "#e4e4ee" }}>{c.name}</div>
                  {c.startDate && <div style={{ fontSize: "0.68rem", color: "#5a5a6e" }}>{c.startDate}</div>}
                </td>
                <td onMouseEnter={() => onCellEnter(rowId, 1)} onMouseLeave={onCellLeave} style={{ ...getCellStyle(rowId, 1), color: c.creative ? "#8b8ba0" : "#3d3f4a", fontSize: "0.78rem" }}>{c.creative || "—"}</td>
                <td onMouseEnter={() => onCellEnter(rowId, 2)} onMouseLeave={onCellLeave} style={{ ...getCellStyle(rowId, 2), color: c.audience ? "#8b8ba0" : "#3d3f4a", fontSize: "0.78rem" }}>{c.audience || "—"}</td>
                <td onMouseEnter={() => onCellEnter(rowId, 3)} onMouseLeave={onCellLeave} style={{ ...getCellStyle(rowId, 3), textAlign: "right", fontFamily: "'SF Mono', Consolas, monospace", fontWeight: 600, color: "#e4e4ee" }}>{c.reach > 0 ? c.reach.toLocaleString() : "—"}</td>
                <td onMouseEnter={() => onCellEnter(rowId, 4)} onMouseLeave={onCellLeave} style={{ ...getCellStyle(rowId, 4), textAlign: "right", fontFamily: "'SF Mono', Consolas, monospace", fontWeight: 600, color: "#818cf8" }}>{c.conversions > 0 ? c.conversions : "—"}</td>
                <td onMouseEnter={() => onCellEnter(rowId, 5)} onMouseLeave={onCellLeave} style={{ ...getCellStyle(rowId, 5), textAlign: "right", fontFamily: "'SF Mono', Consolas, monospace", fontWeight: 600, color: "#22c55e" }}>{c.spent !== "$0" ? c.spent : "—"}</td>
                <td onMouseEnter={() => onCellEnter(rowId, 6)} onMouseLeave={onCellLeave} style={getCellStyle(rowId, 6)}><Badge label={c.status} /></td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
  return (
    <div className="dz-clients-grid">
      {CAMPAIGNS.map((c) => (
        <div key={c.id} className="dz-client-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <div>
              <div className="dz-client-name">{c.name}</div>
              {c.startDate && <div className="dz-client-type">{c.startDate}</div>}
            </div>
            <Badge label={c.status} />
          </div>
          {c.creative && (
            <div style={{ fontSize: "0.72rem", color: "#5a5a6e", marginBottom: 4 }}>
              <span style={{ color: "#6366f1", fontWeight: 600 }}>Creative:</span> {c.creative}
            </div>
          )}
          {c.audience && (
            <div style={{ fontSize: "0.72rem", color: "#5a5a6e", marginBottom: 14 }}>
              <span style={{ color: "#6366f1", fontWeight: 600 }}>Audience:</span> {c.audience}
            </div>
          )}
          <div className="dz-client-stats">
            <div className="dz-client-stat">
              <span className="dz-client-stat-num" style={{ fontSize: "1rem" }}>{c.reach > 0 ? c.reach.toLocaleString() : "—"}</span>
              <span className="dz-client-stat-label">Reach</span>
            </div>
            <div className="dz-client-stat">
              <span className="dz-client-stat-num" style={{ fontSize: "1rem" }}>{c.conversions > 0 ? c.conversions : "—"}</span>
              <span className="dz-client-stat-label">Conversions</span>
            </div>
            <div className="dz-client-stat">
              <span className="dz-client-stat-num" style={{ fontSize: "1rem", color: "#22c55e" }}>{c.spent !== "$0" ? c.spent : "—"}</span>
              <span className="dz-client-stat-label">Spent</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Creative Tab ────────────────────────────────────────────────────
function CreativeTab({ view }: { view: "grid" | "list" }) {
  if (view === "list") {
    return (
      <div className="dz-table-wrap">
        <table className="dz-table">
          <thead>
            <tr><th>Creative</th><th>Type</th><th>Format</th><th>Status</th><th>Last Modified</th></tr>
          </thead>
          <tbody>
            {CREATIVES.map((c) => (
              <tr key={c.id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <CreativeThumb creative={c} />
                    <span style={{ fontWeight: 600, color: "#e4e4ee" }}>{c.name}</span>
                  </div>
                </td>
                <td><Badge label={c.type} /></td>
                <td style={{ fontFamily: "'SF Mono', Consolas, monospace", fontSize: "0.75rem", color: "#8b8ba0" }}>{c.format}</td>
                <td><Badge label={c.status} /></td>
                <td style={{ color: "#5a5a6e", fontSize: "0.78rem" }}>{c.lastModified}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  return (
    <div className="dz-clients-grid">
      {CREATIVES.map((c) => (
        <div key={c.id} className="dz-client-card">
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <CreativeThumb creative={c} />
            <div>
              <div className="dz-client-name">{c.name}</div>
              <div className="dz-client-type">{c.type} &middot; {c.format}</div>
            </div>
          </div>
          <div className="dz-client-footer">
            <Badge label={c.status} />
            <span className="dz-client-since">{c.lastModified}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Audience Tab ────────────────────────────────────────────────────
function AudienceTab({ view }: { view: "grid" | "list" }) {
  const audienceDataCols = useMemo(() => new Set([2]), []);
  const { focusMode, toggleFocus, onCellEnter, onCellLeave, getCellStyle } = useCrosshairFocus(audienceDataCols);

  if (view === "list") {
    return (
      <div className="dz-table-wrap">
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
          <CrosshairToggle active={focusMode} onClick={toggleFocus} />
        </div>
        <table className="dz-table">
          <thead>
            <tr><th>Audience</th><th>Type</th><th style={{ textAlign: "right" }}>Size</th><th>Source</th><th>Status</th><th>Updated</th></tr>
          </thead>
          <tbody>
            {AUDIENCES.map((a, index) => {
              const rowId = String(index);
              return (
              <tr key={a.id}>
                <td onMouseEnter={() => onCellEnter(rowId, 0)} onMouseLeave={onCellLeave} style={{ ...getCellStyle(rowId, 0), fontWeight: 600, color: "#e4e4ee" }}>{a.name}</td>
                <td onMouseEnter={() => onCellEnter(rowId, 1)} onMouseLeave={onCellLeave} style={getCellStyle(rowId, 1)}><Badge label={a.type} /></td>
                <td onMouseEnter={() => onCellEnter(rowId, 2)} onMouseLeave={onCellLeave} style={{ ...getCellStyle(rowId, 2), textAlign: "right", fontFamily: "'SF Mono', Consolas, monospace", fontWeight: 600, color: "#818cf8" }}>{a.size.toLocaleString()}</td>
                <td onMouseEnter={() => onCellEnter(rowId, 3)} onMouseLeave={onCellLeave} style={{ ...getCellStyle(rowId, 3), color: "#8b8ba0", fontSize: "0.78rem" }}>{a.source}</td>
                <td onMouseEnter={() => onCellEnter(rowId, 4)} onMouseLeave={onCellLeave} style={getCellStyle(rowId, 4)}><Badge label={a.status} /></td>
                <td onMouseEnter={() => onCellEnter(rowId, 5)} onMouseLeave={onCellLeave} style={{ ...getCellStyle(rowId, 5), color: "#5a5a6e", fontSize: "0.78rem" }}>{a.lastUpdated}</td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
  return (
    <div className="dz-clients-grid">
      {AUDIENCES.map((a) => (
        <div key={a.id} className="dz-client-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <div>
              <div className="dz-client-name">{a.name}</div>
              <div className="dz-client-type">{a.source}</div>
            </div>
            <Badge label={a.type} />
          </div>
          <div className="dz-client-stats">
            <div className="dz-client-stat">
              <span className="dz-client-stat-num" style={{ fontSize: "1rem" }}>{a.size.toLocaleString()}</span>
              <span className="dz-client-stat-label">People</span>
            </div>
          </div>
          <div className="dz-client-footer">
            <Badge label={a.status} />
            <span className="dz-client-since">{a.lastUpdated}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── New Campaign Wizard ─────────────────────────────────────────────
type WizardStep = "name" | "creative" | "audience" | "review";

function NewCampaignWizard({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<WizardStep>("name");
  const [name, setName] = useState("");
  const [selectedCreative, setSelectedCreative] = useState<number | null>(null);
  const [selectedAudience, setSelectedAudience] = useState<number | null>(null);
  const [launched, setLaunched] = useState(false);

  const steps: { key: WizardStep; label: string; num: number }[] = [
    { key: "name", label: "Campaign", num: 1 },
    { key: "creative", label: "Creative", num: 2 },
    { key: "audience", label: "Audience", num: 3 },
    { key: "review", label: "Launch", num: 4 },
  ];

  const stepIdx = steps.findIndex((s) => s.key === step);

  const canNext = () => {
    if (step === "name") return name.trim().length > 0;
    if (step === "creative") return selectedCreative !== null;
    if (step === "audience") return selectedAudience !== null;
    return true;
  };

  const goNext = () => {
    if (step === "name") setStep("creative");
    else if (step === "creative") setStep("audience");
    else if (step === "audience") setStep("review");
  };

  const goBack = () => {
    if (step === "creative") setStep("name");
    else if (step === "audience") setStep("creative");
    else if (step === "review") setStep("audience");
  };

  const handleLaunch = () => {
    setLaunched(true);
    setTimeout(() => onClose(), 2000);
  };

  const chosenCreative = CREATIVES.find((c) => c.id === selectedCreative);
  const chosenAudience = AUDIENCES.find((a) => a.id === selectedAudience);

  if (launched) {
    return (
      <div className="dz-wizard-overlay" onClick={onClose}>
        <div className="dz-wizard-panel" onClick={(e) => e.stopPropagation()} style={{ textAlign: "center", padding: "60px 40px" }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%", margin: "0 auto 20px",
            background: "rgba(34,197,94,0.15)", border: "2px solid #22c55e",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#e4e4ee", marginBottom: 8 }}>Campaign Launched!</h2>
          <p style={{ color: "#5a5a6e", fontSize: "0.88rem" }}>"{name}" is now live</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dz-wizard-overlay" onClick={onClose}>
      <div className="dz-wizard-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="dz-wizard-header">
          <h2>New Campaign</h2>
          <button onClick={onClose} className="dz-wizard-close">&times;</button>
        </div>

        {/* Progress steps */}
        <div className="dz-wizard-steps">
          {steps.map((s, i) => (
            <div key={s.key} className={`dz-wizard-step${i <= stepIdx ? " active" : ""}${i < stepIdx ? " done" : ""}`}>
              <div className="dz-wizard-step-num">
                {i < stepIdx ? <CheckIcon /> : s.num}
              </div>
              <span>{s.label}</span>
              {i < steps.length - 1 && <div className={`dz-wizard-step-line${i < stepIdx ? " done" : ""}`} />}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="dz-wizard-body">
          {step === "name" && (
            <div>
              <label className="dz-wizard-label">Campaign Name</label>
              <input
                type="text"
                className="dz-search-input"
                placeholder="e.g. Summer Sports Campaign"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                style={{ width: "100%", fontSize: "0.88rem", marginBottom: 16 }}
              />
              <p style={{ fontSize: "0.78rem", color: "#5a5a6e", lineHeight: 1.6 }}>
                Give your campaign a descriptive name. You'll select your creative assets and target audience in the next steps.
              </p>
            </div>
          )}

          {step === "creative" && (
            <div>
              <label className="dz-wizard-label">Select Creative</label>
              <div className="dz-wizard-select-list">
                {CREATIVES.filter((c) => c.status === "Ready").map((c) => (
                  <button
                    key={c.id}
                    className={`dz-wizard-select-item${selectedCreative === c.id ? " selected" : ""}`}
                    onClick={() => setSelectedCreative(c.id)}
                  >
                    <CreativeThumb creative={c} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: "#e4e4ee", fontSize: "0.85rem" }}>{c.name}</div>
                      <div style={{ fontSize: "0.72rem", color: "#5a5a6e" }}>{c.type} &middot; {c.format}</div>
                    </div>
                    {selectedCreative === c.id && (
                      <div style={{ color: "#22c55e" }}><CheckIcon /></div>
                    )}
                  </button>
                ))}
              </div>
              <button className="dz-wizard-upload-btn">
                <UploadIcon /> Upload New Creative
              </button>
            </div>
          )}

          {step === "audience" && (
            <div>
              <label className="dz-wizard-label">Select Audience</label>
              <div className="dz-wizard-select-list">
                {AUDIENCES.filter((a) => a.status === "Active").map((a) => (
                  <button
                    key={a.id}
                    className={`dz-wizard-select-item${selectedAudience === a.id ? " selected" : ""}`}
                    onClick={() => setSelectedAudience(a.id)}
                  >
                    <div style={{
                      width: 48, height: 48, borderRadius: 10, flexShrink: 0,
                      background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.2)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.7rem", fontWeight: 700, color: "#818cf8",
                    }}>
                      {a.size >= 1000 ? `${(a.size / 1000).toFixed(0)}K` : a.size}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: "#e4e4ee", fontSize: "0.85rem" }}>{a.name}</div>
                      <div style={{ fontSize: "0.72rem", color: "#5a5a6e" }}>
                        {a.type} &middot; {a.source} &middot; {a.size.toLocaleString()} people
                      </div>
                    </div>
                    {selectedAudience === a.id && (
                      <div style={{ color: "#22c55e" }}><CheckIcon /></div>
                    )}
                  </button>
                ))}
              </div>
              <button className="dz-wizard-upload-btn">
                <UploadIcon /> Upload New Audience
              </button>
            </div>
          )}

          {step === "review" && (
            <div>
              <label className="dz-wizard-label">Review & Launch</label>
              <div className="dz-wizard-review-grid">
                <div className="dz-wizard-review-card">
                  <div className="dz-wizard-review-label">Campaign</div>
                  <div className="dz-wizard-review-value">{name}</div>
                </div>
                <div className="dz-wizard-review-card">
                  <div className="dz-wizard-review-label">Creative</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {chosenCreative && <CreativeThumb creative={chosenCreative} />}
                    <div>
                      <div className="dz-wizard-review-value">{chosenCreative?.name}</div>
                      <div style={{ fontSize: "0.72rem", color: "#5a5a6e" }}>{chosenCreative?.type} &middot; {chosenCreative?.format}</div>
                    </div>
                  </div>
                </div>
                <div className="dz-wizard-review-card">
                  <div className="dz-wizard-review-label">Audience</div>
                  <div>
                    <div className="dz-wizard-review-value">{chosenAudience?.name}</div>
                    <div style={{ fontSize: "0.72rem", color: "#5a5a6e" }}>
                      {chosenAudience?.size.toLocaleString()} people &middot; {chosenAudience?.source}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="dz-wizard-footer">
          {step !== "name" ? (
            <button className="dz-wizard-back-btn" onClick={goBack}>
              <ArrowLeft /> Back
            </button>
          ) : <div />}
          {step === "review" ? (
            <button className="dz-wizard-launch-btn" onClick={handleLaunch}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              Launch Campaign
            </button>
          ) : (
            <button className="dz-wizard-next-btn" onClick={goNext} disabled={!canNext()}>
              Next <ArrowRight />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────
export default function ClientsPage() {
  const [tab, setTab] = useState<Tab>("campaigns");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [showWizard, setShowWizard] = useState(false);
  const [search, setSearch] = useState("");

  const tabCounts: Record<Tab, number> = {
    products: PRODUCTS.length,
    campaigns: CAMPAIGNS.length,
    creative: CREATIVES.length,
    audience: AUDIENCES.length,
  };

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
                  {showWizard && <NewCampaignWizard onClose={() => setShowWizard(false)} />}

      <main className="dz-platform-main">
        <header className="dz-platform-header">
          <div>
            <h1>Clients</h1>
            <p>Products, campaigns, creative & audience management</p>
          </div>
          <div className="dz-platform-header-right" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              type="text"
              placeholder="Search..."
              className="dz-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 180 }}
            />
          </div>
        </header>

        {/* Toolbar: tabs + view toggle + new campaign */}
        <div className="dz-clients-toolbar">
          <div className="dz-insight-period-tabs">
            {(["products", "campaigns", "creative", "audience"] as const).map((t) => (
              <button
                key={t}
                className={`dz-insight-period-btn${tab === t ? " active" : ""}`}
                onClick={() => setTab(t)}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
                <span className="dz-tab-count">{tabCounts[t]}</span>
              </button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ViewToggle view={view} onChange={setView} />
            {tab === "campaigns" && (
              <button className="dz-new-campaign-btn" onClick={() => setShowWizard(true)}>
                <PlusIcon /> New Campaign
              </button>
            )}
          </div>
        </div>

        {/* Tab content */}
        {tab === "products" && <ProductsTab view={view} />}
        {tab === "campaigns" && <CampaignsTab view={view} onNewCampaign={() => setShowWizard(true)} />}
        {tab === "creative" && <CreativeTab view={view} />}
        {tab === "audience" && <AudienceTab view={view} />}
      </main>
    </>
  );
}
