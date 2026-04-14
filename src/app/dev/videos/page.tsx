"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { DevSidebar } from "../DevSidebar";
import { supabase } from "@/lib/supabase";

interface VideoFile {
  name: string;
  url: string;
  size: number;
  updatedAt?: string;
}

interface UploadState {
  id: string;
  fileName: string;
  fileSize: string;
  phase: "queued" | "uploading" | "done" | "error";
  progress: number; // 0-100
  message: string;
  url?: string;
}

const BUCKET = "blog-videos";

// Source of truth for Supabase Storage URLs in the browser. We use the anon
// key directly so uploads stream straight to the bucket without squeezing
// through Vercel's ~4.5 MB serverless body limit.
const sanitize = (name: string) => name.replace(/\s+/g, "_");

export default function DevVideosPage() {
  const [files, setFiles] = useState<VideoFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [uploads, setUploads] = useState<UploadState[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Serialize uploads — each file streams ~5 MB, running in parallel trips
  // over the browser's concurrent-connection cap for one origin.
  const queueRef = useRef<Promise<void>>(Promise.resolve());

  const fetchFiles = useCallback(async () => {
    try {
      const res = await fetch("/api/dev/storage-videos", { cache: "no-store" });
      const data = await res.json();
      setFiles(data.files || []);
    } catch {
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const patchUpload = (id: string, updates: Partial<UploadState>) => {
    setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
  };

  const uploadFile = async (file: File, id: string) => {
    const sizeMB = (file.size / 1024 / 1024).toFixed(1);
    const objectName = sanitize(file.name);
    patchUpload(id, {
      phase: "uploading",
      progress: 20,
      message: `Uploading ${sizeMB} MB to Supabase…`,
    });

    try {
      // Stream straight to Supabase Storage from the browser. The anon key
      // is scoped to the blog-videos bucket via RLS so the worst a compromised
      // key can do is upload into this specific bucket.
      const { error } = await supabase.storage.from(BUCKET).upload(objectName, file, {
        contentType: file.type || "video/mp4",
        upsert: true,
        cacheControl: "31536000",
      });
      if (error) throw new Error(error.message);

      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(objectName);

      patchUpload(id, {
        phase: "done",
        progress: 100,
        message: `${file.name} uploaded`,
        url: pub.publicUrl,
      });

      // As soon as any upload lands, refresh the grid so the tile appears
      // below automatically — no manual reload.
      fetchFiles();
    } catch (err) {
      patchUpload(id, {
        phase: "error",
        progress: 100,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  };

  const handleFiles = (fileList: FileList) => {
    const videos = Array.from(fileList).filter((f) => f.type.startsWith("video/"));
    if (videos.length === 0) return;

    const entries = videos.map((file) => ({
      file,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${file.name}`,
    }));
    const sizeMB = (n: number) => (n / 1024 / 1024).toFixed(1);
    setUploads((prev) => [
      ...prev,
      ...entries.map(({ file, id }) => ({
        id,
        fileName: file.name,
        fileSize: `${sizeMB(file.size)} MB`,
        phase: "queued" as const,
        progress: 0,
        message: "Queued…",
      })),
    ]);

    for (const { file, id } of entries) {
      queueRef.current = queueRef.current.then(() => uploadFile(file, id));
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copyPath = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 1500);
  };

  const deleteFile = async (e: React.MouseEvent, file: VideoFile) => {
    e.stopPropagation();
    if (confirmDelete !== file.name) {
      setConfirmDelete(file.name);
      return;
    }
    setDeleting(file.name);
    setConfirmDelete(null);
    try {
      const res = await fetch("/api/dev/storage-videos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: file.name }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setFiles((prev) => prev.filter((f) => f.name !== file.name));
    } catch (err) {
      alert(`Delete failed: ${err}`);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <DevSidebar />
      <style>{`
        .dev-page-vid { min-height: 100vh; background: #0a0e1a; color: #e2e8f0; padding: 32px 40px; font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; margin-left: 220px; flex: 1; }
        .dev-vid-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
        .dev-vid-card { background: #111827; border-radius: 12px; overflow: hidden; border: 1px solid #1e293b; position: relative; }
        .dev-vid-card .card-actions { position: absolute; top: 8px; right: 8px; display: flex; gap: 4px; opacity: 0; transition: opacity 0.2s; z-index: 2; }
        .dev-vid-card:hover .card-actions { opacity: 1; }
        .dev-vid-card .copy-btn, .dev-vid-card .del-btn { background: rgba(0,0,0,0.75); color: #e2e8f0; border: 1px solid #334155; border-radius: 6px; padding: 4px 10px; font-size: 0.72rem; cursor: pointer; backdrop-filter: blur(4px); }
        .dev-vid-card .copy-btn:hover { background: rgba(99,102,241,0.5); border-color: #818cf8; }
        .dev-vid-card .copy-btn.copied { background: rgba(34,197,94,0.5); border-color: #22c55e; }
        .dev-vid-card .del-btn { color: #f87171; border-color: #7f1d1d; }
        .dev-vid-card .del-btn:hover, .dev-vid-card .del-btn.confirm { background: rgba(239,68,68,0.4); border-color: #ef4444; color: #fecaca; }
        .upload-progress-track { width: 100%; height: 6px; background: #1e293b; border-radius: 3px; overflow: hidden; }
        .upload-progress-bar { height: 100%; border-radius: 3px; transition: width 0.3s ease; }
        .upload-progress-bar.uploading { background: linear-gradient(90deg, #6366f1, #818cf8); }
        .upload-progress-bar.done { background: #22c55e; }
        .upload-progress-bar.error { background: #ef4444; }
        @media (max-width: 768px) {
          .dev-page-vid { margin-left: 0; padding: 20px 16px; padding-top: 60px; }
          .dev-vid-grid { grid-template-columns: 1fr; gap: 14px; }
          .dev-vid-card .copy-btn { opacity: 1; }
        }
      `}</style>
      <div className="dev-page-vid">
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>Videos</h1>
          <p style={{ fontSize: "0.88rem", color: "#64748b", margin: "4px 0 0" }}>
            {files.length} files in Supabase Storage · <code style={{ fontSize: "0.78rem" }}>{BUCKET}</code>
          </p>
        </div>

        {/* Upload zone */}
        <div
          style={{ border: "2px dashed #334155", borderRadius: 16, padding: "40px 24px", textAlign: "center", cursor: "pointer", marginBottom: 32, transition: "all 0.2s ease", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, ...(dragOver ? { borderColor: "#60a5fa", background: "rgba(96,165,250,0.06)" } : {}) }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input ref={fileInputRef} type="file" accept="video/*" multiple style={{ display: "none" }} onChange={(e) => e.target.files && handleFiles(e.target.files)} />
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={dragOver ? "#60a5fa" : "#64748b"} strokeWidth="1.5">
            <polygon points="23 7 16 12 23 17 23 7" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
          <p style={{ color: "#94a3b8", fontSize: "0.95rem", margin: 0 }}>
            {dragOver ? "Drop videos here" : "Drag & drop .mp4 files or click to browse"}
          </p>
          <p style={{ color: "#475569", fontSize: "0.78rem", margin: 0 }}>Uploads directly to Supabase Storage · 100 MB per file</p>
        </div>

        {/* Upload progress cards */}
        {uploads.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
            {uploads.map((u) => (
              <div key={u.id} style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 12, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: u.phase === "done" ? "rgba(34,197,94,0.15)" : u.phase === "error" ? "rgba(239,68,68,0.15)" : u.phase === "queued" ? "rgba(148,163,184,0.12)" : "rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {u.phase === "done" ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                      ) : u.phase === "error" ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                      ) : u.phase === "queued" ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                      )}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: "0.88rem", fontWeight: 600, color: "#e2e8f0" }}>{u.fileName}</p>
                      <p style={{ margin: 0, fontSize: "0.72rem", color: "#64748b" }}>{u.fileSize}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: "0.78rem", fontWeight: 600, color: u.phase === "done" ? "#22c55e" : u.phase === "error" ? "#ef4444" : u.phase === "queued" ? "#94a3b8" : "#818cf8" }}>
                    {u.phase === "done" ? "Complete" : u.phase === "error" ? "Failed" : u.phase === "queued" ? "Queued" : "Uploading…"}
                  </span>
                </div>
                <div className="upload-progress-track">
                  <div className={`upload-progress-bar ${u.phase}`} style={{ width: `${u.progress}%` }} />
                </div>
                {u.phase === "error" && (
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "#f87171" }}>{u.message}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Video grid */}
        {loading ? (
          <p style={{ color: "#64748b", textAlign: "center", padding: 40 }}>Loading videos...</p>
        ) : (
          <div className="dev-vid-grid">
            {files.map((file) => (
              <div key={file.name} className="dev-vid-card" style={deleting === file.name ? { opacity: 0.4, pointerEvents: "none" } : {}}>
                <div className="card-actions">
                  <button className={`copy-btn${copied === file.url ? " copied" : ""}`} onClick={(e) => copyPath(e, file.url)}>
                    {copied === file.url ? "Copied!" : "Copy"}
                  </button>
                  <button className={`del-btn${confirmDelete === file.name ? " confirm" : ""}`} onClick={(e) => deleteFile(e, file)}>
                    {confirmDelete === file.name ? "Confirm?" : "Delete"}
                  </button>
                </div>
                <video
                  src={file.url}
                  style={{ width: "100%", height: 220, objectFit: "cover", display: "block", cursor: "pointer", background: "#000" }}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  onLoadedMetadata={(e) => { e.currentTarget.currentTime = 0.01; }}
                  onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                  onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0.01; }}
                />
                <div style={{ padding: "10px 14px" }}>
                  <p style={{ fontSize: "0.85rem", fontWeight: 600, margin: 0, color: "#e2e8f0" }}>{file.name}</p>
                  <p style={{ fontSize: "0.72rem", color: "#475569", margin: "4px 0 0", wordBreak: "break-all" }}>{file.url}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
