import { Link, useLocation } from "react-router";
import { useState, useRef, useEffect, useMemo, type ReactNode } from "react";
import { PlatformBg } from "~/components/PlatformBg";
import { PATIENTS } from "~/data/patients";

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
    { to: "/doczoc/dashboard", label: "Home", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
    { to: "/doczoc/calendar", label: "Calendar", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
    { to: "/doczoc/patients", label: "Patients", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { to: "/doczoc/appointments", label: "Appointments", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
    { to: "/doczoc/surgeries", label: "Surgeries", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg> },
    { to: "/doczoc/insights", label: "Insights", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
  ];

  const billingSublinks = [
    { to: "/doczoc/billing", label: "Claims", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
    { to: "/doczoc/rcm", label: "Pipeline", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
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

// ── Google Reviews (Dashboard Card) ─────────────────────────────────
import { GOOGLE_REVIEWS, GOOGLE_RATING, GOOGLE_REVIEW_COUNT } from "~/data/google-reviews";

function StarRating({ rating, size = 10 }: { rating: number; size?: number }) {
  return (
    <span style={{ display: "inline-flex", gap: 1 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i <= rating ? "#fbbf24" : "none"} stroke="#fbbf24" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  );
}

function DashGoogleReviews() {
  return (
    <div className="dz-card" style={{ height: "100%", display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
      {/* Header */}
      <Link to="/doczoc/google-reviews" style={{ textDecoration: "none", color: "inherit", padding: "16px 18px 12px", borderBottom: "1px solid rgba(148,163,184,0.06)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--dz-text-muted, #64748b)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Latest Reviews</span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
            <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#fbbf24" }}>{GOOGLE_RATING}</span>
            <StarRating rating={5} size={9} />
          </div>
        </div>
        <span style={{ fontSize: "0.65rem", color: "#22c55e", fontWeight: 600 }}>{GOOGLE_REVIEW_COUNT} reviews</span>
      </Link>

      {/* Scrollable review list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 10px" }}>
        {GOOGLE_REVIEWS.slice(0, 8).map((review, i) => (
          <div key={i} style={{
            padding: "10px 10px", borderRadius: 8,
            background: i % 2 === 0 ? "transparent" : "var(--dz-input-bg, rgba(148,163,184,0.03))",
            borderBottom: i < 7 ? "1px solid rgba(148,163,184,0.04)" : "none",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
              <div>
                <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--dz-text-primary, #f1f5f9)" }}>{review.author_name}</span>
                <span style={{ fontSize: "0.55rem", color: "var(--dz-text-dim, #475569)", marginLeft: 6 }}>{new Date(review.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                <span style={{ fontSize: "0.5rem", color: "var(--dz-text-dim, #475569)", marginLeft: 4, opacity: 0.7 }}>· {review.location}</span>
              </div>
              <StarRating rating={review.rating} size={7} />
            </div>
            <div style={{
              fontSize: "0.62rem", color: "var(--dz-text-muted, #64748b)", lineHeight: 1.45,
              overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const,
            }}>
              {review.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Next Patient with live countdown ────────────────────────────────
function DashNextPatient() {
  // Demo: appointment is always 1:30 from now
  const [secondsLeft, setSecondsLeft] = useState(90);
  const [insightHovered, setInsightHovered] = useState(false);
  const [insightExpanded, setInsightExpanded] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const countdownText = `${mins}:${secs.toString().padStart(2, "0")}`;
  const urgent = secondsLeft < 60;

  return (
    <div style={{ marginTop: 24, marginBottom: 24 }}>
      <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 12, color: "var(--dz-text-primary, #f1f5f9)" }}>Upcoming Patients</h2>
      <div style={{ display: "flex", gap: 14 }}>
      {/* Next Patient — primary card */}
      <div className="dz-card" style={{ flex: "1 1 55%", padding: 0, overflow: "hidden" }}>
        <div style={{ display: "flex" }}>
          {/* Left: countdown */}
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            padding: "20px 24px", minWidth: 100,
            background: urgent ? "rgba(239,68,68,0.08)" : "rgba(99,102,241,0.06)",
            borderRight: `1px solid ${urgent ? "rgba(239,68,68,0.12)" : "rgba(99,102,241,0.08)"}`,
          }}>
            <div style={{
              fontSize: "1.6rem", fontWeight: 900, fontVariantNumeric: "tabular-nums",
              color: urgent ? "#f87171" : "#818cf8",
              fontFamily: "'SF Mono', Consolas, monospace",
            }}>{countdownText}</div>
            <div style={{ fontSize: "0.62rem", fontWeight: 600, color: "var(--dz-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 2 }}>
              until start
            </div>
          </div>

          {/* Right: patient info */}
          <div style={{ flex: 1, padding: "16px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(59,130,246,0.12)", color: "#60a5fa", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700, flexShrink: 0 }}>JK</div>
              <div>
                <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--dz-text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Next Patient</div>
                <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--dz-text-primary)" }}>James Kim</div>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  fontSize: "0.62rem", fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                  background: "rgba(99,102,241,0.1)", color: "#818cf8",
                }}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
                  Appointment
                </span>
                <span style={{
                  fontSize: "0.62rem", fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                  background: "rgba(59,130,246,0.12)", color: "#60a5fa",
                }}>New Patient</span>
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#818cf8" }}>9:30 AM</span>
              </div>
            </div>

            <div style={{ fontSize: "0.72rem", color: "var(--dz-text-muted)", marginBottom: 8 }}>
              Initial Consultation — Knee (ACL)
            </div>

            {/* AI Insight — entire row hoverable with Show insight CTA */}
            <div
              className="dz-ai-row"
              onMouseEnter={() => setInsightHovered(true)}
              onMouseLeave={() => setInsightHovered(false)}
              onClick={() => setInsightExpanded(!insightExpanded)}
              style={{
                fontSize: "0.78rem", lineHeight: 1.6, color: "var(--dz-text-secondary)",
                padding: "10px 12px", borderRadius: 8,
                background: insightHovered ? "rgba(99,102,241,0.08)" : "rgba(99,102,241,0.04)",
                border: insightHovered ? "1px solid rgba(99,102,241,0.18)" : "1px solid rgba(99,102,241,0.08)",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M20 12a8 8 0 0 0-8-8v8h8z"/></svg>
                  <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#818cf8", textTransform: "uppercase", letterSpacing: "0.03em" }}>AI Summary</span>
                </div>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  fontSize: "0.62rem", fontWeight: 700, color: "#818cf8",
                  opacity: insightHovered || insightExpanded ? 1 : 0,
                  transition: "opacity 0.15s",
                }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: insightExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                  {insightExpanded ? "Hide insight" : "Show insight"}
                </span>
              </div>
              ACL tear (left), positive Lachman. Scheduled for reconstruction consult.
              {insightExpanded && (
                <div style={{ marginTop: 6, paddingTop: 6, borderTop: "1px solid rgba(99,102,241,0.1)" }}>
                  MRI confirmed complete tear with lateral meniscus involvement. Anterior drawer test positive. Reports instability during lateral movements, unable to return to sports. Conservative management (bracing + PT x 8 weeks) showed minimal improvement. Recommend discussing autograft vs allograft options. BMI 24.2, no prior surgical history, cleared by PCP for anesthesia. Insurance pre-auth submitted to UnitedHealthcare (pending).
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Time gap */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, padding: "0 4px", flexShrink: 0 }}>
        <div style={{ width: 1, flex: 1, background: "rgba(148,163,184,0.15)" }} />
        <span style={{ fontSize: "0.65rem", fontWeight: 600, color: "#64748b", whiteSpace: "nowrap" }}>45 min</span>
        <div style={{ width: 1, flex: 1, background: "rgba(148,163,184,0.15)" }} />
      </div>

      {/* After Next — secondary card */}
      <div className="dz-card" style={{ flex: "1 1 45%", padding: 0, overflow: "hidden", opacity: 0.85 }}>
        <div style={{ display: "flex", height: "100%" }}>
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            padding: "20px 20px", minWidth: 80,
            background: "rgba(34,197,94,0.06)",
            borderRight: "1px solid rgba(34,197,94,0.08)",
          }}>
            <div style={{
              fontSize: "0.82rem", fontWeight: 800, color: "#22c55e",
              fontFamily: "'SF Mono', Consolas, monospace",
            }}>10:15</div>
            <div style={{ fontSize: "0.58rem", fontWeight: 600, color: "var(--dz-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 2 }}>AM</div>
          </div>
          <div style={{ flex: 1, padding: "16px 20px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(34,197,94,0.12)", color: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", fontWeight: 700, flexShrink: 0 }}>ML</div>
              <div>
                <div style={{ fontSize: "0.6rem", fontWeight: 700, color: "var(--dz-text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>After Next</div>
                <div style={{ fontSize: "0.92rem", fontWeight: 800, color: "var(--dz-text-primary)" }}>Maria Lopez</div>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{
                  fontSize: "0.6rem", fontWeight: 700, padding: "3px 8px", borderRadius: 20,
                  background: "rgba(34,197,94,0.1)", color: "#22c55e",
                }}>Confirmed</span>
              </div>
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--dz-text-muted)", marginBottom: 6 }}>
              Post-Op — ACL
            </div>
            <div style={{
              fontSize: "0.7rem", lineHeight: 1.5, color: "var(--dz-text-secondary)",
              padding: "8px 10px", borderRadius: 6,
              background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.06)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M20 12a8 8 0 0 0-8-8v8h8z"/></svg>
                <span style={{ fontSize: "0.6rem", fontWeight: 700, color: "#22c55e", textTransform: "uppercase" }}>AI Summary</span>
              </div>
              6-week post-op ACL reconstruction. ROM improving, PT reports good progress.
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

// ── Appointment Type Over Time Graph ──────────────────────────────────
const APPT_TYPE_COLORS: Record<string, string> = {
  "Surgery": "#ef4444",
  "Initial Consultation": "#6366f1",
};

function categorizeVisitType(type: string): string {
  const t = type.toLowerCase();
  if (t.includes("surgery")) return "Surgery";
  return "Initial Consultation";
}

type TimeRange = "3mo" | "6mo" | "1yr";
type GraphMode = "appt-types" | "total-volume" | "new-vs-returning";

function getMonthlyApptData(range: TimeRange) {
  const now = new Date();
  const monthCount = range === "3mo" ? 3 : range === "6mo" ? 6 : 12;
  const months: { label: string; key: string }[] = [];
  for (let i = monthCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      label: d.toLocaleDateString("en-US", { month: "short" }),
      key: `${d.getFullYear()}-${d.getMonth()}`,
    });
  }

  const categories = Object.keys(APPT_TYPE_COLORS);
  const data: Record<string, number[]> = {};
  for (const cat of categories) data[cat] = new Array(monthCount).fill(0);

  // Also track total and new vs returning
  const totalByMonth = new Array(monthCount).fill(0);
  const newByMonth = new Array(monthCount).fill(0);
  const returningByMonth = new Array(monthCount).fill(0);

  for (const p of PATIENTS) {
    let visitCount = 0;
    for (const v of p.visits) {
      const d = new Date(v.date);
      if (isNaN(d.getTime())) continue;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const idx = months.findIndex(m => m.key === key);
      visitCount++;
      if (idx === -1) continue;
      const cat = categorizeVisitType(v.type);
      data[cat][idx]++;
      totalByMonth[idx]++;
      if (visitCount === 1) newByMonth[idx]++;
      else returningByMonth[idx]++;
    }
  }

  const totals = months.map((_, i) => categories.reduce((sum, cat) => sum + data[cat][i], 0));
  const avg = totals.reduce((s, v) => s + v, 0) / monthCount;

  return { months, data, categories, totals, avg, totalByMonth, newByMonth, returningByMonth, monthCount };
}

const GRAPH_MODES: { key: GraphMode; label: string }[] = [
  { key: "appt-types", label: "Appointment Types" },
  { key: "total-volume", label: "Total Volume" },
  { key: "new-vs-returning", label: "New vs Returning" },
];
const TIME_RANGES: { key: TimeRange; label: string }[] = [
  { key: "3mo", label: "3M" },
  { key: "6mo", label: "6M" },
  { key: "1yr", label: "1Y" },
];

const NVR_COLORS: Record<string, string> = { "New Patients": "#8b5cf6", "Returning": "#22c55e" };

function AppointmentGraph() {
  const [animated, setAnimated] = useState(false);
  const [hoveredCat, setHoveredCat] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; cat: string; month: string; value: number } | null>(null);
  const [range, setRange] = useState<TimeRange>("1yr");
  const [mode, setMode] = useState<GraphMode>("appt-types");
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRefs = useRef<Map<string, SVGPathElement>>(new Map());

  const { months, data, categories, avg, totalByMonth, newByMonth, returningByMonth, monthCount } = useMemo(() => getMonthlyApptData(range), [range]);

  // Build lines based on mode
  const lines: { key: string; values: number[]; color: string }[] = useMemo(() => {
    if (mode === "appt-types") return categories.filter(c => data[c].some(v => v > 0)).map(c => ({ key: c, values: data[c], color: APPT_TYPE_COLORS[c] }));
    if (mode === "total-volume") return [{ key: "Total", values: totalByMonth, color: "#6366f1" }];
    return [{ key: "New Patients", values: newByMonth, color: "#8b5cf6" }, { key: "Returning", values: returningByMonth, color: "#22c55e" }];
  }, [mode, data, categories, totalByMonth, newByMonth, returningByMonth]);

  const colorMap: Record<string, string> = useMemo(() => {
    const m: Record<string, string> = {};
    lines.forEach(l => { m[l.key] = l.color; });
    return m;
  }, [lines]);

  // Animate on mount and when range/mode changes
  useEffect(() => {
    setAnimated(false);
    const timer = setTimeout(() => setAnimated(true), 80);
    return () => clearTimeout(timer);
  }, [range, mode]);

  // Measure path lengths for left-to-right animation
  useEffect(() => {
    if (!animated) return;
    pathRefs.current.forEach((el) => {
      const len = el.getTotalLength();
      el.style.strokeDasharray = `${len}`;
      el.style.strokeDashoffset = `${len}`;
      el.getBoundingClientRect(); // force reflow
      el.style.transition = "stroke-dashoffset 2.2s cubic-bezier(0.25, 0.1, 0.25, 1)";
      el.style.strokeDashoffset = "0";
    });
  }, [animated, lines]);

  const W = 800, H = 220, PL = 36, PR = 12, PT = 12, PB = 24;
  const chartW = W - PL - PR;
  const chartH = H - PT - PB;
  const allVals = lines.flatMap(l => l.values);
  const maxVal = Math.max(...allVals, 1);
  const yMax = Math.ceil(maxVal / 5) * 5 || 5;
  const xStep = chartW / Math.max(monthCount - 1, 1);
  const yScale = (v: number) => PT + chartH - (v / yMax) * chartH;
  const xPos = (i: number) => PL + i * xStep;

  const buildPath = (values: number[]) =>
    values.map((v, i) => `${i === 0 ? "M" : "L"}${xPos(i).toFixed(1)},${yScale(v).toFixed(1)}`).join(" ");

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = W / rect.width;
    const x = (e.clientX - rect.left) * scaleX;
    const idx = Math.round((x - PL) / xStep);
    if (idx < 0 || idx >= monthCount) { setTooltip(null); return; }
    const scaleY = H / rect.height;
    const y = (e.clientY - rect.top) * scaleY;
    let closestLine = lines[0];
    let closestDist = Infinity;
    for (const line of lines) {
      const cy = yScale(line.values[idx]);
      const dist = Math.abs(y - cy);
      if (dist < closestDist) { closestDist = dist; closestLine = line; }
    }
    if (closestDist < 50) {
      setTooltip({ x: xPos(idx), y: yScale(closestLine.values[idx]), cat: closestLine.key, month: months[idx].label, value: closestLine.values[idx] });
    } else {
      setTooltip(null);
    }
  };

  const yTicks = 5;
  const modeLabel = GRAPH_MODES.find(m => m.key === mode)?.label || "";
  const rangeLabel = range === "3mo" ? "3 months" : range === "6mo" ? "6 months" : "12 months";

  const pillStyle = (active: boolean): React.CSSProperties => ({
    padding: "4px 12px", borderRadius: 20, border: "1px solid " + (active ? "var(--dz-accent, #6366f1)" : "rgba(148,163,184,0.15)"),
    background: active ? "rgba(99,102,241,0.15)" : "transparent",
    color: active ? "var(--dz-accent, #818cf8)" : "var(--dz-text-muted, #64748b)",
    fontSize: "0.62rem", fontWeight: 700, cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit",
  });

  return (
    <div className="dz-card" style={{ padding: "14px 18px", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            {GRAPH_MODES.map(m => (
              <button key={m.key} onClick={() => setMode(m.key)} style={pillStyle(mode === m.key)}>{m.label}</button>
            ))}
          </div>
          <div style={{ fontSize: "0.68rem", color: "var(--dz-text-muted, #64748b)", marginTop: 6 }}>Last {rangeLabel} · Avg {avg.toFixed(1)}/mo</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {TIME_RANGES.map(t => (
            <button key={t.key} onClick={() => setRange(t.key)} style={pillStyle(range === t.key)}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px", marginBottom: 6 }}>
        {lines.map(line => (
          <button
            key={line.key}
            onMouseEnter={() => setHoveredCat(line.key)}
            onMouseLeave={() => setHoveredCat(null)}
            style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", padding: "2px 0", opacity: hoveredCat && hoveredCat !== line.key ? 0.3 : 1, transition: "opacity 0.2s", fontFamily: "inherit" }}
          >
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: line.color }} />
            <span style={{ fontSize: "0.62rem", fontWeight: 600, color: "var(--dz-text-muted, #94a3b8)" }}>{line.key}</span>
          </button>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 16, height: 2, background: "#64748b", display: "inline-block", borderTop: "1px dashed #64748b" }} />
          <span style={{ fontSize: "0.62rem", fontWeight: 600, color: "var(--dz-text-muted, #64748b)" }}>Avg</span>
        </div>
      </div>

      {/* Chart */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ display: "block", overflow: "visible" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
      >
        <defs>
          {lines.map(line => (
            <linearGradient key={line.key} id={`grad-${line.key.replace(/\s+/g, "")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={line.color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={line.color} stopOpacity="0" />
            </linearGradient>
          ))}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Y-axis grid */}
        {Array.from({ length: yTicks + 1 }, (_, i) => {
          const val = (yMax / yTicks) * i;
          const y = yScale(val);
          return (
            <g key={i}>
              <line x1={PL} y1={y} x2={W - PR} y2={y} stroke="var(--dz-border, rgba(148,163,184,0.08))" strokeWidth="1" />
              <text x={PL - 6} y={y + 3} textAnchor="end" fontSize="9" fill="var(--dz-text-muted, #64748b)" fontFamily="inherit">{Math.round(val)}</text>
            </g>
          );
        })}

        {/* X-axis labels */}
        {months.map((m, i) => (
          <text key={m.key} x={xPos(i)} y={H - 6} textAnchor="middle" fontSize="9" fill="var(--dz-text-muted, #64748b)" fontFamily="inherit">{m.label}</text>
        ))}

        {/* Average line */}
        <line
          x1={PL} y1={yScale(avg)} x2={W - PR} y2={yScale(avg)}
          stroke="#64748b" strokeWidth="1" strokeDasharray="6 4"
          opacity={animated ? 0.6 : 0}
          style={{ transition: "opacity 1s ease 1s" }}
        />

        {/* Lines */}
        {lines.map(line => {
          const path = buildPath(line.values);
          const lastIdx = monthCount - 1;
          const areaPath = `${path} L${xPos(lastIdx).toFixed(1)},${yScale(0).toFixed(1)} L${xPos(0).toFixed(1)},${yScale(0).toFixed(1)} Z`;
          const isHovered = hoveredCat === line.key;
          const dimmed = hoveredCat && !isHovered;
          return (
            <g key={line.key} style={{ transition: "opacity 0.25s", opacity: dimmed ? 0.12 : 1 }}>
              <path d={areaPath} fill={`url(#grad-${line.key.replace(/\s+/g, "")})`} opacity={animated ? (isHovered ? 0.5 : 0.2) : 0} style={{ transition: "opacity 1.2s ease 0.5s" }} />
              {/* Glow */}
              <path
                ref={el => { if (el) pathRefs.current.set(`glow-${line.key}`, el); }}
                d={path} fill="none" stroke={line.color}
                strokeWidth={isHovered ? 3.5 : 2.5} strokeLinecap="round" strokeLinejoin="round"
                filter="url(#glow)"
                strokeDasharray="2000" strokeDashoffset="2000"
              />
              {/* Solid */}
              <path
                ref={el => { if (el) pathRefs.current.set(`line-${line.key}`, el); }}
                d={path} fill="none" stroke={line.color}
                strokeWidth={isHovered ? 2.5 : 1.8} strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray="2000" strokeDashoffset="2000"
              />
              {/* Dots */}
              {line.values.map((v, i) => (
                <circle key={i} cx={xPos(i)} cy={yScale(v)} r={isHovered ? 4 : 2.5}
                  fill={line.color} stroke="var(--dz-card-bg, #0f1021)" strokeWidth={1.5}
                  opacity={animated ? 1 : 0}
                  style={{ transition: `opacity 0.4s ease ${1.2 + i * 0.08}s, r 0.2s` }}
                />
              ))}
            </g>
          );
        })}

        {/* Tooltip */}
        {tooltip && (
          <g>
            <line x1={tooltip.x} y1={PT} x2={tooltip.x} y2={PT + chartH} stroke="var(--dz-text-muted, #64748b)" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
            <circle cx={tooltip.x} cy={tooltip.y} r={5} fill={colorMap[tooltip.cat] || "#818cf8"} stroke="white" strokeWidth="2" />
            <rect x={tooltip.x - 60} y={tooltip.y - 34} width={120} height={24} rx={6} fill="var(--dz-card-bg, #1a1a2e)" stroke="var(--dz-border, rgba(148,163,184,0.15))" strokeWidth="1" />
            <text x={tooltip.x} y={tooltip.y - 19} textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--dz-text-primary, #f1f5f9)" fontFamily="inherit">
              {tooltip.cat}: {tooltip.value} ({tooltip.month})
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

export default function DashboardPage() {
  const [collapsed, setCollapsed] = useState(false);
  const { bgId } = useDzPrefs();
  const location = useLocation();
  const [showSplash, setShowSplash] = useState(() => !!(location.state as any)?.fromLogin);

  const recentPatients = [
    { name: "Sarah Mitchell", type: "Follow-up — Shoulder", time: "9:00 AM", status: "Confirmed" },
    { name: "James Kim", type: "New Patient — Knee", time: "9:30 AM", status: "New" },
    { name: "Maria Lopez", type: "Post-Op — ACL", time: "10:15 AM", status: "Confirmed" },
    { name: "David Ross", type: "Consultation — Hip", time: "11:00 AM", status: "Pending" },
    { name: "Emily Chen", type: "Follow-up — Wrist", time: "1:00 PM", status: "Confirmed" },
    { name: "Michael Brown", type: "Sports Injury — Ankle", time: "2:30 PM", status: "New" },
  ];

  const fromLogin = !!(location.state as any)?.fromLogin;
  const contentReady = true;


  return (
    <div className="dz-platform">
      {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}
      <PlatformBg bgId={bgId} />
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className={`dz-platform-main${collapsed ? " dz-main-expanded" : ""} dz-content-visible`}>
        <header className="dz-platform-header">
          <div>
            <h1>Dashboard</h1>
            <p>Welcome back, Dr. Elguizaoui</p>
          </div>
          <div className="dz-platform-header-right">
          </div>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16, gridTemplateRows: "1fr", overflow: "hidden" }}>
          <AppointmentGraph />
          <div style={{ minHeight: 0, overflow: "hidden" }}>
            <DashGoogleReviews />
          </div>
        </div>

        <DashNextPatient />

        <div className="dz-dash-section" style={{ marginTop: 16 }}>
          <h2>Today's Schedule</h2>
          <div className="dz-table-wrap">
            <table className="dz-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th className="dz-col-patient">Patient</th>
                  <th>Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentPatients.map((p) => {
                  const initials = p.name.split(" ").map(n => n[0]).join("");
                  const colors = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#14b8a6"];
                  const cidx = p.name.charCodeAt(0) % colors.length;
                  return (
                    <tr key={p.name}>
                      <td className="dz-table-time">{p.time}</td>
                      <td className="dz-col-patient">
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, background: `${colors[cidx]}18`, color: colors[cidx], display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", fontWeight: 700 }}>{initials}</div>
                          <span className="dz-table-name" style={{ fontSize: "0.82rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                        </div>
                      </td>
                      <td>{p.type}</td>
                      <td><span className={`dz-status-badge dz-status-${p.status.toLowerCase()}`}>{p.status}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
