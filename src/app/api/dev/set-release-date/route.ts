import { NextRequest, NextResponse } from "next/server";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const REPO_OWNER = "worrellburton";
const REPO_NAME = "sam";
const BRANCH = "main";
const FILE_PATH = "src/data/blog.ts";

// Body: { updates: Array<{ slug, releaseDate: string | null }> }
// - releaseDate is "YYYY-MM-DD" or null to clear
// Supports batching so the cadence auto-scheduler can patch many drafts in a
// single commit.
export async function POST(request: NextRequest) {
  if (!GITHUB_TOKEN) {
    return NextResponse.json(
      { error: "GITHUB_TOKEN not configured. Add it to your Vercel environment variables." },
      { status: 500 }
    );
  }

  const body = await request.json();
  const updates: Array<{ slug: string; releaseDate: string | null }> = Array.isArray(body?.updates)
    ? body.updates
    : body?.slug
      ? [{ slug: body.slug, releaseDate: body.releaseDate ?? null }]
      : [];

  if (updates.length === 0) {
    return NextResponse.json({ error: "Missing updates" }, { status: 400 });
  }

  // Validate release dates
  for (const u of updates) {
    if (u.releaseDate && !/^\d{4}-\d{2}-\d{2}$/.test(u.releaseDate)) {
      return NextResponse.json(
        { error: `Invalid releaseDate "${u.releaseDate}" for slug "${u.slug}" (expected YYYY-MM-DD)` },
        { status: 400 }
      );
    }
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
  let content: string = Buffer.from(fileMeta.content, "base64").toString("utf-8");

  const notFound: string[] = [];

  for (const { slug, releaseDate } of updates) {
    const slugIdx = content.indexOf(`slug: "${slug}"`);
    if (slugIdx === -1) {
      notFound.push(slug);
      continue;
    }
    const nextSlugIdx = content.indexOf(`slug: "`, slugIdx + 1);
    const entryEnd = nextSlugIdx === -1 ? content.length : nextSlugIdx;
    const entry = content.slice(slugIdx, entryEnd);

    const releaseLine = /releaseDate:\s*"[^"]*",?\n?/;
    const hasExisting = releaseLine.test(entry);

    let updatedEntry = entry;
    if (releaseDate) {
      if (hasExisting) {
        updatedEntry = entry.replace(releaseLine, `releaseDate: "${releaseDate}",\n`);
      } else {
        // Insert just before the closing brace of the entry.
        // Find the last `}` of this entry (the one that terminates this object literal).
        const closingIdx = entry.lastIndexOf("}");
        if (closingIdx === -1) {
          notFound.push(slug);
          continue;
        }
        // Find the indentation of the line that has the closing brace.
        const lineStart = entry.lastIndexOf("\n", closingIdx) + 1;
        const indent = entry.slice(lineStart, closingIdx).replace(/[^ \t]/g, "");
        // Use 2x the closing-brace indent as the field indent (typical TS objects).
        const fieldIndent = indent + "  ";
        const insertion = `${fieldIndent}releaseDate: "${releaseDate}",\n`;
        updatedEntry = entry.slice(0, lineStart) + insertion + entry.slice(lineStart);
      }
    } else {
      // Clear
      if (hasExisting) {
        updatedEntry = entry.replace(releaseLine, "");
      }
    }

    if (updatedEntry !== entry) {
      content = content.slice(0, slugIdx) + updatedEntry + content.slice(entryEnd);
    }
  }

  // 2. Commit
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
        message:
          updates.length === 1
            ? `Set release date for ${updates[0].slug} via dev panel`
            : `Set release dates for ${updates.length} posts via dev panel`,
        content: Buffer.from(content, "utf-8").toString("base64"),
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
    updated: updates.length - notFound.length,
    notFound,
  });
}
