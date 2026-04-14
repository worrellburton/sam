"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { blogPosts as staticBlogPosts, allBlogPosts as staticAllBlogPosts, isPostReleased, getSeriesRotationView, type BlogPost } from "@/data/blog";
import { listAllAsBlogPosts } from "@/lib/db/blog";
import { GetStarted } from "@/components/GetStarted";
import { Locations } from "@/components/Locations";

function CardAudioBtn({ slug }: { slug: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const src = `/audio/${slug}.mp3`;

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    audio.preload = "none";
    audio.src = src;

    const onCanPlay = () => setAvailable(true);
    const onError = () => setAvailable(false);
    audio.addEventListener("canplaythrough", onCanPlay);
    audio.addEventListener("error", onError);
    audio.addEventListener("ended", () => setPlaying(false));

    audio.load();

    return () => {
      audio.pause();
      audio.removeEventListener("canplaythrough", onCanPlay);
      audio.removeEventListener("error", onError);
      audio.removeAttribute("src");
    };
  }, [src]);

  const toggle = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      document.querySelectorAll("audio").forEach((a) => { a.pause(); });
      audioRef.current.play().catch(() => {});
      setPlaying(true);
    }
  }, [playing]);

  if (available === false || available === null) return null;

  return (
    <button
      className={`blog-card-play${playing ? " is-playing" : ""}`}
      onClick={toggle}
      aria-label={playing ? "Pause audio" : "Listen to article"}
      title={playing ? "Pause" : "Listen"}
    >
      {playing ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <rect x="6" y="4" width="4" height="16" rx="1" />
          <rect x="14" y="4" width="4" height="16" rx="1" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <polygon points="6 3 20 12 6 21" />
        </svg>
      )}
      <span>{playing ? "Playing" : "Listen"}</span>
    </button>
  );
}

function BlogCard({
  post,
  showEpisode,
  asComingSoon,
  comingLabel,
}: {
  post: BlogPost;
  showEpisode?: boolean;
  /** Override the card's coming-soon styling (used by the rotation teaser). */
  asComingSoon?: boolean;
  /** Optional custom "Coming ..." label; falls back to post.date. */
  comingLabel?: string;
}) {
  const isComingSoon =
    asComingSoon ?? Boolean(post.comingSoon && !isPostReleased(post));
  // An authored draft is not yet published, so we shouldn't link to it. A
  // derived teaser (asComingSoon=true on an already-released post) is a real
  // article — keep the link live.
  const isUnreleasedDraft = Boolean(post.comingSoon && !isPostReleased(post));

  return (
    <div className={`blog-card${isComingSoon ? " coming-soon" : ""}`}>
      <Link href={isUnreleasedDraft ? "#" : `/blog/${post.slug}`} className="blog-card-link">
        <div className="blog-card-img-wrap">
          <Image className="blog-card-img" src={post.image1x1 || post.image} alt={post.imageAlt} width={600} height={600} />
          {showEpisode && post.episode && (
            <span className="blog-card-ep">EP. {post.episode}</span>
          )}
          {isComingSoon && (
            <span className="blog-card-coming">
              {comingLabel ? comingLabel : `Coming ${post.date}`}
            </span>
          )}
        </div>
        <div className="blog-card-body">
          <div className="blog-card-tag-row">
            <span className="blog-card-tag">{post.tag}</span>
            {post.readTime && <span className="blog-card-meta">{post.readTime}</span>}
          </div>
          <h3>{post.title}</h3>
          <p>{post.excerpt}</p>
          <div className="blog-card-footer">
            <span className="blog-card-meta">{post.date}</span>
            {!isUnreleasedDraft && <CardAudioBtn slug={post.slug} />}
          </div>
        </div>
      </Link>
    </div>
  );
}

