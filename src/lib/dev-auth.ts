import { NextResponse, type NextRequest } from "next/server";

// ─────────────────────────────────────────────────────────────────────
// Dev panel auth.
//
// The /dev UI and /api/dev/* endpoints expose write access to Supabase,
// GitHub, and third-party image/LLM APIs. They MUST NOT be reachable
// from the open internet in production.
//
// Rules, in priority order:
//   1. In development (NODE_ENV !== "production"), allow everything.
//      Local dev should be frictionless.
//   2. In production, require DEV_PANEL_SECRET to be set in env. If it
//      isn't, lock everything down (return 503) — failing closed is
//      safer than falling back to an unauthenticated route.
//   3. Accept the secret via:
//        - `x-dev-panel-secret` header  (CLI / curl)
//        - `secret` query param         (legacy link support)
//        - `dev-panel-session` cookie   (set by /api/dev/signin)
//
// The cookie is set by a tiny /dev/signin page which posts to
// /api/dev/signin with the secret. Once set the browser just sends the
// cookie for all subsequent dev requests.
// ─────────────────────────────────────────────────────────────────────

export const DEV_SESSION_COOKIE = "dev-panel-session";

export interface DevAuthResult {
  ok: boolean;
  response?: NextResponse;
}

function isProd(): boolean {
  return process.env.NODE_ENV === "production";
}

function readSecret(req: NextRequest | Request): string | undefined {
  // NextRequest exposes `.cookies.get(...)`; plain Request does not. The
  // API routes we protect always receive a NextRequest, but be tolerant.
  const headers =
    "headers" in req ? (req.headers as Headers) : new Headers();
  const fromHeader = headers.get("x-dev-panel-secret") ?? undefined;
  if (fromHeader) return fromHeader;

  try {
    const url = new URL(req.url);
    const fromQuery = url.searchParams.get("secret");
    if (fromQuery) return fromQuery;
  } catch {
    // malformed URL — fall through
  }

  // Cookie path — only NextRequest has a typed `.cookies` accessor.
  const maybeNext = req as NextRequest;
  if (maybeNext.cookies && typeof maybeNext.cookies.get === "function") {
    const cookie = maybeNext.cookies.get(DEV_SESSION_COOKIE);
    if (cookie?.value) return cookie.value;
  } else {
    // Fallback cookie header parse (API routes technically get NextRequest
    // in Next.js 15/16, but this keeps the helper usable from middleware
    // or a generic Request).
    const raw = headers.get("cookie") ?? "";
    const match = raw
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${DEV_SESSION_COOKIE}=`));
    if (match) return decodeURIComponent(match.slice(DEV_SESSION_COOKIE.length + 1));
  }

  return undefined;
}

/**
 * Server-side guard for /api/dev/* routes.
 * Call at the top of each handler; if the request is unauthorized, return
 * the supplied response immediately.
 */
export function requireDevAuth(req: NextRequest | Request): DevAuthResult {
  if (!isProd()) return { ok: true };

  const expected = process.env.DEV_PANEL_SECRET;
  if (!expected) {
    // Fail closed — prod deployment without the secret set must not
    // accidentally expose these endpoints.
    return {
      ok: false,
      response: NextResponse.json(
        {
          error:
            "Dev panel is not configured (missing DEV_PANEL_SECRET). Contact the site administrator.",
        },
        { status: 503 },
      ),
    };
  }

  const presented = readSecret(req);
  if (presented !== expected) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { ok: true };
}

/** Boolean-only variant for middleware / layouts. */
export function isDevAuthed(req: NextRequest): boolean {
  if (!isProd()) return true;
  const expected = process.env.DEV_PANEL_SECRET;
  if (!expected) return false;
  return readSecret(req) === expected;
}
