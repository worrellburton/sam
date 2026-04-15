"use client";

import { useEffect, useState } from "react";
import { ReviewCard } from "./ReviewCard";
import { logError } from "@/lib/log";

interface GoogleReview {
  rating: number;
  text?: { text?: string };
  authorAttribution?: { displayName?: string; photoUri?: string };
  relativePublishTimeDescription?: string;
  locationLabel: string;
}

// Client-side fetch of the ISR-cached /api/places/all endpoint.
// Rendered inside the server-component /reviews shell so everything
// above the grid ships as static HTML.
export function GoogleReviewsGrid() {
  const [reviews, setReviews] = useState<GoogleReview[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const resp = await fetch("/api/places/all");
        if (!resp.ok) throw new Error(`Places API: ${resp.status}`);
        const data = (await resp.json()) as { reviews: GoogleReview[] };
        if (!cancelled) setReviews(data.reviews);
      } catch (err) {
        logError("reviews.googleGrid", err);
        if (!cancelled) setReviews([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (reviews === null) {
    return (
      <div
        style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}
        aria-live="polite"
        role="status"
      >
        Loading reviews...
      </div>
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
  );
}
