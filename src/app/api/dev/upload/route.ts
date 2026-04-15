import { NextRequest, NextResponse } from "next/server";
import { requireDevAuth } from "@/lib/dev-auth";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const REPO_OWNER = "worrellburton";
const REPO_NAME = "sam";
const BRANCH = "main";

// Proxy for uploading files to GitHub.
// Client sends { fileName, folder, content (base64) }
// This endpoint forwards to GitHub API, avoiding CORS issues.
export async function POST(request: NextRequest) {
  const auth = requireDevAuth(request);
  if (!auth.ok) return auth.response;

  if (!GITHUB_TOKEN) {
    return NextResponse.json(
      { error: "GITHUB_TOKEN not configured. Add it to your Vercel environment variables." },
      { status: 500 }
    );
  }

  const { fileName, folder, content } = await request.json();
  if (!fileName || !folder || !content) {
    return NextResponse.json({ error: "Missing fileName, folder, or content" }, { status: 400 });
  }

  const repoPath = `public/${folder}/${fileName}`;

  // Check if file exists (get SHA for overwrites)
  let sha: string | undefined;
  try {
    const checkRes = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${repoPath}?ref=${BRANCH}`,
      { headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: "application/vnd.github.v3+json" } }
    );
    if (checkRes.ok) {
      const existing = await checkRes.json();
      sha = existing.sha;
    }
  } catch {
    // File doesn't exist yet
  }

  const body: Record<string, string> = {
    message: `Upload ${fileName} via dev panel`,
    content,
    branch: BRANCH,
  };
  if (sha) body.sha = sha;

  const res = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${repoPath}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    return NextResponse.json(
      { error: `GitHub API error: ${err.message || res.statusText}` },
      { status: res.status }
    );
  }

  const result = await res.json();
  return NextResponse.json({
    success: true,
    path: `/${folder}/${fileName}`,
    url: result.content?.html_url,
  });
}

export async function DELETE(request: NextRequest) {
  const auth = requireDevAuth(request);
  if (!auth.ok) return auth.response;

  if (!GITHUB_TOKEN) {
    return NextResponse.json(
      { error: "GITHUB_TOKEN not configured." },
      { status: 500 }
    );
  }

  const { filePath } = await request.json();
  if (!filePath) {
    return NextResponse.json({ error: "Missing filePath" }, { status: 400 });
  }

  // filePath comes as e.g. "/images/photo.jpg" or "/videos/clip.mp4"
  const repoPath = `public${filePath}`;

  // Get file SHA (required for GitHub delete)
  const checkRes = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${repoPath}?ref=${BRANCH}`,
    { headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: "application/vnd.github.v3+json" } }
  );

  if (!checkRes.ok) {
    return NextResponse.json({ error: "File not found on GitHub" }, { status: 404 });
  }

  const existing = await checkRes.json();

  const res = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${repoPath}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Delete ${filePath.split("/").pop()} via dev panel`,
        sha: existing.sha,
        branch: BRANCH,
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    return NextResponse.json(
      { error: `GitHub API error: ${err.message || res.statusText}` },
      { status: res.status }
    );
  }

  return NextResponse.json({ success: true });
}
