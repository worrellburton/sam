import { NextRequest, NextResponse } from "next/server";
import { DEV_SESSION_COOKIE } from "@/lib/dev-auth";

// POST /api/dev/signin { secret: string }
//   - In dev (NODE_ENV !== "production") always accepts and sets the cookie.
//   - In prod, compares against DEV_PANEL_SECRET. On success, sets the
//     dev-panel-session cookie (httpOnly, secure, same-site=lax, 7-day).
//   - On failure, 401 with a stable error shape the signin page can render.
//
// NOTE: this endpoint cannot itself require auth — its purpose is to
// establish auth. All other /api/dev/* routes do go through
// requireDevAuth(), and middleware gates the /dev UI.
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { secret?: string };
  const presented = body.secret?.toString() ?? "";

  const isProd = process.env.NODE_ENV === "production";
  const expected = process.env.DEV_PANEL_SECRET;

  if (isProd && !expected) {
    return NextResponse.json(
      { error: "Dev panel is not configured (missing DEV_PANEL_SECRET)." },
      { status: 503 },
    );
  }

  if (isProd && presented !== expected) {
    return NextResponse.json({ error: "Incorrect secret." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: DEV_SESSION_COOKIE,
    value: presented || "dev",
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return res;
}

// POST /api/dev/signin  with { signout: true } clears the cookie.
// Kept on the same route so we don't multiply endpoints.
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: DEV_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return res;
}
