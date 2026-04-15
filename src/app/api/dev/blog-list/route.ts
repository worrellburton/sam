import { NextRequest, NextResponse } from "next/server";
import { requireDevAuth } from "@/lib/dev-auth";
import { blogPosts as staticBlogPosts, type BlogPost } from "@/data/blog";
import { listAllAsBlogPosts } from "@/lib/db/blog";
import { logError } from "@/lib/log";

// Returns the full merged blog list — DB rows preferred, falling back
// to src/data/blog.ts when the DB is empty or unreachable. Same shape
// the public /blog page uses, so the dev panel sees exactly what the
// site sees.
export async function GET(req: NextRequest) {
  const auth = requireDevAuth(req);
  if (!auth.ok) return auth.response;

  try {
    const rows = await listAllAsBlogPosts();
    if (rows.length > 0) {
      // Preserve static content bodies when DB rows lack them — the DB
      // currently stores metadata only for most posts.
      const byStaticSlug = new Map(staticBlogPosts.map((p) => [p.slug, p]));
      const merged: BlogPost[] = rows.map((r) => {
        const s = byStaticSlug.get(r.slug);
        if (!s) return r;
        return {
          ...r,
          content: r.content || s.content,
          contentHtml: r.contentHtml || s.contentHtml,
        };
      });
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
