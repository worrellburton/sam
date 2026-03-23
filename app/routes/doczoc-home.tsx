import { useState, useMemo } from "react";
import { Link } from "react-router";
import { Sidebar, useDzPrefs } from "./doczoc-dashboard";
import { PlatformBg } from "~/components/PlatformBg";
import { PATIENTS, type Patient } from "~/data/patients";

export function meta() {
  return [{ title: "Home | DocZoc" }];
}

function parseDateLoose(s: string) {
  const d = new Date(s);
  return isNaN(d.getTime()) ? new Date() : d;
}

// ── Data helpers ─────────────────────────────────────────────────────
function useHomeData() {
  return useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    // Surgery counts
    const allSurgeries = PATIENTS.flatMap(p => p.visits.filter(v => v.type.toLowerCase().includes("surgery")).map(v => ({ ...v, patient: p })));
    const upcomingSurgeries = allSurgeries.filter(s => parseDateLoose(s.date) > now);
    const thisWeekSurgeries = allSurgeries.filter(s => {
      const d = parseDateLoose(s.date);
      const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 7;
    });

    // Appointments
    const allAppts = PATIENTS.flatMap(p => p.visits.filter(v => !v.type.startsWith("claim_") && !v.type.startsWith("payment_") && !v.type.startsWith("invoice_") && !v.type.startsWith("prior_auth")).map(v => ({ ...v, patient: p })));
    const upcomingAppts = allAppts.filter(a => parseDateLoose(a.date) >= now).sort((a, b) => parseDateLoose(a.date).getTime() - parseDateLoose(b.date).getTime());
    const nextAppt = upcomingAppts[0];
    const nextSurgery = upcomingSurgeries.sort((a, b) => parseDateLoose(a.date).getTime() - parseDateLoose(b.date).getTime())[0];

    // Unsigned charts
    const unsignedCharts = PATIENTS.filter(p => !p.surgicalConsentSigned && p.visits.some(v => v.type.toLowerCase().includes("surgery")));

    // Missing consent
    const missingConsent = PATIENTS.filter(p => {
      const total = [p.aobSigned, p.roiSigned, p.hipaaSigned, p.financialSigned, p.surgicalConsentSigned].filter(Boolean).length;
      return total < 5;
    });

    // Prior auth expiring
    const expiringAuth = PATIENTS.filter(p => {
      if (!p.priorAuthExpiration) return false;
      const exp = parseDateLoose(p.priorAuthExpiration);
      const diff = (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 30;
    });

    // Claims
    const pendingInvoices = PATIENTS.flatMap(p => p.invoices.filter(i => i.status === "Pending" || i.status === "Insurance Processing").map(i => ({ ...i, patient: p })));
    const overdueInvoices = PATIENTS.flatMap(p => p.invoices.filter(i => i.status === "Overdue").map(i => ({ ...i, patient: p })));
    const unbilledEncounters = PATIENTS.flatMap(p => p.visits.filter(v => v.type.toLowerCase().includes("surgery") && !p.invoices.some(i => i.description.toLowerCase().includes(v.type.split("—")[1]?.trim().toLowerCase().slice(0, 10) || "zzz"))).map(v => ({ ...v, patient: p })));

    // Revenue
    const totalCharged = PATIENTS.reduce((s, p) => s + p.invoices.reduce((s2, i) => s2 + i.totalCharged, 0), 0);
    const totalPaid = PATIENTS.reduce((s, p) => s + p.invoices.reduce((s2, i) => s2 + i.insurancePaid, 0), 0);
    const totalOwed = PATIENTS.reduce((s, p) => s + p.invoices.reduce((s2, i) => s2 + i.patientOwes, 0), 0);
    const collectionRate = totalCharged > 0 ? (totalPaid / totalCharged * 100) : 0;

    // Copays to collect
    const copaysToday = PATIENTS.filter(p => p.copayAmount && parseFloat(p.copayAmount) > 0 && upcomingAppts.some(a => a.patient.id === p.id));

    // Allergies flags
    const allergyPatients = PATIENTS.filter(p => p.allergies.length > 0);

    return {
      nextAppt, nextSurgery, upcomingSurgeries, thisWeekSurgeries,
      unsignedCharts, missingConsent, expiringAuth,
      pendingInvoices, overdueInvoices, unbilledEncounters,
      totalCharged, totalPaid, totalOwed, collectionRate,
      copaysToday, allergyPatients, upcomingAppts,
      totalPatients: PATIENTS.length,
      activePatients: PATIENTS.filter(p => p.status === "Active").length,
    };
  }, []);
}

