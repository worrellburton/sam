// In-memory rate limiter + idempotency cache for API routes.
//
// This is deliberately process-local. On Vercel each serverless
// invocation may hit a different warm instance, so the limit here is
// "best-effort" — it prevents hammering in a single warm instance but
// is not a distributed shield. For that, swap the Map backing store
// with Upstash Redis (drop-in: same shape, different read/write).
// See RateLimit-* draft: https://datatracker.ietf.org/doc/draft-ietf-httpapi-ratelimit-headers/
//
// The idempotency cache is keyed by `Idempotency-Key` header and
// remembers the status + response body for TTL so retries of a
// charge/booking/claim submission don't double-commit.

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export interface RateLimitOptions {
  /** Max requests allowed inside the window. */
  limit: number;
  /** Window size in milliseconds. */
  windowMs: number;
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetSeconds: number;
  limit: number;
}

export function checkRateLimit(
  key: string,
  { limit, windowMs }: RateLimitOptions,
): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return {
      ok: true,
      remaining: limit - 1,
      resetSeconds: Math.ceil(windowMs / 1000),
      limit,
    };
  }
  existing.count += 1;
  const resetSeconds = Math.max(
    0,
    Math.ceil((existing.resetAt - now) / 1000),
  );
  return {
    ok: existing.count <= limit,
    remaining: Math.max(0, limit - existing.count),
    resetSeconds,
    limit,
  };
}

export function rateLimitHeaders(r: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    "RateLimit-Limit": String(r.limit),
    "RateLimit-Remaining": String(r.remaining),
    "RateLimit-Reset": String(r.resetSeconds),
  };
  if (!r.ok) headers["Retry-After"] = String(r.resetSeconds);
  return headers;
}

/** Best-guess caller IP for keying the limiter. */
export function callerKey(req: Request, prefix: string): string {
  const fwd = req.headers.get("x-forwarded-for") ?? "";
  const ip = fwd.split(",")[0]?.trim();
  const real = req.headers.get("x-real-ip") ?? "";
  return `${prefix}:${ip || real || "anon"}`;
}

// ─── Idempotency cache ────────────────────────────────────────────────

interface IdempotentEntry {
  status: number;
  body: unknown;
  expiresAt: number;
}

const idempotentCache = new Map<string, IdempotentEntry>();
const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000; // 24h

export function getIdempotentResponse(
  scope: string,
  key: string,
): IdempotentEntry | null {
  const entry = idempotentCache.get(`${scope}:${key}`);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    idempotentCache.delete(`${scope}:${key}`);
    return null;
  }
  return entry;
}

export function storeIdempotentResponse(
  scope: string,
  key: string,
  status: number,
  body: unknown,
): void {
  idempotentCache.set(`${scope}:${key}`, {
    status,
    body,
    expiresAt: Date.now() + IDEMPOTENCY_TTL_MS,
  });
  // Periodic sweep so the map doesn't grow unbounded.
  if (idempotentCache.size > 500) {
    const now = Date.now();
    for (const [k, v] of idempotentCache) {
      if (v.expiresAt <= now) idempotentCache.delete(k);
    }
  }
}
