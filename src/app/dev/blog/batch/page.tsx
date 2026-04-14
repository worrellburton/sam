"use client";

/**
 * /dev/blog/batch — one-screen thumbnail generator.
 *
 * Pick a set of posts (default: all without a saved hero), choose a style,
 * and run a concurrency-limited pipeline that:
 *   1. asks Claude for 4 prompts
 *   2. generates image from prompt 1 (the hero candidate) at 16:9
 *   3. uploads the image to GitHub
 *   4. patches blog.ts to point at the new file
 *
 * Per-row status badges show exactly what's happening, in real time.
 */

import { useMemo, useState } from "react";
import { DevSidebar } from "../../DevSidebar";
import { blogPosts } from "@/data/blog";

const GLOBAL_PROMPT_LS_KEY = "dev:blog:globalPrompt";

type Style = "photorealistic" | "editorial" | "abstract";

type RowPhase =
  | "idle"
  | "queued"
  | "prompting"
  | "generating"
  | "uploading"
  | "patching"
  | "done"
  | "error"
  | "skipped";

interface RowState {
  phase: RowPhase;
  error: string;
  prompt?: string;
  imageData?: string;
  mime?: string;
  savedPath?: string;
}

const defaultRow: RowState = { phase: "idle", error: "" };

// Re-encode the raw Gemini output (PNG) as a resized WebP so we ship smaller
// files to Supabase Storage. Keeps file sizes ~10x smaller than raw 1K PNGs.
async function encodeHeroToWebp(
  rawBase64: string,
  mime: string,
  maxLongEdge = 1200,
  quality = 0.78
): Promise<{ base64: string; mime: string }> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return { base64: rawBase64, mime };
  }
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("Decode failed"));
    el.src = `data:${mime};base64,${rawBase64}`;
  });
  const longEdge = Math.max(img.naturalWidth, img.naturalHeight);
  const scale = longEdge > maxLongEdge ? maxLongEdge / longEdge : 1;
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return { base64: rawBase64, mime };
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, w, h);
  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob null"))), "image/webp", quality);
  });
  const outMime = blob.type || "image/webp";
  const buf = await blob.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return { base64: btoa(binary), mime: outMime };
}

const phaseMeta: Record<
  RowPhase,
  { label: string; color: string; bg: string; spin: boolean }
> = {
  idle: { label: "Ready", color: "#94a3b8", bg: "rgba(148,163,184,0.12)", spin: false },
  queued: { label: "Queued", color: "#94a3b8", bg: "rgba(148,163,184,0.14)", spin: false },
  prompting: { label: "Drafting prompt", color: "#a5b4fc", bg: "rgba(99,102,241,0.16)", spin: true },
  generating: { label: "Generating image", color: "#a5b4fc", bg: "rgba(99,102,241,0.16)", spin: true },
  uploading: { label: "Uploading", color: "#93c5fd", bg: "rgba(59,130,246,0.16)", spin: true },
  patching: { label: "Patching blog.ts", color: "#93c5fd", bg: "rgba(59,130,246,0.16)", spin: true },
  done: { label: "Saved", color: "#86efac", bg: "rgba(34,197,94,0.18)", spin: false },
  error: { label: "Error", color: "#fca5a5", bg: "rgba(239,68,68,0.18)", spin: false },
  skipped: { label: "Skipped", color: "#cbd5e1", bg: "rgba(148,163,184,0.1)", spin: false },
};

const styleLabels: Record<Style, string> = {
  photorealistic: "Photorealistic",
  editorial: "Editorial",
  abstract: "Abstract Art",
};

