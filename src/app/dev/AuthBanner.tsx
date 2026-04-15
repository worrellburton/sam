"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// Renders a slim red banner at the top of the /dev UI when the visitor
// isn't authed against DEV_PANEL_SECRET. Without this banner, API
// requests under /api/dev/* silently return 401 and form submissions
// that "look like they worked" (UI state updates optimistically) fail
// to actually persist. Polls the lightweight /api/dev/auth-check
// endpoint once on mount.

interface AuthState {
  authed: boolean;
  hasSecret: boolean;
  nodeEnv: string;
}

export function AuthBanner() {
  const pathname = usePathname();
  const [state, setState] = useState<AuthState | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const resp = await fetch("/api/dev/auth-check", { cache: "no-store" });
        if (!resp.ok) throw new Error(String(resp.status));
        const data = (await resp.json()) as AuthState;
        if (!cancelled) setState(data);
      } catch {
        if (!cancelled) setError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Never show the banner on the signin page itself — the form IS the
  // sign-in UI.
  if (pathname === "/dev/signin") return null;

  // In local dev we're always implicitly authed; no banner needed.
  if (state?.nodeEnv !== "production") return null;

  if (error) {
    return (
      <Banner color="amber">
        Couldn&rsquo;t reach <code>/api/dev/auth-check</code>. The dev
        panel will still render, but API writes may fail.
      </Banner>
    );
  }

  if (!state) return null;

  if (!state.hasSecret) {
    return (
      <Banner color="red">
        <strong>DEV_PANEL_SECRET is not set on this deploy.</strong>{" "}
        Add it to Vercel&rsquo;s env vars; until then, every{" "}
        <code>/api/dev/*</code> write will fail with 503.
      </Banner>
    );
  }

  if (!state.authed) {
    const next = encodeURIComponent(pathname);
    return (
      <Banner color="red">
        <strong>You&rsquo;re not signed in.</strong> That&rsquo;s why
        thumbnails / generated images don&rsquo;t persist — the API
        routes silently 401.{" "}
        <Link
          href={`/dev/signin?next=${next}`}
          style={{ color: "#fecaca", textDecoration: "underline", fontWeight: 600 }}
        >
          Sign in →
        </Link>
      </Banner>
    );
  }

  return null;
}

function Banner({
  children,
  color,
}: {
  children: React.ReactNode;
  color: "red" | "amber";
}) {
  const bg = color === "red" ? "rgba(239,68,68,0.12)" : "rgba(251,191,36,0.12)";
  const border =
    color === "red" ? "rgba(239,68,68,0.35)" : "rgba(251,191,36,0.35)";
  const text = color === "red" ? "#fecaca" : "#fde68a";
  return (
    <div
      role="alert"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 90,
        background: bg,
        borderBottom: `1px solid ${border}`,
        color: text,
        fontSize: "0.85rem",
        padding: "10px 20px",
        lineHeight: 1.4,
      }}
    >
      {children}
    </div>
  );
}
