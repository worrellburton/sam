"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DevSidebar } from "../DevSidebar";
import { blogPosts } from "@/data/blog";

const GLOBAL_PROMPT_LS_KEY = "dev:blog:globalPrompt";

const FALLBACK_GLOBAL_PROMPT = `SETTING: New York City. All images should feel unmistakably NYC — Manhattan skyline, brownstone stoops, Central Park at golden hour, Williamsburg / Brooklyn Bridge, rooftop tracks, Chelsea lofts, subway staircases. Light, architecture, and energy should read as New York.

PEOPLE: Subjects are 20s–40s only. Athletic, active, contemporary New Yorkers. No elderly subjects, no clinical "old patient with cane" stock photo tropes.

BRAND VISUAL STYLE: Nike x Equinox. Premium, aspirational, athletic editorial. Cinematic natural light, high contrast, crisp shadows, shallow depth of field. Muted palette with one bold accent. Wardrobe is modern athletic or quiet-luxury minimalism — never hospital gowns. Clinical moments should feel like a high-end private practice or performance lab, not a fluorescent hospital.

CONSISTENCY: All 4 prompts in a set must share the same lighting palette and color DNA so they read as one campaign.`;

type Style = "photorealistic" | "editorial" | "abstract";
type AspectRatio = "16:9" | "3:4" | "1:1";

// A single generated image is never removed from the gallery — regenerating
// a prompt or asking for a different aspect ratio appends a new one.
interface GeneratedImage {
  id: string;
  prompt: string;
  promptIndex: number; // 0-3 origin prompt slot; -1 for "pinned reshape" renders
  data: string;
  mime: string;
  aspectRatio: AspectRatio;
  ts: number;
}

// Per-prompt slot — holds the text prompt and its current generation state.
// The actual rendered image is stored in the growing `images` gallery, not
// here, so previous generations stay visible after a regenerate.
interface PromptSlot {
  prompt: string;
  phase: "idle" | "generating" | "error";
  error: string;
}

interface GenState {
  phase: "idle" | "prompting" | "saving" | "error";
  style: Style;
  prompts: PromptSlot[]; // length 4
  images: GeneratedImage[]; // grows; never cleared unless user asks for new prompts
  selectedId: string | null;
  reshapePhase: Record<AspectRatio, "idle" | "generating" | "error">;
  reshapeError: string;
  error: string;
  savedPath: string | null;
  // NYC-setting toggle. When true (default), prompts are generated with the NYC
  // setting paragraph. When false, the setting constraint is dropped so the
  // article's imagery is free to live anywhere that fits the topic.
  nyc: boolean;
}

const emptyPromptSlot = (): PromptSlot => ({
  prompt: "",
  phase: "idle",
  error: "",
});

const defaultGen: GenState = {
  phase: "idle",
  style: "photorealistic",
  prompts: [emptyPromptSlot(), emptyPromptSlot(), emptyPromptSlot(), emptyPromptSlot()],
  images: [],
  selectedId: null,
  reshapePhase: { "16:9": "idle", "3:4": "idle", "1:1": "idle" },
  reshapeError: "",
  error: "",
  savedPath: null,
  nyc: true,
};

