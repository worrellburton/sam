import { NextRequest, NextResponse } from "next/server";
import {
  callerKey,
  checkRateLimit,
  getIdempotentResponse,
  rateLimitHeaders,
  storeIdempotentResponse,
} from "@/lib/api/rate-limit";

const STEDI_API_KEY = process.env.STEDI_API_KEY || "";
const STEDI_BASE_URL =
  "https://healthcare.us.stedi.com/2024-04-01/change/medicalnetwork/professionalclaims/v3";

export async function POST(request: NextRequest) {
  if (!STEDI_API_KEY) {
    return NextResponse.json(
      { error: "Stedi API key not configured" },
      { status: 500 },
    );
  }

  const rl = checkRateLimit(callerKey(request, "stedi"), {
    limit: 30,
    windowMs: 60_000,
  });
  const rlHeaders = rateLimitHeaders(rl);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Rate limit exceeded — retry after the window resets." },
      { status: 429, headers: rlHeaders },
    );
  }

  // Honor caller-supplied idempotency key; synthesize one otherwise so
  // a retried POST doesn't re-submit the claim at Stedi. Synthesized
  // keys are per-request timestamps, so they still allow distinct
  // submissions through — they just deduplicate exact retries.
  const idempotencyKey =
    request.headers.get("Idempotency-Key") || `stedi-${Date.now()}`;

  const cached = getIdempotentResponse("stedi", idempotencyKey);
  if (cached) {
    return NextResponse.json(cached.body, {
      status: cached.status,
      headers: { ...rlHeaders, "Idempotent-Replayed": "true" },
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400, headers: rlHeaders },
    );
  }

  const res = await fetch(`${STEDI_BASE_URL}/submission`, {
    method: "POST",
    headers: {
      Authorization: `Key ${STEDI_API_KEY}`,
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  // Only cache successful + deterministic replies; transient 5xx
  // errors should be retryable.
  if (res.status < 500) {
    storeIdempotentResponse("stedi", idempotencyKey, res.status, data);
  }
  return NextResponse.json(data, { status: res.status, headers: rlHeaders });
}

/** Health-check: lightweight POST to see if Stedi responds. */
export async function GET() {
  if (!STEDI_API_KEY) {
    return NextResponse.json({ status: "no_key" });
  }

  const start = performance.now();
  try {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(`${STEDI_BASE_URL}/submission`, {
      method: "POST",
      headers: {
        Authorization: `Key ${STEDI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
      signal: controller.signal,
    });
    clearTimeout(tid);

    const latency = Math.round(performance.now() - start);
    // 400/422 means the API is reachable (just rejected empty payload)
    if (res.ok || res.status === 400 || res.status === 422) {
      return NextResponse.json({
        status: latency > 3000 ? "degraded" : "connected",
        latency,
      });
    }
    return NextResponse.json({ status: "degraded", latency });
  } catch {
    return NextResponse.json({ status: "offline" });
  }
}
