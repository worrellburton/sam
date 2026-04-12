"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DevSidebar } from "../DevSidebar";
import { blogPosts } from "@/data/blog";

const GLOBAL_PROMPT_LS_KEY = "dev:blog:globalPrompt";

const FALLBACK_GLOBAL_PROMPT = `SETTING: New York City. All images should feel unmistakably NYC — Manhattan skyline, brownstone stoops, Central Park at golden hour, Williamsburg / Brooklyn Bridge, rooftop tracks, Chelsea lofts, subway staircases. Light, architecture, and energy should read as New York.

PEOPLE: Subjects are 20s–40s only. Athletic, active, contemporary New Yorkers. No elderly subjects, no clinical "old patient with cane" stock photo tropes.

BRAND VISUAL STYLE: Nike x Equinox. Premium, aspirational, athletic editorial. Cinematic natural light, high contrast, crisp shadows, shallow depth of field. Muted palette with one bold accent. Wardrobe is modern athletic or quiet-luxury minimalism — never hospital gowns. Clinical moments should feel like a high-end private practice or performance lab, not a fluorescent hospital.

CONSISTENCY: All 4 prompts in a set must share the same lighting palette and color DNA so they read as one campaign.`;

type Style = "photorealistic" | "editorial" | "abstract";

interface ImageSlot {
  prompt: string;
  phase: "idle" | "generating" | "done" | "error";
  data: string | null;
  mime: string;
  error: string;
}

interface GenState {
  phase: "idle" | "prompting" | "saving" | "error";
  style: Style;
  slots: ImageSlot[]; // length 4
  selectedIndex: number | null;
  error: string;
  savedPath: string | null;
}

const emptySlot = (): ImageSlot => ({
  prompt: "",
  phase: "idle",
  data: null,
  mime: "image/png",
  error: "",
});

