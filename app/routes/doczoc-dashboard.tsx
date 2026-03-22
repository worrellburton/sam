import { Link, useLocation } from "react-router";
import { useState, useRef, useEffect } from "react";
import { PlatformBg } from "~/components/PlatformBg";

export function meta() {
  return [{ title: "Dashboard | DocZoc" }];
}

function useDzPrefs() {
  const [bgId, setBgId] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("dz-bg") || "none";
    return "none";
  });
  const [fontFamily, setFontFamily] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("dz-font") || "inter";
    return "inter";
  });
  useEffect(() => {
    const onStorage = () => {
      setBgId(localStorage.getItem("dz-bg") || "none");
      setFontFamily(localStorage.getItem("dz-font") || "inter");
    };
    window.addEventListener("storage", onStorage);
    const interval = setInterval(onStorage, 500);
    return () => { window.removeEventListener("storage", onStorage); clearInterval(interval); };
  }, []);
  return { bgId, fontFamily };
}

export { useDzPrefs };

function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const location = useLocation();
  const path = location.pathname;
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    if (userMenuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  const links = [
    { to: "/doczoc/dashboard", label: "Dashboard", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
    { to: "/doczoc/patients", label: "Patients", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { to: "/doczoc/in-person", label: "In-Person", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
    { to: "/doczoc/calendar", label: "Calendar", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
    { to: "/doczoc/billing", label: "Billing & Claims", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> },
    { to: "/doczoc/clients", label: "Clients", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg> },
    { to: "/doczoc/insights", label: "Insights", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
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
            <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
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
      <div className="dz-sidebar-bottom" ref={menuRef}>
        {userMenuOpen && (
          <div className="dz-user-popup">
            <Link to="/doczoc/dashboard" className="dz-user-popup-item" onClick={() => setUserMenuOpen(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              My Profile
            </Link>
            <Link to="/doczoc/provider" className="dz-user-popup-item" onClick={() => setUserMenuOpen(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              Provider Information
            </Link>
            <Link to="/doczoc/apis" className="dz-user-popup-item" onClick={() => setUserMenuOpen(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
              APIs
            </Link>
            <Link to="/doczoc/appearance" className="dz-user-popup-item" onClick={() => setUserMenuOpen(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              Appearance
            </Link>
            <div className="dz-user-popup-divider" />
            <Link to="/doczoc" className="dz-user-popup-item dz-user-popup-logout" onClick={() => setUserMenuOpen(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Log Out
            </Link>
          </div>
        )}
        <button className="dz-user-btn" onClick={() => setUserMenuOpen(!userMenuOpen)}>
          <div className="dz-avatar-sm">SE</div>
          {!collapsed && (
            <div className="dz-user-info">
              <span className="dz-user-name">Dr. Elguizaoui</span>
              <span className="dz-user-role">Orthopedic Surgeon</span>
            </div>
          )}
          {!collapsed && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: "auto", opacity: 0.4 }}>
              <polyline points="6 9 12 4 18 9"/><polyline points="6 15 12 20 18 15"/>
            </svg>
          )}
        </button>
      </div>
    </aside>
  );
}

function ThemeToggleFab() {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof document !== "undefined") {
      return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
    }
    return "dark";
  });

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  };

  return (
    <button
      onClick={toggle}
      className="dz-theme-fab"
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      )}
    </button>
  );
}

// Inject the FAB into every platform page via Sidebar
const SidebarWithFab = ({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) => (
  <>
    <Sidebar collapsed={collapsed} onToggle={onToggle} />
    <ThemeToggleFab />
  </>
);

export { Sidebar, ThemeToggleFab };

export default function DashboardPage() {
  const [collapsed, setCollapsed] = useState(false);
  const { bgId } = useDzPrefs();

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
      <PlatformBg bgId={bgId} />
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
