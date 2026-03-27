#!/usr/bin/env node

/**
 * Pre-generate ElevenLabs TTS + background music for all blog posts.
 *
 * Pipeline per post:
 *   1. Generate narration via TTS API (Mark voice)
 *   2. Generate clinical/warm instrumental music via Music API
 *   3. Mix them with ffmpeg (voice loud, music quiet underneath)
 *   4. Save final MP3 to public/audio/{slug}.mp3
 *
 * Usage:
 *   npm run generate:audio              # generate all
 *   npm run generate:audio -- --voice    # voice only (skip music)
 *   npm run generate:audio -- --force    # regenerate even if file exists
 *
 * Requires: VITE_ELEVENLABS_API_KEY in .env, ffmpeg installed
 */

import { readFileSync, writeFileSync, existsSync, unlinkSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const AUDIO_DIR = resolve(ROOT, "public/audio");

// ── Config ──────────────────────────────────────────────────────────
const API_BASE = "https://api.elevenlabs.io/v1";
const VOICE_ID = "UgBBYS2sOqTuMpoF3BR0"; // Mark - Natural Conversations
const MODEL_ID = "eleven_multilingual_v2";

const MUSIC_PROMPT =
  "Gentle, warm, clinical ambient instrumental. Soft piano and strings with subtle pads. " +
  "Optimistic and reassuring medical/healthcare tone. Slow tempo, calm and professional. " +
  "No vocals. Podcast background music.";

// Parse CLI flags
const args = process.argv.slice(2);
const VOICE_ONLY = args.includes("--voice");
const FORCE = args.includes("--force");

// ── Env ─────────────────────────────────────────────────────────────
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

// Check ffmpeg
function hasFFmpeg() {
  try {
    execSync("ffmpeg -version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

// ── Extract blog posts from TypeScript source files ─────────────────
function extractPosts() {
  const posts = [];
  const blogSrc = readFileSync(resolve(ROOT, "app/data/blog.ts"), "utf-8");
  const condSrc = existsSync(resolve(ROOT, "app/data/condition-blogs.ts"))
    ? readFileSync(resolve(ROOT, "app/data/condition-blogs.ts"), "utf-8")
    : "";

  for (const src of [blogSrc, condSrc]) {
    if (!src) continue;
    const slugRe = /slug:\s*"([^"]+)"/g;
    let match;
    const slugs = [];
    while ((match = slugRe.exec(src)) !== null) slugs.push({ index: match.index, slug: match[1] });

    for (const { index, slug } of slugs) {
      const nextSlug = slugs.find((s) => s.index > index);
      const block = src.slice(index, nextSlug ? nextSlug.index : undefined);

      if (/comingSoon:\s*true/.test(block)) {
        console.log(`⏭  Skipping "${slug}" (coming soon)`);
        continue;
      }

      const titleMatch = block.match(/title:\s*"([^"]+)"/);
      const title = titleMatch ? titleMatch[1] : slug;

      let text = "";
      const htmlMatch = block.match(/contentHtml:\s*`([\s\S]*?)`\s*,/);
      const plainMatch = block.match(/content:\s*`([\s\S]*?)`\s*,/);
      if (htmlMatch) text = htmlMatch[1];
      else if (plainMatch) text = plainMatch[1];

      if (!text.trim()) {
        console.log(`⏭  Skipping "${slug}" (no content)`);
        continue;
      }

      text = text
        .replace(/<[^>]+>/g, " ")
        .replace(/&mdash;/g, " — ")
        .replace(/&ndash;/g, " – ")
        .replace(/&[a-z]+;/g, " ")
        .replace(/&#\d+;/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      posts.push({ slug, title, text });
    }
  }
  return posts;
}

// ── Generate voice via TTS API ──────────────────────────────────────
async function generateVoice(text, outPath) {
  const truncated = text.length > 5000 ? text.slice(0, 5000) + "..." : text;

  const res = await fetch(`${API_BASE}/text-to-speech/${VOICE_ID}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "xi-api-key": API_KEY },
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
    throw new Error(errData?.detail?.message || errData?.message || `HTTP ${res.status}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  writeFileSync(outPath, buffer);
  return buffer.length;
}

// ── Generate background music via Music API ─────────────────────────
async function generateMusic(durationMs, outPath) {
  // Clamp to ElevenLabs limits: 3s–600s (10 min)
  const clampedMs = Math.max(3000, Math.min(600000, durationMs));

  const res = await fetch(`${API_BASE}/music/compose`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "xi-api-key": API_KEY },
    body: JSON.stringify({
      prompt: MUSIC_PROMPT,
      music_length_ms: clampedMs,
      force_instrumental: true,
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    throw new Error(errData?.detail?.message || errData?.message || `Music API HTTP ${res.status}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  writeFileSync(outPath, buffer);
  return buffer.length;
}

// ── Get audio duration in ms using ffmpeg ───────────────────────────
function getAudioDurationMs(filePath) {
  try {
    const out = execSync(
      `ffprobe -v error -show_entries format=duration -of csv=p=0 "${filePath}"`,
      { encoding: "utf-8" }
    ).trim();
    return Math.ceil(parseFloat(out) * 1000);
  } catch {
    return 120000; // default 2 min if probe fails
  }
}

// ── Mix voice + music with ffmpeg ───────────────────────────────────
function mixAudio(voicePath, musicPath, outPath) {
  // Voice at full volume, music at 12% volume, fade music in/out
  execSync(
    `ffmpeg -y -i "${voicePath}" -i "${musicPath}" -filter_complex "` +
    `[1:a]volume=0.12,afade=t=in:ss=0:d=3,afade=t=out:st=\${duration_minus_3}:d=3[music];` +
    `[0:a][music]amix=inputs=2:duration=first:dropout_transition=3[out]" ` +
    `-map "[out]" -codec:a libmp3lame -q:a 4 "${outPath}"`,
    { stdio: "ignore" }
  ).toString();
}

// Simpler mix without fade calculation (more reliable)
function mixAudioSimple(voicePath, musicPath, outPath) {
  execSync(
    `ffmpeg -y -i "${voicePath}" -i "${musicPath}" -filter_complex ` +
    `"[1:a]volume=0.12[music];[0:a][music]amix=inputs=2:duration=first:dropout_transition=3[out]" ` +
    `-map "[out]" -codec:a libmp3lame -q:a 4 "${outPath}"`,
    { stdio: "ignore" }
  );
}

// ── Process one blog post ───────────────────────────────────────────
async function processPost(post, useMusic) {
  const finalPath = resolve(AUDIO_DIR, `${post.slug}.mp3`);
  const voicePath = resolve(AUDIO_DIR, `${post.slug}_voice.mp3`);
  const musicPath = resolve(AUDIO_DIR, `${post.slug}_music.mp3`);

  if (existsSync(finalPath) && !FORCE) {
    console.log(`✅ Already exists: ${post.slug}.mp3`);
    return true;
  }

  try {
    // Step 1: Generate voice
    console.log(`🎙  Voice: ${post.slug} (${Math.min(post.text.length, 5000)} chars)...`);
    const voiceSize = await generateVoice(`${post.title}. ${post.text}`, voicePath);
    console.log(`   ✓ Voice: ${(voiceSize / 1024).toFixed(0)} KB`);

    if (!useMusic) {
      // Voice only mode — just rename
      if (existsSync(finalPath)) unlinkSync(finalPath);
      writeFileSync(finalPath, readFileSync(voicePath));
      unlinkSync(voicePath);
      console.log(`✅ Saved (voice only): ${post.slug}.mp3`);
      return true;
    }

    // Step 2: Get voice duration, generate matching music
    const voiceDurationMs = getAudioDurationMs(voicePath);
    // Add 5s buffer so music doesn't cut short
    const musicDurationMs = voiceDurationMs + 5000;

    console.log(`🎵  Music: ${post.slug} (${(musicDurationMs / 1000).toFixed(0)}s)...`);
    const musicSize = await generateMusic(musicDurationMs, musicPath);
    console.log(`   ✓ Music: ${(musicSize / 1024).toFixed(0)} KB`);

    // Step 3: Mix voice + music
    console.log(`🔀  Mixing: ${post.slug}...`);
    mixAudioSimple(voicePath, musicPath, finalPath);

    // Cleanup temp files
    if (existsSync(voicePath)) unlinkSync(voicePath);
    if (existsSync(musicPath)) unlinkSync(musicPath);

    const finalSize = existsSync(finalPath) ? readFileSync(finalPath).length : 0;
    console.log(`✅ Saved: ${post.slug}.mp3 (${(finalSize / 1024).toFixed(0)} KB)`);
    return true;
  } catch (err) {
    console.error(`❌ Error ${post.slug}: ${err.message}`);
    // Cleanup on failure
    for (const p of [voicePath, musicPath]) {
      if (existsSync(p)) unlinkSync(p);
    }
    // If voice was generated but music/mix failed, save voice-only as fallback
    if (existsSync(voicePath)) {
      writeFileSync(finalPath, readFileSync(voicePath));
      unlinkSync(voicePath);
      console.log(`   ⚠ Saved voice-only fallback: ${post.slug}.mp3`);
      return true;
    }
    return false;
  }
}

// ── Main ────────────────────────────────────────────────────────────
async function main() {
  const posts = extractPosts();
  const ffmpegAvailable = hasFFmpeg();
  const useMusic = !VOICE_ONLY && ffmpegAvailable;

  console.log(`\n📝 Found ${posts.length} blog posts with content`);
  console.log(`🎤 Voice: Mark (Natural Conversations)`);
  console.log(`🎵 Music: ${useMusic ? "Yes — clinical ambient instrumental" : VOICE_ONLY ? "Skipped (--voice flag)" : "Skipped (ffmpeg not found — install for music mixing)"}`);
  console.log(`🔄 Force regenerate: ${FORCE ? "Yes" : "No"}\n`);

  if (!ffmpegAvailable && !VOICE_ONLY) {
    console.log("⚠  ffmpeg not found. Install it for voice + music mixing:");
    console.log("   macOS: brew install ffmpeg");
    console.log("   Ubuntu: sudo apt install ffmpeg");
    console.log("   Generating voice-only files instead.\n");
  }

  let success = 0;
  let failed = 0;

  for (const post of posts) {
    if (success > 0 || failed > 0) {
      await new Promise((r) => setTimeout(r, 2000));
    }
    const ok = await processPost(post, useMusic);
    if (ok) success++;
    else failed++;
  }

  console.log(`\n🎉 Done! ${success} generated, ${failed} failed out of ${posts.length} total\n`);
}

main().catch(console.error);
