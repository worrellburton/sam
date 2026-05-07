import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { GetStarted } from "@/components/GetStarted";
import { Locations } from "@/components/Locations";
import { Insurance } from "@/components/Insurance";
import { HomeHero } from "@/components/HomeHero";
import { HomeReviews } from "@/components/HomeReviews";
import { HomeSpecialties } from "@/components/HomeSpecialties";
import { Icon } from "@/components/icons";
import { blogPosts, isPostReleased } from "@/data/blog";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.sportsorthomd.com";

export const metadata: Metadata = {
  title: "Dr. Sameh Elguizaoui, M.D. | NYC Orthopedic Surgeon",
  description:
    "Board-certified orthopedic surgeon Dr. Sameh Elguizaoui specializes in sports medicine, joint preservation, and cartilage repair across Manhattan, Brooklyn, and the West Village.",
  alternates: { canonical: `${SITE_URL}/` },
  openGraph: {
    title: "Dr. Sameh Elguizaoui, M.D. | NYC Orthopedic Surgeon",
    description:
      "Board-certified orthopedic surgeon specializing in sports medicine, knee & shoulder surgery, and cartilage repair in Manhattan, Brooklyn & the West Village.",
    url: `${SITE_URL}/`,
    type: "website",
    images: [
      {
        url: "/images/header.jpg",
        width: 1200,
        height: 630,
        alt: "Dr. Sameh Elguizaoui — NYC Orthopedic Surgeon",
      },
    ],
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How do I choose the right orthopedic surgeon in NYC?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Look for a board-certified orthopedic surgeon with fellowship training in your specific area of concern. Dr. Sameh Elguizaoui, M.D. is board-certified by the American Board of Orthopaedic Surgery, fellowship-trained in sports medicine at Lenox Hill Hospital, and has additional international training in joint preservation across Switzerland, the Netherlands, and Italy.",
      },
    },
    {
      "@type": "Question",
      name: "What conditions does Dr. Elguizaoui treat?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Dr. Elguizaoui treats a wide range of orthopedic conditions including ACL tears, meniscus injuries, rotator cuff tears, shoulder instability, cartilage damage, arthritis, sports injuries, and fractures. He specializes in joint preservation, arthroscopic surgery, and regenerative medicine including PRP therapy.",
      },
    },
    {
      "@type": "Question",
      name: "Does Dr. Elguizaoui accept insurance?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, Dr. Elguizaoui accepts most major insurance plans. His office staff can verify your coverage and benefits before your appointment. Contact the office at (212) 540-2265 for specific insurance inquiries.",
      },
    },
    {
      "@type": "Question",
      name: "Where are Dr. Elguizaoui's office locations in NYC?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Dr. Elguizaoui has three convenient office locations across New York City: Upper East Side in Manhattan, Greenwich Village in Manhattan, and Brooklyn Heights in Brooklyn. All locations offer the same comprehensive orthopedic services.",
      },
    },
  ],
};

