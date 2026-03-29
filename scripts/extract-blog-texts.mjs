#!/usr/bin/env node
// Extract blog texts with intro lines for TTS, outputs JSON array
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

      const episodeMatch = block.match(/episode:\s*(\d+)/);
      const episode = episodeMatch ? parseInt(episodeMatch[1]) : null;

      let text = "";
      const htmlMatch = block.match(/contentHtml:\s*`([\s\S]*?)`\s*,/);
      const plainMatch = block.match(/content:\s*`([\s\S]*?)`\s*,/);
      if (htmlMatch) text = htmlMatch[1];
      else if (plainMatch) text = plainMatch[1];
      if (!text.trim()) continue;

      // Strip TOC section (In This Article) before converting
      text = text.replace(/<div class="blog-toc">[\s\S]*?<\/div>\s*/g, "");

      text = text.replace(/<[^>]+>/g, " ").replace(/&mdash;/g, " — ").replace(/&ndash;/g, " – ")
        .replace(/&[a-z]+;/g, " ").replace(/&#\d+;/g, " ").replace(/\s+/g, " ").trim();

      // Build intro + content
      let intro;
      if (episode) {
        intro = `You're listening to Clinical Clarity by Dr. Sam Elguizaoui, M.D. Episode ${episode}: ${title}.`;
      } else {
        intro = `You're listening to Clinical Clarity by Dr. Sam Elguizaoui, M.D. ${title}.`;
      }

      const full = `${intro} ... ${text}`;
      // Truncate to 5000 chars
      posts.push({ slug, title, episode, text: full.length > 5000 ? full.slice(0, 5000) + "..." : full });
    }
  }
  return posts;
}

console.log(JSON.stringify(extractPosts()));
