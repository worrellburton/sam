import { useEffect } from "react";
import { Link, useParams } from "react-router";
import { getBlogPostBySlug } from "~/data/blog";
import { GetStarted } from "~/components/GetStarted";
import { Locations } from "~/components/Locations";

export function meta({ params }: { params: { slug: string } }) {
  const post = getBlogPostBySlug(params.slug);
  return [
    { title: post ? `${post.title} | Dr. Sam Elguizaoui` : "Post Not Found" },
    { name: "description", content: post?.excerpt || "" },
  ];
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
