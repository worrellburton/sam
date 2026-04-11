"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { GetStarted } from "@/components/GetStarted";
import { Locations } from "@/components/Locations";
import { Insurance } from "@/components/Insurance";
import { services } from "@/data/services";
import { blogPosts } from "@/data/blog";
import { SpecialtyCanvas } from "@/components/SpecialtyCanvas";

const tickerItems = [
  {
    icon: (
      <Image src="https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/nyj.png&h=40&w=40" alt="New York Jets" width={32} height={32} />
    ),
    text: "New York Jets Team Physician",
    em: "NFL",
  },
  {
    icon: (
      <Image src="https://a.espncdn.com/combiner/i?img=/i/teamlogos/nhl/500/nyi.png&h=40&w=40" alt="New York Islanders" width={32} height={32} />
    ),
    text: "New York Islanders Team Physician",
    em: "NHL",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" aria-hidden="true">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    text: "Board Certified",
    em: "Orthopedic Surgery",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e8792b" strokeWidth="1.5" aria-hidden="true">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
    text: "4.8 \u2605 Rating",
    em: "1,466+ Reviews",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" aria-hidden="true">
        <path d="M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7H3l2-4h14l2 4M5 21V10.87M19 21V10.87" />
      </svg>
    ),
    text: "Lenox Hill Hospital",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" aria-hidden="true">
        <path d="M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7H3l2-4h14l2 4M5 21V10.87M19 21V10.87" />
      </svg>
    ),
    text: "Cleveland Clinic Trained",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    text: "International Fellowship",
    em: "Switzerland \u2022 Netherlands \u2022 Italy",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" aria-hidden="true">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
        <path d="M9 14l2 2 4-4" />
      </svg>
    ),
    text: "Magna Cum Laude",
    em: "Ohio State University",
  },
];


const patientReviews = [
  {
    name: "Sarah M.",
    time: "2 weeks ago",
    text: "Dr. Elguizaoui is an incredible surgeon. He repaired my torn rotator cuff and I'm back to playing tennis in record time. He took the time to explain every step of the process and made me feel completely at ease.",
    location: "Upper East Side office",
  },
  {
    name: "James K.",
    time: "1 month ago",
    text: "After tearing my ACL playing basketball, I was devastated. Dr. Elguizaoui reconstructed my knee arthroscopically and his rehab plan got me back on the court. Truly the best orthopedic surgeon in NYC.",
    location: "Brooklyn Heights office",
  },
  {
    name: "Maria L.",
    time: "3 weeks ago",
    text: "I saw several doctors before finding Dr. Elguizaoui. He was the only one who took the time to really understand my knee pain. Recommended PRP therapy instead of surgery and I'm pain-free for the first time in years.",
    location: "Greenwich Village office",
  },
  {
    name: "David R.",
    time: "2 months ago",
    text: "Outstanding care from start to finish. Dr. Elguizaoui performed my meniscus repair and I was walking the same day. His staff is professional, friendly, and the office is state-of-the-art.",
    location: "Upper East Side office",
  },
  {
    name: "Amanda T.",
    time: "1 month ago",
    text: "Dr. Elguizaoui fixed my shoulder labral tear with arthroscopic surgery. Minimal scarring, fast recovery, and he was available to answer all my questions throughout rehab. Highly recommend!",
    location: "Brooklyn Heights office",
  },
  {
    name: "Robert P.",
    time: "3 months ago",
    text: "I came to Dr. Elguizaoui for chronic knee pain that other doctors said needed a replacement. He used a joint preservation approach instead and saved my natural knee. Forever grateful.",
    location: "Greenwich Village office",
  },
];



const timeline = [
  { year: "2007", label: "Undergraduate", title: "B.S. Biology", place: "The Ohio State University", detail: "Magna cum laude, Psychology minor" },
  { year: "2011", label: "Medical School", title: "Doctor of Medicine", place: "Ohio State College of Medicine", detail: "Graduated cum laude" },
  { year: "2016", label: "Residency", title: "Orthopedic Surgery", place: "Cleveland Clinic Akron General", detail: "High-volume trauma in the Cleveland Clinic system" },
  { year: "2017", label: "Fellowship", title: "Sports Medicine", place: "Lenox Hill Hospital, NYC", detail: "NY Jets & NY Islanders team physician" },
  { year: "2018", label: "International", title: "Joint Preservation", place: "Switzerland, Netherlands & Italy", detail: "European cartilage repair & transplant techniques" },
];

const PLACE_IDS = [
  { id: 'ChIJmQNsqXpZwokRoKDGBL8w9LM', label: 'Upper East Side' },
  { id: 'ChIJFTfVAb5ZwokRuFvoKEMtQag', label: 'West Village' },
  { id: 'ChIJzeD6h0VawokRCfzPOz9Oi7E', label: 'Brooklyn' },
];
const FIELDS = 'id,rating,userRatingCount,reviews.rating,reviews.text,reviews.authorAttribution,reviews.relativePublishTimeDescription,reviews.publishTime';

