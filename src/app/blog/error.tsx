"use client";

import Link from "next/link";
import { useEffect } from "react";
import { logError } from "@/lib/log";

// Blog-segment error boundary. Catches render errors inside /blog
// and /blog/[slug] without bubbling up to the root boundary —
// keeps the nav/footer and shows a blog-shaped fallback.

export default function BlogError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logError("blog.error", error, { digest: error.digest });
  }, [error]);

  return (
    <>
      <section className="blog-hero">
        <div className="container">
          <span className="blog-hero-label">Something went wrong</span>
          <h1>
            Clinical <span className="text-accent">Clarity</span>
          </h1>
          <p className="blog-hero-desc">
            We hit an error loading this post. The issue&rsquo;s been logged.
          </p>
        </div>
      </section>
      <section className="section">
        <div
          className="container"
          style={{ textAlign: "center", display: "grid", gap: 16, justifyContent: "center" }}
        >
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn btn-primary" onClick={reset}>
              Try again
            </button>
            <Link href="/blog" className="btn btn-outline">
              Back to blog index
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
