import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireDevAuth } from "@/lib/dev-auth";
import fs from "node:fs";
import path from "node:path";

const SAM_PATTERN = /(sam|headshot|doctor|portrait|character|elguizaoui)/i;

const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
};

function classify(fileName: string, relPath: string) {
  if (relPath.startsWith("blog/")) {
    return { bucket: "blog-thumbnails", key: fileName };
  }
  if (SAM_PATTERN.test(fileName)) {
    return { bucket: "site-images", key: `sam/${fileName}` };
  }
  return { bucket: "site-images", key: `other/${fileName}` };
}

function walk(
  dir: string,
  base: string,
): Array<{ abs: string; rel: string }> {
  const out: Array<{ abs: string; rel: string }> = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(full, base));
    } else if (/\.(jpe?g|png|webp|gif|avif)$/i.test(entry.name)) {
      out.push({
        abs: full,
        rel: path.relative(base, full).replace(/\\/g, "/"),
      });
    }
  }
  return out;
}

export async function POST(request: NextRequest) {
  const auth = requireDevAuth(request);
  if (!auth.ok) return auth.response;

  // Step 1: ensure the site-images bucket exists
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === "site-images");
  if (!exists) {
    const { error: createErr } = await supabase.storage.createBucket(
      "site-images",
      { public: true },
    );
    if (createErr) {
      return NextResponse.json(
        { error: `Failed to create bucket: ${createErr.message}` },
        { status: 500 },
      );
    }
  }

  // Step 2: read public/images and upload each file
  const publicImages = path.join(process.cwd(), "public", "images");
  if (!fs.existsSync(publicImages)) {
    return NextResponse.json(
      { error: "public/images/ not found" },
      { status: 404 },
    );
  }

  const files = walk(publicImages, publicImages);
  const results = { sam: 0, blog: 0, other: 0, failed: 0, errors: [] as string[] };

  for (const file of files) {
    const fileName = path.basename(file.abs);
    const ext = path.extname(fileName).toLowerCase();
    const contentType = MIME_BY_EXT[ext] || "application/octet-stream";
    const bytes = fs.readFileSync(file.abs);
    const target = classify(fileName, file.rel);

    const { error } = await supabase.storage
      .from(target.bucket)
      .upload(target.key, bytes, {
        contentType,
        upsert: true,
        cacheControl: "31536000",
      });

    if (error) {
      results.failed++;
      results.errors.push(`${file.rel}: ${error.message}`);
    } else if (target.bucket === "blog-thumbnails") {
      results.blog++;
    } else if (target.key.startsWith("sam/")) {
      results.sam++;
    } else {
      results.other++;
    }
  }

  return NextResponse.json({
    total: files.length,
    ...results,
    bucketCreated: !exists,
  });
}
