import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router";
import { Sidebar, useDzPrefs } from "./doczoc-dashboard";
import { PlatformBg } from "~/components/PlatformBg";
import { PATIENTS } from "~/data/patients";

export function meta() {
  return [{ title: "Home | DocZoc" }];
}

function parseDateLoose(s: string) {
  const d = new Date(s);
  return isNaN(d.getTime()) ? new Date() : d;
}

// ── Data ──────────────────────────────────────────────────────────────
function useHomeData() {
  return useMemo(() => {
    const now = new Date();
    const allAppts = PATIENTS.flatMap(p =>
      p.visits
        .filter(v => !v.type.startsWith("claim_") && !v.type.startsWith("payment_") && !v.type.startsWith("invoice_") && !v.type.startsWith("prior_auth"))
        .map(v => ({ ...v, patient: p }))
    );
    const upcomingAppts = allAppts.filter(a => parseDateLoose(a.date) >= now).sort((a, b) => parseDateLoose(a.date).getTime() - parseDateLoose(b.date).getTime());
    const allSurgeries = PATIENTS.flatMap(p => p.visits.filter(v => v.type.toLowerCase().includes("surgery")).map(v => ({ ...v, patient: p })));
    const upcomingSurgeries = allSurgeries.filter(s => parseDateLoose(s.date) > now);

    const totalCharged = PATIENTS.reduce((s, p) => s + p.invoices.reduce((s2, i) => s2 + i.totalCharged, 0), 0);
    const totalPaid = PATIENTS.reduce((s, p) => s + p.invoices.reduce((s2, i) => s2 + i.insurancePaid, 0), 0);
    const totalOwed = PATIENTS.reduce((s, p) => s + p.invoices.reduce((s2, i) => s2 + i.patientOwes, 0), 0);
    const pendingInvoices = PATIENTS.flatMap(p => p.invoices.filter(i => i.status === "Pending" || i.status === "Insurance Processing").map(i => ({ ...i, patient: p })));
    const overdueInvoices = PATIENTS.flatMap(p => p.invoices.filter(i => i.status === "Overdue").map(i => ({ ...i, patient: p })));
    const paidInvoices = PATIENTS.flatMap(p => p.invoices.filter(i => i.status === "Paid").map(i => ({ ...i, patient: p })));

    return {
      totalCharged, totalPaid, totalOwed,
      pendingInvoices, overdueInvoices, paidInvoices,
      upcomingAppts, upcomingSurgeries,
      totalPatients: PATIENTS.length,
      activePatients: PATIENTS.filter(p => p.status === "Active").length,
    };
  }, []);
}

