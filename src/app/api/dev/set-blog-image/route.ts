import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const REPO_OWNER = "worrellburton";
const REPO_NAME = "sam";
const BRANCH = "main";
const FILE_PATH = "src/data/blog.ts";

// Updates the image fields of a blog post in src/data/blog.ts via the GitHub
// Contents API.
// Body: { slug, imagePath?, imagePath3x4?, imagePath1x1?, imagePrompts?, imageAlt? }
// Any field provided is written; the 1:1 / 3:4 variants, the imagePrompts
// array, and imageAlt are inserted after the `image:` line if they don't
// already exist. If Supabase credentials are present, the matching
// blog_posts row is also patched (so DB-backed posts get the new thumbs + alt).
export async function POST(request: NextRequest) {
  if (!GITHUB_TOKEN) {
    return NextResponse.json(
      { error: "GITHUB_TOKEN not configured. Add it to your Vercel environment variables." },
      { status: 500 }
    );
  }

  const { slug, imagePath, imagePath3x4, imagePath1x1, imagePrompts, imageAlt } = await request.json();
  const hasPrompts = Array.isArray(imagePrompts) && imagePrompts.length > 0;
  const hasAlt = typeof imageAlt === "string" && imageAlt.trim().length > 0;
  if (!slug || (!imagePath && !imagePath3x4 && !imagePath1x1 && !hasPrompts && !hasAlt)) {
    return NextResponse.json({ error: "Missing slug or at least one field to update" }, { status: 400 });
  }

  // 1. Fetch current blog.ts
  const getRes = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}?ref=${BRANCH}`,
    { headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: "application/vnd.github.v3+json" } }
  );
  if (!getRes.ok) {
    return NextResponse.json({ error: "Failed to fetch blog.ts from GitHub" }, { status: getRes.status });
  }
  const fileMeta = await getRes.json();
  const sha: string = fileMeta.sha;
  const currentContent: string = Buffer.from(fileMeta.content, "base64").toString("utf-8");

  // 2. Find the entry by slug and rewrite its image fields.
  const slugIdx = currentContent.indexOf(`slug: "${slug}"`);
  if (slugIdx === -1) {
    return NextResponse.json({ error: `Post with slug "${slug}" not found in blog.ts` }, { status: 404 });
  }
  const nextSlugIdx = currentContent.indexOf(`slug: "`, slugIdx + 1);
  const entryEnd = nextSlugIdx === -1 ? currentContent.length : nextSlugIdx;
  let entry = currentContent.slice(slugIdx, entryEnd);

  function withBuster(path: string): string {
    const separator = path.includes("?") ? "&" : "?";
    return `${path}${separator}v=${Date.now()}`;
  }

  // Replace `image: "..."` (landscape / default)
  if (imagePath) {
    const busted = withBuster(imagePath);
    const imageSingleLine = /image:\s*"[^"]*"/;
    const imageMultiLine = /image:\s*\n\s*"[^"]*"/;
    if (imageSingleLine.test(entry)) {
      entry = entry.replace(imageSingleLine, `image: "${busted}"`);
    } else if (imageMultiLine.test(entry)) {
      entry = entry.replace(imageMultiLine, `image: "${busted}"`);
    } else {
      return NextResponse.json({ error: `Could not locate image field for "${slug}"` }, { status: 500 });
    }
  }

  // Upsert `image3x4` / `image1x1` variants. If the field exists, replace it;
  // otherwise insert it directly after the `image:` line.
  function upsertVariant(field: "image3x4" | "image1x1", path: string) {
    const busted = withBuster(path);
    const re = new RegExp(`${field}:\\s*"[^"]*"`);
    if (re.test(entry)) {
      entry = entry.replace(re, `${field}: "${busted}"`);
      return;
    }
    // Insert after the first `image: "..."` line. Match the indentation.
    const imageLine = entry.match(/(^|\n)(\s*)image:\s*"[^"]*",?/);
    if (!imageLine) return;
    const indent = imageLine[2] || "    ";
    const insertAfter = imageLine.index! + imageLine[0].length;
    entry =
      entry.slice(0, insertAfter) +
      `\n${indent}${field}: "${busted}",` +
      entry.slice(insertAfter);
  }

  if (imagePath3x4) upsertVariant("image3x4", imagePath3x4);
  if (imagePath1x1) upsertVariant("image1x1", imagePath1x1);

  // Upsert imageAlt. Like the variant paths, replace in place when present,
  // otherwise insert after the `image:` line with the matching indent.
  if (hasAlt) {
    const escaped = imageAlt
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\r?\n/g, " ");
    const altRe = /imageAlt:\s*"[^"]*"/;
    if (altRe.test(entry)) {
      entry = entry.replace(altRe, `imageAlt: "${escaped}"`);
    } else {
      const imageLine = entry.match(/(^|\n)(\s*)image:\s*"[^"]*",?/);
      if (imageLine) {
        const indent = imageLine[2] || "    ";
        const insertAfter = imageLine.index! + imageLine[0].length;
        entry =
          entry.slice(0, insertAfter) +
          `\n${indent}imageAlt: "${escaped}",` +
          entry.slice(insertAfter);
      }
    }
  }

  // Upsert imagePrompts as a multi-line array. Same strategy as upsertVariant
  // but the value is a `[...]` expression instead of a single quoted string.
  if (hasPrompts) {
    // Escape each prompt for inclusion inside a double-quoted TypeScript string.
    const escape = (s: string) =>
      s
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')
        .replace(/\r?\n/g, "\\n");
    const serialized = `[\n${imagePrompts
      .map((p: string) => `      "${escape(String(p))}"`)
      .join(",\n")}\n    ]`;

    // Match `imagePrompts: [ ... ]` across multiple lines and rewrite it.
    const existingRe = /imagePrompts:\s*\[[\s\S]*?\]/;
    if (existingRe.test(entry)) {
      entry = entry.replace(existingRe, `imagePrompts: ${serialized}`);
    } else {
      const imageLine = entry.match(/(^|\n)(\s*)image:\s*"[^"]*",?/);
      if (imageLine) {
        const indent = imageLine[2] || "    ";
        const insertAfter = imageLine.index! + imageLine[0].length;
        entry =
          entry.slice(0, insertAfter) +
          `\n${indent}imagePrompts: ${serialized.replace(/\n      /g, `\n${indent}  `).replace(/\n    \]/g, `\n${indent}]`)},` +
          entry.slice(insertAfter);
      }
    }
  }

  const updatedContent =
    currentContent.slice(0, slugIdx) + entry + currentContent.slice(entryEnd);

  if (updatedContent === currentContent) {
    return NextResponse.json({ success: true, unchanged: true });
  }

  // 3. Commit back to GitHub
  const putRes = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Set blog image(s) for ${slug} via dev panel`,
        content: Buffer.from(updatedContent, "utf-8").toString("base64"),
        sha,
        branch: BRANCH,
      }),
    }
  );

  if (!putRes.ok) {
    const err = await putRes.json().catch(() => ({ message: putRes.statusText }));
    return NextResponse.json(
      { error: `GitHub API error: ${err.message || putRes.statusText}` },
      { status: putRes.status }
    );
  }

  // 4. Mirror the update into Supabase so DB-backed posts pick up the new
  // thumbs + SEO/GEO alt text without waiting on the TS file deploy. Fails
  // soft — a Supabase error is logged but doesn't block the GitHub commit
  // the dev UI was primarily asking for.
  let dbPatched = false;
  let dbError: string | null = null;
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const patch: Record<string, unknown> = {};
    if (imagePath) patch.image = imagePath;
    if (imagePath3x4) patch.image_3x4 = imagePath3x4;
    if (imagePath1x1) patch.image_1x1 = imagePath1x1;
    if (hasPrompts) patch.image_prompts = imagePrompts;
    if (hasAlt) patch.image_alt = imageAlt;
    if (Object.keys(patch).length > 0) {
      const { error: pErr } = await supabase
        .from("blog_posts")
        .update(patch)
        .eq("slug", slug);
      if (pErr) {
        dbError = pErr.message;
        console.error("[set-blog-image] supabase update failed", pErr);
      } else {
        dbPatched = true;
      }
    }
  }

  return NextResponse.json({
    success: true,
    imagePath: imagePath || null,
    imagePath3x4: imagePath3x4 || null,
    imagePath1x1: imagePath1x1 || null,
    imagePrompts: hasPrompts ? imagePrompts : null,
    imageAlt: hasAlt ? imageAlt : null,
    dbPatched,
    dbError,
  });
}