export default function HomePage() {
  const [collapsed, setCollapsed] = useState(false);
  const { bgId } = useDzPrefs();
  const data = useHomeData();
  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="dz-layout">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <PlatformBg id={bgId} />
      <main className={`dz-main${collapsed ? " dz-main-collapsed" : ""}`} style={{ padding: "28px 32px" }}>
        {/* Greeting */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#f1f5f9", margin: 0 }}>
            {greeting}, Dr. Elguizaoui
          </h1>
          <p style={{ fontSize: "0.82rem", color: "#64748b", margin: "4px 0 0" }}>
            {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        {/* ── Row 1: Critical alerts ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 20 }}>
          <AlertCard
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>}
            label="Upcoming Surgeries"
            count={data.upcomingSurgeries.length}
            color="#ef4444"
            linkTo="/doczoc/surgeries"
          />
          <AlertCard
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
            label="Unsigned Charts"
            count={data.unsignedCharts.length}
            color="#f59e0b"
            linkTo="/doczoc/patients"
          />
          <AlertCard
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>}
            label="Missing Consents"
            count={data.missingConsent.length}
            color="#818cf8"
            linkTo="/doczoc/patients"
          />
          <AlertCard
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
            label="Expiring Auth"
            count={data.expiringAuth.length}
            color="#f87171"
            linkTo="/doczoc/patients"
          />
        </div>

        {/* ── Row 2: Next Appointment + Next Surgery ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          {/* Next Appointment Card */}
          <div className="dz-card" style={{ padding: "18px 20px", borderLeft: "3px solid #6366f1" }}>
            <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Next Appointment</div>
            {data.nextAppt ? (
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(99,102,241,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#f1f5f9" }}>{data.nextAppt.type}</div>
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                    <Link to={`/doczoc/patients/${data.nextAppt.patient.id}`} style={{ color: "#a5b4fc", textDecoration: "none" }}>{data.nextAppt.patient.name}</Link>
                    {" · "}{data.nextAppt.date}
                  </div>
                </div>
              </div>
            ) : <span style={{ fontSize: "0.82rem", color: "#64748b" }}>No upcoming appointments</span>}
          </div>

          {/* Next Surgery Card */}
          <div className="dz-card" style={{ padding: "18px 20px", borderLeft: "3px solid #ef4444" }}>
            <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Next Surgery</div>
            {data.nextSurgery ? (
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                  background: "linear-gradient(135deg, rgba(239,68,68,0.15), rgba(168,85,247,0.15))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  animation: "dz-surgery-pulse 2s ease-in-out infinite",
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#f1f5f9" }}>{data.nextSurgery.type}</div>
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                    <Link to={`/doczoc/patients/${data.nextSurgery.patient.id}`} style={{ color: "#a5b4fc", textDecoration: "none" }}>{data.nextSurgery.patient.name}</Link>
                    {" · "}{data.nextSurgery.date}
                  </div>
                </div>
              </div>
            ) : <span style={{ fontSize: "0.82rem", color: "#64748b" }}>No upcoming surgeries</span>}
          </div>
        </div>

        {/* ── Row 3: Revenue + Claims ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
          <div className="dz-card" style={{ padding: "18px 20px", textAlign: "center" }}>
            <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Revenue Collected</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#22c55e", fontFamily: "'SF Mono', Consolas, monospace", margin: "6px 0" }}>
              ${(data.totalPaid / 1000).toFixed(1)}K
            </div>
            <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
              {data.collectionRate.toFixed(1)}% collection rate
            </div>
          </div>
          <div className="dz-card" style={{ padding: "18px 20px", textAlign: "center" }}>
            <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Patient Balances</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#f59e0b", fontFamily: "'SF Mono', Consolas, monospace", margin: "6px 0" }}>
              ${(data.totalOwed / 1000).toFixed(1)}K
            </div>
            <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
              {data.overdueInvoices.length} overdue
            </div>
          </div>
          <div className="dz-card" style={{ padding: "18px 20px", textAlign: "center" }}>
            <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Claims Pending</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#818cf8", fontFamily: "'SF Mono', Consolas, monospace", margin: "6px 0" }}>
              {data.pendingInvoices.length}
            </div>
            <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
              ${(data.pendingInvoices.reduce((s, i) => s + i.totalCharged, 0) / 1000).toFixed(1)}K total
            </div>
          </div>
        </div>

        {/* ── Row 4: Patients at a glance + Quick tasks ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          {/* Today's patients mini-cards */}
          <div className="dz-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(99,102,241,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#f1f5f9" }}>Patient Roster</span>
              <Link to="/doczoc/patients" style={{ fontSize: "0.72rem", color: "#818cf8", fontWeight: 600, textDecoration: "none" }}>View All →</Link>
            </div>
            <div style={{ maxHeight: 320, overflowY: "auto" }}>
              {PATIENTS.slice(0, 8).map(p => (
                <Link
                  key={p.id}
                  to={`/doczoc/patients/${p.id}`}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "10px 18px",
                    textDecoration: "none", borderBottom: "1px solid rgba(99,102,241,0.05)",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(99,102,241,0.04)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                    background: "rgba(99,102,241,0.12)", color: "#818cf8",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.65rem", fontWeight: 700,
                  }}>{p.name.split(" ").map(n => n[0]).join("")}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#e2e8f0" }}>{p.name}</div>
                    <div style={{ fontSize: "0.68rem", color: "#64748b" }}>{p.condition}</div>
                  </div>
                  {p.allergies.length > 0 && (
                    <span style={{ fontSize: "0.6rem", fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: "rgba(239,68,68,0.12)", color: "#f87171" }}>ALLERGY</span>
                  )}
                  <span style={{
                    fontSize: "0.65rem", fontWeight: 700, padding: "2px 8px", borderRadius: 10,
                    background: p.status === "Active" ? "rgba(34,197,94,0.12)" : p.status === "New" ? "rgba(99,102,241,0.12)" : "rgba(148,163,184,0.1)",
                    color: p.status === "Active" ? "#22c55e" : p.status === "New" ? "#818cf8" : "#94a3b8",
                  }}>{p.status}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick actions + stats */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Quick actions */}
            <div className="dz-card" style={{ padding: "18px 20px" }}>
              <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#f1f5f9", marginBottom: 14 }}>Quick Actions</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <QuickActionBtn label="New Patient" icon="user-plus" to="/doczoc/patients" color="#6366f1" />
                <QuickActionBtn label="Schedule" icon="calendar" to="/doczoc/calendar" color="#22c55e" />
                <QuickActionBtn label="Surgeries" icon="heart" to="/doczoc/surgeries" color="#ef4444" />
                <QuickActionBtn label="Billing" icon="dollar" to="/doczoc/billing" color="#f59e0b" />
                <QuickActionBtn label="Appointments" icon="clock" to="/doczoc/appointments" color="#06b6d4" />
                <QuickActionBtn label="Reports" icon="chart" to="/doczoc/reports" color="#8b5cf6" />
              </div>
            </div>

            {/* This week */}
            <div className="dz-card" style={{ padding: "18px 20px" }}>
              <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#f1f5f9", marginBottom: 12 }}>This Week</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <WeekStat label="Surgeries" count={data.thisWeekSurgeries.length} color="#ef4444" />
                <WeekStat label="Active Patients" count={data.activePatients} color="#22c55e" />
                <WeekStat label="Claims to Submit" count={data.pendingInvoices.length} color="#f59e0b" />
                <WeekStat label="Auth Expiring (30d)" count={data.expiringAuth.length} color="#f87171" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Row 5: Upcoming schedule list ── */}
        <div className="dz-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(99,102,241,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#f1f5f9" }}>Upcoming Schedule</span>
            <Link to="/doczoc/appointments" style={{ fontSize: "0.72rem", color: "#818cf8", fontWeight: 600, textDecoration: "none" }}>View All →</Link>
          </div>
          <div style={{ maxHeight: 300, overflowY: "auto" }}>
            {data.upcomingAppts.slice(0, 8).map((a, i) => {
              const isSurgery = a.type.toLowerCase().includes("surgery");
              return (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "10px 18px",
                  borderBottom: "1px solid rgba(99,102,241,0.05)",
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                    background: isSurgery ? "#ef4444" : "#818cf8",
                    boxShadow: isSurgery ? "0 0 6px rgba(239,68,68,0.4)" : undefined,
                  }} />
                  <span style={{ fontSize: "0.75rem", color: "#818cf8", fontWeight: 600, width: 90, flexShrink: 0 }}>{a.date}</span>
                  <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#e2e8f0", flex: 1 }}>{a.type}</span>
                  <Link to={`/doczoc/patients/${a.patient.id}`} style={{ fontSize: "0.72rem", color: "#a5b4fc", textDecoration: "none", fontWeight: 600 }}>{a.patient.name}</Link>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

// ── Subcomponents ────────────────────────────────────────────────────
function AlertCard({ icon, label, count, color, linkTo }: { icon: React.ReactNode; label: string; count: number; color: string; linkTo: string }) {
  return (
    <Link to={linkTo} className="dz-card" style={{
      padding: "16px 18px", display: "flex", alignItems: "center", gap: 12,
      textDecoration: "none", borderLeft: `3px solid ${color}`,
      transition: "all 0.15s",
    }}>
      <div style={{ width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: `${color}15`, flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: "1.2rem", fontWeight: 800, color: count > 0 ? color : "#64748b", fontFamily: "'SF Mono', Consolas, monospace" }}>{count}</div>
        <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "#94a3b8" }}>{label}</div>
      </div>
    </Link>
  );
}

function QuickActionBtn({ label, icon, to, color }: { label: string; icon: string; to: string; color: string }) {
  const icons: Record<string, React.ReactNode> = {
    "user-plus": <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>,
    calendar: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>,
    heart: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
    dollar: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
    clock: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    chart: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  };
  return (
    <Link to={to} style={{
      display: "flex", alignItems: "center", gap: 8, padding: "10px 12px",
      borderRadius: 8, background: `${color}08`, border: `1px solid ${color}18`,
      textDecoration: "none", transition: "all 0.15s",
    }}
    onMouseEnter={e => { e.currentTarget.style.background = `${color}15`; }}
    onMouseLeave={e => { e.currentTarget.style.background = `${color}08`; }}
    >
      {icons[icon]}
      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#e2e8f0" }}>{label}</span>
    </Link>
  );
}

function WeekStat({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>{label}</span>
      <span style={{ fontSize: "0.88rem", fontWeight: 800, color, fontFamily: "'SF Mono', Consolas, monospace" }}>{count}</span>
    </div>
  );
}
