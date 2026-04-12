"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { DevSidebar } from "../DevSidebar";

export default function DevVideosPage() {
  const [files, setFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
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

  return (
    <div style={{ display: "flex" }}>
      <DevSidebar />
      <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>Videos</h1>
          <p style={styles.subtitle}>{files.length} files in /public/videos</p>
        </div>
      </div>

      {/* Upload zone */}
      <div
        style={{ ...styles.dropZone, ...(dragOver ? styles.dropZoneActive : {}) }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          multiple
          style={{ display: "none" }}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={dragOver ? "#60a5fa" : "#64748b"} strokeWidth="1.5">
          <polygon points="23 7 16 12 23 17 23 7" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
        <p style={styles.dropText}>
          {dragOver ? "Drop videos here" : "Drag & drop .mp4 files or click to browse"}
        </p>
        <p style={styles.hint}>Uploads to /public/videos/ &middot; GitHub max 100 MB per file</p>
        {uploading && <p style={styles.uploading}>{uploadProgress}</p>}
        {uploadProgress && !uploading && <p style={styles.uploadDone}>{uploadProgress}</p>}
      </div>

      {/* Video grid */}
      {loading ? (
        <p style={styles.loading}>Loading videos...</p>
      ) : (
        <div style={styles.grid}>
          {files.sort().map((src) => (
            <div key={src} style={styles.card}>
              <video
                src={src}
                style={styles.video}
                muted
                loop
                playsInline
                preload="metadata"
                onLoadedMetadata={(e) => { e.currentTarget.currentTime = 0.01; }}
                onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0.01; }}
              />
              <div style={styles.cardInfo}>
                <p style={styles.filename}>{src.split("/").pop()}</p>
                <p style={styles.path}>{src}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#0a0e1a", color: "#e2e8f0", padding: "32px 40px", fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif", marginLeft: 220, flex: 1 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 },
  headerLeft: { display: "flex", flexDirection: "column", gap: 4 },
  navLink: { color: "#60a5fa", fontSize: "0.82rem", textDecoration: "none", marginBottom: 8 },
  title: { fontSize: "1.8rem", fontWeight: 700, margin: 0, letterSpacing: "-0.02em" },
  subtitle: { fontSize: "0.88rem", color: "#64748b", margin: 0 },
  dropZone: { border: "2px dashed #334155", borderRadius: 16, padding: "48px 24px", textAlign: "center" as const, cursor: "pointer", marginBottom: 48, transition: "all 0.2s ease", display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 12 },
  dropZoneActive: { borderColor: "#60a5fa", background: "rgba(96,165,250,0.06)" },
  dropText: { color: "#94a3b8", fontSize: "0.95rem", margin: 0 },
  hint: { color: "#475569", fontSize: "0.78rem", margin: 0 },
  uploading: { color: "#f59e0b", fontSize: "0.85rem", margin: 0 },
  uploadDone: { color: "#34d399", fontSize: "0.85rem", margin: 0 },
  loading: { color: "#64748b", textAlign: "center" as const, padding: 40 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 },
  card: { background: "#111827", borderRadius: 12, overflow: "hidden", border: "1px solid #1e293b" },
  video: { width: "100%", height: 220, objectFit: "cover" as const, display: "block", cursor: "pointer", background: "#000" },
  cardInfo: { padding: "10px 14px" },
  filename: { fontSize: "0.85rem", fontWeight: 600, margin: 0, color: "#e2e8f0" },
  path: { fontSize: "0.72rem", color: "#475569", margin: "4px 0 0" },
};
