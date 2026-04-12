"use client";

import { useState } from "react";
import Link from "next/link";
import { DevSidebar } from "../DevSidebar";
import { blogPosts } from "@/data/blog";

type Style = "photorealistic" | "editorial" | "abstract";

interface GenState {
  phase: "idle" | "prompting" | "generating" | "saving" | "done" | "error";
  prompt: string;
  style: Style;
  imageData: string | null;
  imageMime: string;
  error: string;
  savedPath: string | null;
}

const defaultGen: GenState = {
  phase: "idle",
  prompt: "",
  style: "photorealistic",
  imageData: null,
  imageMime: "image/png",
  error: "",
  savedPath: null,
};

const styleLabels: Record<Style, { label: string; color: string }> = {
  photorealistic: { label: "Photorealistic", color: "#3b82f6" },
  editorial: { label: "Editorial", color: "#a855f7" },
  abstract: { label: "Abstract Art", color: "#f59e0b" },
};

export default function DevBlogPage() {
  const [search, setSearch] = useState("");
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);
  const [genStates, setGenStates] = useState<Record<string, GenState>>({});

  const filtered = blogPosts.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.tag.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase())
  );

  function getGen(slug: string): GenState {
    return genStates[slug] || defaultGen;
  }

  function updateGen(slug: string, updates: Partial<GenState>) {
    setGenStates((prev) => ({
      ...prev,
      [slug]: { ...(prev[slug] || defaultGen), ...updates },
    }));
  }

  async function handleGeneratePrompt(slug: string) {
    const post = blogPosts.find((p) => p.slug === slug);
    if (!post) return;
    const gen = getGen(slug);

    updateGen(slug, { phase: "prompting", error: "" });

    try {
      const res = await fetch("/api/dev/generate-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: post.title,
          excerpt: post.excerpt,
          content: post.contentHtml || post.content,
          style: gen.style,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate prompt");
      updateGen(slug, { phase: "idle", prompt: data.prompt });
    } catch (err) {
      updateGen(slug, {
        phase: "error",
        error: err instanceof Error ? err.message : "Prompt generation failed",
      });
    }
  }

  async function handleGenerateImage(slug: string) {
    const gen = getGen(slug);
    if (!gen.prompt.trim()) return;

    updateGen(slug, { phase: "generating", error: "", imageData: null });

    try {
      const res = await fetch("/api/dev/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: gen.prompt,
          aspectRatio: "16:9",
          imageSize: "2K",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate image");
      updateGen(slug, {
        phase: "done",
        imageData: data.image,
        imageMime: data.mimeType || "image/png",
      });
    } catch (err) {
      updateGen(slug, {
        phase: "error",
        error: err instanceof Error ? err.message : "Image generation failed",
      });
    }
  }

  async function handleSaveImage(slug: string) {
    const gen = getGen(slug);
    if (!gen.imageData) return;

    updateGen(slug, { phase: "saving", error: "" });

    const ext = gen.imageMime.includes("jpeg") ? "jpg" : "png";
    const fileName = `${slug}.${ext}`;

    try {
      const res = await fetch("/api/dev/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName,
          folder: "images/blog",
          content: gen.imageData,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save image");
      updateGen(slug, { phase: "done", savedPath: data.path });
    } catch (err) {
      updateGen(slug, {
        phase: "error",
        error: err instanceof Error ? err.message : "Save failed",
      });
    }
  }

  const input: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    background: "#111827",
    border: "1px solid #1e293b",
    borderRadius: 8,
    color: "#e2e8f0",
    fontSize: "0.88rem",
    outline: "none",
  };

  const btnPrimary: React.CSSProperties = {
    padding: "8px 16px",
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: "0.82rem",
    fontWeight: 600,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    transition: "background 0.15s",
  };

  const btnSecondary: React.CSSProperties = {
    ...btnPrimary,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid #1e293b",
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0a0e1a", color: "#e2e8f0" }}>
      <DevSidebar />
      <main style={{ flex: 1, marginLeft: 220, padding: "40px 48px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 700, color: "#f1f5f9", margin: 0 }}>Blog</h1>
            <p style={{ color: "#64748b", fontSize: "0.9rem", marginTop: 4 }}>
              {blogPosts.length} posts &middot; {blogPosts.filter((p) => !p.comingSoon).length} published &middot;{" "}
              {blogPosts.filter((p) => p.comingSoon).length} coming soon
            </p>
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <input type="text" placeholder="Search posts..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...input, maxWidth: 400 }} />
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

          {filtered.map((post) => {
            const gen = getGen(post.slug);
            const isExpanded = expandedSlug === post.slug;

            return (
              <div key={post.slug} style={{ marginBottom: 4 }}>
                {/* Row */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 140px 100px 80px",
                    gap: 16,
                    padding: "14px 16px",
                    background: isExpanded ? "#0f172a" : "#111827",
                    borderRadius: isExpanded ? "10px 10px 0 0" : 10,
                    alignItems: "center",
                    border: "1px solid",
                    borderColor: isExpanded ? "#334155" : "#1e293b",
                    borderBottom: isExpanded ? "none" : undefined,
                    transition: "border-color 0.15s",
                    cursor: "pointer",
                  }}
                  onClick={() => setExpandedSlug(isExpanded ? null : post.slug)}
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
                    <span style={{ display: "inline-block", padding: "3px 8px", background: "rgba(99,102,241,0.12)", color: "#a5b4fc", borderRadius: 6, fontSize: "0.75rem", fontWeight: 500 }}>
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
                      onClick={(e) => e.stopPropagation()}
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

                {/* Expanded panel */}
                {isExpanded && (
                  <div
                    style={{
                      background: "#0f172a",
                      border: "1px solid #334155",
                      borderTop: "none",
                      borderRadius: "0 0 10px 10px",
                      padding: "20px 24px 24px",
                    }}
                  >
                    <div style={{ display: "flex", gap: 24 }}>
                      {/* Left: controls */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Style selector */}
                        <div style={{ marginBottom: 16 }}>
                          <label style={{ fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b", display: "block", marginBottom: 8 }}>
                            Style
                          </label>
                          <div style={{ display: "flex", gap: 8 }}>
                            {(Object.keys(styleLabels) as Style[]).map((s) => (
                              <button
                                key={s}
                                onClick={() => updateGen(post.slug, { style: s })}
                                style={{
                                  padding: "6px 14px",
                                  borderRadius: 6,
                                  border: "1px solid",
                                  borderColor: gen.style === s ? styleLabels[s].color : "#1e293b",
                                  background: gen.style === s ? `${styleLabels[s].color}18` : "transparent",
                                  color: gen.style === s ? styleLabels[s].color : "#94a3b8",
                                  fontSize: "0.78rem",
                                  fontWeight: 500,
                                  cursor: "pointer",
                                  transition: "all 0.15s",
                                }}
                              >
                                {styleLabels[s].label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Step 1: Generate prompt with Claude */}
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                            <label style={{ fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b" }}>
                              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 18, height: 18, borderRadius: "50%", background: "rgba(99,102,241,0.2)", color: "#818cf8", fontSize: "0.65rem", fontWeight: 700, marginRight: 6 }}>1</span>
                              Image Prompt
                            </label>
                            <button
                              onClick={() => handleGeneratePrompt(post.slug)}
                              disabled={gen.phase === "prompting"}
                              style={{
                                ...btnSecondary,
                                padding: "5px 12px",
                                fontSize: "0.75rem",
                                opacity: gen.phase === "prompting" ? 0.5 : 1,
                              }}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M12 2a4 4 0 014 4c0 1.1-.5 2-1.2 2.7L19 15l-3 3-6.3-4.2A4 4 0 018 6a4 4 0 014-4z" />
                              </svg>
                              {gen.phase === "prompting" ? "Claude is thinking..." : "Ask Claude"}
                            </button>
                          </div>
                          <textarea
                            value={gen.prompt}
                            onChange={(e) => updateGen(post.slug, { prompt: e.target.value })}
                            placeholder="Click 'Ask Claude' to generate a prompt from the article, or write your own..."
                            rows={4}
                            style={{ ...input, resize: "vertical", fontFamily: "inherit", lineHeight: 1.5 }}
                          />
                        </div>

                        {/* Step 2: Generate image */}
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <button
                            onClick={() => handleGenerateImage(post.slug)}
                            disabled={!gen.prompt.trim() || gen.phase === "generating"}
                            style={{
                              ...btnPrimary,
                              opacity: !gen.prompt.trim() || gen.phase === "generating" ? 0.5 : 1,
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <polyline points="21 15 16 10 5 21" />
                            </svg>
                            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 16, height: 16, borderRadius: "50%", background: "rgba(255,255,255,0.2)", fontSize: "0.6rem", fontWeight: 700, marginRight: -2 }}>2</span>
                            {gen.phase === "generating" ? "Generating..." : "Generate Image"}
                          </button>

                          {gen.imageData && gen.phase !== "generating" && (
                            <button
                              onClick={() => handleSaveImage(post.slug)}
                              disabled={gen.phase === "saving"}
                              style={{
                                ...btnPrimary,
                                background: "#22c55e",
                                opacity: gen.phase === "saving" ? 0.5 : 1,
                              }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                                <polyline points="17 21 17 13 7 13 7 21" />
                                <polyline points="7 3 7 8 15 8" />
                              </svg>
                              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 16, height: 16, borderRadius: "50%", background: "rgba(255,255,255,0.2)", fontSize: "0.6rem", fontWeight: 700, marginRight: -2 }}>3</span>
                              {gen.phase === "saving" ? "Saving..." : "Save to /images/blog/"}
                            </button>
                          )}
                        </div>

                        {/* Status messages */}
                        {gen.phase === "generating" && (
                          <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid #6366f1", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
                            <span style={{ color: "#94a3b8", fontSize: "0.82rem" }}>Nano Banana 2 is generating your image...</span>
                          </div>
                        )}
                        {gen.error && (
                          <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, color: "#f87171", fontSize: "0.82rem" }}>
                            {gen.error}
                          </div>
                        )}
                        {gen.savedPath && (
                          <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 8, color: "#4ade80", fontSize: "0.82rem" }}>
                            Saved to <code style={{ background: "rgba(255,255,255,0.1)", padding: "2px 6px", borderRadius: 4 }}>{gen.savedPath}</code>
                          </div>
                        )}
                      </div>

                      {/* Right: preview */}
                      <div style={{ width: 360, flexShrink: 0 }}>
                        <label style={{ fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b", display: "block", marginBottom: 8 }}>
                          Preview
                        </label>
                        <div
                          style={{
                            width: "100%",
                            aspectRatio: "16 / 9",
                            borderRadius: 10,
                            overflow: "hidden",
                            background: "#1e293b",
                            border: "1px solid #334155",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {gen.imageData ? (
                            <img
                              src={`data:${gen.imageMime};base64,${gen.imageData}`}
                              alt="Generated preview"
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          ) : (
                            <div style={{ textAlign: "center", color: "#475569", padding: 24 }}>
                              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: 8, opacity: 0.5 }}>
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <polyline points="21 15 16 10 5 21" />
                              </svg>
                              <p style={{ fontSize: "0.78rem", margin: 0 }}>Generate an image to preview</p>
                            </div>
                          )}
                        </div>
                        {gen.imageData && (
                          <p style={{ fontSize: "0.72rem", color: "#475569", marginTop: 6, textAlign: "center" }}>
                            {gen.imageMime} &middot; Click &ldquo;Save&rdquo; to upload to /images/blog/{post.slug}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#475569" }}>
              No posts match &ldquo;{search}&rdquo;
            </div>
          )}
        </div>

        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </main>
    </div>
  );
}
