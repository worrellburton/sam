"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

export default function DevImagesPage() {
  const [files, setFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [folder, setFolder] = useState("images/sam");
  const [lightbox, setLightbox] = useState<string | null>(null);
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

  // Group files by subfolder
  const grouped = files.reduce<Record<string, string[]>>((acc, f) => {
    const parts = f.replace(/^\/images\//, "").split("/");
    const dir = parts.length > 1 ? parts.slice(0, -1).join("/") : "(root)";
    (acc[dir] ??= []).push(f);
    return acc;
  }, {});

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <Link href="/dev/videos" style={styles.navLink}>Videos &rarr;</Link>
          <h1 style={styles.title}>Images</h1>
          <p style={styles.subtitle}>{files.length} files in /public/images</p>
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
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={dragOver ? "#60a5fa" : "#64748b"} strokeWidth="1.5">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <p style={styles.dropText}>
          {dragOver ? "Drop images here" : "Drag & drop images or click to browse"}
        </p>
        <div style={styles.folderSelect}>
          <label style={styles.folderLabel}>Upload to:</label>
          <select
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            style={styles.select}
          >
            <option value="images/sam">images/sam</option>
            <option value="images/photos">images/photos</option>
            <option value="images">images (root)</option>
          </select>
        </div>
        {uploading && <p style={styles.uploading}>Uploading...</p>}
        {uploadStatus && !uploading && <p style={styles.uploadDone}>{uploadStatus}</p>}
      </div>

      {/* Image grid grouped by folder */}
      {loading ? (
        <p style={styles.loading}>Loading images...</p>
      ) : (
        Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([dir, imgs]) => (
          <div key={dir}>
            <h2 style={styles.groupTitle}>{dir} <span style={styles.groupCount}>({imgs.length})</span></h2>
            <div style={styles.grid}>
              {imgs.sort().map((src) => (
                <div key={src} style={styles.card} onClick={() => setLightbox(src)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" style={styles.img} loading="lazy" />
                  <p style={styles.filename}>{src.split("/").pop()}</p>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Lightbox */}
      {lightbox && (
        <div style={styles.lightbox} onClick={() => setLightbox(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox} alt="" style={styles.lightboxImg} />
          <p style={styles.lightboxPath}>{lightbox}</p>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#0a0e1a", color: "#e2e8f0", padding: "32px 40px", fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 },
  headerLeft: { display: "flex", flexDirection: "column", gap: 4 },
  navLink: { color: "#60a5fa", fontSize: "0.82rem", textDecoration: "none", marginBottom: 8 },
  title: { fontSize: "1.8rem", fontWeight: 700, margin: 0, letterSpacing: "-0.02em" },
  subtitle: { fontSize: "0.88rem", color: "#64748b", margin: 0 },
  dropZone: { border: "2px dashed #334155", borderRadius: 16, padding: "48px 24px", textAlign: "center" as const, cursor: "pointer", marginBottom: 48, transition: "all 0.2s ease", display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 12 },
  dropZoneActive: { borderColor: "#60a5fa", background: "rgba(96,165,250,0.06)" },
  dropText: { color: "#94a3b8", fontSize: "0.95rem", margin: 0 },
  folderSelect: { display: "flex", alignItems: "center", gap: 8, marginTop: 4 },
  folderLabel: { color: "#64748b", fontSize: "0.8rem" },
  select: { background: "#1e293b", color: "#e2e8f0", border: "1px solid #334155", borderRadius: 6, padding: "6px 10px", fontSize: "0.82rem" },
  uploading: { color: "#f59e0b", fontSize: "0.85rem", margin: 0 },
  uploadDone: { color: "#34d399", fontSize: "0.85rem", margin: 0 },
  loading: { color: "#64748b", textAlign: "center" as const, padding: 40 },
  groupTitle: { fontWeight: 600, color: "#94a3b8", marginBottom: 16, marginTop: 8, textTransform: "uppercase" as const, letterSpacing: "0.05em", fontSize: "0.78rem" },
  groupCount: { color: "#475569", fontWeight: 400 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, marginBottom: 48 },
  card: { background: "#111827", borderRadius: 10, overflow: "hidden", cursor: "pointer", transition: "transform 0.2s", border: "1px solid #1e293b" },
  img: { width: "100%", height: 160, objectFit: "cover" as const, display: "block" },
  filename: { padding: "8px 10px", fontSize: "0.72rem", color: "#64748b", margin: 0, whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis" },
  lightbox: { position: "fixed" as const, inset: 0, background: "rgba(0,0,0,0.92)", display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", zIndex: 9999, cursor: "pointer", padding: 40 },
  lightboxImg: { maxWidth: "90vw", maxHeight: "80vh", objectFit: "contain" as const, borderRadius: 8 },
  lightboxPath: { color: "#94a3b8", fontSize: "0.85rem", marginTop: 16 },
};
