import { NextResponse } from "next/server";
import { requireDevAuth } from "@/lib/dev-auth";
import { locations } from "@/data/locations";

// Live GEO / local-SEO scan.
//
// POSTed by /dev/geo. Validates the signals that drive local-pack
// eligibility:
//   - Homepage HTML contains a MedicalBusiness JSON-LD block (with
//     address + telephone fields)
//   - Phone number appears consistently in the homepage HTML
//   - /robots.txt and /sitemap.xml are reachable
//   - All three Google Place IDs resolve (rating + review count)
//
// Each check returns { ok, detail }. Overall score = passed / total.

// Use the request's own origin so previews/prod/local dev all scan
// themselves, regardless of whether NEXT_PUBLIC_SITE_URL is set.
function resolveBaseUrl(request: Request): string {
  try {
    return new URL(request.url).origin;
  } catch {
    return (
      process.env.NEXT_PUBLIC_SITE_URL || "https://samelguizaoui.vercel.app"
    );
  }
}

const CANONICAL_PHONE_TELLINK = "tel:+19179059370";
const CANONICAL_PHONE_DISPLAY = "(917) 905-9370";

const PLACE_IDS: Record<string, string> = {
  "Upper East Side": "ChIJmQNsqXpZwokRoKDGBL8w9LM",
  "West Village": "ChIJFTfVAb5ZwokRuFvoKEMtQag",
  Brooklyn: "ChIJzeD6h0VawokRCfzPOz9Oi7E",
};

const PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || "";

async function fetchText(baseUrl: string, path: string, timeoutMs = 10000) {
  const controller = new AbortController();
  const tid = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetch(`${baseUrl}${path}`, {
      headers: { "user-agent": "SamMD-GEO-Scanner/1.0" },
      signal: controller.signal,
      cache: "no-store",
    });
    const body = resp.ok ? await resp.text() : "";
    return { ok: resp.ok, status: resp.status, body };
  } finally {
    clearTimeout(tid);
  }
}

async function fetchPlace(placeId: string) {
  if (!PLACES_API_KEY) {
    return { ok: false, detail: "GOOGLE_PLACES_API_KEY not set" };
  }
  try {
    const resp = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": PLACES_API_KEY,
          "X-Goog-FieldMask": "id,rating,userRatingCount,displayName",
        },
        next: { revalidate: 3600 },
      },
    );
    if (!resp.ok) {
      return { ok: false, detail: `Places API ${resp.status}` };
    }
    const data = (await resp.json()) as {
      rating?: number;
      userRatingCount?: number;
      displayName?: { text?: string };
    };
    return {
      ok: true,
      detail: `⭐ ${data.rating ?? "—"} · ${data.userRatingCount ?? 0} reviews`,
      rating: data.rating,
      reviews: data.userRatingCount,
      name: data.displayName?.text,
    };
  } catch (err) {
    return {
      ok: false,
      detail: err instanceof Error ? err.message : "Places fetch failed",
    };
  }
}

interface Check {
  id: string;
  label: string;
  ok: boolean;
  detail: string;
}

export async function POST(request: Request) {
  const auth = requireDevAuth(request);
  if (!auth.ok) return auth.response;

  const baseUrl = resolveBaseUrl(request);
  const checks: Check[] = [];

  // Homepage HTML probes.
  const home = await fetchText(baseUrl, "/");
  const hasMedicalBusinessJsonLd =
    home.ok &&
    /"@type"\s*:\s*"MedicalBusiness"/.test(home.body);
  checks.push({
    id: "medicalbusiness-jsonld",
    label: "Homepage ships MedicalBusiness JSON-LD",
    ok: hasMedicalBusinessJsonLd,
    detail: hasMedicalBusinessJsonLd
      ? "schema.org/MedicalBusiness present in homepage HTML"
      : home.ok
        ? "JSON-LD block not found"
        : `Homepage fetch failed (HTTP ${home.status})`,
  });

  const phoneOnHome =
    home.ok &&
    (home.body.includes(CANONICAL_PHONE_TELLINK) ||
      home.body.includes(CANONICAL_PHONE_DISPLAY));
  checks.push({
    id: "phone-consistency",
    label: "Canonical phone appears on homepage",
    ok: phoneOnHome,
    detail: phoneOnHome
      ? `${CANONICAL_PHONE_DISPLAY} (or tel: variant) present`
      : "Canonical phone number missing from homepage HTML",
  });

  // Office address coverage on homepage.
  for (const loc of locations) {
    const streetOnly = loc.address.split(",")[0].trim();
    const found = home.ok && home.body.includes(streetOnly);
    checks.push({
      id: `addr-${loc.id}`,
      label: `${loc.label} address appears on homepage`,
      ok: found,
      detail: found ? streetOnly : `"${streetOnly}" not found in homepage HTML`,
    });
  }

  // robots.txt + sitemap reachable.
  const robots = await fetchText(baseUrl, "/robots.txt", 5000);
  checks.push({
    id: "robots",
    label: "/robots.txt reachable",
    ok: robots.ok,
    detail: robots.ok ? "200 OK" : `HTTP ${robots.status}`,
  });
  const sitemap = await fetchText(baseUrl, "/sitemap.xml", 10000);
  const urlCount = sitemap.ok
    ? (sitemap.body.match(/<url>/g) ?? []).length
    : 0;
  checks.push({
    id: "sitemap",
    label: "/sitemap.xml reachable",
    ok: sitemap.ok && urlCount > 0,
    detail: sitemap.ok
      ? `${urlCount} <url> entries`
      : `HTTP ${sitemap.status}`,
  });

  // Google Place IDs — parallel.
  const placeResults = await Promise.all(
    Object.entries(PLACE_IDS).map(async ([label, id]) => ({
      label,
      id,
      res: await fetchPlace(id),
    })),
  );
  for (const { label, id, res } of placeResults) {
    checks.push({
      id: `place-${id}`,
      label: `Google Place: ${label}`,
      ok: res.ok,
      detail: res.detail,
    });
  }

  const passed = checks.filter((c) => c.ok).length;
  const overall = checks.length
    ? Math.round((passed / checks.length) * 100)
    : 0;

  const failures = checks.filter((c) => !c.ok);
  const fixPrompt =
    failures.length === 0
      ? "All GEO signals are healthy. No fix needed."
      : [
          "You are working in the Next.js 16 project at worrellburton/sam.",
          "The /dev/geo live-scan flagged the following local-SEO issues.",
          "Fix each so the site stays eligible for Google local-pack",
          "results and the NAP stays consistent across platforms.",
          "",
          "NAP source of truth (edit src/data/locations.ts + the",
          "MEDICAL_BUSINESS_JSONLD block in src/seo.ts if needed):",
          `  Phone: ${CANONICAL_PHONE_DISPLAY}`,
          ...locations.map(
            (l) => `  ${l.label}: ${l.address}`,
          ),
          "",
          "Issues:",
          ...failures.map((f) => `- ${f.label}: ${f.detail}`),
          "",
          "After fixing, re-run the /dev/geo scan and confirm the score",
          "is 100.",
        ].join("\n");

  return NextResponse.json(
    {
      scannedAt: new Date().toISOString(),
      baseUrl,
      overall,
      checks,
      fixPrompt,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
