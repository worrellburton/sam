import { supabase } from "@/lib/supabase";
import type { Tables } from "@/lib/database.types";
import type { BlogPost } from "@/data/blog";

export type BlogPostRow = Tables<"blog_posts">;

/**
 * Convert a Supabase `blog_posts` row into the TS `BlogPost` shape used by
 * the blog pages. Field names are mapped from snake_case to camelCase and
 * optional columns are normalized to `undefined`.
 */
export function rowToBlogPost(row: BlogPostRow): BlogPost {
  const published = row.published_date
    ? new Date(row.published_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? "",
    tag: row.tag ?? "",
    date: published,
    readTime: row.read_time ?? "",
    image: row.image ?? "",
    image3x4: row.image_3x4 ?? undefined,
    image1x1: row.image_1x1 ?? undefined,
    imagePrompts: Array.isArray(row.image_prompts)
      ? (row.image_prompts as string[])
      : undefined,
    imageAlt: row.image_alt ?? "",
    content: row.content_html ?? "",
    contentHtml: row.content_html ?? undefined,
    relatedService: row.related_service ?? undefined,
    episode: row.episode ?? undefined,
    seriesTitle: row.series_title ?? undefined,
    comingSoon: row.coming_soon ?? false,
    releaseDate: row.release_date ?? undefined,
  };
}

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

/** List all posts mapped to the app's `BlogPost` shape. */
export async function listAllAsBlogPosts(): Promise<BlogPost[]> {
  const rows = await listAllPosts();
  return rows.map(rowToBlogPost);
}

/** Fetch a single post mapped to the app's `BlogPost` shape. */
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const row = await getPostBySlug(slug);
  return row ? rowToBlogPost(row) : null;
}