function makeImageId(): string {
  return `img_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

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

  // Release-date state (per-post editor values + save status)
  const [releaseDrafts, setReleaseDrafts] = useState<Record<string, string>>({});
  const [releaseSaveStates, setReleaseSaveStates] = useState<
    Record<string, { phase: "idle" | "saving" | "error" | "done"; error: string }>
  >({});

  // Optimistic override of each post's published/draft state. Keys are slugs,
  // values are the desired `comingSoon` flag after the user clicks the toggle.
  // Seeded from blog.ts on first render.
  const [statusOverrides, setStatusOverrides] = useState<Record<string, boolean>>({});
  const [statusSaving, setStatusSaving] = useState<Record<string, boolean>>({});
  const [statusError, setStatusError] = useState<Record<string, string>>({});

  async function togglePostStatus(slug: string, current: boolean) {
    const next = !current;
    setStatusOverrides((prev) => ({ ...prev, [slug]: next }));
    setStatusSaving((prev) => ({ ...prev, [slug]: true }));
    setStatusError((prev) => {
      const { [slug]: _, ...rest } = prev;
      return rest;
    });
    try {
      const res = await fetch("/api/dev/set-blog-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, comingSoon: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");
    } catch (err) {
      // Roll back optimistic state on failure.
      setStatusOverrides((prev) => ({ ...prev, [slug]: current }));
      setStatusError((prev) => ({
        ...prev,
        [slug]: err instanceof Error ? err.message : "Failed",
      }));
    } finally {
      setStatusSaving((prev) => {
        const { [slug]: _, ...rest } = prev;
        return rest;
      });
    }
  }

  // Infinite-loop rotation (dev-triggered materialization)
  const [rotatePhase, setRotatePhase] = useState<"idle" | "rotating" | "error" | "done">("idle");
  const [rotateError, setRotateError] = useState<string>("");
  const [rotateResult, setRotateResult] = useState<{ promoted?: string[]; newTeaser?: string | null; noop?: boolean } | null>(null);

  async function rotateBlog() {
    setRotatePhase("rotating");
    setRotateError("");
    setRotateResult(null);
    try {
      const res = await fetch("/api/dev/rotate-blog", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to rotate");
      setRotatePhase("done");
      setRotateResult(data);
    } catch (err) {
      setRotatePhase("error");
      setRotateError(err instanceof Error ? err.message : "Failed");
    }
  }

  // Auto-schedule panel
  const [scheduleOpen, setScheduleOpen] = useState<boolean>(false);
  const [scheduleStart, setScheduleStart] = useState<string>(() => {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
  });
  const [scheduleInterval, setScheduleInterval] = useState<number>(7);
  const [schedulePhase, setSchedulePhase] = useState<"idle" | "saving" | "error" | "done">("idle");
  const [scheduleError, setScheduleError] = useState<string>("");
  const [scheduleResult, setScheduleResult] = useState<Array<{ slug: string; releaseDate: string }> | null>(null);

  // Drafts eligible for auto-schedule, ordered by episode number ascending.
  const schedulableDrafts = useMemo(
    () =>
      blogPosts
        .filter((p) => p.comingSoon)
        .slice()
        .sort((a, b) => (a.episode || 9999) - (b.episode || 9999)),
    []
  );

  function addDaysISO(iso: string, days: number): string {
    const [y, m, d] = iso.split("-").map((n) => parseInt(n, 10));
    const dt = new Date(y, (m || 1) - 1, d || 1);
    dt.setDate(dt.getDate() + days);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
  }

  function computeSchedule(): Array<{ slug: string; releaseDate: string }> {
    return schedulableDrafts.map((p, i) => ({
      slug: p.slug,
      releaseDate: addDaysISO(scheduleStart, i * Math.max(1, scheduleInterval)),
    }));
  }

  async function applySchedule() {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(scheduleStart)) {
      setSchedulePhase("error");
      setScheduleError("Start date must be YYYY-MM-DD");
      return;
    }
    const updates = computeSchedule();
    if (updates.length === 0) {
      setSchedulePhase("error");
      setScheduleError("No drafts to schedule");
      return;
    }
    setSchedulePhase("saving");
    setScheduleError("");
    setScheduleResult(null);
    try {
      const res = await fetch("/api/dev/set-release-date", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to apply schedule");
      setSchedulePhase("done");
      setScheduleResult(updates);
      // Reflect in the per-post editor inputs so the UI stays in sync
      setReleaseDrafts((prev) => {
        const next = { ...prev };
        for (const u of updates) next[u.slug] = u.releaseDate;
        return next;
      });
    } catch (err) {
      setSchedulePhase("error");
      setScheduleError(err instanceof Error ? err.message : "Failed");
    }
  }

  async function savePostReleaseDate(slug: string, releaseDate: string | null) {
    setReleaseSaveStates((prev) => ({ ...prev, [slug]: { phase: "saving", error: "" } }));
    try {
      const res = await fetch("/api/dev/set-release-date", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, releaseDate }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save release date");
      setReleaseSaveStates((prev) => ({ ...prev, [slug]: { phase: "done", error: "" } }));
    } catch (err) {
      setReleaseSaveStates((prev) => ({
        ...prev,
        [slug]: { phase: "error", error: err instanceof Error ? err.message : "Failed" },
      }));
    }
  }

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

  function updatePromptSlot(slug: string, index: number, updates: Partial<PromptSlot>) {
    setGenStates((prev) => {
      const cur = prev[slug] || defaultGen;
      const prompts = cur.prompts.map((s, i) => (i === index ? { ...s, ...updates } : s));
      return { ...prev, [slug]: { ...cur, prompts } };
    });
  }

  function appendImage(slug: string, image: GeneratedImage, autoSelect: boolean) {
    setGenStates((prev) => {
      const cur = prev[slug] || defaultGen;
      return {
        ...prev,
        [slug]: {
          ...cur,
          images: [...cur.images, image],
          selectedId: autoSelect && !cur.selectedId ? image.id : cur.selectedId,
        },
      };
    });
  }

  async function handleGeneratePrompts(slug: string) {
    const post = blogPosts.find((p) => p.slug === slug);
    if (!post) return;
    const gen = getGen(slug);

    updateGen(slug, { phase: "prompting", error: "", savedPath: null });

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
          style: gen.style,
          globalPrompt,
          nyc: gen.nyc,
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
            // Preserve prior images — the user's library keeps growing.
            prompts: prompts.map((p) => ({ ...emptyPromptSlot(), prompt: p })),
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

  async function generateFromPrompt(
    slug: string,
    promptIndex: number,
    aspectRatio: AspectRatio = "16:9"
  ) {
    const gen = getGen(slug);
    const slot = gen.prompts[promptIndex];
    if (!slot?.prompt.trim()) return;
    updatePromptSlot(slug, promptIndex, { phase: "generating", error: "" });
    try {
      const res = await fetch("/api/dev/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: slot.prompt, aspectRatio, imageSize: "2K" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate image");
      appendImage(
        slug,
        {
          id: makeImageId(),
          prompt: slot.prompt,
          promptIndex,
          data: data.image,
          mime: data.mimeType || "image/png",
          aspectRatio,
          ts: Date.now(),
        },
        /* autoSelect */ promptIndex === 0 && aspectRatio === "16:9"
      );
      updatePromptSlot(slug, promptIndex, { phase: "idle", error: "" });
    } catch (err) {
      updatePromptSlot(slug, promptIndex, {
        phase: "error",
        error: err instanceof Error ? err.message : "Image generation failed",
      });
    }
  }

  async function handleGenerateAllImages(slug: string) {
    const gen = getGen(slug);
    // Fire all 4 in parallel
    await Promise.all(
      gen.prompts.map((s, i) =>
        s.prompt.trim() ? generateFromPrompt(slug, i, "16:9") : Promise.resolve()
      )
    );
  }

  // Regenerate the CURRENTLY SELECTED image's prompt at a different aspect
  // ratio. Appends a new image to the gallery and auto-selects it.
  async function reshapeSelected(slug: string, aspectRatio: AspectRatio) {
    const gen = getGen(slug);
    const selected = gen.images.find((im) => im.id === gen.selectedId);
    if (!selected) return;

    setGenStates((prev) => {
      const cur = prev[slug] || defaultGen;
      return {
        ...prev,
        [slug]: {
          ...cur,
          reshapePhase: { ...cur.reshapePhase, [aspectRatio]: "generating" },
          reshapeError: "",
        },
      };
    });

    try {
      const res = await fetch("/api/dev/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: selected.prompt, aspectRatio, imageSize: "2K" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate image");
      const newImage: GeneratedImage = {
        id: makeImageId(),
        prompt: selected.prompt,
        promptIndex: selected.promptIndex,
        data: data.image,
        mime: data.mimeType || "image/png",
        aspectRatio,
        ts: Date.now(),
      };
      setGenStates((prev) => {
        const cur = prev[slug] || defaultGen;
        return {
          ...prev,
          [slug]: {
            ...cur,
            images: [...cur.images, newImage],
            selectedId: newImage.id,
            reshapePhase: { ...cur.reshapePhase, [aspectRatio]: "idle" },
          },
        };
      });
    } catch (err) {
      setGenStates((prev) => {
        const cur = prev[slug] || defaultGen;
        return {
          ...prev,
          [slug]: {
            ...cur,
            reshapePhase: { ...cur.reshapePhase, [aspectRatio]: "error" },
            reshapeError: err instanceof Error ? err.message : "Reshape failed",
          },
        };
      });
    }
  }

  // Fire reshapeSelected for all three aspect ratios in parallel. Used by the
  // "Generate Series" button — one click produces 16:9, 3:4, and 1:1 renders
  // of the currently selected prompt so the thumbnail set is complete.
  async function generateSeries(slug: string) {
    const ratios: AspectRatio[] = ["16:9", "3:4", "1:1"];
    await Promise.all(ratios.map((r) => reshapeSelected(slug, r)));
  }

  async function handleSaveSelected(slug: string) {
    const gen = getGen(slug);
    if (!gen.selectedId) return;
    const selected = gen.images.find((im) => im.id === gen.selectedId);
    if (!selected) return;

    updateGen(slug, { phase: "saving", error: "", savedPath: null });

    const ext = selected.mime.includes("jpeg") ? "jpg" : "png";
    const fileName = `${slug}.${ext}`;
    const imagePath = `/images/blog/${fileName}`;

    try {
      // 1. Upload image
      const upload = await fetch("/api/dev/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName, folder: "images/blog", content: selected.data }),
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
      <style>{`@keyframes devSpin { to { transform: rotate(360deg); } }`}</style>
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

        {/* Auto-schedule Releases — stack drafts and release on a cadence */}
        <div
          style={{
            marginBottom: 20,
            background: scheduleOpen ? "#0f172a" : "#111827",
            border: "1px solid #1e293b",
            borderRadius: 10,
            overflow: "hidden",
            transition: "background 0.15s",
          }}
        >
          <button
            onClick={() => setScheduleOpen((o) => !o)}
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
                  background: "rgba(251,191,36,0.15)",
                  color: "#fbbf24",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </span>
              <div>
                <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600, color: "#f1f5f9" }}>Auto-schedule Releases</p>
                <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b", marginTop: 2 }}>
                  Stack drafts and release one every N days. {schedulableDrafts.length} draft{schedulableDrafts.length === 1 ? "" : "s"} eligible.
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
              style={{ transform: scheduleOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {scheduleOpen && (
            <div style={{ padding: "0 18px 18px" }}>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 12 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    First release
                  </label>
                  <input
                    type="date"
                    value={scheduleStart}
                    onChange={(e) => setScheduleStart(e.target.value)}
                    style={{ ...input, width: 170, padding: "8px 10px", fontSize: "0.82rem" }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Release every
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <input
                      type="number"
                      min={1}
                      max={90}
                      value={scheduleInterval}
                      onChange={(e) => setScheduleInterval(Math.max(1, parseInt(e.target.value || "1", 10)))}
                      style={{ ...input, width: 70, padding: "8px 10px", fontSize: "0.82rem" }}
                    />
                    <span style={{ color: "#94a3b8", fontSize: "0.82rem" }}>days</span>
                  </div>
                </div>
                <button
                  onClick={applySchedule}
                  disabled={schedulePhase === "saving" || schedulableDrafts.length === 0}
                  style={{
                    ...btnPrimary,
                    background: "#f59e0b",
                    opacity: schedulePhase === "saving" || schedulableDrafts.length === 0 ? 0.5 : 1,
                  }}
                >
                  {schedulePhase === "saving" ? "Applying..." : "Apply schedule to all drafts"}
                </button>
              </div>

              {/* Preview */}
              {schedulableDrafts.length > 0 && (
                <div
                  style={{
                    background: "#0a0e1a",
                    border: "1px solid #1e293b",
                    borderRadius: 8,
                    padding: "10px 12px",
                    maxHeight: 220,
                    overflow: "auto",
                  }}
                >
                  <p style={{ margin: "0 0 8px", fontSize: "0.72rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Preview (ordered by episode)
                  </p>
                  {computeSchedule().map(({ slug, releaseDate }, i) => {
                    const post = blogPosts.find((p) => p.slug === slug);
                    return (
                      <div key={slug} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: "0.8rem", color: "#cbd5e1", borderTop: i === 0 ? "none" : "1px solid #1e293b" }}>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 12 }}>
                          {post?.episode ? `Ep. ${post.episode} · ` : ""}{post?.title || slug}
                        </span>
                        <span style={{ color: "#fbbf24", fontVariantNumeric: "tabular-nums" }}>{releaseDate}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {schedulePhase === "error" && scheduleError && (
                <p style={{ color: "#f87171", fontSize: "0.78rem", marginTop: 10 }}>{scheduleError}</p>
              )}
              {schedulePhase === "done" && scheduleResult && (
                <p style={{ color: "#4ade80", fontSize: "0.78rem", marginTop: 10 }}>
                  &#10003; Scheduled {scheduleResult.length} draft{scheduleResult.length === 1 ? "" : "s"}. Vercel is redeploying — drafts will auto-appear on their release dates.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Infinite-loop rotation panel */}
        {(() => {
          // Compute a preview that mirrors the server-side rotation logic so
          // the user can see the outcome before clicking.
          const withOverrides = blogPosts.map((p) => {
            const ov = statusOverrides[p.slug];
            const release = releaseDrafts[p.slug] ?? p.releaseDate ?? undefined;
            return {
              ...p,
              comingSoon: ov !== undefined ? ov : !!p.comingSoon,
              releaseDate: release || undefined,
            };
          });
          const now = new Date();
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const released = (p: typeof withOverrides[number]) => {
            if (!p.comingSoon) return true;
            if (!p.releaseDate) return false;
            const r = new Date(p.releaseDate);
            if (isNaN(r.getTime())) return false;
            const rel = new Date(r.getFullYear(), r.getMonth(), r.getDate());
            return rel.getTime() <= today.getTime();
          };
          const dueToPromote = withOverrides.filter(
            (p) => p.comingSoon && p.releaseDate && released(p)
          );
          const activeDraft = withOverrides.find(
            (p) => p.comingSoon && !released(p)
          );
          const needsTeaser = !activeDraft;
          const oldestReleased = needsTeaser
            ? [...withOverrides]
                .filter((p) => p.episode !== undefined)
                .filter((p) => released(p))
                .filter((p) => !dueToPromote.some((d) => d.slug === p.slug))
                .sort((a, b) => (a.episode || 9999) - (b.episode || 9999))[0]
            : undefined;
          const isNoop = dueToPromote.length === 0 && !oldestReleased;
          return (
            <div
              style={{
                border: "1px solid #1e293b",
                borderRadius: 10,
                padding: 18,
                marginBottom: 24,
                background: "#0c1021",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 26,
                    height: 26,
                    borderRadius: 6,
                    background: "rgba(139,92,246,0.15)",
                    color: "#a78bfa",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 2v6h-6" />
                    <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                    <path d="M3 22v-6h6" />
                    <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                  </svg>
                </span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600, color: "#f1f5f9" }}>
                    Infinite-Loop Rotation
                  </p>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b", marginTop: 2 }}>
                    When a draft releases, the oldest published episode rotates into the &ldquo;Coming Soon&rdquo; slot.
                  </p>
                </div>
                <button
                  onClick={rotateBlog}
                  disabled={rotatePhase === "rotating" || isNoop}
                  style={{
                    ...btnPrimary,
                    background: "#8b5cf6",
                    opacity: rotatePhase === "rotating" || isNoop ? 0.5 : 1,
                    cursor: rotatePhase === "rotating" || isNoop ? "not-allowed" : "pointer",
                  }}
                  title={isNoop ? "Nothing to rotate right now" : "Advance the rotation one step"}
                >
                  {rotatePhase === "rotating" ? "Rotating..." : "Advance rotation"}
                </button>
              </div>
              <div
                style={{
                  background: "#0a0e1a",
                  border: "1px solid #1e293b",
                  borderRadius: 8,
                  padding: "10px 12px",
                  fontSize: "0.8rem",
                  color: "#cbd5e1",
                }}
              >
                {isNoop ? (
                  <span style={{ color: "#64748b" }}>
                    Nothing pending — a draft with a past release date is required before a new teaser can be promoted.
                  </span>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {dueToPromote.length > 0 && (
                      <div>
                        <span style={{ color: "#34d399", fontWeight: 600 }}>Promote: </span>
                        {dueToPromote.map((p) => p.slug).join(", ")}
                      </div>
                    )}
                    {oldestReleased && (
                      <div>
                        <span style={{ color: "#a78bfa", fontWeight: 600 }}>New teaser: </span>
                        Ep. {oldestReleased.episode} &middot; {oldestReleased.slug}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {rotatePhase === "error" && (
                <p style={{ color: "#fca5a5", fontSize: "0.78rem", marginTop: 10 }}>{rotateError}</p>
              )}
              {rotatePhase === "done" && rotateResult && !rotateResult.noop && (
                <p style={{ color: "#4ade80", fontSize: "0.78rem", marginTop: 10 }}>
                  &#10003; Rotated.{" "}
                  {rotateResult.promoted && rotateResult.promoted.length > 0
                    ? `Promoted ${rotateResult.promoted.join(", ")}. `
                    : ""}
                  {rotateResult.newTeaser ? `New teaser: ${rotateResult.newTeaser}.` : ""}
                </p>
              )}
              {rotatePhase === "done" && rotateResult?.noop && (
                <p style={{ color: "#64748b", fontSize: "0.78rem", marginTop: 10 }}>
                  No changes needed.
                </p>
              )}
            </div>
          );
        })()}

        <div style={{ marginBottom: 24 }}>
          <input type="text" placeholder="Search posts..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...input, maxWidth: 400 }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {/* Header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "72px 2fr 1fr 140px 100px 110px",
              gap: 16,
              padding: "10px 16px",
              fontSize: "0.72rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#64748b",
            }}
          >
            <span>Thumb</span>
            <span>Title</span>
            <span>Tag / Series</span>
            <span>Date</span>
            <span>Status</span>
            <span></span>
          </div>

          {filtered.map((post) => {
            const gen = getGen(post.slug);
            const isExpanded = expandedSlug === post.slug;
            const totalImages = gen.images.length;
            const anyImage = totalImages > 0;
            const promptsGenerating = gen.prompts.filter((s) => s.phase === "generating").length;
            const anyGenerating = promptsGenerating > 0;
            const promptsErrored = gen.prompts.some((s) => s.phase === "error");
            const anyReshaping = Object.values(gen.reshapePhase).some((p) => p === "generating");

            // Compute a single status indicator for the row header
            let statusChip: { label: string; color: string; bg: string; spin: boolean } | null = null;
            if (gen.phase === "prompting") {
              statusChip = { label: "Drafting prompts", color: "#a5b4fc", bg: "rgba(99,102,241,0.16)", spin: true };
            } else if (anyGenerating) {
              statusChip = { label: `Generating ${promptsGenerating} image${promptsGenerating === 1 ? "" : "s"}`, color: "#a5b4fc", bg: "rgba(99,102,241,0.16)", spin: true };
            } else if (anyReshaping) {
              statusChip = { label: "Reshaping", color: "#a5b4fc", bg: "rgba(99,102,241,0.16)", spin: true };
            } else if (gen.phase === "saving") {
              statusChip = { label: "Saving thumbnail", color: "#86efac", bg: "rgba(34,197,94,0.16)", spin: true };
            } else if (gen.phase === "error" || promptsErrored) {
              statusChip = { label: "Error", color: "#fca5a5", bg: "rgba(239,68,68,0.16)", spin: false };
            } else if (gen.savedPath) {
              statusChip = { label: "Thumbnail saved", color: "#86efac", bg: "rgba(34,197,94,0.16)", spin: false };
            } else if (anyImage) {
              statusChip = { label: `${totalImages} image${totalImages === 1 ? "" : "s"}`, color: "#c4b5fd", bg: "rgba(139,92,246,0.16)", spin: false };
            } else if (gen.prompts.some((s) => s.prompt)) {
              statusChip = { label: "Prompts ready", color: "#93c5fd", bg: "rgba(59,130,246,0.12)", spin: false };
            }

            // Prefer the in-memory selected image so the row thumbnail updates
            // in real time after "Save & Set as Thumbnail" — the saved path on
            // disk (/images/blog/<slug>.png) may not exist yet in this dev
            // server's local FS (it was committed to GitHub), so using the
            // base64 render keeps the preview live.
            const liveImage = gen.images.find((im) => im.id === gen.selectedId);
            const rowThumbSrc = liveImage
              ? `data:${liveImage.mime};base64,${liveImage.data}`
              : post.image;

            return (
              <div key={post.slug} style={{ marginBottom: 4 }}>
                {/* Row */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "72px 2fr 1fr 140px 100px 110px",
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
                  <div
                    style={{
                      width: 72,
                      aspectRatio: "3 / 4",
                      borderRadius: 6,
                      overflow: "hidden",
                      background: "#1e293b",
                      border: "1px solid #1e293b",
                      flexShrink: 0,
                    }}
                  >
                    {rowThumbSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={rowThumbSrc}
                        alt=""
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569", fontSize: "0.7rem" }}>
                        —
                      </div>
                    )}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, color: "#f1f5f9", fontSize: "0.9rem", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0, flex: 1 }}>
                        {post.title}
                      </p>
                      {statusChip && (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "3px 8px",
                            borderRadius: 999,
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            background: statusChip.bg,
                            color: statusChip.color,
                            border: `1px solid ${statusChip.color}30`,
                            flexShrink: 0,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {statusChip.spin ? (
                            <span
                              style={{
                                width: 10,
                                height: 10,
                                borderRadius: "50%",
                                border: `1.5px solid ${statusChip.color}`,
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
                                background: statusChip.color,
                                display: "inline-block",
                              }}
                            />
                          )}
                          {statusChip.label}
                        </span>
                      )}
                    </div>
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
                  {(() => {
                    const effective =
                      statusOverrides[post.slug] !== undefined
                        ? statusOverrides[post.slug]
                        : !!post.comingSoon;
                    const saving = !!statusSaving[post.slug];
                    const err = statusError[post.slug];
                    return (
                      <div style={{ display: "flex", flexDirection: "column", gap: 2, width: "fit-content" }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (saving) return;
                            togglePostStatus(post.slug, effective);
                          }}
                          disabled={saving}
                          title={
                            saving
                              ? "Saving..."
                              : `Click to mark as ${effective ? "Published" : "Draft"}`
                          }
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "3px 8px",
                            borderRadius: 6,
                            fontSize: "0.72rem",
                            fontWeight: 600,
                            background: effective ? "rgba(251,191,36,0.12)" : "rgba(52,211,153,0.12)",
                            color: effective ? "#fbbf24" : "#34d399",
                            border: `1px solid ${effective ? "rgba(251,191,36,0.25)" : "rgba(52,211,153,0.25)"}`,
                            cursor: saving ? "wait" : "pointer",
                            opacity: saving ? 0.7 : 1,
                            width: "fit-content",
                          }}
                        >
                          {saving && (
                            <span
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                border: `1.5px solid ${effective ? "#fbbf24" : "#34d399"}`,
                                borderTopColor: "transparent",
                                animation: "devSpin 0.8s linear infinite",
                                display: "inline-block",
                              }}
                            />
                          )}
                          {effective ? "Draft" : "Published"}
                        </button>
                        {err && (
                          <span style={{ fontSize: "0.68rem", color: "#fca5a5" }} title={err}>
                            Failed
                          </span>
                        )}
                      </div>
                    );
                  })()}
                  <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                    {(() => {
                      const effective =
                        statusOverrides[post.slug] !== undefined
                          ? statusOverrides[post.slug]
                          : !!post.comingSoon;
                      return (
                        <Link
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "0 10px",
                            height: 30,
                            borderRadius: 6,
                            background: effective
                              ? "rgba(251,191,36,0.10)"
                              : "rgba(255,255,255,0.04)",
                            border: `1px solid ${effective ? "rgba(251,191,36,0.25)" : "#1e293b"}`,
                            color: effective ? "#fbbf24" : "#94a3b8",
                            textDecoration: "none",
                            fontSize: "0.72rem",
                            fontWeight: 600,
                          }}
                          title={effective ? "Preview draft in new tab" : "View published post"}
                        >
                          <svg
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                          </svg>
                          {effective ? "Preview" : "View"}
                        </Link>
                      );
                    })()}
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
                    {/* Release date (drafts only) */}
                    {post.comingSoon && (() => {
                      const draft = releaseDrafts[post.slug] ?? post.releaseDate ?? "";
                      const saveState = releaseSaveStates[post.slug];
                      return (
                        <div
                          style={{
                            marginBottom: 16,
                            padding: "12px 14px",
                            background: "rgba(251,191,36,0.06)",
                            border: "1px solid rgba(251,191,36,0.2)",
                            borderRadius: 8,
                          }}
                        >
                          <label style={{ fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#fbbf24", display: "block", marginBottom: 8 }}>
                            Release date
                          </label>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                            <input
                              type="date"
                              value={draft}
                              onChange={(e) =>
                                setReleaseDrafts((prev) => ({ ...prev, [post.slug]: e.target.value }))
                              }
                              style={{ ...input, width: 180, padding: "8px 10px", fontSize: "0.82rem" }}
                            />
                            <button
                              onClick={() => savePostReleaseDate(post.slug, draft || null)}
                              disabled={saveState?.phase === "saving"}
                              style={{
                                ...btnPrimary,
                                padding: "7px 14px",
                                fontSize: "0.78rem",
                                opacity: saveState?.phase === "saving" ? 0.5 : 1,
                              }}
                            >
                              {saveState?.phase === "saving" ? "Saving..." : "Save release date"}
                            </button>
                            {draft && (
                              <button
                                onClick={() => {
                                  setReleaseDrafts((prev) => ({ ...prev, [post.slug]: "" }));
                                  savePostReleaseDate(post.slug, null);
                                }}
                                disabled={saveState?.phase === "saving"}
                                style={{
                                  ...btnSecondary,
                                  padding: "7px 12px",
                                  fontSize: "0.78rem",
                                }}
                              >
                                Clear
                              </button>
                            )}
                            {post.releaseDate && (
                              <span style={{ fontSize: "0.76rem", color: "#94a3b8" }}>
                                Currently: <code style={{ background: "rgba(255,255,255,0.06)", padding: "1px 6px", borderRadius: 4, color: "#fbbf24" }}>{post.releaseDate}</code>
                              </span>
                            )}
                            {saveState?.phase === "done" && (
                              <span style={{ fontSize: "0.76rem", color: "#4ade80" }}>&#10003; Saved</span>
                            )}
                            {saveState?.phase === "error" && (
                              <span style={{ fontSize: "0.76rem", color: "#f87171" }}>{saveState.error}</span>
                            )}
                          </div>
                          <p style={{ margin: "8px 0 0", fontSize: "0.72rem", color: "#64748b" }}>
                            Draft auto-releases when today &ge; release date. Leave blank to keep hidden as &ldquo;Coming Soon.&rdquo;
                          </p>
                        </div>
                      );
                    })()}

                    {/* Style selector + NYC setting toggle */}
                    <div style={{ marginBottom: 16, display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
                      <div>
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
                      <div>
                        <label style={{ fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b", display: "block", marginBottom: 8 }}>
                          Setting
                        </label>
                        <label
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "6px 12px",
                            borderRadius: 6,
                            border: "1px solid",
                            borderColor: gen.nyc ? "#f59e0b" : "#1e293b",
                            background: gen.nyc ? "rgba(245,158,11,0.12)" : "transparent",
                            color: gen.nyc ? "#fbbf24" : "#94a3b8",
                            fontSize: "0.78rem",
                            fontWeight: 500,
                            cursor: "pointer",
                            userSelect: "none",
                          }}
                          title="When checked, prompts are locked to a NYC setting. Uncheck for articles where a NYC backdrop isn't necessary."
                        >
                          <input
                            type="checkbox"
                            checked={gen.nyc}
                            onChange={(e) => updateGen(post.slug, { nyc: e.target.checked })}
                            style={{ accentColor: "#f59e0b", cursor: "pointer" }}
                          />
                          NYC
                        </label>
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
                          !gen.prompts.every((s) => s.prompt.trim())
                        }
                        style={{
                          ...btnPrimary,
                          opacity:
                            anyGenerating || !gen.prompts.every((s) => s.prompt.trim())
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
                        {anyGenerating ? "Generating..." : "Generate 4 Images"}
                      </button>

                      {gen.selectedId && (
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

                    {/* Pinned selected thumbnail at top */}
                    {(() => {
                      const selected = gen.images.find((im) => im.id === gen.selectedId);
                      if (!selected) return null;
                      const ratios: AspectRatio[] = ["16:9", "3:4", "1:1"];
                      // Most-recent render per aspect ratio that matches the
                      // selected image's prompt — this is the visual "series."
                      const seriesByRatio: Partial<Record<AspectRatio, GeneratedImage>> = {};
                      for (const im of gen.images) {
                        if (im.prompt !== selected.prompt) continue;
                        const cur = seriesByRatio[im.aspectRatio];
                        if (!cur || im.ts > cur.ts) seriesByRatio[im.aspectRatio] = im;
                      }
                      const aspectBoxRatio: Record<AspectRatio, string> = {
                        "16:9": "16 / 9",
                        "3:4": "3 / 4",
                        "1:1": "1 / 1",
                      };
                      return (
                        <div
                          style={{
                            background: "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(99,102,241,0.06))",
                            border: "2px solid rgba(34,197,94,0.35)",
                            borderRadius: 12,
                            padding: 16,
                            marginBottom: 20,
                            boxShadow: "0 0 0 3px rgba(34,197,94,0.1)",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, gap: 12, flexWrap: "wrap" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: "50%", background: "#22c55e", color: "#fff" }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              </span>
                              <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#bbf7d0", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                Selected thumbnail
                              </span>
                              <span style={{ fontSize: "0.72rem", color: "#86efac", background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", padding: "2px 8px", borderRadius: 999, fontWeight: 600 }}>
                                {selected.aspectRatio}
                              </span>
                            </div>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                              {ratios.map((r) => {
                                const phase = gen.reshapePhase[r];
                                const isCurrent = selected.aspectRatio === r;
                                return (
                                  <button
                                    key={r}
                                    onClick={() => reshapeSelected(post.slug, r)}
                                    disabled={phase === "generating" || anyReshaping}
                                    title={`Render this prompt at ${r}`}
                                    style={{
                                      padding: "6px 10px",
                                      fontSize: "0.74rem",
                                      fontWeight: 600,
                                      borderRadius: 6,
                                      background: isCurrent ? "rgba(99,102,241,0.18)" : "rgba(255,255,255,0.05)",
                                      color: isCurrent ? "#c7d2fe" : "#cbd5e1",
                                      border: `1px solid ${isCurrent ? "rgba(99,102,241,0.35)" : "#334155"}`,
                                      cursor: phase === "generating" ? "wait" : "pointer",
                                      opacity: phase === "generating" || anyReshaping ? 0.6 : 1,
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 5,
                                    }}
                                  >
                                    {phase === "generating" ? (
                                      <span
                                        style={{
                                          width: 9,
                                          height: 9,
                                          borderRadius: "50%",
                                          border: "1.5px solid #a5b4fc",
                                          borderTopColor: "transparent",
                                          animation: "devSpin 0.8s linear infinite",
                                          display: "inline-block",
                                        }}
                                      />
                                    ) : null}
                                    {r}
                                  </button>
                                );
                              })}
                              <button
                                onClick={() => generateSeries(post.slug)}
                                disabled={anyReshaping}
                                title="Render this prompt at all 3 aspect ratios"
                                style={{
                                  padding: "6px 12px",
                                  fontSize: "0.74rem",
                                  fontWeight: 700,
                                  borderRadius: 6,
                                  background: "linear-gradient(135deg, #22c55e, #16a34a)",
                                  color: "#fff",
                                  border: "1px solid rgba(34,197,94,0.5)",
                                  cursor: anyReshaping ? "wait" : "pointer",
                                  opacity: anyReshaping ? 0.6 : 1,
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 6,
                                  marginLeft: 4,
                                }}
                              >
                                {anyReshaping ? (
                                  <span
                                    style={{
                                      width: 10,
                                      height: 10,
                                      borderRadius: "50%",
                                      border: "1.5px solid #fff",
                                      borderTopColor: "transparent",
                                      animation: "devSpin 0.8s linear infinite",
                                      display: "inline-block",
                                    }}
                                  />
                                ) : (
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M4 4h6v6H4z" />
                                    <path d="M14 4h6v6h-6z" />
                                    <path d="M4 14h16v6H4z" />
                                  </svg>
                                )}
                                {anyReshaping ? "Generating series..." : "Generate Series"}
                              </button>
                            </div>
                          </div>

                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(3, 1fr)",
                              gap: 10,
                            }}
                          >
                            {ratios.map((r) => {
                              const im = seriesByRatio[r];
                              const phase = gen.reshapePhase[r];
                              const isSelected = im && im.id === gen.selectedId;
                              return (
                                <button
                                  key={r}
                                  type="button"
                                  onClick={() => {
                                    if (im) updateGen(post.slug, { selectedId: im.id });
                                    else reshapeSelected(post.slug, r);
                                  }}
                                  disabled={!im && phase === "generating"}
                                  style={{
                                    position: "relative",
                                    width: "100%",
                                    aspectRatio: aspectBoxRatio[r],
                                    borderRadius: 10,
                                    overflow: "hidden",
                                    background: "#0a0e1a",
                                    padding: 0,
                                    border: isSelected
                                      ? "2px solid #22c55e"
                                      : "1px solid #334155",
                                    cursor: phase === "generating" ? "wait" : "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  {im ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={`data:${im.mime};base64,${im.data}`}
                                      alt={`${r} render`}
                                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                                    />
                                  ) : phase === "generating" ? (
                                    <span
                                      style={{
                                        width: 22,
                                        height: 22,
                                        borderRadius: "50%",
                                        border: "2px solid #a5b4fc",
                                        borderTopColor: "transparent",
                                        animation: "devSpin 0.8s linear infinite",
                                        display: "inline-block",
                                      }}
                                    />
                                  ) : (
                                    <span style={{ fontSize: "0.72rem", color: "#64748b", padding: 10, textAlign: "center" }}>
                                      Not rendered yet — click to generate {r}
                                    </span>
                                  )}
                                  <span
                                    style={{
                                      position: "absolute",
                                      top: 6,
                                      left: 6,
                                      fontSize: "0.68rem",
                                      fontWeight: 700,
                                      color: "#fff",
                                      background: "rgba(0,0,0,0.6)",
                                      padding: "2px 6px",
                                      borderRadius: 4,
                                      letterSpacing: "0.04em",
                                    }}
                                  >
                                    {r}
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          {gen.reshapeError && (
                            <p style={{ color: "#fca5a5", fontSize: "0.74rem", margin: "10px 0 0" }}>{gen.reshapeError}</p>
                          )}
                          <p style={{ margin: "10px 0 0", fontSize: "0.72rem", color: "#94a3b8", lineHeight: 1.5 }}>
                            Tip: click &ldquo;Generate Series&rdquo; to render all 3 aspect ratios at once, or click an empty tile to render just that ratio. Click any tile to make it the selected thumbnail.
                          </p>
                        </div>
                      );
                    })()}

                    {/* Prompt editor — 4 compact cards, one per prompt slot */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                        gap: 12,
                        marginBottom: 20,
                      }}
                    >
                      {gen.prompts.map((slot, i) => (
                        <div
                          key={i}
                          style={{
                            background: "#111827",
                            border: "1px solid #1e293b",
                            borderRadius: 10,
                            padding: 10,
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                            <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                              Prompt {i + 1}{i === 0 ? " · Hero" : ""}
                            </span>
                            <button
                              onClick={() => generateFromPrompt(post.slug, i, "16:9")}
                              disabled={!slot.prompt.trim() || slot.phase === "generating"}
                              style={{
                                ...btnSecondary,
                                padding: "3px 8px",
                                fontSize: "0.68rem",
                                opacity: !slot.prompt.trim() || slot.phase === "generating" ? 0.5 : 1,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5,
                              }}
                              title="Generate a new image from this prompt"
                            >
                              {slot.phase === "generating" && (
                                <span
                                  style={{
                                    width: 9,
                                    height: 9,
                                    borderRadius: "50%",
                                    border: "1.5px solid #94a3b8",
                                    borderTopColor: "transparent",
                                    animation: "devSpin 0.8s linear infinite",
                                    display: "inline-block",
                                  }}
                                />
                              )}
                              {slot.phase === "generating" ? "Generating" : "Generate"}
                            </button>
                          </div>
                          <textarea
                            value={slot.prompt}
                            onChange={(e) => updatePromptSlot(post.slug, i, { prompt: e.target.value })}
                            placeholder="Prompt for this image..."
                            rows={3}
                            style={{
                              ...input,
                              fontSize: "0.76rem",
                              resize: "vertical",
                              fontFamily: "inherit",
                              lineHeight: 1.4,
                              padding: "8px 10px",
                            }}
                          />
                          {slot.error && (
                            <p style={{ color: "#f87171", fontSize: "0.7rem", marginTop: 4 }}>{slot.error}</p>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Gallery — every generated image, small tiles, rows of 8 */}
                    {gen.images.length > 0 && (
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                          <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                            Gallery &middot; {gen.images.length} image{gen.images.length === 1 ? "" : "s"}
                          </span>
                          <span style={{ fontSize: "0.7rem", color: "#475569" }}>
                            Click a tile to select as thumbnail
                          </span>
                        </div>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(8, 1fr)",
                            gap: 8,
                          }}
                        >
                          {gen.images
                            .slice()
                            .sort((a, b) => b.ts - a.ts)
                            .map((img) => {
                              const isSelected = gen.selectedId === img.id;
                              return (
                                <button
                                  key={img.id}
                                  onClick={() => updateGen(post.slug, { selectedId: img.id })}
                                  title={`P${img.promptIndex + 1} · ${img.aspectRatio} · ${new Date(img.ts).toLocaleTimeString()}`}
                                  style={{
                                    aspectRatio: "1 / 1",
                                    borderRadius: 6,
                                    overflow: "hidden",
                                    background: "#1e293b",
                                    border: `2px solid ${isSelected ? "#22c55e" : "transparent"}`,
                                    padding: 0,
                                    cursor: "pointer",
                                    position: "relative",
                                    boxShadow: isSelected ? "0 0 0 2px rgba(34,197,94,0.25)" : "none",
                                    transition: "border-color 0.1s, box-shadow 0.1s",
                                  }}
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={`data:${img.mime};base64,${img.data}`}
                                    alt={`Generated ${img.promptIndex + 1}`}
                                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                                  />
                                  <span
                                    style={{
                                      position: "absolute",
                                      bottom: 2,
                                      left: 2,
                                      background: "rgba(0,0,0,0.65)",
                                      color: "#e2e8f0",
                                      fontSize: "0.58rem",
                                      padding: "1px 4px",
                                      borderRadius: 3,
                                      fontWeight: 600,
                                    }}
                                  >
                                    {img.aspectRatio}
                                  </span>
                                  <span
                                    style={{
                                      position: "absolute",
                                      top: 2,
                                      right: 2,
                                      background: "rgba(0,0,0,0.65)",
                                      color: "#cbd5e1",
                                      fontSize: "0.58rem",
                                      padding: "1px 4px",
                                      borderRadius: 3,
                                      fontWeight: 600,
                                    }}
                                  >
                                    P{img.promptIndex + 1}
                                  </span>
                                  {isSelected && (
                                    <span
                                      style={{
                                        position: "absolute",
                                        top: 3,
                                        left: 3,
                                        width: 16,
                                        height: 16,
                                        borderRadius: "50%",
                                        background: "#22c55e",
                                        color: "#fff",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        boxShadow: "0 1px 4px rgba(0,0,0,0.5)",
                                      }}
                                    >
                                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                      </svg>
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    )}

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
                    {anyImage && !gen.selectedId && (
                      <div style={{ marginTop: 16, padding: "10px 14px", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 8, color: "#a5b4fc", fontSize: "0.82rem" }}>
                        Click a tile in the gallery to pin it as the selected thumbnail, then Save &amp; Set as Thumbnail.
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
