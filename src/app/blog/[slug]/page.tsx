"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getBlogPostBySlug } from "@/data/blog";
import { GetStarted } from "@/components/GetStarted";
import { Locations } from "@/components/Locations";

function BlogAudioPlayer({ post }: { post: { title: string; content: string; contentHtml?: string; slug: string } }) {
  const [status, setStatus] = useState<"loading" | "ready" | "playing" | "paused" | "error">("loading");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressInterval = useRef<ReturnType<typeof setInterval>>(undefined);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const localSrc = `/audio/${post.slug}.mp3`;

  useEffect(() => {
    const audio = new Audio(localSrc);
    audioRef.current = audio;

    audio.addEventListener("canplaythrough", () => setStatus("ready"));
    audio.addEventListener("ended", () => { setStatus("ready"); setCurrentTime(0); });
    audio.addEventListener("error", () => setStatus("error"));

    audio.load();

    return () => {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [localSrc]);

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
  }, [status]);

  const play = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.play();
    setStatus("playing");
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setStatus("paused");
  }, []);

  const togglePlayback = useCallback(() => {
    if (status === "playing") pause();
    else play();
  }, [status, play, pause]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setCurrentTime(0);
    setStatus("ready");
  }, []);

  const skip = useCallback((seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, Math.min(audioRef.current.currentTime + seconds, audioRef.current.duration || 0));
    setCurrentTime(audioRef.current.currentTime);
  }, []);

  const cycleSpeed = useCallback(() => {
    const speeds = [1, 1.25, 1.5, 1.75, 2, 0.75];
    const next = speeds[(speeds.indexOf(playbackRate) + 1) % speeds.length];
    setPlaybackRate(next);
    if (audioRef.current) audioRef.current.playbackRate = next;
  }, [playbackRate]);

  const seekTo = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audioRef.current.currentTime = pct * (audioRef.current.duration || 0);
    setCurrentTime(audioRef.current.currentTime);
  }, []);

  const formatTime = (s: number) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  if (status === "loading") {
    return (
      <div className="blog-audio-player">
        <div className="blog-audio-inner">
          <div className="blog-audio-icon"><div className="blog-audio-spinner" /></div>
          <div className="blog-audio-content">
            <div className="blog-audio-label">Loading audio...</div>
            <div className="blog-audio-sub">Clinical Clarity &middot; Audio Edition</div>
          </div>
        </div>
      </div>
    );
  }

  if (status === "error") return null;

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="blog-audio-player">
      <div className="blog-audio-inner">
        <button className="blog-audio-play-btn" onClick={togglePlayback} aria-label={status === "playing" ? "Pause" : "Play"}>
          {status === "playing" ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21"/></svg>
          )}
        </button>

        <div className="blog-audio-content">
          <div className="blog-audio-top-row">
            <div className="blog-audio-label">
              {status === "ready" && currentTime === 0 && "Listen to this article"}
              {status === "ready" && currentTime > 0 && "Paused"}
              {status === "playing" && "Now playing"}
              {status === "paused" && "Paused"}
            </div>
            <div className="blog-audio-time">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="blog-audio-progress clickable" ref={progressBarRef} onClick={seekTo}>
            <div className="blog-audio-progress-fill" style={{ width: `${pct}%` }} />
          </div>

          <div className="blog-audio-bottom-row">
            <div className="blog-audio-sub">Clinical Clarity &middot; Audio Edition</div>
            <div className="blog-audio-controls">
              <button className="blog-audio-ctrl" onClick={() => skip(-15)} title="Back 15s">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
              </button>
              <button className="blog-audio-ctrl" onClick={() => skip(15)} title="Forward 15s">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
              </button>
              <button className="blog-audio-ctrl speed" onClick={cycleSpeed} title="Playback speed">
                {playbackRate}x
              </button>
              {(status === "playing" || status === "paused") && (
                <button className="blog-audio-ctrl" onClick={stop} title="Stop">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
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

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
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
        <Link href="/blog">Back to Blog</Link>
      </main>
    );
  }

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    headline: post.title,
    description: post.excerpt,
    image: post.image,
    author: { "@type": "Person", name: "Dr. Sameh Elguizaoui, M.D." },
    publisher: { "@type": "Organization", name: "Dr. Sameh Elguizaoui, M.D." },
    datePublished: post.date,
  };

  const blogPostingJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.image,
    author: { "@type": "Person", name: "Dr. Sameh Elguizaoui, M.D.", jobTitle: "Orthopedic Surgeon" },
    publisher: { "@type": "Organization", name: "Dr. Sameh Elguizaoui, M.D." },
    datePublished: post.date,
    url: `https://www.samelguizaoui.com/blog/${post.slug}`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingJsonLd) }} />
      <section className="blog-post-hero" style={{ backgroundImage: `url('${post.image}')` }}>
        <div className="container">
          <div className="blog-breadcrumb">
            <Link href="/blog">&larr; Back to Blog</Link>
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
          <BlogAudioPlayer post={post} />
          <div
            className={post.contentHtml ? "blog-article" : "blog-post-content"}
            dangerouslySetInnerHTML={{ __html: post.contentHtml || markdownToHtml(post.content) }}
          />
          <div className="blog-author">
            <img
              className="blog-author-img"
              src="/images/sam6.jpeg"
              alt="Dr. Sameh (Sam) Elguizaoui, M.D."
            />
            <div className="blog-author-info">
              <h4>Written by Dr. Sameh &ldquo;Sam&rdquo; Elguizaoui, M.D.</h4>
              <div className="author-title">Board-Certified Orthopedic Surgeon &bull; Sports Medicine Specialist</div>
              <p>
                Dr. Elguizaoui is a fellowship-trained orthopedic surgeon practicing in Manhattan,
                Brooklyn, and Scarsdale. He specializes in minimally invasive arthroscopic
                surgery, cartilage restoration, and joint preservation — treating New Yorkers
                who refuse to slow down. Every article in Clinical Clarity is written and
                reviewed by Dr. Sam himself, grounded in the operating room and the evidence,
                not marketing fluff.{" "}
                <Link href="/about" style={{ color: "var(--primary)", fontWeight: 600 }}>
                  Learn more about Dr. Sam &rarr;
                </Link>
              </p>
            </div>
          </div>
          <div style={{ marginTop: "60px", paddingTop: "30px", borderTop: "1px solid var(--border)" }}>
            <Link href="/blog" className="btn btn-outline">&larr; Back to All Articles</Link>
          </div>
        </div>
      </section>

      <GetStarted />
      <Locations />
    </>
  );
}
