import { NextRequest, NextResponse } from "next/server";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const REPO_OWNER = "worrellburton";
const REPO_NAME = "sam";
const BRANCH = "main";
const FILE_PATH = "src/data/blog.ts";

// Updates the image fields of a blog post in src/data/blog.ts via the GitHub
// Contents API.
// Body: { slug, imagePath?, imagePath3x4?, imagePath1x1?, imagePrompts? }
// Any field provided is written; the 1:1 / 3:4 variants and the imagePrompts
// array are inserted after the `image:` line if they don't already exist.
export async function POST(request: NextRequest) {
  if (!GITHUB_TOKEN) {
    return NextResponse.json(
      { error: "GITHUB_TOKEN not configured. Add it to your Vercel environment variables." },
      { status: 500 }
    );
  }

  const { slug, imagePath, imagePath3x4, imagePath1x1, imagePrompts } = await request.json();
  const hasPrompts = Array.isArray(imagePrompts) && imagePrompts.length > 0;
  if (!slug || (!imagePath && !imagePath3x4 && !imagePath1x1 && !hasPrompts)) {
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

  return NextResponse.json({
    success: true,
    imagePath: imagePath || null,
    imagePath3x4: imagePath3x4 || null,
    imagePath1x1: imagePath1x1 || null,
    imagePrompts: hasPrompts ? imagePrompts : null,
  });
}
