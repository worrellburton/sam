"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { blogPosts, allBlogPosts, type BlogPost } from "@/data/blog";
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
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="4" width="4" height="16" rx="1" />
          <rect x="14" y="4" width="4" height="16" rx="1" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="6 3 20 12 6 21" />
        </svg>
      )}
      <span>{playing ? "Playing" : "Listen"}</span>
    </button>
  );
}

function BlogCard({ post, showEpisode }: { post: BlogPost; showEpisode?: boolean }) {
  const isComingSoon = post.comingSoon;

  return (
    <div className={`blog-card${isComingSoon ? " coming-soon" : ""}`}>
      <Link href={isComingSoon ? "#" : `/blog/${post.slug}`} className="blog-card-link">
        <div className="blog-card-img-wrap">
          <Image className="blog-card-img" src={post.image} alt={post.imageAlt} width={800} height={400} />
          {showEpisode && post.episode && (
            <span className="blog-card-ep">EP. {post.episode}</span>
          )}
          {isComingSoon && <span className="blog-card-coming">Coming {post.date}</span>}
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
            {!isComingSoon && <CardAudioBtn slug={post.slug} />}
          </div>
        </div>
      </Link>
    </div>
  );
}

export default function BlogPage() {
  const seriesPosts = blogPosts
    .filter((p) => p.episode)
    .sort((a, b) => (b.episode || 0) - (a.episode || 0));

  const guidePosts = allBlogPosts.filter((p) => !p.episode);

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
            {seriesPosts.map((post) => (
              <BlogCard key={post.slug} post={post} showEpisode />
            ))}
          </div>
        </div>
      </section>

      {guidePosts.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
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
