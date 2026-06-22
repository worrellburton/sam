"use client";

import { useRef } from "react";
import { ReviewCard, type ReviewCardProps } from "./ReviewCard";
import { useFadeInOnScroll } from "@/hooks/useFadeInOnScroll";

// Mobile-first reviews stack. Shows up to 5 of the most recent 5-star
// reviews as a vertical scroll — each card fades in as it enters the
// viewport, fades back out as it exits. Feels more like a story than
// the desktop marquee. CSS handles hide/show against the marquee at
// the 768px breakpoint (see .mobile-reviews-stack in legacy.css).

export interface MobileReviewsStackProps {
  reviews: ReviewCardProps[];
  /** Defaults to 5. Cap is enforced here so callers can just hand in
   *  the full list without worrying about slicing. */
  limit?: number;
}

export function MobileReviewsStack({
  reviews,
  limit = 5,
}: MobileReviewsStackProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const trimmed = reviews.slice(0, limit);
  // The homepage first paints local placeholder reviews, then swaps in
  // live Google reviews once they load — both lists clamp to `limit`, so
  // this content key (not the count) is what tells the observer to
  // re-attach to the freshly mounted cards.
  const itemsKey = trimmed.map((r) => r.name).join("|");

  useFadeInOnScroll(containerRef, ".mobile-review-item", itemsKey);

  if (trimmed.length === 0) return null;

  return (
    <div className="mobile-reviews-stack" ref={containerRef}>
      {trimmed.map((r, i) => (
        <div
          className="mobile-review-item"
          key={`${r.name}-${i}`}
          style={{
            opacity: 0,
            transform: "translateY(16px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}
        >
          <ReviewCard {...r} />
        </div>
      ))}
      <p className="mobile-reviews-more" aria-hidden>
        Keep scrolling for more ↓
      </p>
    </div>
  );
}
