import { NextRequest, NextResponse } from "next/server";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const REPO_OWNER = "worrellburton";
const REPO_NAME = "sam";
const BRANCH = "main";
const FILE_PATH = "src/data/blog.ts";

/**
 * Materializes one step of the infinite-loop series rotation.
 *
 * Reads blog.ts from GitHub, parses the `blogPosts` array, and:
 *   1. Clears `comingSoon` + `releaseDate` from any post whose `releaseDate`
 *      has already passed (promoting it to a real published post).
 *   2. If no post is left flagged `comingSoon: true`, promotes the oldest
 *      released episode (lowest episode number) to `comingSoon: true` and
 *      moves that entry to the end of the blogPosts array.
 *
 * POST body: {}  (no params — always advances one step)
 * Response:  { success, promoted?: string, newTeaser?: string, noop?: true }
 */
export async function POST(_request: NextRequest) {
  if (!GITHUB_TOKEN) {
    return NextResponse.json(
      { error: "GITHUB_TOKEN not configured." },
      { status: 500 }
    );
  }

  // 1. Fetch current blog.ts
  const getRes = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}?ref=${BRANCH}`,
    {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      },
    }
  );
  if (!getRes.ok) {
    return NextResponse.json(
      { error: "Failed to fetch blog.ts" },
      { status: getRes.status }
    );
  }
  const fileMeta = await getRes.json();
  const sha: string = fileMeta.sha;
  let content: string = Buffer.from(fileMeta.content, "base64").toString(
    "utf-8"
  );

  // Parse all series entries (those with an `episode:` field) within the
  // top-level `blogPosts` array. We use a block-boundary scan identical to
  // set-blog-status: each entry is bounded by `\n  {\n` ... `\n  },\n`.
  const arrayDeclIdx = content.indexOf("blogPosts: BlogPost[] = [");
  if (arrayDeclIdx === -1) {
    return NextResponse.json(
      { error: "Could not find blogPosts array" },
      { status: 500 }
    );
  }
  const arrayCloseIdx = content.indexOf("\n];", arrayDeclIdx);
  if (arrayCloseIdx === -1) {
    return NextResponse.json(
      { error: "Could not find array close" },
      { status: 500 }
    );
  }

  interface Entry {
    start: number; // index of `  {`
    end: number; // index just past `\n  },\n` (or `\n  }\n`)
    text: string;
    trailingIsComma: boolean;
    slug: string;
    episode: number | null;
    comingSoon: boolean;
    releaseDate: string | null;
  }
  const entries: Entry[] = [];
  let cursor = arrayDeclIdx;
  while (true) {
    const startMarker = "\n  {\n";
    const startIdx = content.indexOf(startMarker, cursor);
    if (startIdx === -1 || startIdx > arrayCloseIdx) break;
    const blockStart = startIdx + 1; // `  {`
    const commaEnd = content.indexOf("\n  },\n", blockStart);
    const bareEnd = content.indexOf("\n  }\n", blockStart);
    let blockEnd: number;
    let trailingIsComma: boolean;
    if (commaEnd !== -1 && (bareEnd === -1 || commaEnd <= bareEnd)) {
      blockEnd = commaEnd + "\n  },\n".length;
      trailingIsComma = true;
    } else if (bareEnd !== -1) {
      blockEnd = bareEnd + "\n  }\n".length;
      trailingIsComma = false;
    } else {
      break;
    }
    if (blockEnd - 1 > arrayCloseIdx + "\n];".length) break;
    const text = content.slice(blockStart, blockEnd);

    const slugMatch = text.match(/slug:\s*"([^"]+)"/);
    const episodeMatch = text.match(/episode:\s*(\d+)/);
    const releaseMatch = text.match(/releaseDate:\s*"([^"]+)"/);
    const comingMatch = text.match(/comingSoon:\s*true/);

    entries.push({
      start: blockStart,
      end: blockEnd,
      text,
      trailingIsComma,
      slug: slugMatch ? slugMatch[1] : "",
      episode: episodeMatch ? parseInt(episodeMatch[1], 10) : null,
      comingSoon: Boolean(comingMatch),
      releaseDate: releaseMatch ? releaseMatch[1] : null,
    });
    cursor = blockEnd;
  }

  // Decide what rotation step to perform.
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const isReleased = (e: Entry) => {
    if (!e.comingSoon) return true;
    if (!e.releaseDate) return false;
    const r = new Date(e.releaseDate);
    if (isNaN(r.getTime())) return false;
    const rel = new Date(r.getFullYear(), r.getMonth(), r.getDate());
    return rel.getTime() <= today.getTime();
  };

  // Step A: promote any coming-soon posts whose releaseDate has passed.
  const toPromote = entries.filter(
    (e) => e.comingSoon && e.releaseDate && isReleased(e)
  );

  // Step B: if after promotion there is no active draft, pick oldest released
  // episode as the new teaser.
  const activeDraft = entries.find((e) => e.comingSoon && !isReleased(e));
  const needsNewTeaser = !activeDraft && toPromote.length === 0;
  const needsNewTeaserAfterPromote = !activeDraft && toPromote.length > 0;

  let newTeaserEntry: Entry | null = null;
  if (needsNewTeaser || needsNewTeaserAfterPromote) {
    const releasedSeries = entries
      .filter((e) => e.episode !== null)
      .filter((e) => isReleased(e))
      // exclude anyone we're about to promote out of draft (they stay released)
      .filter((e) => !toPromote.some((p) => p.slug === e.slug));
    if (releasedSeries.length > 0) {
      releasedSeries.sort(
        (a, b) => (a.episode as number) - (b.episode as number)
      );
      newTeaserEntry = releasedSeries[0];
    }
  }

  if (toPromote.length === 0 && !newTeaserEntry) {
    return NextResponse.json({ success: true, noop: true });
  }

  // Mutate entry texts in memory, then splice back into the file content.

  // Promotion: strip `comingSoon: true` and `releaseDate` lines.
  const promotedSlugs: string[] = [];
  for (const p of toPromote) {
    let t = p.text;
    t = t.replace(/[ \t]*comingSoon:\s*true,?\s*\n/, "");
    t = t.replace(/[ \t]*releaseDate:\s*"[^"]*",?\s*\n/, "");
    p.text = t;
    promotedSlugs.push(p.slug);
  }

  // New teaser: add `comingSoon: true,` to its entry; entry gets moved to end.
  let newTeaserSlug: string | null = null;
  if (newTeaserEntry) {
    let t = newTeaserEntry.text;
    // Normalize trailing to `,\n` so moving is safe.
    if (!newTeaserEntry.trailingIsComma) {
      t = t.replace(/\n  \}\n$/, "\n  },\n");
      newTeaserEntry.trailingIsComma = true;
    }
    if (!/[ \t]*comingSoon:\s*true/.test(t)) {
      t = t.replace(/\n  \},\n$/, "\n    comingSoon: true,\n  },\n");
    }
    newTeaserEntry.text = t;
    newTeaserSlug = newTeaserEntry.slug;
  }

  // Rebuild the `blogPosts` array region from scratch. Preserve original
  // order for everything except the new-teaser entry, which moves to the end.
  const preserved = entries.filter(
    (e) => !newTeaserEntry || e.slug !== newTeaserEntry.slug
  );
  const finalOrder: Entry[] = newTeaserEntry
    ? [...preserved, newTeaserEntry]
    : preserved;

  // Ensure every entry ends with `\n  },\n` — the final entry may have come
  // in as `\n  }\n` but we want uniform `,\n` separators between entries.
  // After we rebuild, the last entry will end with `\n  },\n` which is still
  // valid JS (trailing commas allowed) and matches the style used elsewhere.
  const rebuilt = finalOrder
    .map((e) => {
      if (e.trailingIsComma) return e.text;
      // Force a comma terminator.
      return e.text.replace(/\n  \}\n$/, "\n  },\n");
    })
    .join("");

  // Splice: find the region from the first entry's start up to arrayCloseIdx.
  const firstStart = entries[0]?.start;
  if (firstStart === undefined) {
    return NextResponse.json(
      { error: "No entries parsed in blogPosts array" },
      { status: 500 }
    );
  }
  // arrayCloseIdx points at the `\n` before `];`. We want everything up to
  // (but not including) that `\n`.
  const before = content.slice(0, firstStart);
  const after = content.slice(arrayCloseIdx); // starts with `\n];`

  const updated = before + rebuilt + after;

  if (updated === content) {
    return NextResponse.json({ success: true, noop: true });
  }

  const parts: string[] = [];
  if (promotedSlugs.length > 0) {
    parts.push(
      promotedSlugs.length === 1
        ? `publish ${promotedSlugs[0]}`
        : `publish ${promotedSlugs.length} drafts`
    );
  }
  if (newTeaserSlug) parts.push(`teaser -> ${newTeaserSlug}`);
  const commitMessage = `Rotate blog series: ${parts.join(", ")}`;

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
        message: commitMessage,
        content: Buffer.from(updated, "utf-8").toString("base64"),
        sha,
        branch: BRANCH,
      }),
    }
  );

  if (!putRes.ok) {
    const err = await putRes
      .json()
      .catch(() => ({ message: putRes.statusText }));
    return NextResponse.json(
      { error: `GitHub API error: ${err.message || putRes.statusText}` },
      { status: putRes.status }
    );
  }

  return NextResponse.json({
    success: true,
    promoted: promotedSlugs,
    newTeaser: newTeaserSlug,
  });
}
