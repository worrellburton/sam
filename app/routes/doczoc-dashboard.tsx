import { Link, useLocation } from "react-router";
import { useState, useRef, useEffect, type ReactNode } from "react";
import { PlatformBg } from "~/components/PlatformBg";

export function AiSummaryExpand({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {open && (
        <div style={{ marginTop: 6 }}>{children}</div>
      )}
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          marginTop: 6, padding: "3px 10px", borderRadius: 6,
          fontSize: "0.65rem", fontWeight: 700, cursor: "pointer",
          background: open ? "rgba(99,102,241,0.12)" : "rgba(99,102,241,0.06)",
          color: "#818cf8", border: "1px solid rgba(99,102,241,0.15)",
          transition: "all 0.15s",
        }}
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
        {open ? "Less" : "More insight"}
      </button>
    </>
  );
}

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
    const t2 = setTimeout(() => setPhase("exit"), 2000);
    const t3 = setTimeout(() => onDone(), 2600);
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

const FONT_MAP: Record<string, string> = {
  inter: "Inter, -apple-system, sans-serif",
  system: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  mono: "'SF Mono', 'Fira Code', 'Consolas', monospace",
  serif: "Georgia, 'Times New Roman', serif",
  rounded: "'Nunito', 'Varela Round', system-ui, sans-serif",
  geometric: "'Poppins', 'Futura', system-ui, sans-serif",
};

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

  // Apply font to CSS variable so .dz-platform picks it up
  useEffect(() => {
    const family = FONT_MAP[fontFamily] || FONT_MAP.inter;
    document.documentElement.style.setProperty("--dz-font", family);
  }, [fontFamily]);

  return { bgId, fontFamily };
}

export { useDzPrefs };

