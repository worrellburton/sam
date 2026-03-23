import { Link } from "react-router";
import { allBlogPosts } from "~/data/blog";
import { GetStarted } from "~/components/GetStarted";
import { Locations } from "~/components/Locations";
import { seoMeta } from "~/seo";

export function meta() {
  return seoMeta({
    title: "Blog | Dr. Sam Elguizaoui, M.D.",
    description: "Expert tips on joint health, recovery, and sports medicine from Dr. Elguizaoui. Read about ACL tears, cartilage repair, PRP therapy, and more.",
    path: "/blog",
  });
}

export default function BlogPage() {
  return (
    <>
      <section className="service-hero has-bg" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=1600&h=600&fit=crop&q=80')" }}>
        <div className="container">
          <h1>Blog</h1>
          <p>Orthopedic insights from Dr. Elguizaoui</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="blog-home-grid">
            {allBlogPosts.map((post) => (
              <Link to={`/blog/${post.slug}`} className="blog-card" key={post.slug}>
                <img className="blog-card-img" src={post.image} alt={post.imageAlt} loading="lazy" />
                <div className="blog-card-body">
                  <span className="blog-card-tag">{post.tag}</span>
                  <h3>{post.title}</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "8px" }}>{post.excerpt}</p>
                  <span className="blog-card-meta">{post.date} &bull; {post.readTime}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <GetStarted />
      <Locations />
    </>
  );
}
