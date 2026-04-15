import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getBlogPostBySlug as getStaticPostBySlug,
  allBlogPosts,
  isPostReleased,
  type BlogPost,
} from "@/data/blog";
import { getBlogPostBySlug as getDbPostBySlug } from "@/lib/db/blog";
import { GetStarted } from "@/components/GetStarted";
import { Locations } from "@/components/Locations";
import { BlogAudioPlayer } from "@/components/BlogAudioPlayer";
import { BlogReveal } from "@/components/BlogReveal";
import { markdownToHtml } from "@/lib/markdown";
import { logError } from "@/lib/log";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://samelguizaoui.vercel.app";

export async function generateStaticParams() {
  // Only pre-render posts that are actually released so unreleased drafts
  // don't leak 404-able URLs into the build manifest.
  return allBlogPosts
    .filter((p) => isPostReleased(p))
    .map((p) => ({ slug: p.slug }));
}

async function resolvePost(slug: string): Promise<BlogPost | undefined> {
  const staticPost = getStaticPostBySlug(slug);
  try {
    const dbPost = await getDbPostBySlug(slug);
    if (dbPost) {
      return {
        ...dbPost,
        content: dbPost.content || staticPost?.content || "",
        contentHtml: dbPost.contentHtml || staticPost?.contentHtml,
      };
    }
  } catch (err) {
    logError("blog.resolvePost", err, { slug });
  }
  return staticPost;
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const post = await resolvePost(slug);
  if (!post) return { title: "Post Not Found" };
  const url = `${SITE_URL}/blog/${slug}`;
  return {
    title: `${post.title} | Clinical Clarity`,
    description: post.excerpt,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url,
      type: "article",
      images: post.image ? [{ url: post.image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: post.image ? [post.image] : undefined,
    },
  };
}

export default async function BlogPostPage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const post = await resolvePost(slug);
  if (!post) notFound();

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
    author: {
      "@type": "Person",
      name: "Dr. Sameh Elguizaoui, M.D.",
      jobTitle: "Orthopedic Surgeon",
    },
    publisher: { "@type": "Organization", name: "Dr. Sameh Elguizaoui, M.D." },
    datePublished: post.date,
    url: `${SITE_URL}/blog/${post.slug}`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingJsonLd) }} />
      <section className="blog-post-hero" style={{ backgroundImage: `url('${post.image}')` }}>
        <div className="container" style={{ maxWidth: 1100 }}>
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
        <div className="container" style={{ maxWidth: 1100 }}>
          <BlogAudioPlayer slug={post.slug} />
          <div
            className={post.contentHtml ? "blog-article" : "blog-post-content"}
            dangerouslySetInnerHTML={{
              __html: post.contentHtml || markdownToHtml(post.content),
            }}
          />
          <BlogReveal />
          <div className="blog-author">
            {/* Using <img> (not next/image) because this block is rendered
                inside dangerouslySetInnerHTML-adjacent markup; keeping it
                simple and letting the legacy CSS style it. */}
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
