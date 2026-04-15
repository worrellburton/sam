import { NextResponse, type NextRequest } from "next/server";
import { isDevAuthed } from "@/lib/dev-auth";

// Gates the /dev UI. In dev (NODE_ENV !== "production") this is a no-op.
// In production:
//   - If DEV_PANEL_SECRET isn't set, every /dev/* page returns 503.
//   - If the visitor hasn't authed, they're redirected to /dev/signin
//     with a `?next=` param so we can return them to the intended page
//     after they enter the secret.
//
// /api/dev/* endpoints aren't gated here; each route calls
// requireDevAuth() itself. Keeping API gating inside handlers means
// misconfigured middleware can't silently open them up.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Signin page must be reachable regardless of auth state.
  if (pathname === "/dev/signin") return NextResponse.next();

  if (isDevAuthed(req)) return NextResponse.next();

  // In prod without the env var, surface a clear error instead of a
  // redirect loop.
  if (process.env.NODE_ENV === "production" && !process.env.DEV_PANEL_SECRET) {
    return new NextResponse(
      "Dev panel is not configured (missing DEV_PANEL_SECRET).",
      { status: 503 },
    );
  }

  const signinUrl = req.nextUrl.clone();
  signinUrl.pathname = "/dev/signin";
  signinUrl.searchParams.set("next", pathname + req.nextUrl.search);
  return NextResponse.redirect(signinUrl);
}

export const config = {
  matcher: ["/dev/:path*"],
};
