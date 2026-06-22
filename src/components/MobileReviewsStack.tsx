"use client";

import { useEffect, useRef } from "react";
import { ReviewCard, type ReviewCardProps } from "./ReviewCard";

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
  // Re-run the observer setup whenever the *set* of rendered cards changes,
  // not just the count. The homepage first paints local placeholder reviews,
  // then swaps in live Google reviews once they load — both lists clamp to
  // `limit`, so a length-only dependency would miss the swap and leave the
  // freshly-mounted cards observed by a stale observer (watching removed
  // nodes), stuck at their inline opacity:0 forever.
  const itemsKey = trimmed.map((r) => r.name).join("|");

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    // Respect prefers-reduced-motion — just show all cards at full
    // opacity, no animation.
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      root.querySelectorAll<HTMLElement>(".mobile-review-item").forEach(
        (el) => (el.style.opacity = "1"),
      );
      return;
    }

    const items = root.querySelectorAll<HTMLElement>(".mobile-review-item");
    // IntersectionObserver with threshold buckets — map intersection
    // ratio to opacity + translateY so cards softly fade/float as the
    // reader scrolls past them.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const el = e.target as HTMLElement;
          const ratio = e.intersectionRatio;
          const opacity = Math.max(0.15, Math.min(1, ratio * 1.6));
          const translate = (1 - ratio) * 16;
          el.style.opacity = String(opacity);
          el.style.transform = `translateY(${translate}px)`;
        }
      },
      {
        threshold: Array.from({ length: 21 }, (_, i) => i / 20),
        rootMargin: "-10% 0px -25% 0px",
      },
    );
    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [itemsKey]);

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
