"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { GetStarted } from "@/components/GetStarted";
import { Locations } from "@/components/Locations";
import { Insurance } from "@/components/Insurance";
import { blogPosts, isPostReleased } from "@/data/blog";
import { patientReviews } from "@/data/patient-reviews";
import { HeroGradient } from "@/components/HeroGradient";
import { HeroOverlayGradient } from "@/components/HeroOverlayGradient";
import { HeroTicker } from "@/components/HeroTicker";
import { Icon } from "@/components/icons";

interface GoogleReview {
  rating: number;
  text?: { text?: string };
  authorAttribution?: { displayName?: string; photoUri?: string };
  relativePublishTimeDescription?: string;
  publishTime?: string;
  locationLabel: string;
}

// Pulls aggregated Google Places reviews from the ISR-cached
// `/api/places/all` endpoint (1 request instead of 3 per visitor).
function useGoogleReviews() {
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    async function fetchAllReviews() {
      try {
        const resp = await fetch('/api/places/all');
        if (!resp.ok) throw new Error(`API error: ${resp.status}`);
        const data = await resp.json() as { totalCount: number; reviews: GoogleReview[] };
        setTotalCount(data.totalCount);
        setReviews(data.reviews);
      } catch (err) {
        console.warn('Google Reviews fetch failed:', err);
      }
    }
    fetchAllReviews();
  }, []);

  return { reviews, totalCount };
}

function starsHTML(rating: number) {
  return '\u2605'.repeat(Math.round(rating)) + '\u2606'.repeat(5 - Math.round(rating));
}

