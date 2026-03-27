#!/usr/bin/env node

/**
 * Pre-generate ElevenLabs TTS audio for all blog posts.
 * Saves MP3 files to public/audio/{slug}.mp3
 *
 * Usage: node scripts/generate-audio.mjs
 * Requires: VITE_ELEVENLABS_API_KEY in .env
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// ── Config ──────────────────────────────────────────────────────────
const API_BASE = "https://api.elevenlabs.io/v1";
const VOICE_ID = "UgBBYS2sOqTuMpoF3BR0"; // Mark - Natural Conversations
const MODEL_ID = "eleven_multilingual_v2";

function loadEnv() {
  const envPath = resolve(ROOT, ".env");
  if (!existsSync(envPath)) return {};
  const lines = readFileSync(envPath, "utf-8").split("\n");
  const env = {};
  for (const line of lines) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) env[match[1].trim()] = match[2].trim();
  }
  return env;
}

const env = loadEnv();
const API_KEY = process.env.VITE_ELEVENLABS_API_KEY || env.VITE_ELEVENLABS_API_KEY;

if (!API_KEY) {
  console.error("❌ No VITE_ELEVENLABS_API_KEY found in .env or environment");
  process.exit(1);
}

// ── Extract blog posts from TypeScript source files ─────────────────
function extractPosts() {
  const posts = [];

  // Parse main blog.ts
  const blogSrc = readFileSync(resolve(ROOT, "app/data/blog.ts"), "utf-8");
  // Parse condition-blogs.ts
  const condSrc = existsSync(resolve(ROOT, "app/data/condition-blogs.ts"))
    ? readFileSync(resolve(ROOT, "app/data/condition-blogs.ts"), "utf-8")
    : "";

  for (const src of [blogSrc, condSrc]) {
    if (!src) continue;
    // Match each blog post object
    const slugRe = /slug:\s*"([^"]+)"/g;
    const titleRe = /title:\s*"([^"]+)"/g;
    const contentHtmlRe = /contentHtml:\s*`([\s\S]*?)`\s*,/g;
    const contentRe = /content:\s*`([\s\S]*?)`\s*,/g;
    const comingSoonRe = /comingSoon:\s*true/g;

    let match;
    const slugs = [];
    while ((match = slugRe.exec(src)) !== null) slugs.push({ index: match.index, slug: match[1] });

    for (const { index, slug } of slugs) {
      // Get the block for this post (from this slug to the next slug or end)
      const nextSlug = slugs.find((s) => s.index > index);
      const block = src.slice(index, nextSlug ? nextSlug.index : undefined);

      // Skip coming soon posts
      if (/comingSoon:\s*true/.test(block)) {
        console.log(`⏭  Skipping "${slug}" (coming soon)`);
        continue;
      }

      // Extract title
      const titleMatch = block.match(/title:\s*"([^"]+)"/);
      const title = titleMatch ? titleMatch[1] : slug;

      // Extract content (prefer contentHtml, fall back to content)
      let text = "";
      const htmlMatch = block.match(/contentHtml:\s*`([\s\S]*?)`\s*,/);
      const plainMatch = block.match(/content:\s*`([\s\S]*?)`\s*,/);

      if (htmlMatch) {
        text = htmlMatch[1];
      } else if (plainMatch) {
        text = plainMatch[1];
      }

      if (!text.trim()) {
        console.log(`⏭  Skipping "${slug}" (no content)`);
        continue;
      }

      // Strip HTML tags and entities
      text = text
        .replace(/<[^>]+>/g, " ")
        .replace(/&[a-z]+;/g, " ")
        .replace(/&mdash;/g, " — ")
        .replace(/&ndash;/g, " – ")
        .replace(/&#\d+;/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      posts.push({ slug, title, text });
    }
  }

  return posts;
}

// ── Generate audio via ElevenLabs ──────────────────────────────────
async function generateAudio(text, slug) {
  const outPath = resolve(ROOT, "public/audio", `${slug}.mp3`);

  if (existsSync(outPath)) {
    console.log(`✅ Already exists: ${slug}.mp3`);
    return true;
  }

  // Prepend nothing extra — title is already part of article flow
  // Truncate to ~5000 chars to stay within reasonable limits
  const truncated = text.length > 5000 ? text.slice(0, 5000) + "..." : text;

  console.log(`🎙  Generating: ${slug} (${truncated.length} chars)...`);

  try {
    const res = await fetch(`${API_BASE}/text-to-speech/${VOICE_ID}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": API_KEY,
      },
      body: JSON.stringify({
        text: truncated,
        model_id: MODEL_ID,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.3,
          speed: 0.95,
        },
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      const msg = errData?.detail?.message || errData?.message || `HTTP ${res.status}`;
      console.error(`❌ Failed ${slug}: ${msg}`);
      return false;
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    writeFileSync(outPath, buffer);
    console.log(`✅ Saved: ${slug}.mp3 (${(buffer.length / 1024).toFixed(0)} KB)`);
    return true;
  } catch (err) {
    console.error(`❌ Error ${slug}: ${err.message}`);
    return false;
  }
}

// ── Main ────────────────────────────────────────────────────────────
async function main() {
  const posts = extractPosts();
  console.log(`\n📝 Found ${posts.length} blog posts with content\n`);

  let success = 0;
  let failed = 0;

  for (const post of posts) {
    // Rate limit: ElevenLabs recommends spacing requests
    if (success > 0 || failed > 0) {
      await new Promise((r) => setTimeout(r, 1500));
    }

    const ok = await generateAudio(post.text, post.slug);
    if (ok) success++;
    else failed++;
  }

  console.log(`\n🎉 Done! ${success} generated, ${failed} failed out of ${posts.length} total\n`);
}

main().catch(console.error);
