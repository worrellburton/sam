#!/usr/bin/env node
// One-off migration: upload every file in public/images/blog/ into the
// Supabase `blog-thumbnails` bucket, then print the new public URLs.
//
// Run:
//   node scripts/backfill-blog-thumbnails.mjs
//
// Env (anon key is enough because the bucket's RLS allows anon INSERT):
//   SUPABASE_URL      — defaults to the project URL baked in below
//   SUPABASE_ANON_KEY — required
//
// Uploaded as-is (no WebP conversion). The dev panel regenerates any
// thumbnail into Storage as WebP automatically; this is just the lift-and-
// shift out of git.

import { readFileSync, readdirSync } from "node:fs";
import { join, extname, basename } from "node:path";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://wgznytmxwslupjhsdeha.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const BUCKET = "blog-thumbnails";
const SRC_DIR = "public/images/blog";

if (!SUPABASE_ANON_KEY) {
  console.error("Missing SUPABASE_ANON_KEY env var");
  process.exit(1);
}

const mimeFor = (ext) => {
  switch (ext.toLowerCase()) {
    case ".webp":
      return "image/webp";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".avif":
      return "image/avif";
    default:
      return "application/octet-stream";
  }
};

async function uploadOne(filePath) {
  const name = basename(filePath);
  const body = readFileSync(filePath);
  const contentType = mimeFor(extname(name));

  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${encodeURIComponent(name)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      apikey: SUPABASE_ANON_KEY,
      "Content-Type": contentType,
      "x-upsert": "true",
      "cache-control": "31536000",
    },
    body,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload failed (${res.status}): ${text}`);
  }
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${encodeURIComponent(name)}`;
}

const files = readdirSync(SRC_DIR)
  .filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f))
  .map((f) => join(SRC_DIR, f));

console.log(`Uploading ${files.length} files to ${BUCKET}…`);

for (const f of files) {
  try {
    const publicUrl = await uploadOne(f);
    console.log(`OK  ${basename(f)}  →  ${publicUrl}`);
  } catch (err) {
    console.error(`ERR ${basename(f)}  →  ${err.message}`);
    process.exitCode = 1;
  }
}
