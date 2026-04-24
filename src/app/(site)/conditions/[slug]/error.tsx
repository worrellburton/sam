"use client";

import Link from "next/link";
import { useEffect } from "react";
import { logError } from "@/lib/log";

export default function ConditionError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logError("conditions.slug.error", error, { digest: error.digest });
  }, [error]);

  return (
    <main style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 24px" }}>
      <div style={{ maxWidth: 540, textAlign: "center" }}>
        <p className="section-label">We couldn&rsquo;t load this condition</p>
        <h1 style={{ fontSize: "clamp(1.4rem, 4vw, 2rem)", margin: "12px 0 18px" }}>
          Something went wrong loading this page.
        </h1>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn btn-primary" onClick={reset}>Try again</button>
          <Link href="/" className="btn btn-outline">Back to homepage</Link>
        </div>
      </div>
    </main>
  );
}
