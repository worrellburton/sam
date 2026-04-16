// Shown while /blog is re-validating its ISR cache or a new [slug]
// page is resolving its static/DB merge. Renders the blog hero +
// skeleton cards so layout stays stable.

const skeleton: React.CSSProperties = {
  background:
    "linear-gradient(90deg, rgba(148,163,184,0.08) 0%, rgba(148,163,184,0.18) 50%, rgba(148,163,184,0.08) 100%)",
  backgroundSize: "200% 100%",
  animation: "blogSkeletonShimmer 1.4s ease-in-out infinite",
  borderRadius: 12,
};

export default function BlogLoading() {
  return (
    <>
      <section className="blog-hero">
        <div className="container">
          <span className="blog-hero-label">Investigative Medical Series</span>
          <h1>
            Clinical <span className="text-accent">Clarity</span>
          </h1>
          <p className="blog-hero-desc">
            No fluff. No fads. Deep-dive investigative reports from the
            surgeon who actually sees the inside of the joints.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="blog-home-grid" aria-busy="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="blog-card" style={{ padding: 0 }}>
                <div style={{ ...skeleton, aspectRatio: "1 / 1" }} />
                <div style={{ padding: 16 }}>
                  <div style={{ ...skeleton, height: 12, width: "30%", marginBottom: 10 }} />
                  <div style={{ ...skeleton, height: 18, width: "85%", marginBottom: 8 }} />
                  <div style={{ ...skeleton, height: 18, width: "60%" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @keyframes blogSkeletonShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </>
  );
}
