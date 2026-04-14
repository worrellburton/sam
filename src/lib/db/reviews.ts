import { supabase } from "@/lib/supabase";
import type { Tables } from "@/lib/database.types";

export type GoogleReviewRow = Tables<"google_reviews">;

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