function Sidebar({ collapsed, onToggle, hideThemeToggle }: { collapsed: boolean; onToggle: () => void; hideThemeToggle?: boolean }) {
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

  const [billingOpen, setBillingOpen] = useState(() => path.startsWith("/doczoc/billing") || path.startsWith("/doczoc/rcm"));

  const links = [
    { to: "/doczoc/dashboard", label: "Home", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
    { to: "/doczoc/calendar", label: "Calendar", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
    { to: "/doczoc/patients", label: "Patients", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { to: "/doczoc/appointments", label: "Appointments", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
    { to: "/doczoc/surgeries", label: "Surgeries", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg> },
    { to: "/doczoc/insights", label: "Insights", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
  ];

  const billingSublinks = [
    { to: "/doczoc/billing", label: "Claims", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
    { to: "/doczoc/rcm", label: "Pipeline", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
  ];

  const afterBillingLinks: typeof links = [];

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
            className={`dz-sidebar-link${l.to === "/doczoc/surgeries" ? " dz-sidebar-surgery" : ""}${path === l.to || (l.to !== "/doczoc/dashboard" && path.startsWith(l.to)) ? " active" : ""}`}
          >
            {l.icon}
            {!collapsed && <span>{l.label}</span>}
          </Link>
        ))}
        {/* Billing submenu */}
        {!collapsed ? (
          <>
            <button
              className={`dz-sidebar-link dz-sidebar-parent${billingOpen ? " open" : ""}${path.startsWith("/doczoc/billing") || path.startsWith("/doczoc/rcm") ? " active" : ""}`}
              onClick={() => setBillingOpen(!billingOpen)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              <span>Billing</span>
              <svg className="dz-sidebar-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            {billingOpen && billingSublinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`dz-sidebar-link dz-sidebar-sublink${path === l.to || path.startsWith(l.to) ? " active" : ""}`}
              >
                {l.icon}
                <span>{l.label}</span>
              </Link>
            ))}
          </>
        ) : (
          billingSublinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`dz-sidebar-link${path === l.to || path.startsWith(l.to) ? " active" : ""}`}
            >
              {l.icon}
            </Link>
          ))
        )}
        {afterBillingLinks.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className={`dz-sidebar-link${path === l.to || path.startsWith(l.to) ? " active" : ""}`}
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
            <Link to="/doczoc/reports" className="dz-user-popup-item" onClick={() => setUserMenuOpen(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              Reports
            </Link>
            <Link to="/doczoc/team" className="dz-user-popup-item" onClick={() => setUserMenuOpen(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              Team
            </Link>
            <Link to="/doczoc/appearance" className="dz-user-popup-item" onClick={() => setUserMenuOpen(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09"/></svg>
              Appearance
            </Link>
            <div className="dz-user-popup-divider" />
            <div style={{ padding: "6px 14px" }}>
              <div style={{ fontSize: "0.62rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>API</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.75rem", color: "var(--dz-text-muted)" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block", boxShadow: "0 0 4px rgba(34,197,94,0.5)" }} />
                All systems operational
              </div>
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
    {!hideThemeToggle && <ThemeToggleFab />}
    </>
  );
}

function ThemeToggleFab() {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme");
      if (stored === "light" || stored === "dark") {
        document.documentElement.setAttribute("data-theme", stored);
        return stored;
      }
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

export default function DashboardPage() {
  const [collapsed, setCollapsed] = useState(false);
  const { bgId } = useDzPrefs();
  const location = useLocation();
  const [showSplash, setShowSplash] = useState(() => !!(location.state as any)?.fromLogin);

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

  const fromLogin = !!(location.state as any)?.fromLogin;
  const [contentReady, setContentReady] = useState(!fromLogin);

  useEffect(() => {
    if (!showSplash && !contentReady) {
      // Use double-rAF to ensure the splash DOM is removed and layout is stable before animating
      requestAnimationFrame(() => requestAnimationFrame(() => setContentReady(true)));
    }
  }, [showSplash, contentReady]);


  return (
    <div className={`dz-platform${!showSplash && fromLogin ? " dz-platform-cinematic" : ""}`}>
      {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}
      <PlatformBg bgId={bgId} />
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className={`dz-platform-main${collapsed ? " dz-main-expanded" : ""}${contentReady ? " dz-content-visible" : " dz-content-hidden"}`}>
        <header className="dz-platform-header dz-fade-element" style={{ animationDelay: "0.1s" }}>
          <div>
            <h1>Dashboard</h1>
            <p>Welcome back, Dr. Elguizaoui</p>
          </div>
          <div className="dz-platform-header-right">
          </div>
        </header>

        <div className="dz-stats-grid dz-fade-element" style={{ animationDelay: "0.25s" }}>
          {stats.map((s) => (
            <div key={s.label} className="dz-stat-card">
              <div className="dz-stat-card-label">{s.label}</div>
              <div className="dz-stat-card-value" style={{ color: s.color }}>{s.value}</div>
              <div className="dz-stat-card-change" style={{ color: "#22c55e" }}>{s.change} from last week</div>
            </div>
          ))}
        </div>

        {/* Next Patient */}
        <div className="dz-card dz-fade-element" style={{
          animationDelay: "0.35s",
          padding: "22px 26px",
          marginBottom: 24,
          borderLeft: "3px solid #6366f1",
          background: "var(--dz-card-bg, rgba(15,23,42,0.55))",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.15)",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--dz-text-muted, #64748b)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Next Patient</div>
              <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--dz-text-primary, #f1f5f9)" }}>James Kim</div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{
                fontSize: "0.65rem", fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                background: "rgba(59,130,246,0.12)", color: "#60a5fa",
              }}>New Patient</span>
              <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#818cf8" }}>9:30 AM</span>
            </div>
          </div>
          <div style={{
            fontSize: "0.8rem", lineHeight: 1.65, color: "var(--dz-text-secondary, #94a3b8)",
            padding: "12px 14px", borderRadius: 8,
            background: "rgba(99,102,241,0.04)", border: "1px solid rgba(99,102,241,0.08)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
              <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#818cf8", textTransform: "uppercase", letterSpacing: "0.03em" }}>AI Summary</span>
            </div>
            ACL tear (left), positive Lachman. Scheduled for reconstruction consult.
            <AiSummaryExpand>
              MRI confirmed complete tear with lateral meniscus involvement. Anterior drawer test positive. Reports instability during lateral movements, unable to return to sports. Conservative management (bracing + PT x 8 weeks) showed minimal improvement. Recommend discussing autograft vs allograft options. BMI 24.2, no prior surgical history, cleared by PCP for anesthesia. Insurance pre-auth submitted to UnitedHealthcare (pending).
            </AiSummaryExpand>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 8, marginTop: 10,
            padding: "8px 12px", borderRadius: 8,
            background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.12)",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#f87171" }}>Starts in 25 minutes</span>
            <span style={{ fontSize: "0.65rem", color: "var(--dz-text-dim)", marginLeft: 4 }}>(9:30 AM)</span>
          </div>
        </div>

        <div className="dz-dash-section dz-fade-element" style={{ animationDelay: "0.5s" }}>
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