const defaultGen: GenState = {
  phase: "idle",
  style: "photorealistic",
  slots: [emptySlot(), emptySlot(), emptySlot(), emptySlot()],
  selectedIndex: null,
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
  const [globalPrompt, setGlobalPrompt] = useState<string>(FALLBACK_GLOBAL_PROMPT);
  const [globalPromptOpen, setGlobalPromptOpen] = useState<boolean>(false);
  const [serverDefaultPrompt, setServerDefaultPrompt] = useState<string>(FALLBACK_GLOBAL_PROMPT);

  // Load saved global prompt from localStorage on mount, and fetch the
  // server default so "Reset to default" uses the real default from the API.
  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(GLOBAL_PROMPT_LS_KEY) : null;
    if (stored && stored.trim()) {
      setGlobalPrompt(stored);
    }
    fetch("/api/dev/generate-prompt")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.defaultGlobalPrompt) {
          setServerDefaultPrompt(d.defaultGlobalPrompt);
          // If the user hasn't saved a custom prompt yet, adopt the server default
          if (!stored) setGlobalPrompt(d.defaultGlobalPrompt);
        }
      })
      .catch(() => {});
  }, []);

  function saveGlobalPrompt(value: string) {
    setGlobalPrompt(value);
    if (typeof window !== "undefined") {
      if (value.trim()) localStorage.setItem(GLOBAL_PROMPT_LS_KEY, value);
      else localStorage.removeItem(GLOBAL_PROMPT_LS_KEY);
    }
  }

  function resetGlobalPrompt() {
    saveGlobalPrompt(serverDefaultPrompt);
  }

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

  function updateSlot(slug: string, index: number, updates: Partial<ImageSlot>) {
    setGenStates((prev) => {
      const cur = prev[slug] || defaultGen;
      const slots = cur.slots.map((s, i) => (i === index ? { ...s, ...updates } : s));
      return { ...prev, [slug]: { ...cur, slots } };
    });
  }

  async function handleGeneratePrompts(slug: string) {
    const post = blogPosts.find((p) => p.slug === slug);
    if (!post) return;
    const gen = getGen(slug);

    updateGen(slug, { phase: "prompting", error: "", selectedIndex: null, savedPath: null });

    try {
      const res = await fetch("/api/dev/generate-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: post.title,
          excerpt: post.excerpt,
          content: post.contentHtml || post.content,
          style: gen.style,
          globalPrompt,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate prompts");
      const prompts: string[] = data.prompts;
      setGenStates((prev) => {
        const cur = prev[slug] || defaultGen;
        return {
          ...prev,
          [slug]: {
            ...cur,
            phase: "idle",
            slots: prompts.map((p) => ({ ...emptySlot(), prompt: p })),
          },
        };
      });
    } catch (err) {
      updateGen(slug, {
        phase: "error",
        error: err instanceof Error ? err.message : "Prompt generation failed",
      });
    }
  }

  async function generateOne(slug: string, index: number) {
    const gen = getGen(slug);
    const slot = gen.slots[index];
    if (!slot?.prompt.trim()) return;
    updateSlot(slug, index, { phase: "generating", error: "", data: null });
    try {
      const res = await fetch("/api/dev/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: slot.prompt, aspectRatio: "16:9", imageSize: "2K" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate image");
      updateSlot(slug, index, { phase: "done", data: data.image, mime: data.mimeType || "image/png" });
    } catch (err) {
      updateSlot(slug, index, {
        phase: "error",
        error: err instanceof Error ? err.message : "Image generation failed",
      });
    }
  }

  async function handleGenerateAllImages(slug: string) {
    const gen = getGen(slug);
    // Fire all 4 in parallel
    await Promise.all(
      gen.slots.map((s, i) => (s.prompt.trim() ? generateOne(slug, i) : Promise.resolve()))
    );
  }

  async function handleSaveSelected(slug: string) {
    const gen = getGen(slug);
    if (gen.selectedIndex === null) return;
    const slot = gen.slots[gen.selectedIndex];
    if (!slot?.data) return;

    updateGen(slug, { phase: "saving", error: "", savedPath: null });

    const ext = slot.mime.includes("jpeg") ? "jpg" : "png";
    const fileName = `${slug}.${ext}`;
    const imagePath = `/images/blog/${fileName}`;

    try {
      // 1. Upload image
      const upload = await fetch("/api/dev/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName, folder: "images/blog", content: slot.data }),
      });
      const uploadData = await upload.json();
      if (!upload.ok) throw new Error(uploadData.error || "Failed to upload image");

      // 2. Patch blog.ts to point at the new image
      const setThumb = await fetch("/api/dev/set-blog-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, imagePath }),
      });
      const setData = await setThumb.json();
      if (!setThumb.ok) throw new Error(setData.error || "Failed to set thumbnail");

      updateGen(slug, { phase: "idle", savedPath: imagePath });
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

        {/* Global Image Prompt — applied to every "Ask Claude" request */}
        <div
          style={{
            marginBottom: 20,
            background: globalPromptOpen ? "#0f172a" : "#111827",
            border: "1px solid #1e293b",
            borderRadius: 10,
            overflow: "hidden",
            transition: "background 0.15s",
          }}
        >
          <button
            onClick={() => setGlobalPromptOpen((o) => !o)}
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              color: "#e2e8f0",
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 26,
                  height: 26,
                  borderRadius: 6,
                  background: "rgba(99,102,241,0.15)",
                  color: "#818cf8",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              </span>
              <div>
                <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600, color: "#f1f5f9" }}>Global Image Prompt</p>
                <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b", marginTop: 2 }}>
                  Applied to every &ldquo;Ask Claude for 4 prompts&rdquo; call. Saved to this browser.
                </p>
              </div>
            </div>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#64748b"
              strokeWidth="2.5"
              style={{ transform: globalPromptOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {globalPromptOpen && (
            <div style={{ padding: "0 18px 18px" }}>
              <textarea
                value={globalPrompt}
                onChange={(e) => saveGlobalPrompt(e.target.value)}
                rows={10}
                style={{
                  ...input,
                  resize: "vertical",
                  fontFamily: "inherit",
                  lineHeight: 1.55,
                  fontSize: "0.82rem",
                  background: "#0a0e1a",
                }}
                placeholder="Describe the setting, subjects, and brand visual style for all blog images..."
              />
              <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center" }}>
                <button
                  onClick={resetGlobalPrompt}
                  style={{
                    padding: "6px 12px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid #1e293b",
                    borderRadius: 6,
                    color: "#94a3b8",
                    fontSize: "0.78rem",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  Reset to default
                </button>
                <span style={{ fontSize: "0.72rem", color: "#475569" }}>
                  Saved automatically as you type.
                </span>
              </div>
            </div>
          )}
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
            const anyImage = gen.slots.some((s) => s.data);
            const allDone = gen.slots.every((s) => s.phase === "done");
            const anyGenerating = gen.slots.some((s) => s.phase === "generating");

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

                    {/* Step 1 + 2 buttons */}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                      <button
                        onClick={() => handleGeneratePrompts(post.slug)}
                        disabled={gen.phase === "prompting"}
                        style={{
                          ...btnSecondary,
                          opacity: gen.phase === "prompting" ? 0.5 : 1,
                        }}
                      >
                        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 18, height: 18, borderRadius: "50%", background: "rgba(99,102,241,0.2)", color: "#818cf8", fontSize: "0.65rem", fontWeight: 700 }}>1</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M12 2a4 4 0 014 4c0 1.1-.5 2-1.2 2.7L19 15l-3 3-6.3-4.2A4 4 0 018 6a4 4 0 014-4z" />
                        </svg>
                        {gen.phase === "prompting" ? "Claude is drafting 4 prompts..." : "Ask Claude for 4 prompts"}
                      </button>

                      <button
                        onClick={() => handleGenerateAllImages(post.slug)}
                        disabled={
                          anyGenerating ||
                          !gen.slots.every((s) => s.prompt.trim())
                        }
                        style={{
                          ...btnPrimary,
                          opacity:
                            anyGenerating || !gen.slots.every((s) => s.prompt.trim())
                              ? 0.5
                              : 1,
                        }}
                      >
                        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 18, height: 18, borderRadius: "50%", background: "rgba(255,255,255,0.2)", color: "#fff", fontSize: "0.65rem", fontWeight: 700 }}>2</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                        {anyGenerating ? "Generating 4 images..." : "Generate 4 Images"}
                      </button>

                      {anyImage && gen.selectedIndex !== null && (
                        <button
                          onClick={() => handleSaveSelected(post.slug)}
                          disabled={gen.phase === "saving"}
                          style={{
                            ...btnPrimary,
                            background: "#22c55e",
                            opacity: gen.phase === "saving" ? 0.5 : 1,
                          }}
                        >
                          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 18, height: 18, borderRadius: "50%", background: "rgba(255,255,255,0.2)", fontSize: "0.65rem", fontWeight: 700 }}>3</span>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                            <polyline points="17 21 17 13 7 13 7 21" />
                            <polyline points="7 3 7 8 15 8" />
                          </svg>
                          {gen.phase === "saving" ? "Saving & setting thumbnail..." : "Save & Set as Thumbnail"}
                        </button>
                      )}
                    </div>

                    {/* 2x2 grid of 4 slots */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: 16,
                      }}
                    >
                      {gen.slots.map((slot, i) => {
                        const isSelected = gen.selectedIndex === i;
                        return (
                          <div
                            key={i}
                            style={{
                              background: "#111827",
                              border: "2px solid",
                              borderColor: isSelected ? "#22c55e" : "#1e293b",
                              borderRadius: 10,
                              padding: 12,
                              boxShadow: isSelected ? "0 0 0 3px rgba(34,197,94,0.18)" : "none",
                              transition: "border-color 0.15s, box-shadow 0.15s",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                              <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                                Image {i + 1}{i === 0 ? " · Hero candidate" : ""}
                              </span>
                              <button
                                onClick={() => generateOne(post.slug, i)}
                                disabled={!slot.prompt.trim() || slot.phase === "generating"}
                                style={{
                                  ...btnSecondary,
                                  padding: "3px 8px",
                                  fontSize: "0.68rem",
                                  opacity: !slot.prompt.trim() || slot.phase === "generating" ? 0.5 : 1,
                                }}
                                title="Regenerate just this image"
                              >
                                {slot.phase === "generating" ? "..." : "Regenerate"}
                              </button>
                            </div>

                            {/* Image preview */}
                            <button
                              onClick={() => slot.data && updateGen(post.slug, { selectedIndex: i })}
                              disabled={!slot.data}
                              style={{
                                width: "100%",
                                aspectRatio: "16 / 9",
                                borderRadius: 8,
                                overflow: "hidden",
                                background: "#1e293b",
                                border: "none",
                                padding: 0,
                                cursor: slot.data ? "pointer" : "default",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                position: "relative",
                                marginBottom: 8,
                              }}
                              title={slot.data ? "Click to select" : undefined}
                            >
                              {slot.data ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={`data:${slot.mime};base64,${slot.data}`}
                                  alt={`Generated ${i + 1}`}
                                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                              ) : slot.phase === "generating" ? (
                                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#94a3b8", fontSize: "0.78rem" }}>
                                  <div style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid #6366f1", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
                                  Generating...
                                </div>
                              ) : (
                                <div style={{ textAlign: "center", color: "#475569", padding: 16, fontSize: "0.78rem" }}>
                                  {slot.prompt.trim() ? "Click Generate" : "No prompt yet"}
                                </div>
                              )}
                              {isSelected && (
                                <div
                                  style={{
                                    position: "absolute",
                                    top: 8,
                                    right: 8,
                                    width: 26,
                                    height: 26,
                                    borderRadius: "50%",
                                    background: "#22c55e",
                                    color: "#fff",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                                  }}
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                </div>
                              )}
                            </button>

                            <textarea
                              value={slot.prompt}
                              onChange={(e) => updateSlot(post.slug, i, { prompt: e.target.value })}
                              placeholder="Prompt for this image..."
                              rows={3}
                              style={{
                                ...input,
                                fontSize: "0.78rem",
                                resize: "vertical",
                                fontFamily: "inherit",
                                lineHeight: 1.45,
                              }}
                            />
                            {slot.error && (
                              <p style={{ color: "#f87171", fontSize: "0.72rem", marginTop: 6 }}>{slot.error}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Status messages */}
                    {gen.error && (
                      <div style={{ marginTop: 16, padding: "10px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, color: "#f87171", fontSize: "0.82rem" }}>
                        {gen.error}
                      </div>
                    )}
                    {gen.savedPath && (
                      <div style={{ marginTop: 16, padding: "12px 14px", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 8, color: "#4ade80", fontSize: "0.82rem", lineHeight: 1.6 }}>
                        <p style={{ margin: 0, color: "#bbf7d0", fontWeight: 600 }}>
                          &#10003; Image saved &amp; thumbnail updated on <code style={{ background: "rgba(255,255,255,0.1)", padding: "1px 6px", borderRadius: 4 }}>main</code>
                        </p>
                        <p style={{ margin: "4px 0 8px", color: "#86efac", fontSize: "0.76rem" }}>
                          <code style={{ background: "rgba(255,255,255,0.1)", padding: "1px 6px", borderRadius: 4 }}>{gen.savedPath}</code>
                          {" · "}blog.ts patched for <code style={{ background: "rgba(255,255,255,0.1)", padding: "1px 6px", borderRadius: 4 }}>{post.slug}</code>
                        </p>
                        <p style={{ margin: "0 0 8px", color: "#fcd34d", fontSize: "0.76rem" }}>
                          Vercel is redeploying — usually <strong>1–2 min</strong>. Hard-refresh the site (Cmd+Shift+R) after it finishes.
                        </p>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <Link
                            href={`/blog/${post.slug}?v=${Date.now()}`}
                            target="_blank"
                            style={{
                              padding: "5px 10px",
                              background: "rgba(34,197,94,0.15)",
                              border: "1px solid rgba(34,197,94,0.3)",
                              borderRadius: 6,
                              color: "#4ade80",
                              fontSize: "0.74rem",
                              fontWeight: 600,
                              textDecoration: "none",
                            }}
                          >
                            Open post (cache-busted) &rarr;
                          </Link>
                          <a
                            href={`https://github.com/worrellburton/sam/commits/main/src/data/blog.ts`}
                            target="_blank"
                            rel="noopener"
                            style={{
                              padding: "5px 10px",
                              background: "rgba(255,255,255,0.05)",
                              border: "1px solid #1e293b",
                              borderRadius: 6,
                              color: "#94a3b8",
                              fontSize: "0.74rem",
                              fontWeight: 600,
                              textDecoration: "none",
                            }}
                          >
                            Check deploy status
                          </a>
                        </div>
                      </div>
                    )}
                    {anyImage && gen.selectedIndex === null && allDone && (
                      <div style={{ marginTop: 16, padding: "10px 14px", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 8, color: "#a5b4fc", fontSize: "0.82rem" }}>
                        Click an image above to select it, then Save &amp; Set as Thumbnail.
                      </div>
                    )}
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
