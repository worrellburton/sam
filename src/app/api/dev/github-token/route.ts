import { NextResponse } from "next/server";
import { requireDevAuth } from "@/lib/dev-auth";

// Returns the GitHub token so the browser can upload large files directly to
// GitHub's Contents API, bypassing Vercel's ~4.5 MB serverless body limit.
//
// Gated by requireDevAuth(); in production this fails closed unless
// DEV_PANEL_SECRET is set AND the caller presents it.
export async function GET(request: Request) {
  const auth = requireDevAuth(request);
  if (!auth.ok) return auth.response;

  const token = process.env.GITHUB_TOKEN || "";
  if (!token) {
    return NextResponse.json(
      { error: "GITHUB_TOKEN not configured." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    token,
    owner: "worrellburton",
    repo: "sam",
    branch: "main",
  });
}
