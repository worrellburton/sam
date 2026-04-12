import { NextRequest, NextResponse } from "next/server";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const REPO_OWNER = "worrellburton";
const REPO_NAME = "sam";
const BRANCH = "main";

// Returns upload config (token + existing file SHA) so the client
// can PUT directly to GitHub, bypassing Vercel's 4.5 MB body limit.
export async function POST(request: NextRequest) {
  if (!GITHUB_TOKEN) {
    return NextResponse.json(
      { error: "GITHUB_TOKEN not configured" },
      { status: 500 }
    );
  }

  const { fileName, folder } = await request.json();
  if (!fileName || !folder) {
    return NextResponse.json({ error: "Missing fileName or folder" }, { status: 400 });
  }

  const repoPath = `public/${folder}/${fileName}`;

  // Check if file already exists to get SHA for overwrites
  let sha: string | undefined;
  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${repoPath}?ref=${BRANCH}`,
      { headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: "application/vnd.github.v3+json" } }
    );
    if (res.ok) {
      const existing = await res.json();
      sha = existing.sha;
    }
  } catch {
    // File doesn't exist yet
  }

  return NextResponse.json({
    token: GITHUB_TOKEN,
    owner: REPO_OWNER,
    repo: REPO_NAME,
    branch: BRANCH,
    path: repoPath,
    sha,
  });
}