export default function Home() {
  // Treat drafts whose releaseDate has passed as published
  const releasedPosts = blogPosts.filter((p) => isPostReleased(p));
  const recentPosts = releasedPosts.slice(0, 3);
  // Feature the next unreleased draft (by earliest releaseDate, falling back
  // to first coming-soon if none have dates)
  const upcomingDrafts = blogPosts.filter((p) => p.comingSoon && !isPostReleased(p));
  const comingSoonPost = upcomingDrafts
    .slice()
    .sort((a, b) => {
      const da = a.releaseDate ? new Date(a.releaseDate).getTime() : Infinity;
      const db = b.releaseDate ? new Date(b.releaseDate).getTime() : Infinity;
      return da - db;
    })[0];
  const { reviews: googleReviews, totalCount: googleTotal } = useGoogleReviews();

  const allReviews = (() => {
    if (googleReviews.length > 0) {
      return [...googleReviews].sort((a, b) => {
        const ta = new Date(a.publishTime || 0).getTime();
        const tb = new Date(b.publishTime || 0).getTime();
        return tb - ta;
      });
    }
    return patientReviews.map(r => ({ ...r, rating: 5, isLocal: true as const }));
  })();
  const [heroReady, setHeroReady] = useState(false);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How do I choose the right orthopedic surgeon in NYC?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Look for a board-certified orthopedic surgeon with fellowship training in your specific area of concern. Dr. Sameh Elguizaoui, M.D. is board-certified by the American Board of Orthopaedic Surgery, fellowship-trained in sports medicine at Lenox Hill Hospital, and has additional international training in joint preservation across Switzerland, the Netherlands, and Italy."
        }
      },
      {
        "@type": "Question",
        "name": "What conditions does Dr. Elguizaoui treat?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Dr. Elguizaoui treats a wide range of orthopedic conditions including ACL tears, meniscus injuries, rotator cuff tears, shoulder instability, cartilage damage, arthritis, sports injuries, and fractures. He specializes in joint preservation, arthroscopic surgery, and regenerative medicine including PRP therapy."
        }
      },
      {
        "@type": "Question",
        "name": "Does Dr. Elguizaoui accept insurance?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, Dr. Elguizaoui accepts most major insurance plans. His office staff can verify your coverage and benefits before your appointment. Contact the office at (917) 905-9370 for specific insurance inquiries."
        }
      },
      {
        "@type": "Question",
        "name": "Where are Dr. Elguizaoui's office locations in NYC?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Dr. Elguizaoui has three convenient office locations across New York City: Upper East Side in Manhattan, Greenwich Village in Manhattan, and Brooklyn Heights in Brooklyn. All locations offer the same comprehensive orthopedic services."
        }
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {/* Hero */}
      <header className={`hero${heroReady ? " hero-loaded" : ""}`} id="hero">
        <Image className={`hero-bg-img${heroReady ? " loaded" : ""}`} src="/images/header.jpg" alt="Dr. Sameh Elguizaoui performing orthopedic surgery" aria-hidden="true" width={1920} height={1080} sizes="100vw" priority onLoad={() => setHeroReady(true)} />
        <HeroGradient />
        <div className="hero-overlay"></div>
        <HeroOverlayGradient />
        <div className="container hero-content">
          <div className="hero-text">
            <p className="hero-label">Board-Certified Orthopedic Excellence</p>
            <h1>NYC&rsquo;s Most Trusted <em>Orthopedic</em> Surgeon</h1>
            <div className="hero-divider" />
            <p className="hero-desc">Sports medicine and joint preservation specialist trained at Cleveland Clinic and Lenox Hill Hospital. Former team physician for the NY Jets and NY Islanders.</p>
            <a href="#about" className="btn btn-hero">Learn More</a>
          </div>
          <a href="https://www.zocdoc.com/doctor/sam-elguizaoui-md-236423" target="_blank" rel="noopener" className="hero-rating-card" aria-label="View Dr. Elguizaoui on Zocdoc">
            <div className="rating-top">
              <div className="rating-score">4.8<span className="rating-star">&#9733;</span></div>
              <div className="rating-info">
                <span className="rating-platform">Patient Rating</span>
                <span className="rating-count"><strong>1,466</strong> Reviews</span>
              </div>
            </div>
            <div className="rating-bottom">
              <div className="rating-avatars">
                <div className="avatar">S</div>
                <div className="avatar">M</div>
                <div className="avatar">A</div>
              </div>
              <span className="rating-patient-choice" aria-label="Zocdoc Patient Choice">
                <Icon.Trophy width={14} height={14} />
                Patient Choice
              </span>
            </div>
          </a>
        </div>
        <HeroTicker />
      </header>

      {/* About */}
      <section className="section about reveal" id="about">
        <div className="container">
          <div className="about-layout">
            <div className="about-photo">
              <Image src="/images/Confident Doctor Headshot-1.jpg" alt="Dr. Sam Elguizaoui - Orthopedic Surgeon" className="about-portrait" width={800} height={1200} sizes="(max-width: 768px) 100vw, 50vw" style={{ objectPosition: "center 20%" }} />
            </div>
            <div className="about-right">
              <div className="about-header">
                <p className="section-label">About Dr. Elguizaoui</p>
                <h2>Orthopedic Excellence,<br /><span className="text-accent">Patient-First Approach</span></h2>
              </div>
              <div className="about-content">
                <p className="about-lead">Board-certified orthopedic surgeon and fellowship-trained sports medicine specialist in New York City, combining world-class surgical training with conservative, patient-centered care.</p>
                <p>Trained at <strong>Cleveland Clinic</strong> and <strong>Lenox Hill Hospital</strong>, with an international fellowship across <strong>Switzerland, the Netherlands, and Italy</strong> in joint preservation and cartilage repair.</p>
                <p>Former team physician for the <strong>New York Jets (NFL)</strong> and <strong>New York Islanders (NHL)</strong>.</p>
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

      <Insurance />

      {/* Specialties */}
      <section className="section specialties reveal" id="specialties">
        <div className="container">
          <div className="section-header specialties-header">
            <p className="section-label">Areas of Expertise</p>
            <h2>Specialized Orthopedic <span className="text-accent">Treatments</span></h2>
            <p className="section-desc">From advanced arthroscopic surgery to cutting-edge regenerative therapies, Dr. Elguizaoui offers comprehensive orthopedic care tailored to your needs and goals.</p>
          </div>
          {(() => {
            type SpecialtyCard = {
              title: string;
              href: string;
              video?: string;
              image?: string;
              description?: string;
            };
            // Videos live in the Supabase `blog-videos` bucket (public read).
            // A single base URL + filename keeps the list readable and makes
            // it easy to swap in new clips uploaded via /dev/videos.
            const V = "https://wgznytmxwslupjhsdeha.supabase.co/storage/v1/object/public/blog-videos";
            const row1: SpecialtyCard[] = [
              { title: "Sports Medicine", href: "/services/sports-medicine", video: `${V}/Sports_Medicine.mp4` },
              { title: "Joint Preservation", href: "/services/joint-preservation", video: `${V}/Joint_Preservation.mp4` },
            ];
            const row2: SpecialtyCard[] = [
              { title: "Arthroscopic Surgery", href: "/services/arthroscopic-surgery", video: `${V}/Arthroscopic_Surgery.mp4` },
              { title: "Cartilage Repair", href: "/services/cartilage-repair", video: `${V}/Cartilage_Repair.mp4` },
              { title: "Regenerative Medicine", href: "/services/regenerative-medicine", video: `${V}/Regenerative_Medicine.mp4` },
            ];
            const row3: SpecialtyCard[] = [
              { title: "Shoulder", href: "/services/shoulder-knee-surgery", video: `${V}/Shoulder.mp4` },
              { title: "Knee", href: "/services/sports-medicine", video: `${V}/Knee.mp4` },
              { title: "Elbow", href: "/services/sports-medicine", video: `${V}/Elbow.mp4` },
            ];
            const row4: SpecialtyCard[] = [
              { title: "General Orthopedics", href: "/services/sports-medicine", video: `${V}/General_Orthopedics.mp4` },
              {
                title: "Book a Consultation",
                href: "/book",
                description: "Schedule a visit at one of Dr. Elguizaoui's NYC offices — Manhattan, Brooklyn, or Scarsdale.",
              },
            ];
            const renderCard = (card: SpecialtyCard) => {
              const isBookCard = !card.video && !card.image;
              return (
                <Link
                  href={card.href}
                  className={`specialty-card specialty-link${isBookCard ? " book-card" : ""}`}
                  key={card.title}
                  onMouseEnter={(e) => {
                    const v = e.currentTarget.querySelector("video");
                    if (v) v.play().catch(() => {});
                  }}
                  onMouseLeave={(e) => {
                    const v = e.currentTarget.querySelector("video");
                    if (v) {
                      v.pause();
                      v.currentTime = 0;
                    }
                  }}
                >
                  {card.video ? (
                    <video
                      className="specialty-video"
                      src={card.video}
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      onLoadedMetadata={(e) => {
                        e.currentTarget.currentTime = 0.01;
                      }}
                    />
                  ) : null}
                  {!isBookCard && <div className="specialty-overlay"></div>}
                  <span className="specialty-arrow-btn" aria-hidden="true">
                    <Icon.ArrowUpRight width={16} height={16} />
                  </span>
                  <div className="specialty-content">
                    {isBookCard && (
                      <div className="book-card-badge">
                        <Icon.Calendar width={20} height={20} />
                        <span>ZocDoc</span>
                      </div>
                    )}
                    <h3 className="specialty-title">{card.title}</h3>
                    {card.description && <p className="specialty-description">{card.description}</p>}
                    {isBookCard && (
                      <div className="book-card-rating">
                        <div className="book-card-rating-top">
                          <span className="book-card-score">4.8<span className="book-card-star">&#9733;</span></span>
                          <span className="book-card-rating-meta">
                            <strong>{googleTotal ? `${(1466 + googleTotal).toLocaleString()}` : '1,466'}</strong> Patient Reviews
                          </span>
                        </div>
                        <span className="book-card-patient-choice">
                          <Icon.Trophy width={14} height={14} />
                          Patient Choice
                        </span>
                        <span className="book-card-cta">
                          Book on ZocDoc
                          <Icon.ArrowRight width={14} height={14} strokeWidth={2.5} />
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              );
            };
            const renderRow = (cards: SpecialtyCard[], rowClass: string) => (
              <div className={`specialties-row ${rowClass}`}>
                {cards.map((c) => renderCard(c))}
              </div>
            );
            return (
              <>
                {renderRow(row1, "specialties-row-1")}
                {renderRow(row2, "specialties-row-2")}
                {renderRow(row3, "specialties-row-3")}
                {renderRow(row4, "specialties-row-4")}
              </>
            );
          })()}
        </div>
      </section>

      {/* Reviews */}
      <section className="section reviews reveal" id="reviews">
        <div className="container">
          <div className="section-header">
            <p className="section-label">Patient Reviews</p>
            <h2>Trusted by <span className="text-accent">{googleTotal ? `${(1469 + googleTotal).toLocaleString()}+` : '1,400+'} Patients</span></h2>
            <p className="section-desc">Consistently rated among the top orthopedic surgeons in New York City.</p>
          </div>
          <div className="reviews-marquee" aria-label="Recent patient reviews">
            <div className="reviews-marquee-track">
              {[0, 1].map((loopIdx) => (
                <div className="reviews-marquee-group" key={loopIdx} aria-hidden={loopIdx === 1}>
                  {allReviews.map((review, i) => {
                    const isGoogle = 'authorAttribution' in review;
                    const r = review as GoogleReview;
                    const local = review as typeof patientReviews[0] & { rating: number };
                    const name = isGoogle ? (r.authorAttribution?.displayName || 'Patient') : local.name;
                    const avatar = isGoogle ? r.authorAttribution?.photoUri : undefined;
                    const time = isGoogle ? (r.relativePublishTimeDescription || '') : local.time;
                    const text = isGoogle ? (r.text?.text || '') : local.text;
                    const location = isGoogle ? r.locationLabel : local.location;
                    const rating = isGoogle ? r.rating : 5;
                    return (
                      <div className="google-review-card" key={`${loopIdx}-${i}`}>
                        <div className="google-review-header">
                          <img
                            className="google-review-avatar"
                            src={avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1a3a5c&color=fff&size=36`}
                            alt={name}
                            loading="lazy"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                          <div>
                            <div className="google-review-author">{name}</div>
                            <div className="google-review-meta">{time}</div>
                          </div>
                          {isGoogle && (
                            <div className="google-review-google-icon">
                              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                            </div>
                          )}
                        </div>
                        <div className="google-review-stars">{starsHTML(rating)}</div>
                        <div className="google-review-text">{text}</div>
                        <div className="google-review-location">{location}</div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Blog Preview */}
      <section className="section blog-home reveal" id="blog">
        <div className="container">
          <div className="section-header">
            <p className="section-label">Clinical Clarity</p>
            <h2>Investigating Modern <span className="text-accent">Orthopedics</span></h2>
            <p className="section-desc">No fluff. No fads. Deep-dive investigative reports from the surgeon who actually sees the inside of the joints.</p>
          </div>
          <div className="blog-home-grid">
            {recentPosts.map((post) => (
              <Link href={`/blog/${post.slug}`} className="blog-card blog-card-book" key={post.slug}>
                <div className="blog-card-img-wrap">
                  <Image className="blog-card-img" src={post.image} alt={post.imageAlt} width={600} height={800} sizes="(max-width: 768px) 100vw, 33vw" />
                  {post.episode && (
                    <span className="blog-card-ep">EP. {post.episode}</span>
                  )}
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
                  <Image className="blog-card-img" src={comingSoonPost.image} alt={comingSoonPost.imageAlt} width={600} height={800} />
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
            <Link href="/blog" className="btn btn-outline">View All Episodes &rarr;</Link>
          </div>
        </div>
      </section>

      <GetStarted />
      <Locations />
    </>
  );
}
