"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { DevSidebar } from "../DevSidebar";

export default function DevVideosPage() {
  const [files, setFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = useCallback(async () => {
    try {
      const res = await fetch("/api/dev/files?type=videos");
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
    setUploadProgress(`Uploading ${file.name} (${(file.size / 1024 / 1024).toFixed(1)} MB)...`);
    const form = new FormData();
    form.append("file", file);
    form.append("folder", "videos");
    try {
      const res = await fetch("/api/dev/files", { method: "POST", body: form });
      const data = await res.json();
      if (data.success) {
        setUploadProgress(`Uploaded ${file.name}`);
        fetchFiles();
      } else {
        setUploadProgress(`Error: ${data.error}`);
      }
    } catch (err) {
      setUploadProgress(`Upload failed: ${err}`);
    } finally {
      setUploading(false);
    }
  };

  const handleFiles = (fileList: FileList) => {
    Array.from(fileList).forEach((f) => {
      if (f.type.startsWith("video/")) uploadFile(f);
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

  return (
    <div style={{ display: "flex" }}>
      <DevSidebar />
      <style>{`
        .dev-page-vid { min-height: 100vh; background: #0a0e1a; color: #e2e8f0; padding: 32px 40px; font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; margin-left: 220px; flex: 1; }
        .dev-vid-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
        .dev-vid-card { background: #111827; border-radius: 12px; overflow: hidden; border: 1px solid #1e293b; position: relative; }
        .dev-vid-card .copy-btn { position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.75); color: #e2e8f0; border: 1px solid #334155; border-radius: 6px; padding: 4px 10px; font-size: 0.72rem; cursor: pointer; opacity: 0; transition: opacity 0.2s; z-index: 2; backdrop-filter: blur(4px); }
        .dev-vid-card:hover .copy-btn { opacity: 1; }
        .dev-vid-card .copy-btn:hover { background: rgba(99,102,241,0.5); border-color: #818cf8; }
        .dev-vid-card .copy-btn.copied { background: rgba(34,197,94,0.5); border-color: #22c55e; }
        @media (max-width: 768px) {
          .dev-page-vid { margin-left: 0; padding: 20px 16px; padding-top: 60px; }
          .dev-vid-grid { grid-template-columns: 1fr; gap: 14px; }
          .dev-vid-card .copy-btn { opacity: 1; }
        }
      `}</style>
      <div className="dev-page-vid">
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>Videos</h1>
          <p style={{ fontSize: "0.88rem", color: "#64748b", margin: "4px 0 0" }}>{files.length} files in /public/videos</p>
        </div>

        {/* Upload zone */}
        <div
          style={{ border: "2px dashed #334155", borderRadius: 16, padding: "48px 24px", textAlign: "center", cursor: "pointer", marginBottom: 48, transition: "all 0.2s ease", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, ...(dragOver ? { borderColor: "#60a5fa", background: "rgba(96,165,250,0.06)" } : {}) }}
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
          <p style={{ color: "#475569", fontSize: "0.78rem", margin: 0 }}>Uploads to /public/videos/ &middot; GitHub max 100 MB per file</p>
          {uploading && <p style={{ color: "#f59e0b", fontSize: "0.85rem", margin: 0 }}>{uploadProgress}</p>}
          {uploadProgress && !uploading && <p style={{ color: "#34d399", fontSize: "0.85rem", margin: 0 }}>{uploadProgress}</p>}
        </div>

        {/* Video grid */}
        {loading ? (
          <p style={{ color: "#64748b", textAlign: "center", padding: 40 }}>Loading videos...</p>
        ) : (
          <div className="dev-vid-grid">
            {files.sort().map((src) => (
              <div key={src} className="dev-vid-card">
                <button className={`copy-btn${copied === src ? " copied" : ""}`} onClick={(e) => copyPath(e, src)}>
                  {copied === src ? "Copied!" : "Copy path"}
                </button>
                <video
                  src={src}
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
                  <p style={{ fontSize: "0.85rem", fontWeight: 600, margin: 0, color: "#e2e8f0" }}>{src.split("/").pop()}</p>
                  <p style={{ fontSize: "0.72rem", color: "#475569", margin: "4px 0 0" }}>{src}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
