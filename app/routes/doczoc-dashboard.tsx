import { Link, useLocation } from "react-router";
import { useState } from "react";

export function meta() {
  return [{ title: "Dashboard | DocZoc" }];
}

function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const location = useLocation();
  const path = location.pathname;

  const links = [
    { to: "/doczoc/dashboard", label: "Dashboard", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
    { to: "/doczoc/patients", label: "Patients", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { to: "/doczoc/clients", label: "Clients", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
    { to: "/doczoc/calendar", label: "Calendar", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  ];

  return (
    <aside className={`dz-sidebar${collapsed ? " dz-sidebar-collapsed" : ""}`}>
      <div className="dz-sidebar-top">
        <Link to="/doczoc" className="dz-sidebar-logo">
          <div className="dz-logo-icon">D</div>
          {!collapsed && <span className="dz-logo-text" style={{ color: "#e2e8f0" }}>DocZoc</span>}
        </Link>
        <button className="dz-sidebar-toggle" onClick={onToggle}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {collapsed ? <><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></> : <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>}
          </svg>
        </button>
      </div>
      <nav className="dz-sidebar-nav">
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className={`dz-sidebar-link${path === l.to || (l.to !== "/doczoc/dashboard" && path.startsWith(l.to)) ? " active" : ""}`}
          >
            {l.icon}
            {!collapsed && <span>{l.label}</span>}
          </Link>
        ))}
      </nav>
      <div className="dz-sidebar-bottom">
        <Link to="/doczoc" className="dz-sidebar-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          {!collapsed && <span>Sign Out</span>}
        </Link>
      </div>
    </aside>
  );
}

export { Sidebar };

export default function DashboardPage() {
  const [collapsed, setCollapsed] = useState(false);

  const stats = [
    { label: "Today's Appointments", value: "24", change: "+3", color: "#6366f1" },
    { label: "New Patients (Week)", value: "18", change: "+5", color: "#22c55e" },
    { label: "Show Rate", value: "96%", change: "+2%", color: "#a78bfa" },
    { label: "Pending Reviews", value: "7", change: "-2", color: "#f59e0b" },
  ];

  const recentPatients = [
    { name: "Sarah Mitchell", type: "Follow-up — Shoulder", time: "9:00 AM", status: "Confirmed" },
    { name: "James Kim", type: "New Patient — Knee", time: "9:30 AM", status: "New" },
    { name: "Maria Lopez", type: "Post-Op — ACL", time: "10:15 AM", status: "Confirmed" },
    { name: "David Ross", type: "Consultation — Hip", time: "11:00 AM", status: "Pending" },
    { name: "Emily Chen", type: "Follow-up — Wrist", time: "1:00 PM", status: "Confirmed" },
    { name: "Michael Brown", type: "Sports Injury — Ankle", time: "2:30 PM", status: "New" },
  ];

  return (
    <div className="dz-platform">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className={`dz-platform-main${collapsed ? " dz-main-expanded" : ""}`}>
        <header className="dz-platform-header">
          <div>
            <h1>Dashboard</h1>
            <p>Welcome back, Dr. Elguizaoui</p>
          </div>
          <div className="dz-platform-header-right">
            <div className="dz-avatar">SE</div>
          </div>
        </header>

        <div className="dz-stats-grid">
          {stats.map((s) => (
            <div key={s.label} className="dz-stat-card">
              <div className="dz-stat-card-label">{s.label}</div>
              <div className="dz-stat-card-value" style={{ color: s.color }}>{s.value}</div>
              <div className="dz-stat-card-change" style={{ color: "#22c55e" }}>{s.change} from last week</div>
            </div>
          ))}
        </div>

        <div className="dz-dash-section">
          <h2>Today's Schedule</h2>
          <div className="dz-table-wrap">
            <table className="dz-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Patient</th>
                  <th>Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentPatients.map((p) => (
                  <tr key={p.name}>
                    <td className="dz-table-time">{p.time}</td>
                    <td className="dz-table-name">{p.name}</td>
                    <td>{p.type}</td>
                    <td><span className={`dz-status-badge dz-status-${p.status.toLowerCase()}`}>{p.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
