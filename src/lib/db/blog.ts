import { supabase } from "@/lib/supabase";
import type { Tables } from "@/lib/database.types";

export type BlogPostRow = Tables<"blog_posts">;

/** Lists all blog posts that are visible today (not flagged coming_soon, or with a release_date <= today). */
export async function listVisiblePosts(): Promise<BlogPostRow[]> {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .or(`coming_soon.eq.false,release_date.lte.${today}`)
    .order("published_date", { ascending: false });
  if (error) {
    console.error("[db.blog.listVisiblePosts]", error);
    return [];
  }
  return data ?? [];
}

/** Returns every post including authored drafts — used by the rotation view. */
export async function listAllPosts(): Promise<BlogPostRow[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .order("episode", { ascending: true, nullsFirst: false });
  if (error) {
    console.error("[db.blog.listAllPosts]", error);
    return [];
  }
  return data ?? [];
}

export async function getPostBySlug(slug: string): Promise<BlogPostRow | null> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) {
    console.error("[db.blog.getPostBySlug]", slug, error);
    return null;
  }
  return data;
}
