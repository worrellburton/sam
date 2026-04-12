"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
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

  return (
    <aside style={styles.sidebar}>
      <div style={styles.brand}>
        <span style={styles.brandBold}>Sam</span>
        <span style={styles.brandAccent}>MD</span>
        <span style={styles.brandSub}>Dev Tools</span>
      </div>
      <nav style={styles.nav}>
        {links.map((l) => (
          <Link
            key={l.to}
            href={l.to}
            style={{
              ...styles.link,
              ...(pathname.startsWith(l.to) ? styles.linkActive : {}),
            }}
          >
            {l.icon}
            <span>{l.label}</span>
          </Link>
        ))}
      </nav>
      <div style={styles.bottom}>
        <Link href="/" style={styles.backLink}>
          &larr; Back to site
        </Link>
      </div>
    </aside>
  );
}

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: 220,
    minHeight: "100vh",
    background: "#0c1021",
    borderRight: "1px solid #1e293b",
    display: "flex",
    flexDirection: "column",
    padding: "24px 0",
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 100,
  },
  brand: {
    padding: "0 20px 24px",
    borderBottom: "1px solid #1e293b",
    marginBottom: 16,
  },
  brandBold: { fontSize: "1.1rem", fontWeight: 800, color: "#f1f5f9" },
  brandAccent: { fontSize: "1.1rem", fontWeight: 800, color: "#818cf8" },
  brandSub: {
    display: "block",
    fontSize: "0.68rem",
    color: "#475569",
    marginTop: 2,
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
  },
  nav: { flex: 1, display: "flex", flexDirection: "column", gap: 4, padding: "0 10px" },
  link: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 8,
    color: "#94a3b8",
    textDecoration: "none",
    fontSize: "0.88rem",
    fontWeight: 500,
    transition: "all 0.15s",
  },
  linkActive: {
    background: "rgba(99, 102, 241, 0.12)",
    color: "#c7d2fe",
  },
  bottom: { padding: "16px 20px", borderTop: "1px solid #1e293b" },
  backLink: { color: "#475569", fontSize: "0.78rem", textDecoration: "none" },
};