export default function BlogPage() {
  // Prefer DB-backed posts; fall back to the bundled static list if the
  // query fails or returns nothing (e.g. local dev without env vars).
  const [posts, setPosts] = useState<BlogPost[]>(staticAllBlogPosts);

  useEffect(() => {
    let cancelled = false;
    listAllAsBlogPosts()
      .then((rows) => {
        if (!cancelled && rows.length > 0) {
          // Preserve static content bodies when DB rows lack them — DB
          // currently stores metadata only for most posts.
          const byStaticSlug = new Map(staticAllBlogPosts.map((p) => [p.slug, p]));
          const merged = rows.map((r) => {
            const s = byStaticSlug.get(r.slug);
            if (!s) return r;
            return {
              ...r,
              content: r.content || s.content,
              contentHtml: r.contentHtml || s.contentHtml,
            };
          });
          setPosts(merged);
        }
      })
      .catch(() => {
        /* fallback already in state */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Infinite-loop rotation: when the authored coming-soon post releases (or
  // none is flagged), the oldest released episode is re-surfaced as the
  // teaser so the series always has a "coming next" slot.
  const series = posts.filter((p) => p.episode !== undefined);
  const rotation = getSeriesRotationView(series.length > 0 ? series : staticBlogPosts);
  const seriesPublished = [...rotation.published].sort(
    (a, b) => (b.episode || 0) - (a.episode || 0)
  );

  const guidePosts = posts.filter((p) => !p.episode);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Where can I find reliable information about orthopedic injuries and treatments?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Dr. Elguizaoui's Clinical Clarity blog provides evidence-based, investigative reports on orthopedic topics written by a board-certified orthopedic surgeon. Each article offers deep-dive analysis of modern treatments, injury prevention, and surgical techniques without marketing fluff or unproven fads."
        }
      },
      {
        "@type": "Question",
        "name": "When should I see an orthopedic surgeon for joint pain?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You should see an orthopedic surgeon if you experience persistent joint pain lasting more than a few weeks, swelling that does not improve with rest and ice, mechanical symptoms like locking or catching in a joint, instability or giving way, or pain that limits your daily activities or athletic performance. Early evaluation can prevent further damage and expand treatment options."
        }
      },
      {
        "@type": "Question",
        "name": "What are the most common sports injuries treated by orthopedic surgeons?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The most common sports injuries include ACL and meniscus tears in the knee, rotator cuff and labral tears in the shoulder, ankle sprains and fractures, and tennis or golfer's elbow. Dr. Elguizaoui specializes in minimally invasive arthroscopic treatment of these injuries, often allowing athletes to return to sport faster with less scarring."
        }
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <section className="blog-hero">
        <div className="container">
          <span className="blog-hero-label">Investigative Medical Series</span>
          <h1>
            Clinical <span className="text-accent">Clarity</span>
          </h1>
          <p className="blog-hero-desc">
            No fluff. No fads. Deep-dive investigative reports from the surgeon who actually sees the inside of the joints.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="blog-section-header">
            <h2>
              The <span className="text-accent">Investigation</span>
            </h2>
            <p>Each episode is a deep-dive report. Start from the beginning or jump to any case file.</p>
          </div>

          <div className="blog-home-grid">
            {rotation.comingSoon && (
              <BlogCard
                key={`teaser-${rotation.comingSoon.slug}`}
                post={rotation.comingSoon}
                showEpisode
                asComingSoon
                comingLabel={
                  rotation.derived
                    ? "Revisiting Next"
                    : `Coming ${rotation.comingSoon.date}`
                }
              />
            )}
            {seriesPublished.map((post) => (
              <BlogCard key={post.slug} post={post} showEpisode />
            ))}
          </div>
        </div>
      </section>

      {guidePosts.length > 0 && (
        <section className="section" style={{ paddingTop: "20px" }}>
          <div className="container">
            <div className="blog-section-header">
              <h2>
                Condition <span className="text-accent">Guides</span>
              </h2>
              <p>In-depth guides on specific injuries and conditions — written with clarity and compassion.</p>
            </div>

            <div className="blog-home-grid">
              {guidePosts.map((post) => (
                <BlogCard key={post.slug} post={post} />
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