// ── Sparkline chart (SVG) ─────────────────────────────────────────────
function BalanceChart() {
  // Generate mock 30-day revenue data
  const points = useMemo(() => {
    const data: number[] = [];
    let val = 48000;
    for (let i = 0; i < 30; i++) {
      val += (Math.random() - 0.42) * 3200;
      val = Math.max(30000, Math.min(75000, val));
      data.push(val);
    }
    data[data.length - 1] = 64424;
    return data;
  }, []);

  const min = Math.min(...points) - 2000;
  const max = Math.max(...points) + 2000;
  const w = 380;
  const h = 140;

  const toX = (i: number) => (i / (points.length - 1)) * w;
  const toY = (v: number) => h - ((v - min) / (max - min)) * h;

  const linePath = points.map((v, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(" ");
  const areaPath = linePath + ` L${w},${h} L0,${h} Z`;

  const labels = ["Feb 27", "Mar 4", "Mar 9", "Mar 14", "Mar 19"];

  return (
    <div style={{ marginTop: 16 }}>
      <svg viewBox={`0 0 ${w} ${h + 24}`} width="100%" style={{ display: "block" }}>
        <defs>
          <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#chart-grad)" />
        <path d={linePath} fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* X labels */}
        {labels.map((l, i) => (
          <text key={l} x={toX(i * 7.25)} y={h + 18} fill="#64748b" fontSize="10" textAnchor="middle" fontFamily="Inter, sans-serif">{l}</text>
        ))}
      </svg>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────
export default function HomePage() {
  const [collapsed, setCollapsed] = useState(false);
  const { bgId } = useDzPrefs();
  const data = useHomeData();
  const [balanceView, setBalanceView] = useState<"chart" | "table">("chart");

  const accounts = [
    { name: "Patient Copays", amount: data.totalOwed, icon: "💳" },
    { name: "Private Pay AR", amount: 0, icon: "🏦" },
    { name: "Insurance AR", amount: data.pendingInvoices.reduce((s, i) => s + i.totalCharged, 0), icon: "🏦" },
    { name: "Operating", amount: 64424.29, icon: "🏦" },
    { name: "Checking ••6071", amount: 0, icon: "🏦" },
  ];

  const inflow = data.totalPaid;
  const outflow = data.totalCharged - data.totalPaid;

  return (
    <div className="dz-platform">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <PlatformBg bgId={bgId} />
      <main className={`dz-platform-main${collapsed ? " dz-main-expanded" : ""}`} style={{ padding: 0 }}>
        {/* Top bar */}
        <div style={{
          display: "flex", alignItems: "center", gap: 16, padding: "14px 32px",
          borderBottom: "1px solid var(--glass-border)",
          position: "sticky", top: 0, zIndex: 5,
          background: "rgba(6,6,18,0.7)", backdropFilter: "blur(20px)",
        }}>
          <div style={{
            flex: 1, maxWidth: 480, display: "flex", alignItems: "center", gap: 10,
            background: "var(--dz-input-bg)", border: "1px solid var(--glass-border)",
            borderRadius: 10, padding: "9px 14px",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <span style={{ fontSize: "0.85rem", color: "#64748b", flex: 1 }}>Search for anything</span>
            <span style={{ fontSize: "0.7rem", color: "#475569", background: "rgba(148,163,184,0.1)", padding: "2px 6px", borderRadius: 4, fontFamily: "monospace" }}>⌘ K</span>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <button style={{
              display: "flex", alignItems: "center", gap: 8, padding: "9px 18px",
              background: "var(--glass-bg)", border: "1px solid var(--glass-border)",
              borderRadius: 10, color: "var(--dz-text-primary)", fontSize: "0.85rem",
              fontWeight: 600, cursor: "pointer",
            }}>
              New appointment
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <button style={{
              width: 38, height: 38, borderRadius: 10, border: "1px solid var(--glass-border)",
              background: "transparent", color: "#94a3b8", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.15.65.65 1.15 1.24 1.27h.27a2 2 0 0 1 0 4h-.09"/></svg>
            </button>
            <button style={{
              width: 38, height: 38, borderRadius: 10, border: "1px solid var(--glass-border)",
              background: "transparent", color: "#94a3b8", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <span style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, borderRadius: "50%", background: "#ef4444", border: "2px solid #0f0f1e" }} />
            </button>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: "linear-gradient(135deg, #4f46e5, #6366f1)",
              color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.75rem", fontWeight: 700, cursor: "pointer",
            }}>SE</div>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "32px 32px 48px" }}>
          {/* Welcome */}
          <h1 style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--dz-text-primary)", margin: "0 0 24px", letterSpacing: "-0.02em" }}>
            Welcome, Dr. Elguizaoui
          </h1>

          {/* Quick actions */}
          <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
            {[
              { label: "New Patient", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>, active: true },
              { label: "Schedule", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg> },
              { label: "Submit Claim", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
              { label: "Referral", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg> },
              { label: "Upload Chart", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
            ].map(btn => (
              <button key={btn.label} style={{
                display: "flex", alignItems: "center", gap: 7, padding: "8px 16px",
                borderRadius: 8, fontSize: "0.82rem", fontWeight: 500, cursor: "pointer",
                background: btn.active ? "var(--dz-accent)" : "transparent",
                color: btn.active ? "#fff" : "var(--dz-text-secondary)",
                border: btn.active ? "none" : "1px solid var(--glass-border)",
                transition: "all 0.15s",
              }}>
                {btn.icon}
                {btn.label}
              </button>
            ))}
            <span style={{ marginLeft: "auto", fontSize: "0.82rem", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
              Customize
            </span>
          </div>

          {/* Main row: Balance + Accounts */}
          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16, marginBottom: 16 }}>
            {/* Balance card */}
            <div className="dz-card" style={{ padding: "24px 28px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--dz-text-primary)" }}>Practice balance</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
                <div style={{ display: "flex", gap: 2 }}>
                  <button onClick={() => setBalanceView("chart")} style={{
                    width: 32, height: 28, borderRadius: "6px 0 0 6px", border: "1px solid var(--glass-border)",
                    background: balanceView === "chart" ? "var(--dz-accent-bg-active)" : "transparent",
                    color: balanceView === "chart" ? "var(--dz-accent)" : "#64748b", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                  </button>
                  <button onClick={() => setBalanceView("table")} style={{
                    width: 32, height: 28, borderRadius: "0 6px 6px 0", border: "1px solid var(--glass-border)", borderLeft: "none",
                    background: balanceView === "table" ? "var(--dz-accent-bg-active)" : "transparent",
                    color: balanceView === "table" ? "var(--dz-accent)" : "#64748b", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                  </button>
                </div>
              </div>

              <div style={{ fontSize: "2.4rem", fontWeight: 700, color: "var(--dz-text-primary)", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                $64,424<span style={{ fontSize: "1.4rem", color: "#64748b" }}>.29</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.82rem", color: "#64748b" }}>
                  Last 30 days
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginLeft: "auto" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.82rem", color: "var(--dz-text-secondary)" }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3"><polyline points="18 15 12 9 6 15"/></svg>
                    ${(inflow / 1000).toFixed(0)}K
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.82rem", color: "var(--dz-text-secondary)" }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="3"><polyline points="6 9 12 15 18 9"/></svg>
                    −${(outflow / 1000).toFixed(0)}K
                  </span>
                </div>
              </div>

              <BalanceChart />
            </div>

            {/* Accounts card */}
            <div className="dz-card" style={{ padding: "24px 28px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--dz-text-primary)" }}>Accounts</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid var(--glass-border)", background: "transparent", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </button>
                  <button style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid var(--glass-border)", background: "transparent", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {accounts.map((acc, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "12px 0",
                    borderBottom: i < accounts.length - 1 ? "1px solid var(--glass-border)" : "none",
                    cursor: "pointer",
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                      background: "var(--dz-input-bg)", border: "1px solid var(--glass-border)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.85rem",
                    }}>{acc.icon}</div>
                    <span style={{ fontSize: "0.88rem", color: "var(--dz-text-primary)", fontWeight: 500, flex: 1 }}>{acc.name}</span>
                    <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--dz-text-primary)", fontFamily: "'SF Mono', Consolas, monospace" }}>
                      ${acc.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).split(".")[0]}
                      <span style={{ color: "#64748b" }}>.{acc.amount.toFixed(2).split(".")[1]}</span>
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, cursor: "pointer" }}>
                <span style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--dz-input-bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>+3</span>
                <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 500 }}>View all accounts</span>
              </div>
            </div>
          </div>

          {/* Bottom row: 3 cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 32 }}>
            {/* Patient Payments */}
            <div className="dz-card" style={{ padding: "22px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--dz-text-primary)" }}>Patient Payments</span>
                <div style={{ display: "flex", gap: 4 }}>
                  <button style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid var(--glass-border)", background: "transparent", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                  </button>
                  <button style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid var(--glass-border)", background: "transparent", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                  </button>
                </div>
              </div>
              <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--dz-text-primary)", letterSpacing: "-0.02em", marginBottom: 12 }}>
                ${(data.totalOwed / 1000).toFixed(1)}K<span style={{ fontSize: "1rem", color: "#64748b" }}>.{(data.totalOwed % 1000).toFixed(0).padStart(2, "0").slice(0, 2)}</span>
              </div>
              {/* Mini progress bar */}
              <div style={{ height: 4, borderRadius: 2, background: "var(--glass-border)", marginBottom: 10 }}>
                <div style={{ height: 4, borderRadius: 2, background: "#818cf8", width: "35%" }} />
              </div>
              <div style={{ display: "flex", gap: 16, fontSize: "0.78rem", color: "#64748b", marginBottom: 16 }}>
                <span>Balance <span style={{ color: "#818cf8" }}>●</span></span>
                <span>Pending <span style={{ color: "#475569" }}>●</span></span>
                <span style={{ marginLeft: "auto", color: "var(--dz-text-secondary)" }}>${(data.totalOwed * 3.2).toLocaleString("en-US", { maximumFractionDigits: 0 })} available</span>
              </div>
              <div style={{ borderTop: "1px solid var(--glass-border)", paddingTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.82rem", color: "#64748b" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/></svg>
                  Autopay
                </div>
                <span style={{ fontSize: "0.82rem", color: "var(--dz-text-secondary)" }}>Apr 20</span>
                <button style={{ padding: "5px 16px", borderRadius: 6, border: "1px solid var(--glass-border)", background: "transparent", color: "var(--dz-text-primary)", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}>
                  Pay
                </button>
              </div>
            </div>

            {/* Claims */}
            <div className="dz-card" style={{ padding: "22px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--dz-text-primary)" }}>Claims</span>
                <div style={{ display: "flex", gap: 4 }}>
                  <button style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid var(--glass-border)", background: "transparent", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                  </button>
                  <button style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid var(--glass-border)", background: "transparent", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                  </button>
                </div>
              </div>
              <div style={{ display: "flex", gap: 24, marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: 4 }}>Outstanding</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--dz-text-primary)" }}>{data.pendingInvoices.length}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: 4 }}>Overdue</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--dz-text-primary)" }}>{data.overdueInvoices.length > 0 ? data.overdueInvoices.length : "–"}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: 4 }}>Due soon</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--dz-text-primary)" }}>{Math.min(data.pendingInvoices.length, 3)}</div>
                </div>
              </div>
              <div style={{ borderTop: "1px solid var(--glass-border)", paddingTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: 2 }}>Inbox</div>
                  <div style={{ fontSize: "0.82rem", color: "var(--dz-text-secondary)" }}>{data.pendingInvoices.length} items · ${(data.pendingInvoices.reduce((s, i) => s + i.totalCharged, 0) / 1000).toFixed(1)}K</div>
                </div>
                <Link to="/doczoc/billing" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.85rem", color: "var(--dz-text-primary)", fontWeight: 600, textDecoration: "none" }}>
                  View
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                </Link>
              </div>
            </div>

            {/* Invoicing */}
            <div className="dz-card" style={{ padding: "22px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--dz-text-primary)" }}>Invoicing</span>
                <div style={{ display: "flex", gap: 4 }}>
                  <button style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid var(--glass-border)", background: "transparent", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                  </button>
                </div>
              </div>
              <div style={{ display: "flex", gap: 24, marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: 4 }}>Overdue</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--dz-text-primary)" }}>
                    {data.overdueInvoices.length} · <span style={{ fontWeight: 500 }}>${(data.overdueInvoices.reduce((s, i) => s + i.totalCharged, 0) / 1000).toFixed(1)}K</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: 4 }}>Paid</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--dz-text-primary)" }}>
                    {data.paidInvoices.length} · <span style={{ fontWeight: 500 }}>${(data.totalPaid / 1000000).toFixed(1)}M</span>
                  </div>
                </div>
              </div>
              <div style={{ borderTop: "1px solid var(--glass-border)", paddingTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: 2 }}>Open</div>
                  <div style={{ fontSize: "0.82rem", color: "var(--dz-text-secondary)" }}>{data.pendingInvoices.length} items · ${(data.pendingInvoices.reduce((s, i) => s + i.totalCharged, 0) / 1000).toFixed(1)}K</div>
                </div>
                <Link to="/doczoc/rcm" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.85rem", color: "var(--dz-text-primary)", fontWeight: 600, textDecoration: "none" }}>
                  View
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Money movement / Revenue section */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--dz-text-primary)", margin: 0 }}>Revenue movement</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid var(--glass-border)", background: "transparent", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--dz-text-primary)" }}>Mar 2026</span>
              <button style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid var(--glass-border)", background: "transparent", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
