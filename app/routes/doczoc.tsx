import { useState, useEffect } from "react";
import type { Route } from "./+types/doczoc";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "DocZoc | Provider Portal" },
    { name: "description", content: "DocZoc provider portal — manage your bookings, view patient appointments, and streamline your practice." },
  ];
}

function useThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      return (document.documentElement.getAttribute("data-theme") as "light" | "dark") || "light";
    }
    return "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return { theme, toggle: () => setTheme((t) => (t === "light" ? "dark" : "light")) };
}

export default function DocZocPage() {
  const { theme, toggle } = useThemeToggle();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="dz-page">
      {/* Nav */}
      <nav className="dz-nav">
        <div className="dz-nav-inner">
          <div className="dz-nav-left">
            <div className="dz-logo">
              <div className="dz-logo-icon">D</div>
              <span className="dz-logo-text">DocZoc</span>
            </div>
          </div>
          <div className="dz-nav-right">
            <button className="dz-theme-btn" onClick={toggle} aria-label="Toggle theme">
              {theme === "dark" ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              )}
            </button>
            <button className="dz-sign-in-btn">
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="dz-hero">
        <div className="dz-hero-inner">
          <div className="dz-hero-content">
            <div className="dz-hero-badge">For Healthcare Providers</div>
            <h1>Your Patient Bookings,<br /><span className="dz-accent">All in One Place</span></h1>
            <p className="dz-hero-sub">DocZoc gives doctors a simple, secure portal to view appointments, manage patient bookings, and stay organized — so you can focus on what matters most: your patients.</p>
            <div className="dz-hero-actions">
              <button className="dz-btn-primary">Get Started Free</button>
              <button className="dz-btn-outline">Watch Demo</button>
            </div>
            <div className="dz-hero-trust">
              <div className="dz-trust-avatars">
                <div className="dz-trust-avatar" style={{ background: "#4f46e5" }}>S</div>
                <div className="dz-trust-avatar" style={{ background: "#059669" }}>M</div>
                <div className="dz-trust-avatar" style={{ background: "#d97706" }}>R</div>
                <div className="dz-trust-avatar" style={{ background: "#dc2626" }}>A</div>
              </div>
              <span>Trusted by <strong>2,400+</strong> providers across NYC</span>
            </div>
          </div>
          <div className="dz-hero-visual">
            <div className="dz-dashboard-preview">
              <div className="dz-dash-header">
                <div className="dz-dash-dots">
                  <span></span><span></span><span></span>
                </div>
                <span className="dz-dash-title">Dashboard</span>
              </div>
              <div className="dz-dash-body">
                <div className="dz-dash-stat-row">
                  <div className="dz-dash-stat">
                    <span className="dz-dash-stat-num">24</span>
                    <span className="dz-dash-stat-label">Today's Appts</span>
                  </div>
                  <div className="dz-dash-stat">
                    <span className="dz-dash-stat-num">8</span>
                    <span className="dz-dash-stat-label">New Patients</span>
                  </div>
                  <div className="dz-dash-stat">
                    <span className="dz-dash-stat-num">96%</span>
                    <span className="dz-dash-stat-label">Show Rate</span>
                  </div>
                </div>
                <div className="dz-dash-list">
                  <div className="dz-dash-appt">
                    <div className="dz-appt-time">9:00 AM</div>
                    <div className="dz-appt-info">
                      <span className="dz-appt-name">Sarah M.</span>
                      <span className="dz-appt-type">Follow-up — Shoulder</span>
                    </div>
                    <div className="dz-appt-badge dz-confirmed">Confirmed</div>
                  </div>
                  <div className="dz-dash-appt">
                    <div className="dz-appt-time">9:30 AM</div>
                    <div className="dz-appt-info">
                      <span className="dz-appt-name">James K.</span>
                      <span className="dz-appt-type">New Patient — Knee</span>
                    </div>
                    <div className="dz-appt-badge dz-new">New</div>
                  </div>
                  <div className="dz-dash-appt">
                    <div className="dz-appt-time">10:15 AM</div>
                    <div className="dz-appt-info">
                      <span className="dz-appt-name">Maria L.</span>
                      <span className="dz-appt-type">Post-Op — ACL</span>
                    </div>
                    <div className="dz-appt-badge dz-confirmed">Confirmed</div>
                  </div>
                  <div className="dz-dash-appt">
                    <div className="dz-appt-time">11:00 AM</div>
                    <div className="dz-appt-info">
                      <span className="dz-appt-name">David R.</span>
                      <span className="dz-appt-type">Consultation — Hip</span>
                    </div>
                    <div className="dz-appt-badge dz-pending">Pending</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="dz-features">
        <div className="dz-features-inner">
          <div className="dz-section-header">
            <p className="dz-label">Why DocZoc</p>
            <h2>Everything You Need to<br /><span className="dz-accent">Manage Your Practice</span></h2>
          </div>
          <div className="dz-features-grid">
            <div className="dz-feature-card reveal">
              <div className="dz-feature-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <h3>Real-Time Bookings</h3>
              <p>See new appointments the moment patients book. No refresh needed — your schedule updates live.</p>
            </div>
            <div className="dz-feature-card reveal">
              <div className="dz-feature-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <h3>Patient Profiles</h3>
              <p>Instant access to patient history, insurance info, and visit notes — all in one clean view.</p>
            </div>
            <div className="dz-feature-card reveal">
              <div className="dz-feature-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <h3>Smart Confirmations</h3>
              <p>Automatic reminders via SMS and email reduce no-shows by up to 40%.</p>
            </div>
            <div className="dz-feature-card reveal">
              <div className="dz-feature-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <h3>HIPAA Compliant</h3>
              <p>Enterprise-grade security. Your patient data is encrypted end-to-end and never shared.</p>
            </div>
            <div className="dz-feature-card reveal">
              <div className="dz-feature-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </div>
              <h3>Analytics Dashboard</h3>
              <p>Track booking trends, patient volume, and revenue at a glance with beautiful reports.</p>
            </div>
            <div className="dz-feature-card reveal">
              <div className="dz-feature-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              </div>
              <h3>Multi-Location</h3>
              <p>Manage bookings across all your offices from a single dashboard. Perfect for group practices.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="dz-cta">
        <div className="dz-cta-inner">
          <h2>Ready to Simplify Your Practice?</h2>
          <p>Join thousands of providers who trust DocZoc to manage their patient bookings.</p>
          <div className="dz-hero-actions">
            <button className="dz-btn-primary">Create Free Account</button>
            <button className="dz-btn-outline">Contact Sales</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="dz-footer">
        <div className="dz-footer-inner">
          <div className="dz-footer-left">
            <div className="dz-logo">
              <div className="dz-logo-icon">D</div>
              <span className="dz-logo-text">DocZoc</span>
            </div>
            <p className="dz-footer-copy">&copy; {new Date().getFullYear()} DocZoc. All rights reserved.</p>
          </div>
          <div className="dz-footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Support</a>
            <a href="#">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
