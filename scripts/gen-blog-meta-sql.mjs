#!/usr/bin/env node
/**
 * Emit blog_posts SQL with metadata only (no content body).
 * Used for initial seed via MCP — full content can be synced later via
 * seed-supabase.mjs which has access to the service role key.
 */
import { pathToFileURL } from "node:url";
import path from "node:path";

function q(v) {
  if (v === null || v === undefined) return "null";
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "number") return String(v);
  if (Array.isArray(v)) return `ARRAY[${v.map((x) => q(x)).join(",")}]::text[]`;
  return `'${String(v).replace(/'/g, "''")}'`;
}

function dateOnly(s) {
  if (!s) return "null";
  const d = new Date(s);
  if (isNaN(d.getTime())) return "null";
  return `'${d.toISOString().slice(0, 10)}'`;
}

async function main() {
  const { blogPosts } = await import(
    pathToFileURL(path.resolve(process.cwd(), "src/data/blog.ts")).href
  );
  const cols = [
    "slug", "title", "excerpt", "tag", "published_date", "read_time",
    "image", "image_3x4", "image_1x1", "image_alt",
    "related_service", "episode", "series_title", "coming_soon", "release_date",
  ];
  const rows = blogPosts.map((p) => [
    q(p.slug),
    q(p.title),
    q(p.excerpt),
    q(p.tag),
    dateOnly(p.date),
    q(p.readTime),
    q(p.image),
    q(p.image3x4 ?? null),
    q(p.image1x1 ?? null),
    q(p.imageAlt),
    q(p.relatedService ?? null),
    p.episode ?? "null",
    q(p.seriesTitle ?? null),
    q(!!p.comingSoon),
    p.releaseDate ? dateOnly(p.releaseDate) : "null",
  ]);
  const values = rows.map((r) => `  (${r.join(",")})`).join(",\n");
  const onConflict = cols
    .filter((c) => c !== "slug")
    .map((c) => `${c} = EXCLUDED.${c}`)
    .join(", ");
  console.log(
    `INSERT INTO public.blog_posts (${cols.join(",")}) VALUES\n${values}\nON CONFLICT (slug) DO UPDATE SET ${onConflict};`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
