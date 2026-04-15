import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireDevAuth } from "@/lib/dev-auth";

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
  const auth = requireDevAuth(request);
  if (!auth.ok) return auth.response;

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
  //
  // Note: ~half the posts the site renders live in Supabase only — they
  // never got added to src/data/blog.ts. For those, slugIdx === -1 and
  // there's simply nothing to rewrite in blog.ts. Rather than 404ing
  // (which is what this route used to do, silently losing every save
  // for DB-only posts), we flag `inBlogTs = false`, skip the GitHub
  // commit below, and let step 4 persist the update to Supabase alone.
  const slugIdx = currentContent.indexOf(`slug: "${slug}"`);
  const inBlogTs = slugIdx !== -1;
  const nextSlugIdx = inBlogTs
    ? currentContent.indexOf(`slug: "`, slugIdx + 1)
    : -1;
  const entryEnd =
    inBlogTs && nextSlugIdx === -1
      ? currentContent.length
      : nextSlugIdx;
  let entry = inBlogTs
    ? currentContent.slice(slugIdx, entryEnd)
    : "";

  function withBuster(path: string): string {
    const separator = path.includes("?") ? "&" : "?";
    return `${path}${separator}v=${Date.now()}`;
  }

  // Rewrite the entry in blog.ts ONLY if the slug actually lives there.
  // For Supabase-only posts (inBlogTs === false) we skip this whole
  // block and fall straight through to the DB update below.
  if (inBlogTs) {
    // Replace `image: "..."` or `image: PLACEHOLDER_IMAGE` (bare identifier).
    // Both forms exist in src/data/blog.ts — posts with real thumbnails use
    // the quoted string, posts waiting on a real thumbnail use the
    // PLACEHOLDER_IMAGE constant so they're grep-countable. Either way we
    // rewrite to a fresh quoted string with a cache-buster.
    if (imagePath) {
      const busted = withBuster(imagePath);
      const imageSingleLine = /image:\s*"[^"]*"/;
      const imageMultiLine = /image:\s*\n\s*"[^"]*"/;
      const imageIdentifier = /image:\s*PLACEHOLDER_IMAGE(?!_)/;
      if (imageSingleLine.test(entry)) {
        entry = entry.replace(imageSingleLine, `image: "${busted}"`);
      } else if (imageMultiLine.test(entry)) {
        entry = entry.replace(imageMultiLine, `image: "${busted}"`);
      } else if (imageIdentifier.test(entry)) {
        entry = entry.replace(imageIdentifier, `image: "${busted}"`);
      } else {
        return NextResponse.json({ error: `Could not locate image field for "${slug}"` }, { status: 500 });
      }
    }

  // Upsert `image3x4` / `image1x1` variants. The source of truth for a
  // variant can be one of:
  //   - "https://..." quoted string (real Supabase URL)
  //   - PLACEHOLDER_IMAGE_3X4 / PLACEHOLDER_IMAGE_1X1 identifier
  //   - absent entirely (inserted after `image:` in that case)
  function upsertVariant(field: "image3x4" | "image1x1", path: string) {
    const busted = withBuster(path);
    const quotedRe = new RegExp(`${field}:\\s*"[^"]*"`);
    const placeholderIdent =
      field === "image3x4" ? "PLACEHOLDER_IMAGE_3X4" : "PLACEHOLDER_IMAGE_1X1";
    const identRe = new RegExp(`${field}:\\s*${placeholderIdent}`);
    if (quotedRe.test(entry)) {
      entry = entry.replace(quotedRe, `${field}: "${busted}"`);
      return;
    }
    if (identRe.test(entry)) {
      entry = entry.replace(identRe, `${field}: "${busted}"`);
      return;
    }
    // Insert after the first `image:` line (match quoted OR identifier).
    const imageLine = entry.match(
      /(^|\n)(\s*)image:\s*(?:"[^"]*"|PLACEHOLDER_IMAGE(?!_)),?/,
    );
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
      const imageLine = entry.match(/(^|\n)(\s*)image:\s*(?:"[^"]*"|PLACEHOLDER_IMAGE(?!_)),?/);
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
      const imageLine = entry.match(/(^|\n)(\s*)image:\s*(?:"[^"]*"|PLACEHOLDER_IMAGE(?!_)),?/);
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
  } // end if (inBlogTs) — blog.ts mutations above

  // 3. Commit the blog.ts update back to GitHub — only meaningful when
  // the slug was present in blog.ts. For DB-only posts we skip straight
  // to the Supabase update below.
  let githubCommitted = false;
  if (inBlogTs) {
    const updatedContent =
      currentContent.slice(0, slugIdx) + entry + currentContent.slice(entryEnd);

    if (updatedContent !== currentContent) {
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
        },
      );

      if (!putRes.ok) {
        const err = await putRes.json().catch(() => ({ message: putRes.statusText }));
        return NextResponse.json(
          { error: `GitHub API error: ${err.message || putRes.statusText}` },
          { status: putRes.status },
        );
      }
      githubCommitted = true;
    }
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

  // If the slug wasn't in blog.ts AND the Supabase update didn't happen,
  // there's nowhere we could have persisted the change — surface that as
  // an error so the dev UI can tell the user rather than silently succeed.
  if (!inBlogTs && !dbPatched) {
    return NextResponse.json(
      {
        error:
          dbError ||
          `Slug "${slug}" isn't in blog.ts and Supabase isn't configured — nothing was saved.`,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    inBlogTs,
    githubCommitted,
    imagePath: imagePath || null,
    imagePath3x4: imagePath3x4 || null,
    imagePath1x1: imagePath1x1 || null,
    imagePrompts: hasPrompts ? imagePrompts : null,
    imageAlt: hasAlt ? imageAlt : null,
    dbPatched,
    dbError,
  });
}
