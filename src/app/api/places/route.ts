import { NextRequest, NextResponse } from "next/server";

const PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || "";

export async function GET(request: NextRequest) {
  const placeId = request.nextUrl.searchParams.get("placeId");
  const fields = request.nextUrl.searchParams.get("fields") || "id,rating,userRatingCount,reviews";

  if (!placeId) {
    return NextResponse.json({ error: "placeId required" }, { status: 400 });
  }

  if (!PLACES_API_KEY) {
    return NextResponse.json({ error: "Google Places API key not configured" }, { status: 500 });
  }

  const url = `https://places.googleapis.com/v1/places/${placeId}`;

  const resp = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": PLACES_API_KEY,
      "X-Goog-FieldMask": fields,
    },
    next: { revalidate: 3600 },
  });

  if (!resp.ok) {
    const text = await resp.text();
    console.error(`Places API error for ${placeId}: ${resp.status} ${text}`);
    return NextResponse.json({ error: "Places API error", details: text }, { status: resp.status });
  }

  const data = await resp.json();
  return NextResponse.json(data);
}
