"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// /dev/signin — tiny form that exchanges DEV_PANEL_SECRET for the
// dev-panel-session cookie. The middleware redirects every other /dev/*
// route here until the cookie is set.
function DevSigninInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dev";

  const [secret, setSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/dev/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || `Sign-in failed (${res.status})`);
        setLoading(false);
        return;
      }
      // Force a full navigation so the middleware re-runs with the cookie.
      window.location.href = next;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0e1a",
        color: "#e2e8f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <form
        onSubmit={onSubmit}
        style={{
          width: "100%",
          maxWidth: 360,
          background: "#111827",
          border: "1px solid #1e293b",
          borderRadius: 12,
          padding: 24,
        }}
      >
        <div style={{ marginBottom: 18 }}>
          <p
            style={{
              fontSize: "0.72rem",
              color: "#64748b",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              margin: 0,
            }}
          >
            Admin portal
          </p>
          <h1
            style={{
              fontSize: "1.3rem",
              fontWeight: 700,
              color: "#f1f5f9",
              margin: "4px 0 0",
            }}
          >
            Sign in
          </h1>
          <p style={{ fontSize: "0.82rem", color: "#94a3b8", margin: "8px 0 0" }}>
            Enter the dev panel secret to continue.
          </p>
        </div>

        <label
          htmlFor="dev-secret"
          style={{
            display: "block",
            fontSize: "0.78rem",
            fontWeight: 600,
            color: "#94a3b8",
            marginBottom: 6,
          }}
        >
          Secret
        </label>
        <input
          id="dev-secret"
          type="password"
          autoComplete="current-password"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "10px 12px",
            background: "#0a0e1a",
            border: "1px solid #1e293b",
            borderRadius: 8,
            color: "#f1f5f9",
            fontSize: "0.92rem",
            fontFamily: "inherit",
          }}
        />

        {error && (
          <div
            role="alert"
            style={{
              marginTop: 12,
              padding: "8px 10px",
              background: "rgba(239,68,68,0.12)",
              color: "#fca5a5",
              borderRadius: 6,
              fontSize: "0.82rem",
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !secret}
          style={{
            marginTop: 16,
            width: "100%",
            padding: "11px 16px",
            background: "#4f46e5",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: "0.92rem",
            fontWeight: 600,
            cursor: loading || !secret ? "not-allowed" : "pointer",
            opacity: loading || !secret ? 0.6 : 1,
          }}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>

        <p
          style={{
            marginTop: 14,
            fontSize: "0.72rem",
            color: "#64748b",
            lineHeight: 1.5,
          }}
        >
          In development this form accepts any value. In production it checks
          the <code>DEV_PANEL_SECRET</code> env var.
        </p>
      </form>
    </div>
  );
}

export default function DevSigninPage() {
  // useSearchParams must live inside a Suspense boundary per Next 15+.
  return (
    <Suspense fallback={null}>
      <DevSigninInner />
    </Suspense>
  );
}
