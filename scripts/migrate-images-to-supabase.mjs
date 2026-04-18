#!/usr/bin/env node
/**
 * One-off migration: push every file under public/images/ to Supabase
 * Storage, classified into three locations:
 *
 *   Sam portraits  → site-images/sam/<filename>
 *   Blog images    → blog-thumbnails/<filename>   (existing bucket)
 *   Everything else → site-images/other/<filename>
 *
 * Idempotent — re-running overwrites existing keys with upsert:true.
 *
 * Run:
 *   node --env-file=.env.local scripts/migrate-images-to-supabase.mjs
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
 * (bucket RLS must allow inserts from the anon role, or set
 *  SUPABASE_SERVICE_ROLE_KEY for an admin-scoped client).
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY in env.",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const PUBLIC_IMAGES = path.join(process.cwd(), "public", "images");

// Filename heuristics — tuned to the current repo contents. Anything
// that matches this pattern goes into the Sam folder; everything else
// (DSC*, random photos) goes to Other.
const SAM_PATTERN = /(sam|headshot|doctor|portrait|character|elguizaoui)/i;

const MIME_BY_EXT = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
};

function classify(fileName) {
  if (SAM_PATTERN.test(fileName)) return { bucket: "site-images", prefix: "sam" };
  return { bucket: "site-images", prefix: "other" };
}

async function uploadOne(srcAbs, relPath) {
  const fileName = path.basename(srcAbs);
  const ext = path.extname(fileName).toLowerCase();
  const contentType = MIME_BY_EXT[ext] || "application/octet-stream";
  const bytes = fs.readFileSync(srcAbs);

  let target;
  if (relPath.startsWith("blog/")) {
    // Blog sub-folder → Supabase blog-thumbnails bucket (flat)
    target = { bucket: "blog-thumbnails", key: fileName };
  } else {
    const { bucket, prefix } = classify(fileName);
    target = { bucket, key: `${prefix}/${fileName}` };
  }

  const { error } = await supabase.storage
    .from(target.bucket)
    .upload(target.key, bytes, {
      contentType,
      upsert: true,
      cacheControl: "31536000",
    });

  if (error) {
    return { ok: false, key: target.key, bucket: target.bucket, err: error.message };
  }
  return { ok: true, key: target.key, bucket: target.bucket, size: bytes.length };
}

function walk(dir, base = dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(full, base));
    } else if (/\.(jpe?g|png|webp|gif|avif)$/i.test(entry.name)) {
      out.push({ abs: full, rel: path.relative(base, full).replace(/\\/g, "/") });
    }
  }
  return out;
}

async function main() {
  if (!fs.existsSync(PUBLIC_IMAGES)) {
    console.error(`public/images/ not found at ${PUBLIC_IMAGES}`);
    process.exit(1);
  }

  const files = walk(PUBLIC_IMAGES);
  console.log(`Migrating ${files.length} files…\n`);

  const tally = { sam: 0, other: 0, blog: 0, failed: 0 };
  let done = 0;

  for (const file of files) {
    const result = await uploadOne(file.abs, file.rel);
    done++;
    if (!result.ok) {
      tally.failed++;
      console.error(
        `  [${done}/${files.length}] FAIL ${file.rel} → ${result.bucket}/${result.key}: ${result.err}`,
      );
      continue;
    }
    if (result.bucket === "blog-thumbnails") tally.blog++;
    else if (result.key.startsWith("sam/")) tally.sam++;
    else tally.other++;

    if (done % 10 === 0 || done === files.length) {
      console.log(
        `  [${done}/${files.length}] ${result.bucket}/${result.key} (${(
          result.size / 1024
        ).toFixed(0)} KB)`,
      );
    }
  }

  console.log(
    `\nDone. sam: ${tally.sam}, other: ${tally.other}, blog: ${tally.blog}, failed: ${tally.failed}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
