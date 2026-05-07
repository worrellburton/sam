import Link from "next/link";

// Top-level 404. Next.js renders this whenever a route is hit that
// doesn't match any page or when a Server Component calls notFound().
// Kept self-contained styling-wise (inline styles + theme vars) because
// it can render under any route, including /doczoc or /dev where
// legacy.css isn't loaded.

const btnPrimary: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "12px 24px",
  borderRadius: 999,
  background: "var(--primary)",
  color: "#fff",
  fontWeight: 600,
  textDecoration: "none",
};

const btnOutline: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "12px 24px",
  borderRadius: 999,
  background: "transparent",
  color: "var(--text)",
  fontWeight: 600,
  border: "1px solid var(--border)",
  textDecoration: "none",
};

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 24px",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: 560 }}>
        <p
          style={{
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            fontSize: "0.8rem",
            color: "var(--text-muted)",
          }}
        >
          404 — Page Not Found
        </p>
        <h1 style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)", margin: "12px 0 18px" }}>
          We couldn&rsquo;t find that page.
        </h1>
        <p style={{ color: "var(--text-light)", lineHeight: 1.7, marginBottom: 28 }}>
          The link you followed may be broken, or the page may have moved.
          Here are a few good places to land:
        </p>
        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link href="/" style={btnPrimary}>
            Homepage
          </Link>
          <Link href="/blog" style={btnOutline}>
            Clinical Clarity Blog
          </Link>
          <Link href="/contact" style={btnOutline}>
            Contact the office
          </Link>
        </div>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: 32 }}>
          Or call{" "}
          <a href="tel:+12125402265" style={{ color: "var(--primary)" }}>
            (212) 540-2265
          </a>{" "}
          to reach Dr. Elguizaoui&rsquo;s team.
        </p>
      </div>
    </main>
  );
}
