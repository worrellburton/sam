import { NextRequest, NextResponse } from "next/server";
import { isDevAuthed } from "@/lib/dev-auth";

// Lightweight probe used by the dev panel to surface a clear
// "you're not signed in" banner instead of silent 401s on every
// fetch to /api/dev/*. Always 200 — the body just reports whether
// the caller is currently recognized.
//
// Does NOT call requireDevAuth — we want unauthed callers to still
// get a JSON response they can render.
export async function GET(req: NextRequest) {
  const authed = isDevAuthed(req);
  const hasSecret = Boolean(process.env.DEV_PANEL_SECRET);
  const nodeEnv = process.env.NODE_ENV ?? "development";
  return NextResponse.json(
    { authed, hasSecret, nodeEnv },
    { headers: { "Cache-Control": "no-store" } },
  );
}
