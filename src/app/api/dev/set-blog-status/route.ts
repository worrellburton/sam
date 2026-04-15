import { NextRequest, NextResponse } from "next/server";
import { requireDevAuth } from "@/lib/dev-auth";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const REPO_OWNER = "worrellburton";
const REPO_NAME = "sam";
const BRANCH = "main";
const FILE_PATH = "src/data/blog.ts";

// Body: { slug: string, comingSoon: boolean }
// - If comingSoon === true: add `comingSoon: true,` to the entry and MOVE it
//   to the end of the blogPosts array.
// - If comingSoon === false: remove any `comingSoon: ...` line from the entry.
//   Position is left alone.
export async function POST(request: NextRequest) {
  const auth = requireDevAuth(request);
  if (!auth.ok) return auth.response;

  if (!GITHUB_TOKEN) {
    return NextResponse.json(
      { error: "GITHUB_TOKEN not configured." },
      { status: 500 }
    );
  }

  const { slug, comingSoon } = await request.json();
  if (!slug || typeof comingSoon !== "boolean") {
    return NextResponse.json({ error: "Missing slug or comingSoon" }, { status: 400 });
  }

  // 1. Fetch current blog.ts
  const getRes = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}?ref=${BRANCH}`,
    { headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: "application/vnd.github.v3+json" } }
  );
  if (!getRes.ok) {
    return NextResponse.json({ error: "Failed to fetch blog.ts" }, { status: getRes.status });
  }
  const fileMeta = await getRes.json();
  const sha: string = fileMeta.sha;
  let content: string = Buffer.from(fileMeta.content, "base64").toString("utf-8");

  // Find the entry block bounded by top-level `  {` and `  },` (or `  }` for last entry).
  const slugMarker = `slug: "${slug}"`;
  const slugIdx = content.indexOf(slugMarker);
  if (slugIdx === -1) {
    return NextResponse.json({ error: `Slug "${slug}" not found` }, { status: 404 });
  }

  // Entry starts at the nearest preceding `\n  {\n`.
  const startMarker = "\n  {\n";
  const startIdx = content.lastIndexOf(startMarker, slugIdx);
  if (startIdx === -1) {
    return NextResponse.json({ error: "Could not locate entry start" }, { status: 500 });
  }
  const blockStart = startIdx + 1; // position at `  {`

  // Entry ends at the next top-level `\n  },\n` (most entries) or `\n  }\n`
  // (the final entry in the array).
  const commaEnd = content.indexOf("\n  },\n", slugIdx);
  const bareEnd = content.indexOf("\n  }\n", slugIdx);
  let blockEnd: number;
  let trailingIsComma: boolean;
  if (commaEnd !== -1 && (bareEnd === -1 || commaEnd <= bareEnd)) {
    blockEnd = commaEnd + "\n  },\n".length;
    trailingIsComma = true;
  } else if (bareEnd !== -1) {
    blockEnd = bareEnd + "\n  }\n".length;
    trailingIsComma = false;
  } else {
    return NextResponse.json({ error: "Could not locate entry end" }, { status: 500 });
  }

  let entry = content.slice(blockStart, blockEnd);

  // Normalize to trailing `,\n` form so we can freely move / reinsert it.
  if (!trailingIsComma) {
    entry = entry.replace(/\n  \}\n$/, "\n  },\n");
  }

  // Edit the comingSoon field inside the entry.
  const comingSoonLine = /[ \t]*comingSoon:\s*(?:true|false),?\s*\n/;
  const hasExisting = comingSoonLine.test(entry);

  if (comingSoon) {
    if (!hasExisting) {
      // Insert `    comingSoon: true,\n` just before the closing `  },\n`.
      entry = entry.replace(/\n  \},\n$/, "\n    comingSoon: true,\n  },\n");
    } else {
      entry = entry.replace(comingSoonLine, "    comingSoon: true,\n");
    }
  } else {
    if (hasExisting) {
      entry = entry.replace(comingSoonLine, "");
    }
  }

  // Remove the original block from content.
  let updated = content.slice(0, blockStart) + content.slice(blockEnd);

  if (comingSoon) {
    // Move to end: insert entry just before the `\n];` that terminates the
    // blogPosts array. We intentionally target the FIRST `\n];` after the
    // `blogPosts: BlogPost[] = [` declaration to avoid matching conditionBlogPosts.
    const arrayDeclIdx = updated.indexOf("blogPosts: BlogPost[] = [");
    if (arrayDeclIdx === -1) {
      return NextResponse.json({ error: "Could not find blogPosts array" }, { status: 500 });
    }
    const arrayCloseIdx = updated.indexOf("\n];", arrayDeclIdx);
    if (arrayCloseIdx === -1) {
      return NextResponse.json({ error: "Could not find array close" }, { status: 500 });
    }

    // Ensure the entry immediately preceding the close has a trailing comma.
    // After removal the tail looks like `...  },\n];` or (rarely, if we removed
    // what used to be the last entry) `...  }\n];`.
    // entry already ends with `\n  },\n`, so after splicing before `\n];` we get
    // `...  },\n  {...},\n];` which is valid.
    const before = updated.slice(0, arrayCloseIdx);
    const after = updated.slice(arrayCloseIdx); // starts with `\n];`

    // If preceding block lacks a trailing comma (i.e., we removed the last
    // entry and the new last entry now ends in `\n  }\n`), add one.
    const normalizedBefore = before.endsWith("  }\n")
      ? before.slice(0, -"  }\n".length) + "  },\n"
      : before;

    updated = normalizedBefore + entry + after;
  } else {
    // Leave position alone: re-insert at the same spot we removed from.
    updated = content.slice(0, blockStart) + entry + content.slice(blockEnd);
  }

  if (updated === content) {
    return NextResponse.json({ success: true, unchanged: true });
  }

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
        message: `${comingSoon ? "Mark draft" : "Publish"}: ${slug} via dev panel`,
        content: Buffer.from(updated, "utf-8").toString("base64"),
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

  return NextResponse.json({ success: true, slug, comingSoon });
}
