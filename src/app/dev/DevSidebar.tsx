"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  {
    to: "/dev",
    exact: true,
    label: "Home",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    to: "/dev#dashboard",
    label: "Dashboard",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
      </svg>
    ),
  },
  {
    to: "/dev#reviews",
    label: "Reviews",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    to: "/dev#seo",
    label: "SEO",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
    ),
  },
  {
    to: "/dev#geo",
    label: "GEO",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
      </svg>
    ),
  },
  {
    to: "/dev#bookings",
    label: "Bookings",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    to: "/dev#analytics",
    label: "Analytics",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 20V10M12 20V4M6 20v-6" />
      </svg>
    ),
  },
  {
    to: "/dev/blog",
    label: "Blog",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
  {
    to: "/dev/blog/batch",
    label: "Batch Thumbs",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    to: "/dev/images",
    label: "Images",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
  },
  {
    to: "/dev/videos",
    label: "Videos",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    ),
  },
];

export function DevSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (link: typeof links[0]) => {
    if ('exact' in link && link.exact) return pathname === "/dev";
    if (link.to.includes("#")) return false;
    // /dev/blog and /dev/blog/batch are siblings — only the most specific match wins.
    if (link.to === "/dev/blog") return pathname === "/dev/blog";
    return pathname.startsWith(link.to);
  };

  return (
    <>
      <style>{`
        .dev-sidebar {
          width: 220px;
          min-height: 100vh;
          background: #0c1021;
          border-right: 1px solid #1e293b;
          display: flex;
          flex-direction: column;
          padding: 24px 0;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 100;
        }
        .dev-sidebar-brand {
          padding: 0 20px 24px;
          border-bottom: 1px solid #1e293b;
          margin-bottom: 16px;
        }
        .dev-sidebar-brand-bold { font-size: 1.1rem; font-weight: 800; color: #f1f5f9; }
        .dev-sidebar-brand-accent { font-size: 1.1rem; font-weight: 800; color: #818cf8; }
        .dev-sidebar-brand-sub {
          display: block;
          font-size: 0.68rem;
          color: #475569;
          margin-top: 2px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .dev-sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 4px; padding: 0 10px; }
        .dev-sidebar-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 8px;
          color: #94a3b8;
          text-decoration: none;
          font-size: 0.88rem;
          font-weight: 500;
          transition: all 0.15s;
        }
        .dev-sidebar-link:hover { color: #e2e8f0; background: rgba(255,255,255,0.04); }
        .dev-sidebar-link.active { background: rgba(99, 102, 241, 0.12); color: #c7d2fe; }
        .dev-sidebar-bottom { padding: 16px 20px; border-top: 1px solid #1e293b; }
        .dev-sidebar-back { color: #475569; font-size: 0.78rem; text-decoration: none; }
        .dev-sidebar-back:hover { color: #94a3b8; }
        .dev-hamburger { display: none; }
        .dev-overlay { display: none; }

        @media (max-width: 768px) {
          .dev-sidebar {
            left: -260px;
            transition: left 0.3s ease;
            width: 240px;
          }
          .dev-sidebar.open { left: 0; }
          .dev-hamburger {
            display: flex;
            align-items: center;
            justify-content: center;
            position: fixed;
            top: 12px;
            left: 12px;
            z-index: 101;
            width: 40px;
            height: 40px;
            background: #111827;
            border: 1px solid #1e293b;
            border-radius: 8px;
            color: #94a3b8;
            cursor: pointer;
            font-size: 0;
          }
          .dev-overlay {
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.6);
            z-index: 99;
          }
          .dev-overlay.open { display: block; }
        }
      `}</style>
      <button className="dev-hamburger" onClick={() => setOpen(!open)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {open ? (
            <path d="M18 6L6 18M6 6l12 12" />
          ) : (
            <path d="M3 12h18M3 6h18M3 18h18" />
          )}
        </svg>
      </button>
      <div className={`dev-overlay${open ? " open" : ""}`} onClick={() => setOpen(false)} />
      <aside className={`dev-sidebar${open ? " open" : ""}`}>
        <div className="dev-sidebar-brand">
          <span className="dev-sidebar-brand-bold">Sam</span>
          <span className="dev-sidebar-brand-accent">MD</span>
          <span className="dev-sidebar-brand-sub">Admin Portal</span>
        </div>
        <nav className="dev-sidebar-nav">
          {links.map((l) => (
            <Link
              key={l.to}
              href={l.to}
              className={`dev-sidebar-link${isActive(l) ? " active" : ""}`}
              onClick={() => setOpen(false)}
            >
              {l.icon}
              <span>{l.label}</span>
            </Link>
          ))}
        </nav>
        <div className="dev-sidebar-bottom">
          <Link href="/" className="dev-sidebar-back">
            &larr; Back to site
          </Link>
        </div>
      </aside>
    </>
  );
}
