import { NextResponse } from "next/server";
import { createBookingRequest } from "@/lib/db/booking";

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
  let body: BookingBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
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
    // `ip` is typed as `unknown` (Postgres inet); string is accepted by Supabase.
    ip: ip as unknown as string,
    user_agent: userAgent,
  });

  if (!row) {
    return NextResponse.json({ error: "Failed to save booking request" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, id: row.id }, { status: 201 });
}
