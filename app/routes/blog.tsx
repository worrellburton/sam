import { Link } from "react-router";
import { blogPosts, allBlogPosts } from "~/data/blog";
import { GetStarted } from "~/components/GetStarted";
import { Locations } from "~/components/Locations";
import { seoMeta } from "~/seo";

export function meta() {
  return seoMeta({
    title: "Clinical Clarity | Dr. Sam Elguizaoui, M.D.",
    description: "An investigative medical blog series by Dr. Elguizaoui. Myth-busting, deep-dive reports on joint health, sports medicine, and recovery — from the surgeon who actually sees the inside of the joints.",
    path: "/blog",
  });
}

export default function BlogPage() {
  // Series posts (with episode numbers), sorted by episode
  const seriesPosts = blogPosts
    .filter(p => p.episode)
    .sort((a, b) => (b.episode || 0) - (a.episode || 0));

  // Condition guides (from condition-blogs, no episode number)
  const guidePosts = allBlogPosts.filter(p => !p.episode);

  const latestEpisode = seriesPosts.find(p => !p.comingSoon);
  const comingSoonPost = seriesPosts.find(p => p.comingSoon);

  return (
    <>
      <section className="service-hero has-bg" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=1600&h=600&fit=crop&q=80')" }}>
        <div className="container">
          <div style={{ marginBottom: 8 }}>
            <span style={{
              display: "inline-block", fontSize: "0.72rem", fontWeight: 700,
              letterSpacing: "0.1em", textTransform: "uppercase", color: "#f59e0b",
              borderBottom: "2px solid #f59e0b", paddingBottom: 4,
            }}>Investigative Medical Series</span>
          </div>
          <h1 style={{ lineHeight: 1.15 }}>Clinical <span className="text-accent">Clarity</span></h1>
          <p className="service-hero-desc" style={{ maxWidth: 640, opacity: 0.9 }}>
            Investigating modern orthopedics with Dr. Elguizaoui. No fluff. No fads. Just hard truths from the surgeon who actually sees the inside of the joints.
          </p>
        </div>
      </section>

      {/* Coming Soon Banner */}
      {comingSoonPost && (
        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="container">
            <div style={{
              position: "relative", overflow: "hidden", borderRadius: "var(--radius)",
              background: "linear-gradient(135deg, rgba(37,99,235,0.08), rgba(245,158,11,0.08))",
              border: "1px solid rgba(245,158,11,0.2)",
              padding: "clamp(24px, 4vw, 40px)",
              display: "grid", gridTemplateColumns: "1fr auto", gap: 32, alignItems: "center",
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <span style={{
                    fontSize: "0.68rem", fontWeight: 800, letterSpacing: "0.08em",
                    textTransform: "uppercase", color: "#f59e0b",
                    background: "rgba(245,158,11,0.12)", padding: "4px 12px", borderRadius: 20,
                  }}>Coming Soon</span>
                  <span style={{
                    fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)",
                    fontFamily: "'SF Mono', Consolas, monospace",
                  }}>EP. {comingSoonPost.episode}</span>
                </div>
                <h2 style={{ fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)", lineHeight: 1.25, marginBottom: 12 }}>
                  {comingSoonPost.title}
                </h2>
                <p style={{ color: "var(--text-light)", fontSize: "0.95rem", lineHeight: 1.6, maxWidth: 560 }}>
                  {comingSoonPost.excerpt}
                </p>
                <div style={{ marginTop: 16, fontSize: "0.82rem", color: "var(--text-muted)" }}>
                  Dropping {comingSoonPost.date}
                </div>
              </div>
              <div style={{
                width: 120, height: 120, borderRadius: "50%",
                background: "rgba(245,158,11,0.1)", border: "2px dashed rgba(245,158,11,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <span style={{ fontSize: "2.4rem", fontWeight: 900, color: "#f59e0b", fontFamily: "'SF Mono', Consolas, monospace" }}>
                  {comingSoonPost.episode}
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Series Episodes */}
      <section className="section">
        <div className="container">
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <h2 style={{ margin: 0 }}>The <span className="text-accent">Investigation</span></h2>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: 32, maxWidth: 600 }}>
            Each episode is a deep-dive report. Start from the beginning or jump to any case file.
          </p>

          <div className="blog-home-grid">
            {seriesPosts.filter(p => !p.comingSoon).map((post) => (
              <Link to={`/blog/${post.slug}`} className="blog-card" key={post.slug}>
                <div style={{ position: "relative" }}>
                  <img className="blog-card-img" src={post.image} alt={post.imageAlt} loading="lazy" />
                  {/* Episode badge */}
                  <span style={{
                    position: "absolute", top: 12, left: 12,
                    background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)",
                    color: "#fff", fontSize: "0.65rem", fontWeight: 800,
                    padding: "4px 10px", borderRadius: 6,
                    fontFamily: "'SF Mono', Consolas, monospace",
                    letterSpacing: "0.05em",
                  }}>EP. {post.episode}</span>
                </div>
                <div className="blog-card-body">
                  <span className="blog-card-tag">{post.tag}</span>
                  <h3>{post.title}</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginTop: "8px", lineHeight: 1.5 }}>{post.excerpt}</p>
                  <span className="blog-card-meta">{post.date} &bull; {post.readTime}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Condition Guides */}
      {guidePosts.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <h2 style={{ margin: 0 }}>Condition <span className="text-accent">Guides</span></h2>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: 32, maxWidth: 600 }}>
              In-depth guides on specific injuries and conditions — written with clarity and compassion.
            </p>

            <div className="blog-home-grid">
              {guidePosts.map((post) => (
                <Link to={`/blog/${post.slug}`} className="blog-card" key={post.slug}>
                  <img className="blog-card-img" src={post.image} alt={post.imageAlt} loading="lazy" />
                  <div className="blog-card-body">
                    <span className="blog-card-tag">{post.tag}</span>
                    <h3>{post.title}</h3>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginTop: "8px", lineHeight: 1.5 }}>{post.excerpt}</p>
                    <span className="blog-card-meta">{post.date} &bull; {post.readTime}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <GetStarted />
      <Locations />
    </>
  );
}
