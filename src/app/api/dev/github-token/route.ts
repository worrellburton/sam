import { NextResponse } from "next/server";

// Returns the GitHub token so the browser can upload large files directly to
// GitHub's Contents API, bypassing Vercel's ~4.5 MB serverless body limit.
//
// Security note: this exposes the token to anyone who can reach the dev
// panel. That's the same trust model as `/api/dev/upload`, which already
// accepts unauthenticated writes to the repo. If you need this gated, set
// DEV_PANEL_SECRET and pass `?secret=...` from the client.
export async function GET(request: Request) {
  const token = process.env.GITHUB_TOKEN || "";
  if (!token) {
    return NextResponse.json(
      { error: "GITHUB_TOKEN not configured." },
      { status: 500 }
    );
  }

  const gate = process.env.DEV_PANEL_SECRET;
  if (gate) {
    const url = new URL(request.url);
    const secret = url.searchParams.get("secret") || request.headers.get("x-dev-panel-secret");
    if (secret !== gate) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.json({
    token,
    owner: "worrellburton",
    repo: "sam",
    branch: "main",
  });
}
