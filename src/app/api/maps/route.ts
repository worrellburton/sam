import { NextRequest, NextResponse } from "next/server";

const GOOGLE_MAPS_KEY = process.env.GOOGLE_MAPS_SERVER_KEY || "";

/**
 * Server-side proxy for Google Maps Embed and Static Maps APIs.
 * Keeps the API key off the client.
 *
 * Usage:
 *   /api/maps?type=embed&q=ADDRESS&zoom=13
 *   /api/maps?type=static&center=ADDRESS&zoom=14&size=200x200&scale=2&markers=...
 */
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const type = sp.get("type"); // "embed" or "static"

  if (!GOOGLE_MAPS_KEY) {
    return NextResponse.json(
      { error: "Google Maps API key not configured" },
      { status: 500 },
    );
  }

  if (type === "embed") {
    const q = sp.get("q") || "";
    const zoom = sp.get("zoom") || "13";
    const url = `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_KEY}&q=${encodeURIComponent(q)}&zoom=${zoom}`;

    // Return a redirect so the iframe can load the embed directly
    return NextResponse.redirect(url);
  }

  if (type === "static") {
    const center = sp.get("center") || "";
    const zoom = sp.get("zoom") || "14";
    const size = sp.get("size") || "200x200";
    const scale = sp.get("scale") || "2";
    const markers = sp.get("markers") || "";

    const params = new URLSearchParams({
      center,
      zoom,
      size,
      scale,
      maptype: "roadmap",
      "style": "feature:poi|visibility:off",
      markers,
      key: GOOGLE_MAPS_KEY,
    });

    const url = `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`;

    const resp = await fetch(url);
    if (!resp.ok) {
      return NextResponse.json(
        { error: "Google Static Maps API error" },
        { status: resp.status },
      );
    }

    const buffer = await resp.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": resp.headers.get("Content-Type") || "image/png",
        "Cache-Control": "public, max-age=86400",
      },
    });
  }

  return NextResponse.json(
    { error: "type parameter required (embed or static)" },
    { status: 400 },
  );
}
