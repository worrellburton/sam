import Link from "next/link";

// Top-level 404. Next.js renders this whenever a route is hit that
// doesn't match any page or when a Server Component calls notFound().
// The dynamic [slug] routes for /services, /conditions, /blog all
// call notFound() for missing slugs, so this is the catch-all for
// mistyped URLs and stale inbound links.

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
        <p className="section-label">404 — Page Not Found</p>
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
          <Link href="/" className="btn btn-primary">
            Homepage
          </Link>
          <Link href="/blog" className="btn btn-outline">
            Clinical Clarity Blog
          </Link>
          <Link href="/contact" className="btn btn-outline">
            Contact the office
          </Link>
        </div>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: 32 }}>
          Or call{" "}
          <a href="tel:+19179059370" style={{ color: "var(--primary)" }}>
            (917) 905-9370
          </a>{" "}
          to reach Dr. Elguizaoui&rsquo;s team.
        </p>
      </div>
    </main>
  );
}
