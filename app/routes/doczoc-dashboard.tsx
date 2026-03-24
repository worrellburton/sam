import { Link, useLocation } from "react-router";
import { useState, useRef, useEffect } from "react";
import { PlatformBg } from "~/components/PlatformBg";

function SplashScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<"enter" | "hold" | "exit">("enter");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    // Particle animation on canvas
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.scale(dpr, dpr);
    const W = canvas.clientWidth;
    const H = canvas.clientHeight;

    const particles: { x: number; y: number; vx: number; vy: number; r: number; alpha: number; color: string }[] = [];
    const colors = ["#6366f1", "#818cf8", "#a78bfa", "#34d399", "#22d3ee"];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: W / 2 + (Math.random() - 0.5) * 40,
        y: H / 2 + (Math.random() - 0.5) * 40,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        r: 1.5 + Math.random() * 3,
        alpha: 0,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let t = 0;
    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      t++;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.99;
        p.vy *= 0.99;
        p.alpha = Math.min(1, t / 30) * (1 - Math.max(0, (t - 90) / 30));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha * 0.7);
        ctx.fill();
      }

      // Draw connecting lines
      ctx.globalAlpha = 0.1;
      ctx.strokeStyle = "#818cf8";
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      animRef.current = requestAnimationFrame(draw);
    }
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("hold"), 100);
    const t2 = setTimeout(() => setPhase("exit"), 2200);
    const t3 = setTimeout(() => onDone(), 2900);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <div className={`dz-splash dz-splash-${phase}`}>
      <canvas ref={canvasRef} className="dz-splash-canvas" />
      <div className="dz-splash-content">
        <div className="dz-splash-logo-ring">
          <div className="dz-splash-logo-inner">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
        </div>
        <h1 className="dz-splash-title">DocZoc</h1>
        <p className="dz-splash-subtitle">Welcome back, Dr. Elguizaoui</p>
      </div>
    </div>
  );
}

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
    { to: "/doczoc/insights", label: "Insights", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
    { to: "/doczoc/patients", label: "Patients", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { to: "/doczoc/in-person", label: "Appointments", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
    { to: "/doczoc/calendar", label: "Calendar", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
    { to: "/doczoc/billing", label: "Billing & Claims", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> },
    { to: "/doczoc/rcm", label: "RCM Pipeline", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
    { to: "/doczoc/team", label: "Team", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  ];

  return (
    <>
    <aside className={`dz-sidebar${collapsed ? " dz-sidebar-collapsed" : ""}`}>
      <div className="dz-sidebar-top">
        <Link to="/doczoc" className="dz-sidebar-logo">
          <div className="dz-logo-icon">D</div>
          {!collapsed && <span className="dz-logo-text" style={{ color: "#e2e8f0" }}>DocZoc</span>}
        </Link>
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
            {/* Essentials */}
            <div className="dz-popup-section-label dz-popup-essentials">Essentials</div>
            <Link to="/doczoc/dashboard" className="dz-user-popup-item" onClick={() => setUserMenuOpen(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              My Profile
            </Link>
            <Link to="/doczoc/provider" className="dz-user-popup-item" onClick={() => setUserMenuOpen(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              Provider Information
            </Link>
            <Link to="/doczoc/reports" className="dz-user-popup-item" onClick={() => setUserMenuOpen(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              Reports
            </Link>
            <Link to="/doczoc/in-person" className="dz-user-popup-item" onClick={() => setUserMenuOpen(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              Operative Report
            </Link>
            <div className="dz-user-popup-divider" />
            {/* Settings */}
            <div className="dz-popup-section-label">Settings</div>
            <Link to="/doczoc/apis" className="dz-user-popup-item" onClick={() => setUserMenuOpen(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
              APIs
            </Link>
            <Link to="/doczoc/appearance" className="dz-user-popup-item" onClick={() => setUserMenuOpen(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              Appearance
            </Link>
            <div className="dz-user-popup-divider" />
            {/* Status */}
            <div className="dz-popup-online-status">
              <span className="dz-popup-online-dot" />
              Online
            </div>
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
    <ThemeToggleFab />
    </>
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

export { Sidebar, ThemeToggleFab };

const quickActions = [
  { label: "New Patient", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>, to: "/doczoc/patients" },
  { label: "Schedule", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, to: "/doczoc/calendar" },
  { label: "Surgeries", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>, to: "/doczoc/in-person" },
  { label: "Billing", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>, to: "/doczoc/billing" },
  { label: "Appointments", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, to: "/doczoc/in-person" },
  { label: "Reports", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>, to: "/doczoc/reports" },
];

const thisWeekStats = [
  { label: "Surgeries", value: 0 },
  { label: "Active Patients", value: 5 },
  { label: "Claims to Submit", value: 4 },
  { label: "Auth Expiring (30d)", value: 0 },
];

const metricCards = [
  { label: "Total Revenue", value: "$82K", change: "+12.4%", positive: true, data: [40, 45, 42, 50, 55, 52, 60, 58, 65, 68, 72, 82] },
  { label: "Patients Seen", value: "1248", change: "+8.2%", positive: true, data: [80, 85, 90, 88, 95, 100, 105, 110, 108, 115, 120, 125] },
  { label: "Avg. Collection Rate", value: "75.9%", change: "+1.8%", positive: true, data: [70, 71, 72, 71, 73, 74, 73, 74, 75, 74, 75, 76] },
  { label: "Denial Rate", value: "4.2%", change: "-0.8%", positive: false, data: [6, 5.5, 5.8, 5.2, 5, 4.8, 5.1, 4.9, 4.5, 4.3, 4.4, 4.2] },
];

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const w = 120, h = 32;
  const max = Math.max(...data), min = Math.min(...data), range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 4) - 2}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function DashboardPage() {
  const [collapsed, setCollapsed] = useState(false);
  const { bgId } = useDzPrefs();
  const location = useLocation();
  const [showSplash, setShowSplash] = useState(() => !!(location.state as any)?.fromLogin);
  const fromLogin = !!(location.state as any)?.fromLogin;

  return (
    <div className={`dz-platform${!showSplash && fromLogin ? " dz-platform-cinematic" : ""}`}>
      {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}
      <PlatformBg bgId={bgId} />
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className={`dz-platform-main${collapsed ? " dz-main-expanded" : ""}`}>
        <header className="dz-platform-header">
          <div>
            <h1>Home</h1>
            <p>Welcome back, Dr. Elguizaoui</p>
          </div>
          <div className="dz-platform-header-right">
            <div className="dz-avatar">SE</div>
          </div>
        </header>

        {/* Top row: Upcoming Schedule + Quick Actions / This Week */}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20, marginBottom: 20 }}>
          {/* Upcoming Schedule */}
          <div className="dz-card" style={{ padding: "24px 28px", minHeight: 260 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#f1f5f9", margin: 0 }}>Upcoming Schedule</h2>
              <Link to="/doczoc/calendar" style={{ fontSize: "0.85rem", color: "#818cf8", textDecoration: "none", fontWeight: 600 }}>View Calendar →</Link>
            </div>
            <p style={{ color: "#64748b", fontSize: "0.92rem" }}>No upcoming appointments or surgeries</p>
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Quick Actions */}
            <div className="dz-card" style={{ padding: "20px 24px" }}>
              <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#f1f5f9", margin: "0 0 16px" }}>Quick Actions</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {quickActions.map((a) => (
                  <Link key={a.label} to={a.to} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "12px 16px", borderRadius: 10,
                    border: "1px solid rgba(148,163,184,0.12)",
                    background: "rgba(15,23,42,0.4)",
                    color: "#e2e8f0", fontSize: "0.88rem", fontWeight: 600,
                    textDecoration: "none", transition: "background 0.15s",
                  }}>
                    {a.icon}
                    {a.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* This Week */}
            <div className="dz-card" style={{ padding: "20px 24px" }}>
              <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#f1f5f9", margin: "0 0 14px" }}>This Week</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {thisWeekStats.map((s) => (
                  <div key={s.label} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "10px 0",
                    borderBottom: "1px solid rgba(148,163,184,0.08)",
                  }}>
                    <span style={{ color: "#94a3b8", fontSize: "0.88rem" }}>{s.label}</span>
                    <span style={{ color: s.value > 0 ? "#22c55e" : "#ef4444", fontSize: "0.95rem", fontWeight: 700 }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom metric cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {metricCards.map((m) => (
            <div key={m.label} className="dz-card" style={{ padding: "20px 22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ color: "#94a3b8", fontSize: "0.82rem", fontWeight: 600 }}>{m.label}</span>
                <span style={{
                  fontSize: "0.72rem", fontWeight: 700, padding: "2px 8px", borderRadius: 6,
                  background: m.positive ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
                  color: m.positive ? "#22c55e" : "#ef4444",
                }}>{m.change}</span>
              </div>
              <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#f1f5f9", fontFamily: "'SF Mono', Consolas, monospace", marginBottom: 8 }}>{m.value}</div>
              <MiniSparkline data={m.data} color={m.positive ? "#22c55e" : "#f59e0b"} />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