export default function Home() {
  const releasedPosts = blogPosts.filter((p) => isPostReleased(p));
  const recentPosts = releasedPosts.slice(0, 3);
  const upcomingDrafts = blogPosts.filter((p) => p.comingSoon && !isPostReleased(p));
  const comingSoonPost = upcomingDrafts
    .slice()
    .sort((a, b) => {
      const da = a.releaseDate ? new Date(a.releaseDate).getTime() : Infinity;
      const db = b.releaseDate ? new Date(b.releaseDate).getTime() : Infinity;
      return da - db;
    })[0];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <HomeHero />

      {/* About */}
      <section className="section about reveal" id="about">
        <div className="container">
          <div className="about-layout">
            <div className="about-photo">
              <Image
                src="/images/Confident Doctor Headshot-1.jpg"
                alt="Dr. Sam Elguizaoui - Orthopedic Surgeon"
                className="about-portrait"
                width={800}
                height={1200}
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectPosition: "center 20%" }}
              />
            </div>
            <div className="about-right">
              <div className="about-header">
                <p className="section-label">About Dr. Elguizaoui</p>
                <h2>
                  Orthopedic Excellence,
                  <br />
                  <span className="text-accent">Patient-First Approach</span>
                </h2>
              </div>
              <div className="about-content">
                <p className="about-lead">
                  Board-certified orthopedic surgeon and fellowship-trained sports medicine specialist in New York City, combining world-class surgical training with conservative, patient-centered care.
                </p>
                <p>
                  Trained at <strong>Cleveland Clinic</strong> and <strong>Lenox Hill Hospital</strong>, with an international fellowship across <strong>Switzerland, the Netherlands, and Italy</strong> in joint preservation and cartilage repair.
                </p>
                <p>
                  Former team physician for the <strong>New York Jets (NFL)</strong> and <strong>New York Islanders (NHL)</strong>.
                </p>
              </div>
              <div className="about-highlights">
                <div className="highlight-card reveal-left" style={{ transitionDelay: "0s", animationDelay: "0s" }}>
                  <div className="highlight-icon">
                    <Icon.Shield strokeWidth={2} />
                  </div>
                  <h3>Board Certified</h3>
                  <p>American Board of Orthopaedic Surgery</p>
                </div>
                <div className="highlight-card reveal-left" style={{ transitionDelay: "0.12s" }}>
                  <div className="highlight-icon" style={{ transitionDelay: "0.27s" }}>
                    <Icon.Globe strokeWidth={2} />
                  </div>
                  <h3>International Training</h3>
                  <p>Fellowship across Switzerland, Netherlands &amp; Italy</p>
                </div>
                <div className="highlight-card reveal-left" style={{ transitionDelay: "0.24s" }}>
                  <div className="highlight-icon" style={{ transitionDelay: "0.39s" }}>
                    <Icon.Users strokeWidth={2} />
                  </div>
                  <h3>Pro Sports Experience</h3>
                  <p>NY Jets (NFL) &bull; NY Islanders (NHL)</p>
                </div>
                <div className="highlight-card reveal-left" style={{ transitionDelay: "0.36s" }}>
                  <div className="highlight-icon" style={{ transitionDelay: "0.51s" }}>
                    <Icon.Star strokeWidth={2} />
                  </div>
                  <h3>1,400+ Reviews</h3>
                  <p>4.8/5 stars across major platforms</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specialties */}
      <section className="section specialties reveal" id="specialties">
        <div className="container">
          <div className="section-header specialties-header">
            <p className="section-label">Areas of Expertise</p>
            <h2>
              Specialized Orthopedic <span className="text-accent">Treatments</span>
            </h2>
            <p className="section-desc">
              From advanced arthroscopic surgery to cutting-edge regenerative therapies, Dr. Elguizaoui offers comprehensive orthopedic care tailored to your needs and goals.
            </p>
          </div>
          <HomeSpecialties />
        </div>
      </section>

      <HomeReviews />

      {/* Blog Preview */}
      <section className="section blog-home reveal" id="blog">
        <div className="container">
          <div className="section-header">
            <p className="section-label">Clinical Clarity</p>
            <h2>
              Investigating Modern <span className="text-accent">Orthopedics</span>
            </h2>
            <p className="section-desc">
              No fluff. No fads. Deep-dive investigative reports from the surgeon who actually sees the inside of the joints.
            </p>
          </div>
          <div className="blog-home-grid">
            {recentPosts.map((post) => (
              <Link href={`/blog/${post.slug}`} className="blog-card blog-card-book" key={post.slug}>
                <div className="blog-card-img-wrap">
                  <Image
                    className="blog-card-img"
                    src={post.image}
                    alt={post.imageAlt}
                    width={600}
                    height={800}
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  {post.episode && <span className="blog-card-ep">EP. {post.episode}</span>}
                </div>
                <div className="blog-card-body">
                  <span className="blog-card-tag">{post.tag}</span>
                  <h3>{post.title}</h3>
                  <span className="blog-card-meta">{post.date}</span>
                </div>
              </Link>
            ))}
            {comingSoonPost && (
              <div className="blog-card blog-card-book blog-card-featured">
                <span className="blog-card-feature-flag">Next Up</span>
                <div className="blog-card-img-wrap">
                  <Image
                    className="blog-card-img"
                    src={comingSoonPost.image}
                    alt={comingSoonPost.imageAlt}
                    width={600}
                    height={800}
                  />
                  <div className="blog-card-coming-overlay">
                    <span className="blog-card-coming-badge">Coming Soon</span>
                  </div>
                </div>
                <div className="blog-card-body">
                  <span className="blog-card-tag">{comingSoonPost.tag}</span>
                  <h3>{comingSoonPost.title}</h3>
                  <span className="blog-card-meta">{comingSoonPost.date}</span>
                </div>
              </div>
            )}
          </div>
          <div style={{ textAlign: "center", marginTop: "40px" }}>
            <Link href="/blog" className="btn btn-outline">
              View All Episodes &rarr;
            </Link>
          </div>
        </div>
      </section>

      <GetStarted />
      <Locations />
      <Insurance />
    </>
  );
}
