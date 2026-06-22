"use client";

import { MobileReviewsStack } from "./MobileReviewsStack";
import { ReviewCard } from "./ReviewCard";
import { patientReviews } from "@/data/patient-reviews";
import { useGoogleReviews } from "@/hooks/useGoogleReviews";
import { formatReviewTotal, type GoogleReview } from "@/lib/reviews";

export function HomeReviews() {
  const { reviews: googleReviews, totalCount: googleTotal } = useGoogleReviews();

  const allReviews = (() => {
    if (googleReviews.length > 0) {
      return [...googleReviews].sort((a, b) => {
        const ta = new Date(a.publishTime || 0).getTime();
        const tb = new Date(b.publishTime || 0).getTime();
        return tb - ta;
      });
    }
    return patientReviews.map((r) => ({ ...r, rating: 5, isLocal: true as const }));
  })();

  // Normalize both review shapes into ReviewCardProps once, so the mobile
  // stack + desktop marquee can share data.
  const cards = allReviews.map((review) => {
    const isGoogle = "authorAttribution" in review;
    const r = review as GoogleReview;
    const local = review as (typeof patientReviews)[0] & { rating: number };
    return {
      name: isGoogle ? r.authorAttribution?.displayName || "Patient" : local.name,
      avatarUrl: isGoogle ? r.authorAttribution?.photoUri : undefined,
      time: isGoogle ? r.relativePublishTimeDescription || "" : local.time,
      text: isGoogle ? r.text?.text || "" : local.text,
      location: isGoogle ? r.locationLabel : local.location,
      rating: isGoogle ? r.rating : 5,
      showGoogleBadge: isGoogle,
      publishTime: isGoogle ? r.publishTime : undefined,
    };
  });
  // Mobile gets the most recent 5 five-star reviews, newest first.
  const mobileCards = [...cards]
    .filter((c) => c.rating >= 5)
    .sort(
      (a, b) => new Date(b.publishTime ?? 0).getTime() - new Date(a.publishTime ?? 0).getTime(),
    )
    .slice(0, 5);

  const displayTotal = formatReviewTotal(googleTotal);

  return (
    <section className="section reviews reveal" id="reviews">
      <div className="container">
        <div className="section-header">
          <p className="section-label">Patient Reviews</p>
          <h2>
            Trusted by <span className="text-accent">{displayTotal} Patients</span>
          </h2>
          <p className="section-desc">Consistently rated among the top orthopedic surgeons in New York City.</p>
        </div>

        {/* Mobile: vertical fade-as-you-scroll stack of 5 reviews. */}
        <MobileReviewsStack reviews={mobileCards} />

        {/* Desktop: horizontal infinite marquee (hidden on mobile). */}
        <div className="reviews-marquee" aria-label="Recent patient reviews">
          <div className="reviews-marquee-track">
            {[0, 1].map((loopIdx) => (
              <div className="reviews-marquee-group" key={loopIdx} aria-hidden={loopIdx === 1}>
                {cards.map((c, i) => (
                  <ReviewCard key={`${loopIdx}-${i}`} {...c} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
