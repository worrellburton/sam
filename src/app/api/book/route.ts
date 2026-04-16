import { NextResponse } from "next/server";
import { createBookingRequest } from "@/lib/db/booking";
import {
  callerKey,
  checkRateLimit,
  getIdempotentResponse,
  rateLimitHeaders,
  storeIdempotentResponse,
} from "@/lib/api/rate-limit";

export const runtime = "nodejs";

interface BookingBody {
  name?: string;
  email?: string;
  phone?: string;
  insurance?: string;
  apptType?: string;
  preferredDate?: string;
  preferredTime?: string;
  locationId?: string;
  notes?: string;
}

export async function POST(req: Request) {
  const rl = checkRateLimit(callerKey(req, "book"), {
    limit: 5,
    windowMs: 60_000,
  });
  const rlHeaders = rateLimitHeaders(rl);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many booking requests — please try again shortly." },
      { status: 429, headers: rlHeaders },
    );
  }

  const idempotencyKey = req.headers.get("Idempotency-Key");
  if (idempotencyKey) {
    const cached = getIdempotentResponse("book", idempotencyKey);
    if (cached) {
      return NextResponse.json(cached.body, {
        status: cached.status,
        headers: { ...rlHeaders, "Idempotent-Replayed": "true" },
      });
    }
  }

  let body: BookingBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400, headers: rlHeaders },
    );
  }

  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json(
      { error: "Name is required" },
      { status: 400, headers: rlHeaders },
    );
  }

  const ipHeader = req.headers.get("x-forwarded-for") ?? "";
  const ip = ipHeader.split(",")[0].trim() || null;
  const userAgent = req.headers.get("user-agent") ?? null;

  const row = await createBookingRequest({
    name,
    email: body.email?.trim() || null,
    phone: body.phone?.trim() || null,
    insurance: body.insurance?.trim() || null,
    appt_type: body.apptType?.trim() || null,
    preferred_date: body.preferredDate || null,
    preferred_time: body.preferredTime || null,
    location_id: body.locationId || null,
    notes: body.notes?.trim() || null,
    status: "pending",
    ip: ip as unknown as string,
    user_agent: userAgent,
  });

  if (!row) {
    return NextResponse.json(
      { error: "Failed to save booking request" },
      { status: 500, headers: rlHeaders },
    );
  }

  const payload = { ok: true, id: row.id };
  if (idempotencyKey) {
    storeIdempotentResponse("book", idempotencyKey, 201, payload);
  }
  return NextResponse.json(payload, { status: 201, headers: rlHeaders });
}
