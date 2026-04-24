import type { Metadata } from "next";
import {
  blogPosts as staticBlogPosts,
  allBlogPosts as staticAllBlogPosts,
  getSeriesRotationView,
  type BlogPost,
} from "@/data/blog";
import { listAllAsBlogPosts } from "@/lib/db/blog";
import { GetStarted } from "@/components/GetStarted";
import { Locations } from "@/components/Locations";
import { BlogCard } from "@/components/BlogCard";
import { logError } from "@/lib/log";
import { PLACEHOLDER_IMAGE } from "@/data/placeholder-image";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://samelguizaoui.vercel.app";

export const metadata: Metadata = {
  title: "Clinical Clarity | Orthopedic Blog by Dr. Sameh Elguizaoui",
  description:
    "Deep-dive investigative reports on orthopedic surgery, sports medicine, and joint preservation — written by a board-certified surgeon.",
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    title: "Clinical Clarity | Orthopedic Surgery Blog",
    description:
      "Deep-dive investigative reports on orthopedic surgery, sports medicine, and joint preservation — written by a board-certified surgeon.",
    url: `${SITE_URL}/blog`,
    type: "website",
    images: [
      {
        url: "/images/header.jpg",
        width: 1200,
        height: 630,
        alt: "Clinical Clarity — Orthopedic Blog by Dr. Sameh Elguizaoui",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Clinical Clarity | Orthopedic Surgery Blog",
    description:
      "Deep-dive investigative reports on orthopedic surgery, sports medicine, and joint preservation.",
    images: ["/images/header.jpg"],
  },
};

// Re-validate the blog index hourly; DB-backed overrides pick up without
// a redeploy, but we still cache heavily.
export const revalidate = 3600;

// A DB-sourced string is "missing" when it's empty or still the bare
// placeholder — in either case we'd rather fall back to the static
// blog.ts value (which is where the /dev/blog save flow writes real
// Supabase URLs via the GitHub Contents API).
function hasRealValue(v: unknown): v is string {
  if (typeof v !== "string" || v.trim() === "") return false;
  if (v === PLACEHOLDER_IMAGE) return false;
  return true;
}

async function resolvePosts(): Promise<BlogPost[]> {
  try {
    const rows = await listAllAsBlogPosts();
    if (rows.length > 0) {
      const byStaticSlug = new Map(staticAllBlogPosts.map((p) => [p.slug, p]));
      const merged = rows.map((r) => {
        const s = byStaticSlug.get(r.slug);
        if (!s) return r;
        return {
          ...s,
          ...r,
          image: hasRealValue(r.image) ? r.image : s.image,
          image3x4: hasRealValue(r.image3x4) ? r.image3x4 : s.image3x4,
          image1x1: hasRealValue(r.image1x1) ? r.image1x1 : s.image1x1,
          imageAlt: hasRealValue(r.imageAlt) ? r.imageAlt : s.imageAlt,
          imagePrompts:
            Array.isArray(r.imagePrompts) && r.imagePrompts.length > 0
              ? r.imagePrompts
              : s.imagePrompts,
          content: r.content || s.content,
          contentHtml: r.contentHtml || s.contentHtml,
        };
      });
      // Fold in any static posts the DB is missing entirely.
      const dbSlugs = new Set(merged.map((p) => p.slug));
      for (const s of staticAllBlogPosts) {
        if (!dbSlugs.has(s.slug)) merged.push(s);
      }
      return merged;
    }
  } catch (err) {
    logError("blog.resolvePosts", err);
  }
  return staticAllBlogPosts;
}

export default async function BlogPage() {
  const posts = await resolvePosts();

  // Infinite-loop rotation: when the authored coming-soon post releases (or
  // none is flagged), the oldest released episode is re-surfaced as the
  // teaser so the series always has a "coming next" slot.
  const series = posts.filter((p) => p.episode !== undefined);
  const rotation = getSeriesRotationView(
    series.length > 0 ? series : staticBlogPosts,
  );
  const seriesPublished = [...rotation.published].sort(
    (a, b) => (b.episode || 0) - (a.episode || 0),
  );
  const guidePosts = posts.filter((p) => !p.episode);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Where can I find reliable information about orthopedic injuries and treatments?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Dr. Elguizaoui's Clinical Clarity blog provides evidence-based, investigative reports on orthopedic topics written by a board-certified orthopedic surgeon. Each article offers deep-dive analysis of modern treatments, injury prevention, and surgical techniques without marketing fluff or unproven fads.",
        },
      },
      {
        "@type": "Question",
        name: "When should I see an orthopedic surgeon for joint pain?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You should see an orthopedic surgeon if you experience persistent joint pain lasting more than a few weeks, swelling that does not improve with rest and ice, mechanical symptoms like locking or catching in a joint, instability or giving way, or pain that limits your daily activities or athletic performance. Early evaluation can prevent further damage and expand treatment options.",
        },
      },
      {
        "@type": "Question",
        name: "What are the most common sports injuries treated by orthopedic surgeons?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The most common sports injuries include ACL and meniscus tears in the knee, rotator cuff and labral tears in the shoulder, ankle sprains and fractures, and tennis or golfer's elbow. Dr. Elguizaoui specializes in minimally invasive arthroscopic treatment of these injuries, often allowing athletes to return to sport faster with less scarring.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
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
