import type { Metadata } from "next";
import type { ReactNode } from "react";
import { GetStarted } from "@/components/GetStarted";
import { Locations } from "@/components/Locations";
import { GoogleReviewsGrid } from "@/components/GoogleReviewsGrid";
import { formatReviewTotal } from "@/lib/reviews";
import { SITE_URL } from "@/lib/env";

export const metadata: Metadata = {
  title: "Patient Reviews | Dr. Sameh Elguizaoui, M.D.",
  description:
    "Verified patient reviews for Dr. Elguizaoui across Zocdoc, Google, Healthgrades, Vitals, and U.S. News — 4.8/5 stars across 1,400+ reviews.",
  alternates: { canonical: `${SITE_URL}/reviews` },
};

const platformIcons: Record<string, ReactNode> = {
  Zocdoc: (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <rect width="44" height="44" rx="10" fill="#FF7666" />
      <text x="22" y="29" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="700" fill="#fff">Z</text>
    </svg>
  ),
  Google: (
    <svg width="44" height="44" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  ),
  Healthgrades: (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <rect width="44" height="44" rx="10" fill="#1B8A6B" />
      <path d="M13 22h6v-8h6v8h6v6h-6v8h-6v-8h-6z" fill="#fff" />
    </svg>
  ),
  Vitals: (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <rect width="44" height="44" rx="10" fill="#00A4E4" />
      <path d="M10 22h6l3-8 4 16 3-8h8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  ),
  "U.S. News": (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <rect width="44" height="44" rx="10" fill="#1A3668" />
      <text x="22" y="20" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="10" fontWeight="700" fill="#fff">U.S.</text>
      <text x="22" y="33" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="12" fontWeight="700" fill="#C5A44E">NEWS</text>
    </svg>
  ),
};

const platforms = [
  { name: "Zocdoc", rating: "4.78", reviews: "1,400+", url: "https://www.zocdoc.com/doctor/sam-elguizaoui-md-236423" },
  { name: "Google", rating: "4.8", reviews: "150+", url: "https://www.google.com/search?q=Dr+Sam+Elguizaoui+orthopedic+surgeon+NYC" },
  { name: "Healthgrades", rating: "5.0", reviews: "50+", url: "https://www.healthgrades.com/physician/dr-sam-elguizaoui" },
  { name: "Vitals", rating: "4.9", reviews: "200+", url: "https://www.vitals.com/doctors/Dr_Sam_Elguizaoui.html" },
  { name: "U.S. News", rating: "Top", reviews: "Doctor Rankings", url: "https://health.usnews.com/doctors" },
];

function starsHTML(rating: number) {
  return "\u2605".repeat(Math.round(rating)) + "\u2606".repeat(5 - Math.round(rating));
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What do patients say about Dr. Elguizaoui?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Patients consistently praise Dr. Elguizaoui for his thorough explanations, empathetic bedside manner, and excellent surgical outcomes. With a 4.78 out of 5 rating on Zocdoc from over 1,400 reviews and a 5.0 on Healthgrades, patients frequently highlight that he listens carefully and takes a conservative, patient-first approach to treatment.",
      },
    },
    {
      "@type": "Question",
      name: "Where can I find reviews for Dr. Elguizaoui?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You can find verified patient reviews for Dr. Elguizaoui on Zocdoc (1,400+ reviews), Google (150+ reviews), Healthgrades (50+ reviews), and Vitals (200+ reviews). He is also recognized in U.S. News Doctor Rankings. Links to all platforms are available on our reviews page.",
      },
    },
    {
      "@type": "Question",
      name: "How is Dr. Elguizaoui rated compared to other NYC orthopedic surgeons?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Dr. Elguizaoui is consistently rated among the top orthopedic surgeons in New York City. He holds a 4.8-star overall rating across major review platforms, has received the Patient Choice Award, and 91% of patients report waiting less than 30 minutes at his offices.",
      },
    },
  ],
};

export default function ReviewsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <section
        className="service-hero has-bg"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1600&h=600&fit=crop&q=80')",
        }}
      >
        <div className="container">
          <p className="hero-label">Patient Feedback</p>
          <h1>Patient <span className="text-accent">Reviews</span></h1>
          <p className="service-hero-desc">See what patients are saying about Dr. Elguizaoui across every major review platform.</p>
        </div>
      </section>

      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="container">
          <div className="section-header">
            <p className="section-label">Review Platforms</p>
            <h2>Rated Among NYC&rsquo;s <span className="text-accent">Top Orthopedic Surgeons</span></h2>
          </div>
          <div className="platform-cards-grid">
            {platforms.map((p) => (
              <a key={p.name} href={p.url} target="_blank" rel="noopener" className="platform-card">
                <span className="sr-only"> (opens in a new tab)</span>
                <div className="platform-icon" style={{ background: "transparent" }}>
                  {platformIcons[p.name]}
                </div>
                <div className="platform-info">
                  <div className="platform-name">
                    {p.name}
                    {p.name === "Zocdoc" && (
                      <span className="patient-choice-inline">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="none" aria-hidden="true">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        Patient Choice
                      </span>
                    )}
                  </div>
                  <div className="platform-rating">
                    <span className="platform-score">{p.rating}</span>
                    {p.rating !== "Top" && <span className="platform-stars">{starsHTML(5)}</span>}
                  </div>
                  <div className="platform-count">{p.reviews}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <p className="section-label">Google Reviews</p>
            <h2>What Patients <span className="text-accent">Are Saying</span></h2>
            <p className="section-desc">Real reviews from verified Google patients across our Manhattan and Brooklyn locations.</p>
          </div>

          <GoogleReviewsGrid />

          <div style={{ textAlign: "center", marginTop: "40px" }}>
            <a
              href="https://www.zocdoc.com/doctor/sam-elguizaoui-md-236423"
              target="_blank"
              rel="noopener"
              className="btn btn-primary btn-lg"
            >
              View All {formatReviewTotal()} Reviews
            </a>
          </div>
        </div>
      </section>

      <GetStarted />
      <Locations />
    </>
  );
}
