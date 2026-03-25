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
  const latest = GOOGLE_REVIEWS[0];

  return (
    <Link to="/doczoc/google-reviews" className="dz-stat-card" style={{ cursor: "pointer", textDecoration: "none", color: "inherit" }}>
      <div className="dz-stat-card-label" style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Google Reviews
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <div className="dz-stat-card-value" style={{ color: "#fbbf24" }}>{GOOGLE_RATING}</div>
        <StarRating rating={5} size={11} />
      </div>
      <div className="dz-stat-card-change" style={{ color: "#22c55e" }}>{GOOGLE_REVIEW_COUNT} reviews</div>
      {/* Latest review preview */}
      <div style={{
        marginTop: 8, padding: "8px 10px", borderRadius: 8,
        background: "var(--dz-input-bg, rgba(148,163,184,0.06))",
        border: "1px solid rgba(148,163,184,0.05)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
          <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--dz-text-primary)" }}>{latest.author_name}</span>
          <StarRating rating={latest.rating} size={8} />
        </div>
        <div style={{
          fontSize: "0.68rem", color: "var(--dz-text-muted)", lineHeight: 1.4,
          overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const,
        }}>
          {latest.text}
        </div>
      </div>
    </Link>
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
    <div style={{ display: "flex", gap: 14, marginBottom: 24 }}>
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
  );
}

export default function DashboardPage() {
  const [collapsed, setCollapsed] = useState(false);
  const { bgId } = useDzPrefs();
  const location = useLocation();
  const [showSplash, setShowSplash] = useState(() => !!(location.state as any)?.fromLogin);

  const stats = [
    { label: "Today's Appointments", value: "24", change: "+3", color: "#6366f1" },
    { label: "New Patients (Week)", value: "18", change: "+5", color: "#22c55e" },
    { label: "Show Rate", value: "96%", change: "+2%", color: "#a78bfa" },
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

        <div className="dz-stats-grid">
          {stats.map((s) => (
            <div key={s.label} className="dz-stat-card">
              <div className="dz-stat-card-label">{s.label}</div>
              <div className="dz-stat-card-value" style={{ color: s.color }}>{s.value}</div>
              <div className="dz-stat-card-change" style={{ color: "#22c55e" }}>{s.change} from last week</div>
            </div>
          ))}
          <DashGoogleReviews />
        </div>

        {/* Next Patient */}
        <DashNextPatient />

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
