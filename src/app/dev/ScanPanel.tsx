"use client";

import { useState } from "react";

// Shared UI for the /dev/seo and /dev/geo live scans.
//
// Each scan endpoint returns `{ overall, fixPrompt, ... }` at minimum.
// The panel renders a "Run scan" button, the overall score gauge,
// and a copy-to-clipboard button for the Markdown fix prompt so the
// user can drop it straight into a fresh Claude Code session.

export interface ScanBaseResult {
  overall: number;
  scannedAt: string;
  fixPrompt: string;
  /** Origin actually scanned (useful when debugging 404s). */
  baseUrl?: string;
}

interface ScanPanelProps<T extends ScanBaseResult> {
  endpoint: string;
  label: string; // e.g. "SEO", "GEO"
  onResult: (result: T) => void;
  result: T | null;
}

function gaugeColor(score: number): string {
  if (score >= 90) return "#4ade80";
  if (score >= 70) return "#fbbf24";
  return "#f87171";
}

export function ScanPanel<T extends ScanBaseResult>({
  endpoint,
  label,
  onResult,
  result,
}: ScanPanelProps<T>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(endpoint, { method: "POST" });
      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}));
        throw new Error(body.error || `Scan failed (${resp.status})`);
      }
      const data = (await resp.json()) as T;
      onResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scan failed");
    } finally {
      setLoading(false);
    }
  }

  async function copyPrompt() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.fixPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard may be blocked in insecure contexts; no UI fallback
      // needed since this is an internal tool.
    }
  }

  return (
    <div
      style={{
        background: "#111827",
        border: "1px solid #1e293b",
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        display: "flex",
        alignItems: "center",
        gap: 24,
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            border: `3px solid ${result ? gaugeColor(result.overall) : "#1e293b"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0a0e1a",
          }}
        >
          <span
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              color: result ? gaugeColor(result.overall) : "#475569",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {result ? result.overall : "—"}
          </span>
        </div>
        <div>
          <p
            style={{
              fontSize: "0.72rem",
              color: "#64748b",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              margin: 0,
            }}
          >
            {label} live score
          </p>
          <p
            style={{
              fontSize: "0.95rem",
              fontWeight: 600,
              color: "#f1f5f9",
              margin: "2px 0 0",
            }}
          >
            {result
              ? `Scanned ${new Date(result.scannedAt).toLocaleTimeString()}`
              : "Not yet scanned"}
          </p>
          {result?.baseUrl && (
            <p style={{ fontSize: "0.72rem", color: "#64748b", margin: "2px 0 0" }}>
              Host: <code style={{ color: "#c7d2fe" }}>{result.baseUrl}</code>
            </p>
          )}
          {error && (
            <p style={{ fontSize: "0.78rem", color: "#fca5a5", margin: "4px 0 0" }}>
              {error}
            </p>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginLeft: "auto", flexWrap: "wrap" }}>
        <button
          onClick={run}
          disabled={loading}
          style={{
            padding: "9px 18px",
            background: loading ? "rgba(99,102,241,0.25)" : "#4f46e5",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: "0.88rem",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? `Scanning ${label}…` : `Run ${label} scan`}
        </button>
        {result && (
          <button
            onClick={copyPrompt}
            style={{
              padding: "9px 18px",
              background: "transparent",
              color: "#c7d2fe",
              border: "1px solid rgba(99,102,241,0.3)",
              borderRadius: 8,
              fontSize: "0.88rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {copied ? "Copied ✓" : "Copy fix prompt"}
          </button>
        )}
      </div>
    </div>
  );
}
