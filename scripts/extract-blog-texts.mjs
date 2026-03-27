#!/usr/bin/env node
// Extracts blog post text for TTS generation, outputs JSON array
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

function extractPosts() {
  const posts = [];
  const blogSrc = readFileSync(resolve(ROOT, "app/data/blog.ts"), "utf-8");
  const condSrc = existsSync(resolve(ROOT, "app/data/condition-blogs.ts"))
    ? readFileSync(resolve(ROOT, "app/data/condition-blogs.ts"), "utf-8") : "";

  for (const src of [blogSrc, condSrc]) {
    if (!src) continue;
    const slugRe = /slug:\s*"([^"]+)"/g;
    let match;
    const slugs = [];
    while ((match = slugRe.exec(src)) !== null) slugs.push({ index: match.index, slug: match[1] });

    for (const { index, slug } of slugs) {
      const nextSlug = slugs.find((s) => s.index > index);
      const block = src.slice(index, nextSlug ? nextSlug.index : undefined);
      if (/comingSoon:\s*true/.test(block)) continue;

      const titleMatch = block.match(/title:\s*"([^"]+)"/);
      const title = titleMatch ? titleMatch[1] : slug;

      let text = "";
      const htmlMatch = block.match(/contentHtml:\s*`([\s\S]*?)`\s*,/);
      const plainMatch = block.match(/content:\s*`([\s\S]*?)`\s*,/);
      if (htmlMatch) text = htmlMatch[1];
      else if (plainMatch) text = plainMatch[1];
      if (!text.trim()) continue;

      text = text.replace(/<[^>]+>/g, " ").replace(/&mdash;/g, " — ").replace(/&ndash;/g, " – ")
        .replace(/&[a-z]+;/g, " ").replace(/&#\d+;/g, " ").replace(/\s+/g, " ").trim();

      // Prepend title, truncate to 5000
      const full = `${title}. ${text}`;
      posts.push({ slug, text: full.length > 5000 ? full.slice(0, 5000) + "..." : full });
    }
  }
  return posts;
}

console.log(JSON.stringify(extractPosts()));