interface GoogleReview {
  rating: number;
  text?: { text?: string };
  authorAttribution?: { displayName?: string; photoUri?: string };
  relativePublishTimeDescription?: string;
  publishTime?: string;
  locationLabel: string;
}

function useGoogleReviews() {
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    async function fetchAllReviews() {
      try {
        const results = await Promise.all(PLACE_IDS.map(async (place) => {
          const resp = await fetch(`/api/places?placeId=${place.id}&fields=${encodeURIComponent(FIELDS)}`);
          if (!resp.ok) throw new Error(`API error: ${resp.status}`);
          const data = await resp.json();
          return {
            rating: data.rating || 0,
            count: data.userRatingCount || 0,
            reviews: (data.reviews || []).map((r: GoogleReview) => ({ ...r, locationLabel: place.label })),
          };
        }));

        const total = results.reduce((s, r) => s + r.count, 0);
        setTotalCount(total);

        const all = results.flatMap(r => r.reviews)
          .filter((r: GoogleReview) => r.rating >= 5)
          .sort((a: GoogleReview, b: GoogleReview) => new Date(b.publishTime || 0).getTime() - new Date(a.publishTime || 0).getTime());

        setReviews(all);
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
  const recentPosts = blogPosts.slice(0, 3);
  const comingSoonPost = blogPosts.find(p => p.comingSoon);
  const { reviews: googleReviews, totalCount: googleTotal } = useGoogleReviews();

  const allReviews = (() => {
    const arr = googleReviews.length > 0 ? [...googleReviews] : patientReviews.map(r => ({ ...r, rating: 5, isLocal: true as const }));
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  })();
  const [reviewIndex, setReviewIndex] = useState(0);
  const reviewsPerPage = 3;
  const totalReviewPages = Math.ceil(allReviews.length / reviewsPerPage);
  useEffect(() => {
    if (allReviews.length <= reviewsPerPage) return;
    const interval = setInterval(() => {
      setReviewIndex(prev => (prev + 1) % totalReviewPages);
    }, 5000);
    return () => clearInterval(interval);
  }, [allReviews.length, totalReviewPages]);

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
      <header className="hero" id="hero">
        <Image className="hero-bg-img loaded" src="/header.jpg" alt="Dr. Sameh Elguizaoui performing orthopedic surgery" aria-hidden="true" width={1920} height={1080} priority />
        <div className="hero-overlay"></div>
        <div className="container hero-content">
          <div className="hero-text">
            <h1>NYC&rsquo;s Most Trusted Orthopedic Surgeon &mdash; Sports Medicine and Joint Preservation Expert</h1>
            <a href="#about" className="btn btn-hero">Learn More</a>
          </div>
          <div className="hero-rating-card">
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
              <span className="rating-zocdoc">DocZoc</span>
            </div>
          </div>
        </div>
        <div className="ticker-bar">
          <div className="ticker-track">
            {[1, 2].map((set) =>
              tickerItems.map((item, i) => (
                <div className="ticker-item" key={`${set}-${i}`}>
                  {item.icon}
                  <span>{item.text} {item.em && <em>{item.em}</em>}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </header>

      {/* About */}
      <section className="section about reveal" id="about">
        <div className="container">
          <div className="about-layout">
            <div className="about-photo">
              <Image src="/images/photos/DSC02128.jpg" alt="Dr. Sam Elguizaoui - Orthopedic Surgeon" className="about-portrait" width={800} height={1200} style={{ objectPosition: "center 20%" }} />
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
                <div className="highlight-card">
                  <div className="highlight-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1a3a5c" strokeWidth="2" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                  </div>
                  <h3>Board Certified</h3>
                  <p>American Board of Orthopaedic Surgery</p>
                </div>
                <div className="highlight-card">
                  <div className="highlight-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1a3a5c" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                  </div>
                  <h3>International Training</h3>
                  <p>Fellowship across Switzerland, Netherlands &amp; Italy</p>
                </div>
                <div className="highlight-card">
                  <div className="highlight-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1a3a5c" strokeWidth="2" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                  </div>
                  <h3>Pro Sports Experience</h3>
                  <p>NY Jets (NFL) &bull; NY Islanders (NHL)</p>
                </div>
                <div className="highlight-card">
                  <div className="highlight-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1a3a5c" strokeWidth="2" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
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
          <div className="section-header">
            <p className="section-label">Areas of Expertise</p>
            <h2>Specialized Orthopedic <span className="text-accent">Treatments</span></h2>
            <p className="section-desc">From advanced arthroscopic surgery to cutting-edge regenerative therapies, Dr. Elguizaoui offers comprehensive orthopedic care tailored to your needs and goals.</p>
          </div>
          <div className="specialties-grid">
            {services.map((svc) => (
              <Link href={`/services/${svc.slug}`} className="specialty-card specialty-link" key={svc.slug}>
                <SpecialtyCanvas slug={svc.slug} />
                <video
                  className="specialty-video"
                  muted
                  loop
                  playsInline
                  preload="none"
                  onMouseEnter={(e) => { const v = e.currentTarget; v.src = "/test.mp4"; v.play().then(() => v.classList.add("loaded")).catch(() => {}); }}
                  onMouseLeave={(e) => { const v = e.currentTarget; v.classList.remove("loaded"); v.pause(); }}
                />
                <div className="specialty-overlay"></div>
                <span className="specialty-arrow-btn" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="7" y1="17" x2="17" y2="7" />
                    <polyline points="7 7 17 7 17 17" />
                  </svg>
                </span>
                <h3 className="specialty-title">{svc.title}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Credentials */}
      <section className="section credentials reveal cred-has-bg" id="credentials" style={{ backgroundImage: "url('/images/photos/DSC02243.jpg')" }}>
        <div className="cred-bg-overlay" />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className="section-header">
            <p className="section-label">Training &amp; Credentials</p>
            <h2>World-Class <span className="text-accent">Education &amp; Training</span></h2>
          </div>
          <div className="cred-track">
            {timeline.map((item, i) => (
              <div className="cred-step" key={i}>
                <div className="cred-icon-wrap">
                  <svg className="cred-icon-ring" viewBox="0 0 60 60" aria-hidden="true">
                    <circle cx="30" cy="30" r="27" fill="none" stroke="var(--border)" strokeWidth="2" />
                    <circle className="cred-ring-fill" cx="30" cy="30" r="27" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="170" strokeDashoffset="170" />
                  </svg>
                  <span className="cred-step-num">{i + 1}</span>
                </div>
                {i < timeline.length - 1 && (
                  <div className="cred-connector">
                    <svg viewBox="0 0 80 12" preserveAspectRatio="none" className="cred-connector-svg" aria-hidden="true">
                      <line x1="0" y1="6" x2="70" y2="6" stroke="var(--primary)" strokeWidth="2" strokeDasharray="70" strokeDashoffset="70" />
                      <polygon points="68,2 76,6 68,10" fill="var(--primary)" opacity="0" className="cred-arrow" />
                    </svg>
                  </div>
                )}
                <div className="cred-card">
                  <span className="cred-year">{item.year}</span>
                  <span className="cred-label">{item.label}</span>
                  <h3>{item.title}</h3>
                  <p className="cred-place">{item.place}</p>
                  {item.detail && <p className="cred-detail">{item.detail}</p>}
                </div>
              </div>
            ))}
          </div>
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
          <div className="reviews-carousel-wrapper" aria-live="polite">
            <div className="reviews-carousel-track" style={{ transform: `translateX(-${reviewIndex * 100}%)` }}>
              {Array.from({ length: totalReviewPages }).map((_, pageIdx) => (
                <div className="reviews-carousel-page" key={pageIdx}>
                  {allReviews.slice(pageIdx * reviewsPerPage, (pageIdx + 1) * reviewsPerPage).map((review, i) => {
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
                      <div className="google-review-card" key={i}>
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
            {totalReviewPages > 1 && (
              <div className="reviews-carousel-nav">
                <button className="reviews-nav-btn" onClick={() => setReviewIndex(prev => prev === 0 ? totalReviewPages - 1 : prev - 1)} aria-label="Previous reviews">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
                </button>
                <span className="reviews-nav-count">{reviewIndex + 1} / {totalReviewPages}</span>
                <button className="reviews-nav-btn" onClick={() => setReviewIndex(prev => (prev + 1) % totalReviewPages)} aria-label="Next reviews">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 6 15 12 9 18" /></svg>
                </button>
              </div>
            )}
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
              <Link href={`/blog/${post.slug}`} className="blog-card" key={post.slug}>
                <div style={{ position: "relative" }}>
                  <Image className="blog-card-img" src={post.image} alt={post.imageAlt} width={800} height={400} />
                  {post.episode && (
                    <span style={{
                      position: "absolute", top: 12, left: 12,
                      background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)",
                      color: "#fff", fontSize: "0.62rem", fontWeight: 800,
                      padding: "3px 8px", borderRadius: 5,
                      fontFamily: "'SF Mono', Consolas, monospace",
                      letterSpacing: "0.05em",
                    }}>EP. {post.episode}</span>
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
              <div className="blog-card blog-card-coming-soon">
                <div style={{ position: "relative" }}>
                  <Image className="blog-card-img" src={comingSoonPost.image} alt={comingSoonPost.imageAlt} width={800} height={400} />
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
