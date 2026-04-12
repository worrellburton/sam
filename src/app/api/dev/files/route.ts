import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const REPO_OWNER = "worrellburton";
const REPO_NAME = "sam";
const BRANCH = "main";

function walkDir(dir: string, base: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDir(full, base));
    } else {
      results.push("/" + path.relative(base, full));
    }
  }
  return results;
}

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type") || "images";
  const publicDir = path.join(process.cwd(), "public");
  const targetDir = type === "videos"
    ? path.join(publicDir, "videos")
    : path.join(publicDir, "images");

  const files = walkDir(targetDir, publicDir);
  return NextResponse.json({ files });
}

export async function POST(request: NextRequest) {
  if (!GITHUB_TOKEN) {
    return NextResponse.json(
      { error: "GITHUB_TOKEN not configured. Add it to your Vercel environment variables." },
      { status: 500 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const folder = formData.get("folder") as string || "images";

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");
  const repoPath = `public/${folder}/${file.name}`;

  // Check if file already exists (to get its SHA for updates)
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
    // File doesn't exist yet, that's fine
  }

  const body: Record<string, string> = {
    message: `Upload ${file.name} via dev panel`,
    content: base64,
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
    path: `/${folder}/${file.name}`,
    url: result.content?.html_url,
  });
}
