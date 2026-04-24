"use client";

import Link from "next/link";
import { useEffect } from "react";
import { logError } from "@/lib/log";

// Top-level error boundary. Next.js renders this whenever any
// server-rendered or client-rendered page in the app tree throws
// during render. Kept self-contained styling-wise (inline styles +
// theme vars from theme.css) because it can render under any route,
// including /doczoc or /dev where legacy.css isn't loaded.

const btnPrimary: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "12px 24px",
  borderRadius: 999,
  background: "var(--primary)",
  color: "#fff",
  fontWeight: 600,
  border: "none",
  cursor: "pointer",
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

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logError("app.rootError", error, { digest: error.digest });
  }, [error]);

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
          Something went wrong
        </p>
        <h1 style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)", margin: "12px 0 18px" }}>
          We hit an unexpected error.
        </h1>
        <p style={{ color: "var(--text-light)", lineHeight: 1.7, marginBottom: 28 }}>
          The issue has been logged and we&rsquo;re looking into it. You can
          try reloading this page, or head back to the homepage. If you need
          to reach Dr. Elguizaoui right now, call{" "}
          <a href="tel:+19179059370" style={{ color: "var(--primary)" }}>
            (917) 905-9370
          </a>
          .
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button style={btnPrimary} onClick={reset}>
            Try again
          </button>
          <Link href="/" style={btnOutline}>
            Back to homepage
          </Link>
        </div>
      </div>
    </main>
  );
}
