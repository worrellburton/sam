import { NextRequest, NextResponse } from "next/server";
import { requireDevAuth } from "@/lib/dev-auth";
import { blogPosts as staticBlogPosts, type BlogPost } from "@/data/blog";
import { listAllAsBlogPosts } from "@/lib/db/blog";
import { logError } from "@/lib/log";
import { PLACEHOLDER_IMAGE } from "@/data/placeholder-image";

// Returns the full merged blog list — DB rows preferred, falling back
// to src/data/blog.ts when the DB is empty or unreachable. Same shape
// the public /blog page uses, so the dev panel sees exactly what the
// site sees.
//
// Important: the merge falls back to static for any thumbnail/content
// field the DB row leaves empty or placeholder-ish. Without this, a
// Supabase row with no `image` overrides a real thumbnail that was
// committed to blog.ts by /dev/blog → set-blog-image, which made
// previously-saved thumbnails disappear after the DB merge was wired
// up.

/** A DB-sourced string field counts as "missing" if it's empty, the
 *  bare PLACEHOLDER_IMAGE constant, or the resolved placeholder URL. */
function hasRealValue(v: unknown): v is string {
  if (typeof v !== "string" || v.trim() === "") return false;
  if (v === PLACEHOLDER_IMAGE) return false;
  return true;
}

function merge(dbPost: BlogPost, staticPost: BlogPost): BlogPost {
  return {
    ...staticPost,
    ...dbPost,
    image: hasRealValue(dbPost.image) ? dbPost.image : staticPost.image,
    image3x4: hasRealValue(dbPost.image3x4) ? dbPost.image3x4 : staticPost.image3x4,
    image1x1: hasRealValue(dbPost.image1x1) ? dbPost.image1x1 : staticPost.image1x1,
    imageAlt: hasRealValue(dbPost.imageAlt) ? dbPost.imageAlt : staticPost.imageAlt,
    imagePrompts:
      Array.isArray(dbPost.imagePrompts) && dbPost.imagePrompts.length > 0
        ? dbPost.imagePrompts
        : staticPost.imagePrompts,
    content: dbPost.content || staticPost.content,
    contentHtml: dbPost.contentHtml || staticPost.contentHtml,
  };
}

export async function GET(req: NextRequest) {
  const auth = requireDevAuth(req);
  if (!auth.ok) return auth.response;

  try {
    const rows = await listAllAsBlogPosts();
    if (rows.length > 0) {
      const byStaticSlug = new Map(staticBlogPosts.map((p) => [p.slug, p]));
      const merged: BlogPost[] = rows.map((r) => {
        const s = byStaticSlug.get(r.slug);
        if (!s) return r;
        return merge(r, s);
      });
      // Also fold in any static posts the DB is missing entirely, so
      // the dev panel never regresses to fewer posts than blog.ts has.
      const dbSlugs = new Set(merged.map((p) => p.slug));
      for (const s of staticBlogPosts) {
        if (!dbSlugs.has(s.slug)) merged.push(s);
      }
      return NextResponse.json(
        { posts: merged, source: "db+static" },
        { headers: { "Cache-Control": "no-store" } },
      );
    }
  } catch (err) {
    logError("dev.blog-list", err);
  }
  return NextResponse.json(
    { posts: staticBlogPosts, source: "static" },
    { headers: { "Cache-Control": "no-store" } },
  );
}

