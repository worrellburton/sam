"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { DevSidebar } from "../DevSidebar";

export default function DevImagesPage() {
  const [files, setFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [folder, setFolder] = useState("images/sam");
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
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

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const uploadFile = async (file: File) => {
    setUploading(true);
    setUploadStatus(`Uploading ${file.name}...`);
    const form = new FormData();
    form.append("file", file);
    form.append("folder", folder);
    try {
      const res = await fetch("/api/dev/files", { method: "POST", body: form });
      const data = await res.json();
      if (data.success) {
        setUploadStatus(`Uploaded ${file.name}`);
        fetchFiles();
      } else {
        setUploadStatus(`Error: ${data.error}`);
      }
    } catch (err) {
      setUploadStatus(`Upload failed: ${err}`);
    } finally {
      setUploading(false);
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
  }, [folder]);

  const copyPath = (e: React.MouseEvent, src: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(src);
    setCopied(src);
    setTimeout(() => setCopied(null), 1500);
  };

  // Group files by subfolder
  const grouped = files.reduce<Record<string, string[]>>((acc, f) => {
    const parts = f.replace(/^\/images\//, "").split("/");
    const dir = parts.length > 1 ? parts.slice(0, -1).join("/") : "(root)";
    (acc[dir] ??= []).push(f);
    return acc;
  }, {});

  return (
    <div style={{ display: "flex" }}>
      <DevSidebar />
      <style>{`
        .dev-page { min-height: 100vh; background: #0a0e1a; color: #e2e8f0; padding: 32px 40px; font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; margin-left: 220px; flex: 1; }
        .dev-img-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; margin-bottom: 48px; }
        .dev-img-card { background: #111827; border-radius: 10px; overflow: hidden; cursor: pointer; transition: transform 0.2s; border: 1px solid #1e293b; position: relative; }
        .dev-img-card .copy-btn { position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.75); color: #e2e8f0; border: 1px solid #334155; border-radius: 6px; padding: 4px 10px; font-size: 0.72rem; cursor: pointer; opacity: 0; transition: opacity 0.2s; z-index: 2; backdrop-filter: blur(4px); }
        .dev-img-card:hover .copy-btn { opacity: 1; }
        .dev-img-card .copy-btn:hover { background: rgba(99,102,241,0.5); border-color: #818cf8; }
        .dev-img-card .copy-btn.copied { background: rgba(34,197,94,0.5); border-color: #22c55e; }
        @media (max-width: 768px) {
          .dev-page { margin-left: 0; padding: 20px 16px; padding-top: 60px; }
          .dev-img-grid { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; }
          .dev-img-card .copy-btn { opacity: 1; }
        }
      `}</style>
      <div className="dev-page">
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>Images</h1>
          <p style={{ fontSize: "0.88rem", color: "#64748b", margin: "4px 0 0" }}>{files.length} files in /public/images</p>
        </div>

        {/* Upload zone */}
        <div
          style={{ border: "2px dashed #334155", borderRadius: 16, padding: "48px 24px", textAlign: "center", cursor: "pointer", marginBottom: 48, transition: "all 0.2s ease", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, ...(dragOver ? { borderColor: "#60a5fa", background: "rgba(96,165,250,0.06)" } : {}) }}
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
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
            <label style={{ color: "#64748b", fontSize: "0.8rem" }}>Upload to:</label>
            <select value={folder} onChange={(e) => setFolder(e.target.value)} onClick={(e) => e.stopPropagation()} style={{ background: "#1e293b", color: "#e2e8f0", border: "1px solid #334155", borderRadius: 6, padding: "6px 10px", fontSize: "0.82rem" }}>
              <option value="images/sam">images/sam</option>
              <option value="images/photos">images/photos</option>
              <option value="images">images (root)</option>
            </select>
          </div>
          {uploading && <p style={{ color: "#f59e0b", fontSize: "0.85rem", margin: 0 }}>Uploading...</p>}
          {uploadStatus && !uploading && <p style={{ color: "#34d399", fontSize: "0.85rem", margin: 0 }}>{uploadStatus}</p>}
        </div>

        {/* Image grid grouped by folder */}
        {loading ? (
          <p style={{ color: "#64748b", textAlign: "center", padding: 40 }}>Loading images...</p>
        ) : (
          Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([dir, imgs]) => (
            <div key={dir}>
              <h2 style={{ fontWeight: 600, color: "#94a3b8", marginBottom: 16, marginTop: 8, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.78rem" }}>{dir} <span style={{ color: "#475569", fontWeight: 400 }}>({imgs.length})</span></h2>
              <div className="dev-img-grid">
                {imgs.sort().map((src) => (
                  <div key={src} className="dev-img-card" onClick={() => setLightbox(src)}>
                    <button className={`copy-btn${copied === src ? " copied" : ""}`} onClick={(e) => copyPath(e, src)}>
                      {copied === src ? "Copied!" : "Copy path"}
                    </button>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }} loading="lazy" />
                    <p style={{ padding: "8px 10px", fontSize: "0.72rem", color: "#64748b", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{src.split("/").pop()}</p>
                  </div>
                ))}
              </div>
            </div>
          ))
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
