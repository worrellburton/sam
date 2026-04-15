import { NextResponse } from "next/server";

const PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || "";

// Locations used on the homepage. Kept server-side so the list (and Place IDs)
// don't need to ship in the client bundle.
const PLACE_IDS = [
  { id: "ChIJmQNsqXpZwokRoKDGBL8w9LM", label: "Upper East Side" },
  { id: "ChIJFTfVAb5ZwokRuFvoKEMtQag", label: "West Village" },
  { id: "ChIJzeD6h0VawokRCfzPOz9Oi7E", label: "Brooklyn" },
];

const FIELDS =
  "id,rating,userRatingCount,reviews.rating,reviews.text,reviews.authorAttribution,reviews.relativePublishTimeDescription,reviews.publishTime";

interface PlacesReview {
  rating: number;
  text?: { text?: string };
  authorAttribution?: { displayName?: string; photoUri?: string };
  relativePublishTimeDescription?: string;
  publishTime?: string;
}

interface PlaceResponse {
  rating?: number;
  userRatingCount?: number;
  reviews?: PlacesReview[];
}

// Aggregates Google Places data for all three office locations into one
// ISR-cached response so the homepage only makes one network call instead
// of three separate ones per visitor.
export const revalidate = 3600; // 1 hour

export async function GET() {
  if (!PLACES_API_KEY) {
    return NextResponse.json(
      { error: "Google Places API key not configured" },
      { status: 500 },
    );
  }

  const results = await Promise.all(
    PLACE_IDS.map(async (place) => {
      const url = `https://places.googleapis.com/v1/places/${place.id}`;
      const resp = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": PLACES_API_KEY,
          "X-Goog-FieldMask": FIELDS,
        },
        next: { revalidate: 3600 },
      });

      if (!resp.ok) {
        console.error(
          `Places API error for ${place.label} (${place.id}): ${resp.status}`,
        );
        return { label: place.label, rating: 0, count: 0, reviews: [] };
      }

      const data = (await resp.json()) as PlaceResponse;
      return {
        label: place.label,
        rating: data.rating ?? 0,
        count: data.userRatingCount ?? 0,
        reviews: (data.reviews ?? []).map((r) => ({
          ...r,
          locationLabel: place.label,
        })),
      };
    }),
  );

  const totalCount = results.reduce((sum, r) => sum + r.count, 0);
  const reviews = results
    .flatMap((r) => r.reviews)
    .filter((r) => r.rating >= 5)
    .sort(
      (a, b) =>
        new Date(b.publishTime ?? 0).getTime() -
        new Date(a.publishTime ?? 0).getTime(),
    );

  return NextResponse.json(
    { totalCount, reviews },
    {
      headers: {
        "Cache-Control":
          "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}
