// Root suspense fallback. Rendered while any Server Component in the
// app tree is still fetching (e.g. /services/[slug] waiting on
// Supabase). Deliberately minimal — a centered spinner and no copy,
// so it feels like a beat of the layout rather than a full-page
// skeleton. Next.js automatically unmounts this as soon as the page
// itself is ready to stream.

export default function RootLoading() {
  return (
    <main
      style={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 24px",
      }}
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading…</span>
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: "3px solid rgba(255,255,255,0.1)",
          borderTopColor: "var(--primary)",
          animation: "spin 0.9s linear infinite",
        }}
      />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
      `}</style>
    </main>
  );
}
