import { NextRequest, NextResponse } from "next/server";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const REPO_OWNER = "worrellburton";
const REPO_NAME = "sam";
const BRANCH = "main";
const FILE_PATH = "src/data/blog.ts";

// Updates the `image` field of a blog post in src/data/blog.ts via the GitHub
// Contents API. Body: { slug, imagePath }.
export async function POST(request: NextRequest) {
  if (!GITHUB_TOKEN) {
    return NextResponse.json(
      { error: "GITHUB_TOKEN not configured. Add it to your Vercel environment variables." },
      { status: 500 }
    );
  }

  const { slug, imagePath } = await request.json();
  if (!slug || !imagePath) {
    return NextResponse.json({ error: "Missing slug or imagePath" }, { status: 400 });
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

  // 2. Find the entry by slug and rewrite the image field within that entry only.
  // Match: slug: "<slug>" ... image: "..." (or image:\n    "...")
  // We scope by locating the slug line, then replacing the first `image:` line that
  // follows it before the next `slug:`.
  const slugIdx = currentContent.indexOf(`slug: "${slug}"`);
  if (slugIdx === -1) {
    return NextResponse.json({ error: `Post with slug "${slug}" not found in blog.ts` }, { status: 404 });
  }
  const nextSlugIdx = currentContent.indexOf(`slug: "`, slugIdx + 1);
  const entryEnd = nextSlugIdx === -1 ? currentContent.length : nextSlugIdx;
  const entry = currentContent.slice(slugIdx, entryEnd);

  // Replace either single-line `image: "..."` or multi-line `image:\n    "..."` forms
  const imageSingleLine = /image:\s*"[^"]*"/;
  const imageMultiLine = /image:\s*\n\s*"[^"]*"/;

  let updatedEntry: string | null = null;
  if (imageSingleLine.test(entry)) {
    updatedEntry = entry.replace(imageSingleLine, `image: "${imagePath}"`);
  } else if (imageMultiLine.test(entry)) {
    updatedEntry = entry.replace(imageMultiLine, `image: "${imagePath}"`);
  }
  if (!updatedEntry) {
    return NextResponse.json({ error: `Could not locate image field for "${slug}"` }, { status: 500 });
  }

  const updatedContent =
    currentContent.slice(0, slugIdx) + updatedEntry + currentContent.slice(entryEnd);

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
        message: `Set blog image for ${slug} via dev panel`,
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

  return NextResponse.json({ success: true, imagePath });
}
