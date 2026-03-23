import { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router";
import { getBlogPostBySlug } from "~/data/blog";
import { GetStarted } from "~/components/GetStarted";
import { Locations } from "~/components/Locations";
import { useElevenLabs } from "~/hooks/useElevenLabs";
import { seoMeta } from "~/seo";

export function meta({ params }: { params: { slug: string } }) {
  const post = getBlogPostBySlug(params.slug);
  if (!post) return [{ title: "Post Not Found" }];
  return seoMeta({
    title: `${post.title} | Dr. Sam Elguizaoui`,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    image: post.image,
    type: "article",
  });
}

// ── Audio Player ────────────────────────────────────────────────────
function BlogAudioPlayer({ post }: { post: { title: string; content: string; contentHtml?: string; slug: string } }) {
  const { status, audioUrl, error, progress, generateAudio, togglePlayback, stop, audioRef } = useElevenLabs();
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const progressInterval = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    if (status === "playing" && audioRef.current) {
      progressInterval.current = setInterval(() => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
          setDuration(audioRef.current.duration || 0);
        }
      }, 250);
    } else {
      if (progressInterval.current) clearInterval(progressInterval.current);
    }
    return () => { if (progressInterval.current) clearInterval(progressInterval.current); };
  }, [status, audioRef]);

  const handleGenerate = () => {
    const text = post.contentHtml
      ? post.contentHtml.replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/g, " ")
      : post.content;
    generateAudio(`${post.title}. ${text}`, post.slug);
  };

  const formatTime = (s: number) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="blog-audio-player">
      <div className="blog-audio-inner">
        <div className="blog-audio-icon">
          {status === "generating" ? (
            <div className="blog-audio-spinner" />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
            </svg>
          )}
        </div>
        <div className="blog-audio-content">
          <div className="blog-audio-label">
            {status === "idle" && "Listen to this article"}
            {status === "generating" && `Generating audio... ${progress}%`}
            {status === "ready" && "Audio ready — press play"}
            {status === "playing" && `Playing — ${formatTime(currentTime)} / ${formatTime(duration)}`}
            {status === "paused" && `Paused — ${formatTime(currentTime)} / ${formatTime(duration)}`}
            {status === "error" && (error || "Error generating audio")}
          </div>
          <div className="blog-audio-sub">
            {status === "idle" && "Narrated by Mark · Powered by ElevenLabs"}
            {status === "generating" && "This may take a moment..."}
            {(status === "ready" || status === "playing" || status === "paused") && "Narrated by Mark · ElevenLabs"}
            {status === "error" && "Check your API key or try again"}
          </div>
          {(status === "playing" || status === "paused") && duration > 0 && (
            <div className="blog-audio-progress">
              <div className="blog-audio-progress-fill" style={{ width: `${(currentTime / duration) * 100}%` }} />
            </div>
          )}
          {status === "generating" && (
            <div className="blog-audio-progress">
              <div className="blog-audio-progress-fill generating" style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>
        <div className="blog-audio-actions">
          {status === "idle" && (
            <button className="blog-audio-btn generate" onClick={handleGenerate}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              Generate
            </button>
          )}
          {status === "error" && (
            <button className="blog-audio-btn generate" onClick={handleGenerate}>Retry</button>
          )}
          {(status === "ready" || status === "paused") && (
            <button className="blog-audio-btn play" onClick={togglePlayback}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
            </button>
          )}
          {status === "playing" && (
            <>
              <button className="blog-audio-btn play" onClick={togglePlayback}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
                </svg>
              </button>
              <button className="blog-audio-btn stop" onClick={stop}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BlogPostPage() {
  const { slug } = useParams();
  const post = getBlogPostBySlug(slug || "");

  useEffect(() => {
    if (!post?.contentHtml) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.1 }
    );
    document.querySelectorAll(".blog-reveal, .blog-reveal-left, .blog-reveal-scale").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [post]);

  if (!post) {
    return (
      <main style={{ padding: "4rem 2rem", textAlign: "center" }}>
        <h1>Post Not Found</h1>
        <Link to="/blog">Back to Blog</Link>
      </main>
    );
  }

  return (
    <>
      <section className="blog-post-hero" style={{ backgroundImage: `url('${post.image}')` }}>
        <div className="container">
          <div className="blog-breadcrumb">
            <Link to="/blog">&larr; Back to Blog</Link>
          </div>
          <h1>{post.title}</h1>
          <div className="blog-post-meta">
            <span>{post.date}</span>
            <span>&bull;</span>
            <span>{post.readTime}</span>
            <span>&bull;</span>
            <span>Dr. Sam Elguizaoui</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: post.contentHtml ? "820px" : "760px" }}>
          {/* Audio Player */}
          <BlogAudioPlayer post={post} />

          <div
            className={post.contentHtml ? "blog-article" : "blog-post-content"}
            dangerouslySetInnerHTML={{ __html: post.contentHtml || markdownToHtml(post.content) }}
          />
          <div style={{ marginTop: "60px", paddingTop: "30px", borderTop: "1px solid var(--border)" }}>
            <Link to="/blog" className="btn btn-outline">&larr; Back to All Articles</Link>
          </div>
        </div>
      </section>

      <GetStarted />
      <Locations />
    </>
  );
}

function markdownToHtml(md: string): string {
  return md
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`)
    .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
    .replace(/^(?!<[hul])((?!<).+)$/gm, (match) => {
      const trimmed = match.trim();
      if (!trimmed || trimmed.startsWith("<")) return match;
      return `<p>${trimmed}</p>`;
    })
    .replace(/<p><\/p>/g, "")
    .replace(/\n{2,}/g, "\n");
}
