"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { DevSidebar } from "../DevSidebar";

interface FileEntry {
  path: string;
  mtime: number;
}

interface UploadState {
  fileName: string;
  fileSize: string;
  phase: "uploading" | "processing" | "done" | "error";
  progress: number;
  message: string;
}

type SortField = "name" | "date";
type SortDir = "asc" | "desc";

export default function DevImagesPage() {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [uploads, setUploads] = useState<UploadState[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = useCallback(async () => {
    try {
      const res = await fetch("/api/dev/files?type=images");
      const data = await res.json();
      setFiles(data.files || []);
    } catch {
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir(field === "date" ? "desc" : "asc");
    }
  };

  const sortedFiles = [...files].sort((a, b) => {
    if (sortField === "date") {
      return sortDir === "desc" ? b.mtime - a.mtime : a.mtime - b.mtime;
    }
    const nameA = a.path.split("/").pop()?.toLowerCase() || "";
    const nameB = b.path.split("/").pop()?.toLowerCase() || "";
    return sortDir === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
  });

  const formatDate = (mtime: number) => {
    const d = new Date(mtime);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const compressImage = (file: File, maxWidth = 2400, quality = 0.82): Promise<{ base64: string; fileName: string; compressedSize: number }> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let w = img.width;
        let h = img.height;
        if (w > maxWidth) {
          h = Math.round(h * (maxWidth / w));
          w = maxWidth;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("Canvas not supported")); return; }
        ctx.drawImage(img, 0, 0, w, h);
        const webpDataUrl = canvas.toDataURL("image/webp", quality);
        const base64 = webpDataUrl.split(",")[1];
        const compressedSize = Math.round(base64.length * 0.75);
        const baseName = file.name.replace(/\.[^.]+$/, "");
        resolve({ base64, fileName: `${baseName}.webp`, compressedSize });
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = URL.createObjectURL(file);
    });
  };

  const uploadFile = async (file: File) => {
    const originalSizeMB = (file.size / 1024 / 1024).toFixed(1);
    const idx = uploads.length;

    setUploads(prev => [...prev, {
      fileName: file.name,
      fileSize: `${originalSizeMB} MB`,
      phase: "uploading",
      progress: 0,
      message: `Compressing ${file.name}...`,
    }]);

    try {
      // Compress to WebP
      setUploads(prev => prev.map((u, i) => i === idx ? { ...u, progress: 10, message: "Compressing for web..." } : u));
      const { base64, fileName, compressedSize } = await compressImage(file);
      const compressedMB = (compressedSize / 1024 / 1024).toFixed(1);
      const savings = Math.round((1 - compressedSize / file.size) * 100);

      setUploads(prev => prev.map((u, i) => i === idx ? {
        ...u,
        fileName,
        fileSize: `${compressedMB} MB (${savings}% smaller)`,
        progress: 35,
        message: `Compressed: ${originalSizeMB} MB → ${compressedMB} MB`,
      } : u));

      setUploads(prev => prev.map((u, i) => i === idx ? { ...u, phase: "processing", progress: 45, message: "Pushing to GitHub..." } : u));

      const res = await fetch("/api/dev/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName, folder: "images", content: base64 }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Upload failed");

      setUploads(prev => prev.map((u, i) => i === idx ? { ...u, phase: "done", progress: 100, message: `${fileName} uploaded (${savings}% smaller)` } : u));
      // Add to top of list immediately
      setFiles(prev => [{ path: `/images/${fileName}`, mtime: Date.now() }, ...prev.filter(f => f.path !== `/images/${fileName}`)]);
    } catch (err) {
      setUploads(prev => prev.map((u, i) => i === idx ? { ...u, phase: "error", progress: 100, message: `${err}` } : u));
    }
  };

  const handleFiles = (fileList: FileList) => {
    Array.from(fileList).forEach((f) => {
      if (f.type.startsWith("image/")) uploadFile(f);
    });
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copyPath = (e: React.MouseEvent, src: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(src);
    setCopied(src);
    setTimeout(() => setCopied(null), 1500);
  };

  const deleteFile = async (e: React.MouseEvent, filePath: string) => {
    e.stopPropagation();
    if (confirmDelete !== filePath) {
      setConfirmDelete(filePath);
      return;
    }
    setDeleting(filePath);
    setConfirmDelete(null);
    try {
      const res = await fetch("/api/dev/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePath }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setFiles(prev => prev.filter(f => f.path !== filePath));
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
        .dev-page { min-height: 100vh; background: #0a0e1a; color: #e2e8f0; padding: 32px 40px; font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; margin-left: 220px; flex: 1; }
        .dev-img-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; margin-bottom: 48px; }
        .dev-img-card { background: #111827; border-radius: 10px; overflow: hidden; cursor: pointer; transition: transform 0.2s; border: 1px solid #1e293b; position: relative; }
        .dev-img-card .card-actions { position: absolute; top: 8px; right: 8px; display: flex; gap: 4px; opacity: 0; transition: opacity 0.2s; z-index: 2; }
        .dev-img-card:hover .card-actions { opacity: 1; }
        .dev-img-card .copy-btn, .dev-img-card .del-btn { background: rgba(0,0,0,0.75); color: #e2e8f0; border: 1px solid #334155; border-radius: 6px; padding: 4px 10px; font-size: 0.72rem; cursor: pointer; backdrop-filter: blur(4px); }
        .dev-img-card .copy-btn:hover { background: rgba(99,102,241,0.5); border-color: #818cf8; }
        .dev-img-card .copy-btn.copied { background: rgba(34,197,94,0.5); border-color: #22c55e; }
        .dev-img-card .del-btn { color: #f87171; border-color: #7f1d1d; }
        .dev-img-card .del-btn:hover, .dev-img-card .del-btn.confirm { background: rgba(239,68,68,0.4); border-color: #ef4444; color: #fecaca; }
        .dev-img-list { display: flex; flex-direction: column; gap: 2px; margin-bottom: 48px; }
        .dev-img-list-item { display: flex; align-items: center; gap: 14px; background: #111827; border: 1px solid #1e293b; border-radius: 8px; padding: 8px 14px; cursor: pointer; position: relative; transition: background 0.15s; }
        .dev-img-list-item:hover { background: #1a2234; }
        .dev-img-list-item img { width: 48px; height: 48px; object-fit: cover; border-radius: 6px; flex-shrink: 0; }
        .dev-img-list-item .list-name { font-size: 0.85rem; font-weight: 500; color: #e2e8f0; flex: 1; }
        .dev-img-list-item .list-path { font-size: 0.72rem; color: #475569; flex: 2; }
        .dev-img-list-item .copy-btn { background: rgba(0,0,0,0.5); color: #e2e8f0; border: 1px solid #334155; border-radius: 6px; padding: 4px 10px; font-size: 0.72rem; cursor: pointer; opacity: 0; transition: opacity 0.15s; }
        .dev-img-list-item:hover .copy-btn { opacity: 1; }
        .dev-img-list-item .copy-btn:hover { background: rgba(99,102,241,0.5); border-color: #818cf8; }
        .dev-img-list-item .copy-btn.copied { background: rgba(34,197,94,0.5); border-color: #22c55e; opacity: 1; }
        .dev-img-list-item .del-btn { background: none; color: #64748b; border: 1px solid transparent; border-radius: 6px; padding: 4px 8px; font-size: 0.72rem; cursor: pointer; opacity: 0; transition: opacity 0.15s, color 0.15s; }
        .dev-img-list-item:hover .del-btn { opacity: 1; }
        .dev-img-list-item .del-btn:hover { color: #f87171; border-color: #7f1d1d; }
        .dev-img-list-item .del-btn.confirm { opacity: 1; background: rgba(239,68,68,0.2); color: #f87171; border-color: #ef4444; }
        .dev-img-list-item .list-date { font-size: 0.78rem; color: #64748b; width: 120px; flex-shrink: 0; text-align: right; }
        .dev-list-header { display: flex; align-items: center; gap: 14px; padding: 6px 14px 6px 76px; margin-bottom: 4px; }
        .dev-list-header button { background: none; border: none; color: #64748b; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; cursor: pointer; display: flex; align-items: center; gap: 4px; padding: 0; }
        .dev-list-header button:hover { color: #94a3b8; }
        .dev-list-header button.active { color: #e2e8f0; }
        .sort-arrow { font-size: 0.65rem; }
        .view-toggle { display: flex; gap: 4px; background: #111827; border-radius: 8px; padding: 3px; border: 1px solid #1e293b; }
        .view-toggle button { background: none; border: none; color: #64748b; padding: 6px 10px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; }
        .view-toggle button.active { background: #1e293b; color: #e2e8f0; }
        .upload-progress-track { width: 100%; height: 6px; background: #1e293b; border-radius: 3px; overflow: hidden; }
        .upload-progress-bar { height: 100%; border-radius: 3px; transition: width 0.3s ease; }
        .upload-progress-bar.uploading { background: linear-gradient(90deg, #6366f1, #818cf8); }
        .upload-progress-bar.processing { background: linear-gradient(90deg, #818cf8, #f59e0b); animation: pulse-bar 1.5s ease-in-out infinite; }
        .upload-progress-bar.done { background: #22c55e; }
        .upload-progress-bar.error { background: #ef4444; }
        @keyframes pulse-bar { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        @media (max-width: 768px) {
          .dev-page { margin-left: 0; padding: 20px 16px; padding-top: 60px; }
          .dev-img-grid { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; }
          .dev-img-card .copy-btn { opacity: 1; }
        }
      `}</style>
      <div className="dev-page">
        <div style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>Images</h1>
            <p style={{ fontSize: "0.88rem", color: "#64748b", margin: "4px 0 0" }}>{files.length} files in /public/images</p>
          </div>
          <div className="view-toggle">
            <button className={viewMode === "list" ? "active" : ""} onClick={() => setViewMode("list")} title="List view">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            </button>
            <button className={viewMode === "grid" ? "active" : ""} onClick={() => setViewMode("grid")} title="Grid view">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            </button>
          </div>
        </div>

        {/* Upload zone */}
        <div
          style={{ border: "2px dashed #334155", borderRadius: 16, padding: "40px 24px", textAlign: "center", cursor: "pointer", marginBottom: 32, transition: "all 0.2s ease", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, ...(dragOver ? { borderColor: "#60a5fa", background: "rgba(96,165,250,0.06)" } : {}) }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => e.target.files && handleFiles(e.target.files)} />
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={dragOver ? "#60a5fa" : "#64748b"} strokeWidth="1.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <p style={{ color: "#94a3b8", fontSize: "0.95rem", margin: 0 }}>
            {dragOver ? "Drop images here" : "Drag & drop images or click to browse"}
          </p>
          <p style={{ color: "#475569", fontSize: "0.78rem", margin: 0 }}>Uploads to /public/images/</p>
        </div>

        {/* Upload progress cards */}
        {uploads.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
            {uploads.map((u, i) => (
              <div key={i} style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 12, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: u.phase === "done" ? "rgba(34,197,94,0.15)" : u.phase === "error" ? "rgba(239,68,68,0.15)" : "rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {u.phase === "done" ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                      ) : u.phase === "error" ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                      )}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: "0.88rem", fontWeight: 600, color: "#e2e8f0" }}>{u.fileName}</p>
                      <p style={{ margin: 0, fontSize: "0.72rem", color: "#64748b" }}>{u.fileSize}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: "0.78rem", fontWeight: 600, color: u.phase === "done" ? "#22c55e" : u.phase === "error" ? "#ef4444" : u.phase === "processing" ? "#f59e0b" : "#818cf8" }}>
                    {u.phase === "done" ? "Complete" : u.phase === "error" ? "Failed" : u.phase === "processing" ? "Pushing to GitHub..." : `${u.progress}%`}
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

        {/* Image list/grid — sorted by most recent */}
        {loading ? (
          <p style={{ color: "#64748b", textAlign: "center", padding: 40 }}>Loading images...</p>
        ) : viewMode === "grid" ? (
          <div className="dev-img-grid">
            {sortedFiles.map((f) => (
              <div key={f.path} className="dev-img-card" onClick={() => setLightbox(f.path)} style={deleting === f.path ? { opacity: 0.4, pointerEvents: "none" } : {}}>
                <div className="card-actions">
                  <button className={`copy-btn${copied === f.path ? " copied" : ""}`} onClick={(e) => copyPath(e, f.path)}>
                    {copied === f.path ? "Copied!" : "Copy"}
                  </button>
                  <button className={`del-btn${confirmDelete === f.path ? " confirm" : ""}`} onClick={(e) => deleteFile(e, f.path)}>
                    {confirmDelete === f.path ? "Confirm?" : "Delete"}
                  </button>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.path} alt="" style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }} loading="lazy" />
                <p style={{ padding: "8px 10px", fontSize: "0.72rem", color: "#64748b", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.path.split("/").pop()}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="dev-img-list">
            <div className="dev-list-header">
              <button className={sortField === "name" ? "active" : ""} onClick={() => toggleSort("name")} style={{ flex: 1 }}>
                Name <span className="sort-arrow">{sortField === "name" ? (sortDir === "asc" ? "▲" : "▼") : ""}</span>
              </button>
              <span style={{ flex: 2 }} />
              <button className={sortField === "date" ? "active" : ""} onClick={() => toggleSort("date")} style={{ width: 120, textAlign: "right", justifyContent: "flex-end" }}>
                Date uploaded <span className="sort-arrow">{sortField === "date" ? (sortDir === "asc" ? "▲" : "▼") : ""}</span>
              </button>
              <span style={{ width: 72 }} />
            </div>
            {sortedFiles.map((f) => (
              <div key={f.path} className="dev-img-list-item" onClick={() => setLightbox(f.path)} style={deleting === f.path ? { opacity: 0.4, pointerEvents: "none" } : {}}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.path} alt="" loading="lazy" />
                <span className="list-name">{f.path.split("/").pop()}</span>
                <span className="list-path">{f.path}</span>
                <span className="list-date">{formatDate(f.mtime)}</span>
                <button className={`copy-btn${copied === f.path ? " copied" : ""}`} onClick={(e) => copyPath(e, f.path)}>
                  {copied === f.path ? "Copied!" : "Copy path"}
                </button>
                <button className={`del-btn${confirmDelete === f.path ? " confirm" : ""}`} onClick={(e) => deleteFile(e, f.path)}>
                  {deleting === f.path ? "..." : confirmDelete === f.path ? "Confirm?" : "Delete"}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Lightbox */}
        {lightbox && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 9999, cursor: "pointer", padding: 40 }} onClick={() => setLightbox(null)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lightbox} alt="" style={{ maxWidth: "90vw", maxHeight: "80vh", objectFit: "contain", borderRadius: 8 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16 }}>
              <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: 0 }}>{lightbox}</p>
              <button onClick={(e) => copyPath(e, lightbox)} style={{ background: copied === lightbox ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.1)", color: "#e2e8f0", border: "1px solid #475569", borderRadius: 6, padding: "4px 12px", fontSize: "0.78rem", cursor: "pointer" }}>
                {copied === lightbox ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
