"use client";

import { ReviewCard } from "./ReviewCard";
import { useGoogleReviews } from "@/hooks/useGoogleReviews";

// Placeholder cards shown on first load (before the cache/network
// resolves) so the grid reserves its space instead of collapsing to a
// "Loading…" line — avoids layout shift when the real reviews land.
function ReviewSkeleton() {
  return (
    <div className="reviews-grid" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <div className="review-skeleton" key={i}>
          <div className="review-skeleton-head">
            <div className="review-skeleton-avatar" />
            <div className="review-skeleton-lines">
              <div className="review-skeleton-line" style={{ width: "60%" }} />
              <div className="review-skeleton-line" style={{ width: "40%" }} />
            </div>
          </div>
          <div className="review-skeleton-line" style={{ width: "90%" }} />
          <div className="review-skeleton-line" style={{ width: "100%" }} />
          <div className="review-skeleton-line" style={{ width: "75%" }} />
        </div>
      ))}
    </div>
  );
}

// Client-side fetch of the ISR-cached /api/places/all endpoint, rendered
// inside the server-component /reviews shell so everything above the grid
// ships as static HTML.
export function GoogleReviewsGrid() {
  const { reviews, status } = useGoogleReviews();

  if (status === "loading") {
    return (
      <>
        <span className="sr-only" role="status" aria-live="polite">
          Loading reviews…
        </span>
        <ReviewSkeleton />
      </>
    );
  }

  if (reviews.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
        Reviews are loading from Google. Please check back shortly.
      </div>
    );
  }

  return (
    <>
      <div className="reviews-grid">
        {reviews.map((review, i) => (
          <ReviewCard
            key={i}
            name={review.authorAttribution?.displayName || "Patient"}
            avatarUrl={review.authorAttribution?.photoUri}
            time={review.relativePublishTimeDescription || ""}
            text={review.text?.text || ""}
            location={review.locationLabel}
            rating={review.rating}
            showGoogleBadge
          />
        ))}
      </div>
      <p className="reviews-grid-meta">Verified Google reviews, refreshed hourly.</p>
    </>
  );
}
