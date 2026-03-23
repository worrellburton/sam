import { Link, useLocation } from "react-router";
import { useState, useEffect, useCallback, useRef } from "react";
import { useScrollPosition } from "~/hooks/useScrollPosition";
import { useTheme } from "~/hooks/useTheme";

const services = [
  { slug: "sports-medicine", label: "Sports Medicine", desc: "Athletic injury care" },
  { slug: "arthroscopic-surgery", label: "Arthroscopic Surgery", desc: "Minimally invasive" },
  { slug: "regenerative-medicine", label: "Regenerative Medicine", desc: "PRP & biologics" },
  { slug: "joint-preservation", label: "Joint Preservation", desc: "Save natural joints" },
  { slug: "cartilage-repair", label: "Cartilage Repair", desc: "Repair & restoration" },
  { slug: "shoulder-knee-surgery", label: "Shoulder & Knee", desc: "ACL, rotator cuff" },
];

export function Navigation() {
  const location = useLocation();
  const { scrollY, direction } = useScrollPosition();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const megaCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openMega = useCallback(() => {
    if (megaCloseTimer.current) {
      clearTimeout(megaCloseTimer.current);
      megaCloseTimer.current = null;
    }
    setMegaOpen(true);
  }, []);

  const closeMega = useCallback(() => {
    megaCloseTimer.current = setTimeout(() => {
      setMegaOpen(false);
      megaCloseTimer.current = null;
    }, 150);
  }, []);

  const isHome = location.pathname === "/" || location.pathname === "/sam/" || location.pathname === "/sam";
  const isScrolled = scrollY > 50;
  const isHidden = direction === "down" && scrollY > 200;

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
    setMobileServicesOpen(false);
    document.body.style.overflow = "";
  }, []);

  const openMobile = useCallback(() => {
    setMobileOpen(true);
    document.body.style.overflow = "hidden";
  }, []);

  useEffect(() => {
    closeMobile();
    if (megaCloseTimer.current) {
      clearTimeout(megaCloseTimer.current);
      megaCloseTimer.current = null;
    }
    setMegaOpen(false);
  }, [location.pathname, closeMobile]);

  return (
    <nav
      className={`nav${!isHome ? " nav-solid" : ""}${isScrolled ? " scrolled" : ""}${isHidden ? " nav-hidden" : ""}`}
      id="nav"
    >
      <div className="container nav-container">
        <Link to="/" className="nav-logo">
          <span className="logo-name">Sam Elguizaoui, M.D.</span>
        </Link>

        <button
          className={`nav-toggle${mobileOpen ? " active" : ""}`}
          onClick={() => (mobileOpen ? closeMobile() : openMobile())}
          aria-label="Toggle navigation"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <ul className="nav-links" id="navLinks">
          <li>
            <Link to="/about">About</Link>
          </li>
          <li
            className={`nav-mega-wrap${megaOpen ? " open" : ""}`}
            onMouseEnter={openMega}
            onMouseLeave={closeMega}
          >
            <button
              className="nav-mega-toggle"
              onClick={(e) => {
                e.preventDefault();
                setMegaOpen(!megaOpen);
              }}
            >
              Services{" "}
              <svg className="dropdown-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="mega-menu">
              <button className="mega-back-btn" onClick={() => setMegaOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>{" "}
                Back
              </button>
              <div className="mega-menu-inner">
                <div className="mega-col">
                  <h4 className="mega-heading">Treatments</h4>
                  <Link to="/services/sports-medicine" className="mega-link">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a3a5c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="14" cy="4" r="2" />
                      <path d="M4 17l4-2 3-5 4 2 3-4" />
                      <path d="M8 15l-2 6" />
                      <path d="M15 10l2 6" />
                      <path d="M11 10l-3 5" />
                    </svg>
                    <div>
                      <span>Sports Medicine</span>
                      <small>Athletic injury care &bull; Return to sport</small>
                    </div>
                  </Link>
                  <Link to="/services/arthroscopic-surgery" className="mega-link">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a3a5c" strokeWidth="1.5">
                      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                    </svg>
                    <div>
                      <span>Arthroscopic Surgery</span>
                      <small>Minimally invasive &bull; Faster recovery</small>
                    </div>
                  </Link>
                  <Link to="/services/regenerative-medicine" className="mega-link">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a3a5c" strokeWidth="1.5">
                      <path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3" />
                    </svg>
                    <div>
                      <span>Regenerative Medicine</span>
                      <small>PRP therapy &bull; Biologic treatments</small>
                    </div>
                  </Link>
                </div>
                <div className="mega-col">
                  <h4 className="mega-heading">Specialties</h4>
                  <Link to="/services/joint-preservation" className="mega-link">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a3a5c" strokeWidth="1.5">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <div>
                      <span>Joint Preservation</span>
                      <small>Save your natural joints</small>
                    </div>
                  </Link>
                  <Link to="/services/cartilage-repair" className="mega-link">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a3a5c" strokeWidth="1.5">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    <div>
                      <span>Cartilage Repair</span>
                      <small>Repair &bull; Transplant &bull; Restoration</small>
                    </div>
                  </Link>
                  <Link to="/services/shoulder-knee-surgery" className="mega-link">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a3a5c" strokeWidth="1.5">
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                      <path d="M9 14l2 2 4-4" />
                    </svg>
                    <div>
                      <span>Shoulder &amp; Knee Surgery</span>
                      <small>ACL &bull; Rotator cuff &bull; Meniscus</small>
                    </div>
                  </Link>
                </div>
                <div className="mega-col mega-cta-col">
                  <div className="mega-cta-card">
                    <h4>Ready to get started?</h4>
                    <p>Book a consultation with Dr. Elguizaoui today.</p>
                    <a href="/sam/book" className="btn btn-primary btn-block">
                      Book Now
                    </a>
                    <a href="tel:+19179059370" className="mega-phone">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>{" "}
                      +1-917-905-9370
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </li>
          <li>
            <Link to="/reviews">Reviews</Link>
          </li>
          <li>
            <Link to="/faq">FAQ</Link>
          </li>
          <li>
            <Link to="/blog">Blog</Link>
          </li>
          <li className="nav-buttons">
            <Link to="/contact" className="nav-btn-contact">
              Contact Us
            </Link>
            <Link to="/book" className="nav-btn-book">
              Book Now
            </Link>
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
              <svg className="icon-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
              <svg className="icon-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            </button>
          </li>
        </ul>

        {/* Mobile fullscreen nav — rebuilt from scratch */}
        <div className={`mobile-nav${mobileOpen ? " active" : ""}`}>
          <div className="mnav-header">
            <Link to="/" className="mnav-logo" onClick={closeMobile}>
              Sam Elguizaoui, M.D.
            </Link>
            <div className="mnav-header-actions">
              <button className="mnav-theme-btn" onClick={toggleTheme} aria-label="Toggle theme">
                {theme === "dark" ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                )}
              </button>
              <button className="mnav-close" onClick={closeMobile} aria-label="Close">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
          </div>

          <div className="mnav-body">
            <div className="mnav-links">
              <Link to="/about" className="mnav-link" onClick={closeMobile}>
                <span>About</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 6 15 12 9 18"/></svg>
              </Link>

              <button
                className={`mnav-link mnav-link-expand${mobileServicesOpen ? " open" : ""}`}
                onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
              >
                <span>Services</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: mobileServicesOpen ? "rotate(90deg)" : "none", transition: "transform 0.3s ease" }}><polyline points="9 6 15 12 9 18"/></svg>
              </button>

              <div className={`mnav-services${mobileServicesOpen ? " open" : ""}`}>
                {services.map((s) => (
                  <Link
                    key={s.slug}
                    to={`/services/${s.slug}`}
                    className="mnav-service-item"
                    onClick={closeMobile}
                  >
                    <span className="mnav-service-name">{s.label}</span>
                    <span className="mnav-service-desc">{s.desc}</span>
                  </Link>
                ))}
              </div>

              <Link to="/reviews" className="mnav-link" onClick={closeMobile}>
                <span>Reviews</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 6 15 12 9 18"/></svg>
              </Link>

              <Link to="/faq" className="mnav-link" onClick={closeMobile}>
                <span>FAQ</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 6 15 12 9 18"/></svg>
              </Link>

              <Link to="/blog" className="mnav-link" onClick={closeMobile}>
                <span>Blog</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 6 15 12 9 18"/></svg>
              </Link>

              <Link to="/contact" className="mnav-link" onClick={closeMobile}>
                <span>Contact</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 6 15 12 9 18"/></svg>
              </Link>
            </div>

            <div className="mnav-footer">
              <Link to="/book" className="mnav-book-btn" onClick={closeMobile}>
                Book Appointment
              </Link>
              <a href="tel:+19179059370" className="mnav-phone">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                (917) 905-9370
              </a>
              <div className="mnav-locations">
                <span>Manhattan</span>
                <span className="mnav-loc-dot"></span>
                <span>Brooklyn</span>
                <span className="mnav-loc-dot"></span>
                <span>Upper East Side</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
