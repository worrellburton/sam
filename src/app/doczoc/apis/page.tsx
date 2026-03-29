"use client";
import { useState } from "react";
import { Sidebar, useDzPrefs } from "../dashboard/page";
import { PlatformBg } from "@/components/PlatformBg";
import { useApiStatus } from "@/hooks/useApiStatus";
import type { ApiStatus } from "@/hooks/useApiStatus";


const API_DETAILS: Record<string, { description: string; docs: string; usage: string; auth: string }> = {
  athenahealth: {
    description: "athenahealth EHR API (athenaOne) — full practice management integration for patients, appointments, providers, insurance eligibility, and clinical data via OAuth 2.0.",
    docs: "https://docs.athenahealth.com/api",
    usage: "Patient records, appointment scheduling, insurance eligibility, provider & department lookup",
    auth: "OAuth 2.0 Client Credentials (env: NEXT_PUBLIC_ATHENA_CLIENT_ID, NEXT_PUBLIC_ATHENA_CLIENT_SECRET)",
  },
  "ICD-10 API": {
    description: "NLM Clinical Tables API — search ICD-10-CM diagnosis codes in real-time for claim coding and patient charting.",
    docs: "https://clinicaltables.nlm.nih.gov/apidoc/icd10cm/v3/doc.html",
    usage: "Patient charting, claim coding, ICD-10 search in billing",
    auth: "None (open API)",
  },
  Brandfetch: {
    description: "Brandfetch CDN — resolves high-quality insurance carrier and client logos by domain name.",
    docs: "https://docs.brandfetch.com",
    usage: "Insurance logos, client logos on Clients page",
    auth: "CDN key (embedded)",
  },
  Stedi: {
    description: "Stedi Healthcare API — submit HIPAA-compliant 837P professional claims electronically to insurance clearinghouses.",
    docs: "https://www.stedi.com/docs",
    usage: "Electronic claim submission from Billing & Claims page",
    auth: "API key (env: NEXT_PUBLIC_STEDI_API_KEY)",
  },
  "CMS MPFS": {
    description: "CMS Medicare Physician Fee Schedule (MPFS) API — look up Medicare reimbursement rates by CPT code, locality, and modifier.",
    docs: "https://data.cms.gov/provider-summary-by-type-of-service/medicare-physician-other-practitioners",
    usage: "Fee schedule lookups, reimbursement estimates, charge reconciliation",
    auth: "None (open API)",
  },
};

const statusColorMap: Record<string, string> = {
  checking: "#fbbf24",
  connected: "#22c55e",
  degraded: "#f59e0b",
  offline: "#ef4444",
};

function ApiCard({ api }: { api: ApiStatus }) {
  const details = API_DETAILS[api.name];
  const color = statusColorMap[api.status];

  return (
    <div className="dz-card" style={{ padding: 0, overflow: "hidden" }}>
      {/* Header with status */}
      <div style={{
        padding: "18px 22px",
        borderBottom: "1px solid rgba(99,102,241,0.1)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 12, height: 12, borderRadius: "50%", background: color, flexShrink: 0,
            boxShadow: api.status === "connected" ? `0 0 8px ${color}` : "none",
            animation: api.status === "checking" ? "pulse 1.5s ease-in-out infinite" : "none",
          }} />
          <span style={{ fontSize: "1.05rem", fontWeight: 700, color: "#f1f5f9" }}>{api.name}</span>
          <span style={{
            display: "inline-block", padding: "3px 10px", borderRadius: 6,
            fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase",
            background: `${color}1a`, color,
          }}>
            {api.status}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {api.latency !== undefined && (
            <span style={{ fontSize: "0.82rem", fontFamily: "'SF Mono', Consolas, monospace", fontWeight: 600, color: "#94a3b8" }}>
              {api.latency}ms
            </span>
          )}
          {api.lastChecked && (
            <span style={{ fontSize: "0.72rem", color: "#64748b" }}>
              {api.lastChecked.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Details */}
      {details && (
        <div style={{ padding: "16px 22px" }}>
          <p style={{ fontSize: "0.88rem", color: "#94a3b8", lineHeight: 1.6, marginBottom: 14 }}>
            {details.description}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
            <div>
              <div style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>Used For</div>
              <div style={{ fontSize: "0.85rem", color: "#f1f5f9" }}>{details.usage}</div>
            </div>
            <div>
              <div style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>Authentication</div>
              <div style={{ color: "#f1f5f9", fontFamily: "'SF Mono', Consolas, monospace", fontSize: "0.78rem" }}>{details.auth}</div>
            </div>
            <div>
              <div style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>Endpoint</div>
              <div style={{ fontSize: "0.78rem", color: "#818cf8", fontFamily: "'SF Mono', Consolas, monospace", wordBreak: "break-all" }}>{api.url}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ApisPage() {
  const [collapsed, setCollapsed] = useState(false);
  const { bgId } = useDzPrefs();
  const { statuses, refresh } = useApiStatus();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const connectedCount = statuses.filter((s) => s.status === "connected").length;

  return (
    <div className="dz-platform">
      <style>{`@keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }`}</style>
      <PlatformBg bgId={bgId} />
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className={`dz-platform-main${collapsed ? " dz-main-expanded" : ""}`}>
        <header className="dz-platform-header">
          <div>
            <h1>APIs</h1>
            <p>{connectedCount}/{statuses.length} connected</p>
          </div>
          <button
            onClick={handleRefresh}
            style={{
              display: "flex", alignItems: "center", gap: 8, padding: "9px 18px",
              borderRadius: 10, border: "1px solid rgba(99,102,241,0.3)",
              background: "rgba(99,102,241,0.1)", color: "#a5b4fc",
              fontSize: "0.85rem", fontWeight: 600, cursor: "pointer",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }}>
              <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            {refreshing ? "Checking..." : "Refresh All"}
          </button>
        </header>

        {/* Status bar summary */}
        <div style={{
          display: "flex", alignItems: "center", gap: 20, padding: "12px 18px",
          background: "rgba(15,23,42,0.5)", border: "1px solid rgba(99,102,241,0.1)",
          borderRadius: 12, marginBottom: 20, flexWrap: "wrap",
        }}>
          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.04em" }}>APIS</span>
          {statuses.map((api) => (
            <div key={api.name} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: statusColorMap[api.status],
                boxShadow: api.status === "connected" ? `0 0 6px ${statusColorMap[api.status]}` : "none",
                animation: api.status === "checking" ? "pulse 1.5s ease-in-out infinite" : "none",
              }} />
              <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#f1f5f9" }}>{api.name}</span>
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: statusColorMap[api.status] }}>{api.status === "connected" ? "Connected" : api.status === "checking" ? "Checking" : api.status === "degraded" ? "Degraded" : "Offline"}</span>
              {api.latency !== undefined && (
                <span style={{ fontSize: "0.72rem", color: "#64748b", fontFamily: "'SF Mono', Consolas, monospace" }}>{api.latency}ms</span>
              )}
            </div>
          ))}
        </div>

        {/* API Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {statuses.map((api) => (
            <ApiCard key={api.name} api={api} />
          ))}
        </div>
      </main>
    </div>
  );
}
