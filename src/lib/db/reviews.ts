import { supabase } from "@/lib/supabase";
import type { Tables } from "@/lib/database.types";
import type { GoogleReview } from "@/data/google-reviews";

export type GoogleReviewRow = Tables<"google_reviews">;

/** Map a Supabase row into the `GoogleReview` shape used by the UI. */
export function rowToGoogleReview(row: GoogleReviewRow): GoogleReview {
  const loc = (row.location ?? "Upper East Side") as GoogleReview["location"];
  return {
    author_name: row.author_name ?? "",
    rating: row.rating ?? 5,
    text: row.text ?? "",
    date: row.review_date ?? "",
    location: loc,
  };
}

export async function listReviews(limit = 50): Promise<GoogleReviewRow[]> {
  const { data, error } = await supabase
    .from("google_reviews")
    .select("*")
    .order("review_date", { ascending: false, nullsFirst: false })
    .limit(limit);
  if (error) {
    console.error("[db.reviews.listReviews]", error);
    return [];
  }
  return data ?? [];
}

export async function listReviewsAsStatic(limit = 50): Promise<GoogleReview[]> {
  const rows = await listReviews(limit);
  return rows.map(rowToGoogleReview);
}
