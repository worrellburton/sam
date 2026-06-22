"use client";

import { useEffect, useState } from "react";
import { idbGet, idbSet } from "@/lib/idb";
import { logError } from "@/lib/log";
import type { GoogleReview, ReviewsPayload, ReviewsStatus } from "@/lib/reviews";

// Stale-while-revalidate cache of the aggregated Google Places payload.
// First paints from IndexedDB (no network) when a prior visit cached it,
// then refreshes from /api/places/all in the background and updates
// state if the data changed. /api/places/all is ISR-cached server-side,
// but the client cache lets repeat visitors skip the initial fetch.
const CACHE_STORE = "places-reviews";
const CACHE_KEY = "all";

/**
 * Shared hook for the homepage and /reviews review surfaces.
 *
 * `status` is "loading" until the first data (cache or network) lands,
 * then "ready"; it only reports "error" when the network fails *and*
 * there was no cached payload to fall back on.
 */
export function useGoogleReviews(): {
  reviews: GoogleReview[];
  totalCount: number;
  status: ReviewsStatus;
} {
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [status, setStatus] = useState<ReviewsStatus>("loading");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const cached = await idbGet<ReviewsPayload>(CACHE_STORE, CACHE_KEY);
      if (cancelled) return;
      if (cached) {
        setReviews(cached.reviews);
        setTotalCount(cached.totalCount);
        setStatus("ready");
      }

      try {
        const resp = await fetch("/api/places/all");
        if (!resp.ok) throw new Error(`Places API: ${resp.status}`);
        const data = (await resp.json()) as ReviewsPayload;
        if (cancelled) return;
        setReviews(data.reviews);
        setTotalCount(data.totalCount);
        setStatus("ready");
        await idbSet(CACHE_STORE, CACHE_KEY, data);
      } catch (err) {
        logError("reviews.useGoogleReviews", err);
        // Keep any cached data we already painted; only surface an error
        // when we have nothing to show.
        if (!cancelled) setStatus((s) => (s === "ready" ? s : "error"));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { reviews, totalCount, status };
}
