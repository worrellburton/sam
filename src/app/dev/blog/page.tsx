"use client";

import { useState } from "react";
import Link from "next/link";
import { DevSidebar } from "../DevSidebar";
import { blogPosts } from "@/data/blog";

export default function DevBlogPage() {
  const [search, setSearch] = useState("");

  const filtered = blogPosts.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.tag.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0a0e1a", color: "#e2e8f0" }}>
      <DevSidebar />
      <main style={{ flex: 1, marginLeft: 220, padding: "40px 48px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 700, color: "#f1f5f9", margin: 0 }}>Blog</h1>
            <p style={{ color: "#64748b", fontSize: "0.9rem", marginTop: 4 }}>{blogPosts.length} posts &middot; {blogPosts.filter(p => !p.comingSoon).length} published &middot; {blogPosts.filter(p => p.comingSoon).length} coming soon</p>
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <input
            type="text"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              maxWidth: 400,
              padding: "10px 14px",
              background: "#111827",
              border: "1px solid #1e293b",
              borderRadius: 8,
              color: "#e2e8f0",
              fontSize: "0.88rem",
              outline: "none",
            }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {/* Header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 140px 100px 80px",
              gap: 16,
              padding: "10px 16px",
              fontSize: "0.72rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#64748b",
            }}
          >
            <span>Title</span>
            <span>Tag / Series</span>
            <span>Date</span>
            <span>Status</span>
            <span></span>
          </div>

          {filtered.map((post) => (
            <div
              key={post.slug}
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 140px 100px 80px",
                gap: 16,
                padding: "14px 16px",
                background: "#111827",
                borderRadius: 10,
                marginBottom: 4,
                alignItems: "center",
                border: "1px solid #1e293b",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#334155")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1e293b")}
            >
              <div style={{ minWidth: 0 }}>
                <p style={{ fontWeight: 600, color: "#f1f5f9", fontSize: "0.9rem", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {post.title}
                </p>
                <p style={{ color: "#64748b", fontSize: "0.78rem", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  /blog/{post.slug}
                </p>
              </div>

              <div style={{ minWidth: 0 }}>
                <span
                  style={{
                    display: "inline-block",
                    padding: "3px 8px",
                    background: "rgba(99,102,241,0.12)",
                    color: "#a5b4fc",
                    borderRadius: 6,
                    fontSize: "0.75rem",
                    fontWeight: 500,
                  }}
                >
                  {post.tag}
                </span>
                {post.seriesTitle && (
                  <p style={{ color: "#475569", fontSize: "0.72rem", marginTop: 3 }}>
                    {post.seriesTitle} {post.episode && `· Ep. ${post.episode}`}
                  </p>
                )}
              </div>

              <span style={{ color: "#94a3b8", fontSize: "0.82rem" }}>{post.date}</span>

              <span
                style={{
                  display: "inline-block",
                  padding: "3px 8px",
                  borderRadius: 6,
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  background: post.comingSoon ? "rgba(251,191,36,0.12)" : "rgba(52,211,153,0.12)",
                  color: post.comingSoon ? "#fbbf24" : "#34d399",
                  width: "fit-content",
                }}
              >
                {post.comingSoon ? "Draft" : "Published"}
              </span>

              <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                <Link
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 30,
                    height: 30,
                    borderRadius: 6,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid #1e293b",
                    color: "#94a3b8",
                    textDecoration: "none",
                    transition: "all 0.15s",
                  }}
                  title="View post"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#475569" }}>
              No posts match &ldquo;{search}&rdquo;
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
