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

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://samelguizaoui.vercel.app";

export const metadata: Metadata = {
  title: "Clinical Clarity | Orthopedic Blog by Dr. Sameh Elguizaoui",
  description:
    "Deep-dive investigative reports on orthopedic surgery, sports medicine, and joint preservation — written by a board-certified surgeon.",
  alternates: { canonical: `${SITE_URL}/blog` },
};

// Re-validate the blog index hourly; DB-backed overrides pick up without
// a redeploy, but we still cache heavily.
export const revalidate = 3600;

async function resolvePosts(): Promise<BlogPost[]> {
  try {
    const rows = await listAllAsBlogPosts();
    if (rows.length > 0) {
      const byStaticSlug = new Map(staticAllBlogPosts.map((p) => [p.slug, p]));
      return rows.map((r) => {
        const s = byStaticSlug.get(r.slug);
        if (!s) return r;
        return {
          ...r,
          content: r.content || s.content,
          contentHtml: r.contentHtml || s.contentHtml,
        };
      });
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