export default function BatchThumbnailPage() {
  const [rows, setRows] = useState<Record<string, RowState>>({});
  const [selected, setSelected] = useState<Set<string>>(
    // Default: all posts that currently have an Unsplash (non-local) hero.
    () => new Set(blogPosts.filter((p) => !p.image?.startsWith("/images/")).map((p) => p.slug))
  );
  const [style, setStyle] = useState<Style>("photorealistic");
  const [concurrency, setConcurrency] = useState<number>(2);
  const [skipSaved, setSkipSaved] = useState<boolean>(true);
  const [running, setRunning] = useState<boolean>(false);
  const [cancelRequested, setCancelRequested] = useState<boolean>(false);

  const posts = useMemo(() => blogPosts.slice(), []);

  function updateRow(slug: string, updates: Partial<RowState>) {
    setRows((prev) => ({ ...prev, [slug]: { ...(prev[slug] || defaultRow), ...updates } }));
  }

  function toggleSelected(slug: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(posts.map((p) => p.slug)));
  }
  function selectNone() {
    setSelected(new Set());
  }
  function selectNeedsHero() {
    setSelected(new Set(posts.filter((p) => !p.image?.startsWith("/images/")).map((p) => p.slug)));
  }

  function getGlobalPrompt(): string {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(GLOBAL_PROMPT_LS_KEY) || "";
  }

  async function runOnePost(slug: string) {
    const post = posts.find((p) => p.slug === slug);
    if (!post) return;

    if (skipSaved && post.image?.startsWith("/images/")) {
      updateRow(slug, { phase: "skipped" });
      return;
    }

    // 1. Prompt
    updateRow(slug, { phase: "prompting", error: "" });
    let prompt = "";
    try {
      const res = await fetch("/api/dev/generate-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: post.title,
          excerpt: post.excerpt,
          content: post.contentHtml || post.content,
          tag: post.tag,
          seriesTitle: post.seriesTitle,
          episode: post.episode,
          readTime: post.readTime,
          imageAlt: post.imageAlt,
          relatedService: post.relatedService,
          style,
          globalPrompt: getGlobalPrompt(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Prompt failed");
      const prompts: string[] = data.prompts || [];
      prompt = prompts[0] || "";
      if (!prompt.trim()) throw new Error("Claude returned no prompts");
      updateRow(slug, { prompt });
    } catch (err) {
      updateRow(slug, {
        phase: "error",
        error: err instanceof Error ? err.message : "Prompt failed",
      });
      return;
    }

    if (cancelRequested) {
      updateRow(slug, { phase: "skipped" });
      return;
    }

    // 2. Image
    updateRow(slug, { phase: "generating" });
    let imageData = "";
    let mime = "image/png";
    try {
      const res = await fetch("/api/dev/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, aspectRatio: "16:9", imageSize: "1K" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Image gen failed");
      imageData = data.image;
      mime = data.mimeType || "image/png";
      updateRow(slug, { imageData, mime });
    } catch (err) {
      updateRow(slug, {
        phase: "error",
        error: err instanceof Error ? err.message : "Image gen failed",
      });
      return;
    }

    if (cancelRequested) {
      updateRow(slug, { phase: "skipped" });
      return;
    }

    // Re-encode raw Gemini PNG → optimized WebP before upload. This typically
    // drops a ~1.5 MB PNG to ~80-150 KB, making the live pages much faster.
    try {
      const encoded = await encodeHeroToWebp(imageData, mime, 1200, 0.78);
      imageData = encoded.base64;
      mime = encoded.mime;
    } catch (err) {
      updateRow(slug, {
        phase: "error",
        error: err instanceof Error ? err.message : "WebP encode failed",
      });
      return;
    }

    // 3. Upload to Supabase Storage (blog-thumbnails bucket). The returned
    // publicUrl is what we persist so the site serves from the Supabase edge.
    const ext = mime.includes("webp") ? "webp" : mime.includes("jpeg") ? "jpg" : "png";
    const fileName = `${slug}.${ext}`;
    let imagePath = "";
    updateRow(slug, { phase: "uploading" });
    try {
      const upload = await fetch("/api/dev/storage-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName, content: imageData, mimeType: mime }),
      });
      const uploadData = await upload.json();
      if (!upload.ok) throw new Error(uploadData.error || "Upload failed");
      imagePath = uploadData.publicUrl;
    } catch (err) {
      updateRow(slug, {
        phase: "error",
        error: err instanceof Error ? err.message : "Upload failed",
      });
      return;
    }

    // 4. Patch blog.ts
    updateRow(slug, { phase: "patching" });
    try {
      const patch = await fetch("/api/dev/set-blog-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, imagePath }),
      });
      const patchData = await patch.json();
      if (!patch.ok) throw new Error(patchData.error || "Patch failed");
    } catch (err) {
      updateRow(slug, {
        phase: "error",
        error: err instanceof Error ? err.message : "Patch failed",
      });
      return;
    }

    updateRow(slug, { phase: "done", savedPath: imagePath });
  }

  async function runAllSelected() {
    if (running) return;
    const targets = posts.filter((p) => selected.has(p.slug)).map((p) => p.slug);
    if (targets.length === 0) return;

    setRunning(true);
    setCancelRequested(false);
    // Seed rows to queued
    setRows((prev) => {
      const next = { ...prev };
      for (const slug of targets) next[slug] = { ...(next[slug] || defaultRow), phase: "queued", error: "" };
      return next;
    });

    // Concurrency-limited pool
    const queue = [...targets];
    const pool = Math.max(1, Math.min(concurrency, 6));
    async function worker() {
      while (queue.length > 0) {
        if (cancelRequested) return;
        const slug = queue.shift();
        if (!slug) return;
        await runOnePost(slug);
      }
    }
    await Promise.all(Array.from({ length: pool }, () => worker()));
    setRunning(false);
  }

  function cancel() {
    setCancelRequested(true);
  }

  function reset() {
    setRows({});
  }

  const counts = useMemo(() => {
    const c = { queued: 0, running: 0, done: 0, error: 0, skipped: 0 };
    for (const slug of Object.keys(rows)) {
      const p = rows[slug].phase;
      if (p === "queued") c.queued++;
      else if (p === "done") c.done++;
      else if (p === "error") c.error++;
      else if (p === "skipped") c.skipped++;
      else if (p !== "idle") c.running++;
    }
    return c;
  }, [rows]);

  const input: React.CSSProperties = {
    padding: "8px 12px",
    background: "#111827",
    border: "1px solid #1e293b",
    borderRadius: 8,
    color: "#e2e8f0",
    fontSize: "0.82rem",
    outline: "none",
  };

  const btnPrimary: React.CSSProperties = {
    padding: "9px 18px",
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: "0.85rem",
    fontWeight: 600,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  };

  const btnSecondary: React.CSSProperties = {
    ...btnPrimary,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid #1e293b",
    color: "#e2e8f0",
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0a0e1a", color: "#e2e8f0" }}>
      <style>{`@keyframes devSpin { to { transform: rotate(360deg); } }`}</style>
      <DevSidebar />
      <main style={{ flex: 1, marginLeft: 220, padding: "40px 48px" }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 700, color: "#f1f5f9", margin: 0 }}>Batch Thumbnails</h1>
          <p style={{ color: "#64748b", fontSize: "0.9rem", marginTop: 4 }}>
            Generate hero thumbnails for many blog posts in parallel. Each post runs Claude &rarr; Gemini &rarr; GitHub upload &rarr; blog.ts patch.
          </p>
        </div>

        {/* Controls */}
        <div
          style={{
            background: "#0f172a",
            border: "1px solid #1e293b",
            borderRadius: 10,
            padding: 16,
            marginBottom: 20,
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            gap: 16,
          }}
        >
          <div>
            <label style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>
              Style
            </label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {(Object.keys(styleLabels) as Style[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  disabled={running}
                  style={{
                    ...btnSecondary,
                    padding: "5px 10px",
                    fontSize: "0.74rem",
                    background: style === s ? "rgba(99,102,241,0.18)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${style === s ? "rgba(99,102,241,0.4)" : "#1e293b"}`,
                    color: style === s ? "#c7d2fe" : "#cbd5e1",
                    opacity: running ? 0.6 : 1,
                  }}
                >
                  {styleLabels[s]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>
              Concurrency
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="range"
                min={1}
                max={6}
                value={concurrency}
                onChange={(e) => setConcurrency(parseInt(e.target.value, 10))}
                disabled={running}
                style={{ flex: 1 }}
              />
              <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#c7d2fe", minWidth: 16, textAlign: "right" }}>
                {concurrency}
              </span>
            </div>
            <p style={{ fontSize: "0.68rem", color: "#475569", marginTop: 4 }}>
              Posts running in parallel (API rate limits apply)
            </p>
          </div>

          <div>
            <label style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>
              Skip saved
            </label>
            <label style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={skipSaved}
                onChange={(e) => setSkipSaved(e.target.checked)}
                disabled={running}
              />
              <span style={{ fontSize: "0.82rem" }}>
                Skip posts that already have a local hero
              </span>
            </label>
          </div>

          <div>
            <label style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>
              Selection
            </label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <button onClick={selectAll} disabled={running} style={{ ...btnSecondary, padding: "5px 10px", fontSize: "0.74rem" }}>
                All ({posts.length})
              </button>
              <button onClick={selectNone} disabled={running} style={{ ...btnSecondary, padding: "5px 10px", fontSize: "0.74rem" }}>
                None
              </button>
              <button onClick={selectNeedsHero} disabled={running} style={{ ...btnSecondary, padding: "5px 10px", fontSize: "0.74rem" }}>
                Needs hero
              </button>
            </div>
          </div>
        </div>

        {/* Run bar */}
        <div
          style={{
            background: "#0f172a",
            border: "1px solid #1e293b",
            borderRadius: 10,
            padding: "14px 18px",
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={runAllSelected}
            disabled={running || selected.size === 0}
            style={{
              ...btnPrimary,
              opacity: running || selected.size === 0 ? 0.5 : 1,
            }}
          >
            {running ? (
              <>
                <span
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    border: "1.5px solid #fff",
                    borderTopColor: "transparent",
                    animation: "devSpin 0.8s linear infinite",
                    display: "inline-block",
                  }}
                />
                Running ({counts.running} · {counts.queued} queued)
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Run {selected.size} selected
              </>
            )}
          </button>

          {running && (
            <button onClick={cancel} style={{ ...btnSecondary, color: "#fca5a5", border: "1px solid rgba(239,68,68,0.3)" }}>
              Cancel remaining
            </button>
          )}
          {!running && Object.keys(rows).length > 0 && (
            <button onClick={reset} style={btnSecondary}>
              Clear status
            </button>
          )}

          <div style={{ marginLeft: "auto", display: "flex", gap: 14, fontSize: "0.78rem", color: "#94a3b8" }}>
            <span><strong style={{ color: "#86efac" }}>{counts.done}</strong> done</span>
            <span><strong style={{ color: "#a5b4fc" }}>{counts.running}</strong> running</span>
            <span><strong style={{ color: "#cbd5e1" }}>{counts.queued}</strong> queued</span>
            {counts.error > 0 && (
              <span><strong style={{ color: "#fca5a5" }}>{counts.error}</strong> errors</span>
            )}
            {counts.skipped > 0 && (
              <span><strong style={{ color: "#cbd5e1" }}>{counts.skipped}</strong> skipped</span>
            )}
          </div>
        </div>

        {/* Rows */}
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, overflow: "hidden" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "40px 60px 2fr 1fr 140px 80px",
              gap: 12,
              padding: "10px 16px",
              fontSize: "0.7rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#64748b",
              borderBottom: "1px solid #1e293b",
            }}
          >
            <span></span>
            <span>Preview</span>
            <span>Title</span>
            <span>Status</span>
            <span>Saved Path</span>
            <span></span>
          </div>

          {posts.map((post) => {
            const row = rows[post.slug] || defaultRow;
            const meta = phaseMeta[row.phase];
            const isSelected = selected.has(post.slug);
            const hasLocal = post.image?.startsWith("/images/");
            const preview = row.imageData
              ? `data:${row.mime || "image/png"};base64,${row.imageData}`
              : post.image;
            return (
              <div
                key={post.slug}
                style={{
                  display: "grid",
                  gridTemplateColumns: "40px 60px 2fr 1fr 140px 80px",
                  gap: 12,
                  padding: "10px 16px",
                  borderBottom: "1px solid #111827",
                  alignItems: "center",
                }}
              >
                <label style={{ display: "flex", alignItems: "center", justifyContent: "center", cursor: running ? "wait" : "pointer" }}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelected(post.slug)}
                    disabled={running}
                  />
                </label>
                <div
                  style={{
                    width: 50,
                    height: 36,
                    borderRadius: 4,
                    overflow: "hidden",
                    background: "#1e293b",
                    position: "relative",
                  }}
                >
                  {preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : null}
                  {row.imageData && (
                    <span
                      style={{
                        position: "absolute",
                        top: 2,
                        right: 2,
                        background: "rgba(34,197,94,0.9)",
                        color: "#fff",
                        fontSize: "0.55rem",
                        padding: "1px 4px",
                        borderRadius: 3,
                        fontWeight: 700,
                      }}
                    >
                      NEW
                    </span>
                  )}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p
                    style={{
                      fontWeight: 600,
                      color: "#f1f5f9",
                      fontSize: "0.84rem",
                      margin: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {post.title}
                  </p>
                  <p style={{ color: "#64748b", fontSize: "0.72rem", margin: "2px 0 0" }}>
                    /blog/{post.slug}
                    {hasLocal && (
                      <span style={{ marginLeft: 8, color: "#86efac" }}>&middot; local hero</span>
                    )}
                    {!hasLocal && post.image && (
                      <span style={{ marginLeft: 8, color: "#fbbf24" }}>&middot; remote hero</span>
                    )}
                  </p>
                </div>
                <div>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "3px 8px",
                      borderRadius: 999,
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      background: meta.bg,
                      color: meta.color,
                      border: `1px solid ${meta.color}30`,
                    }}
                  >
                    {meta.spin ? (
                      <span
                        style={{
                          width: 9,
                          height: 9,
                          borderRadius: "50%",
                          border: `1.5px solid ${meta.color}`,
                          borderTopColor: "transparent",
                          animation: "devSpin 0.8s linear infinite",
                          display: "inline-block",
                        }}
                      />
                    ) : (
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: meta.color,
                          display: "inline-block",
                        }}
                      />
                    )}
                    {meta.label}
                  </span>
                  {row.phase === "error" && row.error && (
                    <p style={{ color: "#fca5a5", fontSize: "0.68rem", margin: "3px 0 0" }} title={row.error}>
                      {row.error.length > 48 ? row.error.slice(0, 45) + "..." : row.error}
                    </p>
                  )}
                </div>
                <code
                  style={{
                    fontSize: "0.7rem",
                    color: row.savedPath ? "#86efac" : "#475569",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    display: "block",
                  }}
                  title={row.savedPath || ""}
                >
                  {row.savedPath || "—"}
                </code>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                  <button
                    onClick={() => runOnePost(post.slug)}
                    disabled={running || ["prompting", "generating", "uploading", "patching"].includes(row.phase)}
                    style={{
                      ...btnSecondary,
                      padding: "4px 10px",
                      fontSize: "0.7rem",
                      opacity: running ? 0.5 : 1,
                    }}
                    title="Run this post only"
                  >
                    Run
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <p style={{ marginTop: 16, fontSize: "0.76rem", color: "#475569", lineHeight: 1.6 }}>
          Prompts use the same Global Image Prompt you set on the main Blog page. Images are Gemini 3 Pro at 16:9 / 2K, uploaded to the{" "}
          <code style={{ background: "rgba(255,255,255,0.05)", padding: "1px 6px", borderRadius: 4 }}>blog-thumbnails</code> Supabase Storage bucket and wired into{" "}
          <code style={{ background: "rgba(255,255,255,0.05)", padding: "1px 6px", borderRadius: 4 }}>blog.ts</code> + Supabase automatically.
        </p>
      </main>
    </div>
  );
}
