// Shared types + display constants for the marketing site's Google
// review surfaces: the homepage marquee/mobile stack (HomeReviews) and
// the /reviews grid (GoogleReviewsGrid). Both consume /api/places/all,
// which aggregates the three office locations, keeps only 5-star
// reviews, and sorts them newest-first server-side.

export interface GoogleReview {
  rating: number;
  text?: { text?: string };
  authorAttribution?: { displayName?: string; photoUri?: string };
  relativePublishTimeDescription?: string;
  publishTime?: string;
  locationLabel: string;
}

export interface ReviewsPayload {
  totalCount: number;
  reviews: GoogleReview[];
}

export type ReviewsStatus = "loading" | "ready" | "error";

// Single source of truth for the "trusted by N+ patients" figure. The
// homepage adds the live Google rating count on top of this baseline;
// static surfaces (the /reviews CTA) use the baseline alone. One
// constant avoids the 1,469 / 1,466 / 1,400 drift we had across files.
export const BASE_REVIEW_COUNT = 1466;

/** Formats the headline review total, e.g. `formatReviewTotal(308)` →
 *  "1,774+". Pass the live Google `userRatingCount` total as the delta;
 *  omit it for static surfaces. */
export function formatReviewTotal(googleDelta = 0): string {
  return `${(BASE_REVIEW_COUNT + googleDelta).toLocaleString()}+`;
}
