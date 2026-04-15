import { NextResponse } from "next/server";
import { requireDevAuth } from "@/lib/dev-auth";
import { services } from "@/data/services";
import { conditions } from "@/data/conditions";
import { blogPosts, isPostReleased } from "@/data/blog";

// Live SEO scan.
//
// POSTed by /dev/seo. Fetches every known route on the live site,
// parses the <head> for the metadata Google actually looks at
// (title, description, canonical, OpenGraph, JSON-LD), grades each
// page against target ranges, computes an overall score, and returns
// a Markdown-formatted "fix prompt" the dev panel can copy into a
// fresh Claude Code session.
//
// Kept inline-regex simple so the route stays lightweight and runs
// on the edge-style Node runtime Vercel gives API routes by default.
// For anything richer we'd pull in linkedom/cheerio; this is enough
// to audit what's already being shipped.

// The base URL to scan is whatever origin served this request — that
// way the scanner always targets its own deploy (preview, prod, local
// dev) regardless of whether NEXT_PUBLIC_SITE_URL is configured. Falls
// back to the env var only if the request URL can't be parsed.
function resolveBaseUrl(request: Request): string {
  try {
    return new URL(request.url).origin;
  } catch {
    return (
      process.env.NEXT_PUBLIC_SITE_URL || "https://sammd.vercel.app"
    );
  }
}

const TARGET_TITLE_MIN = 30;
const TARGET_TITLE_MAX = 65;
const TARGET_DESC_MIN = 120;
const TARGET_DESC_MAX = 170;

interface PageScan {
  path: string;
  label: string;
  status: number;
  title?: string;
  description?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  jsonLdTypes: string[];
  h1Count: number;
  checks: { id: string; label: string; ok: boolean; note?: string }[];
  score: number; // 0-100
  error?: string;
}

function allRoutes(): { path: string; label: string }[] {
  return [
    { path: "/", label: "Homepage" },
    { path: "/about", label: "About" },
    { path: "/contact", label: "Contact" },
    { path: "/reviews", label: "Reviews" },
    { path: "/faq", label: "FAQ" },
    { path: "/blog", label: "Blog index" },
    { path: "/book", label: "Booking" },
    ...services.map((s) => ({ path: `/services/${s.slug}`, label: s.title })),
    ...conditions.map((c) => ({ path: `/conditions/${c.slug}`, label: c.title })),
    ...blogPosts
      .filter((p) => isPostReleased(p))
      .map((p) => ({ path: `/blog/${p.slug}`, label: p.title })),
  ];
}

// Pull a single matching group via case-insensitive regex. Returns
// undefined if not found so callers can distinguish "missing" from "empty".
function extract(re: RegExp, html: string): string | undefined {
  const m = html.match(re);
  return m?.[1]?.trim();
}

function extractAll(re: RegExp, html: string): string[] {
  const out: string[] = [];
  let m: RegExpExecArray | null;
  const g = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
  while ((m = g.exec(html))) {
    out.push(m[1]);
  }
  return out;
}

async function scanOne(
  route: { path: string; label: string },
  baseUrl: string,
): Promise<PageScan> {
  const url = `${baseUrl}${route.path}`;
  try {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 12000);
    const resp = await fetch(url, {
      headers: { "user-agent": "SamMD-SEO-Scanner/1.0" },
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(tid);
    const html = await resp.text();

    const title = extract(/<title[^>]*>([^<]+)<\/title>/i, html);
    const description = extract(
      /<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i,
      html,
    );
    const canonical = extract(
      /<link\s+rel=["']canonical["']\s+href=["']([^"']*)["']/i,
      html,
    );
    const ogTitle = extract(
      /<meta\s+property=["']og:title["']\s+content=["']([^"']*)["']/i,
      html,
    );
    const ogDescription = extract(
      /<meta\s+property=["']og:description["']\s+content=["']([^"']*)["']/i,
      html,
    );
    const ogImage = extract(
      /<meta\s+property=["']og:image["']\s+content=["']([^"']*)["']/i,
      html,
    );

    const jsonLdBlocks = extractAll(
      /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i,
      html,
    );
    const jsonLdTypes = jsonLdBlocks
      .flatMap((raw) => {
        try {
          const parsed = JSON.parse(raw);
          const items = Array.isArray(parsed) ? parsed : [parsed];
          return items
            .map((item) => (typeof item?.["@type"] === "string" ? item["@type"] : null))
            .filter((t): t is string => !!t);
        } catch {
          return [];
        }
      });

    const h1Count = (html.match(/<h1\b/gi) ?? []).length;

    const checks = [
      {
        id: "status",
        label: "HTTP 200",
        ok: resp.ok,
        note: `HTTP ${resp.status}`,
      },
      {
        id: "title",
        label: "Title length",
        ok: !!title && title.length >= TARGET_TITLE_MIN && title.length <= TARGET_TITLE_MAX,
        note: title
          ? `${title.length} chars (target ${TARGET_TITLE_MIN}–${TARGET_TITLE_MAX})`
          : "missing",
      },
      {
        id: "description",
        label: "Description length",
        ok:
          !!description &&
          description.length >= TARGET_DESC_MIN &&
          description.length <= TARGET_DESC_MAX,
        note: description
          ? `${description.length} chars (target ${TARGET_DESC_MIN}–${TARGET_DESC_MAX})`
          : "missing",
      },
      {
        id: "canonical",
        label: "Canonical link",
        ok: !!canonical,
        note: canonical ? "present" : "missing",
      },
      {
        id: "og",
        label: "OpenGraph trio",
        ok: !!ogTitle && !!ogDescription && !!ogImage,
        note: [
          ogTitle ? "title" : null,
          ogDescription ? "description" : null,
          ogImage ? "image" : null,
        ]
          .filter(Boolean)
          .join(" + ") || "none",
      },
      {
        id: "jsonld",
        label: "JSON-LD structured data",
        ok: jsonLdTypes.length > 0,
        note: jsonLdTypes.length > 0 ? jsonLdTypes.join(", ") : "missing",
      },
      {
        id: "h1",
        label: "Exactly one <h1>",
        ok: h1Count === 1,
        note: `${h1Count} found`,
      },
    ];

    const passed = checks.filter((c) => c.ok).length;
    const score = Math.round((passed / checks.length) * 100);

    return {
      ...route,
      status: resp.status,
      title,
      description,
      canonical,
      ogTitle,
      ogDescription,
      ogImage,
      jsonLdTypes,
      h1Count,
      checks,
      score,
    };
  } catch (err) {
    return {
      ...route,
      status: 0,
      jsonLdTypes: [],
      h1Count: 0,
      checks: [],
      score: 0,
      error: err instanceof Error ? err.message : "scan failed",
    };
  }
}

function buildFixPrompt(pages: PageScan[]): string {
  const failures: string[] = [];
  for (const p of pages) {
    const bad = p.checks.filter((c) => !c.ok);
    if (bad.length === 0) continue;
    failures.push(
      `- ${p.path} (${p.label})\n${bad
        .map((b) => `    • ${b.label}: ${b.note}`)
        .join("\n")}`,
    );
  }
  if (failures.length === 0) {
    return "All scanned pages pass the SEO target ranges. No fix needed.";
  }
  return [
    "You are working in the Next.js 16 project at worrellburton/sam.",
    "The /dev/seo live-scan found the following issues. Fix each route's",
    "metadata so titles land in 30–65 chars, descriptions land in 120–170",
    "chars, every page has a canonical URL, OpenGraph title/description/",
    "image, at least one JSON-LD block, and exactly one <h1>.",
    "",
    "Server Component routes set metadata via `export const metadata` or",
    "`generateMetadata()`. Client-component pages (/book, /doczoc/*) need",
    "metadata added to a sibling `layout.tsx` or page-specific `head.tsx`.",
    "",
    "Issues found:",
    ...failures,
    "",
    "After fixing, re-run `npm run build` locally to confirm typecheck",
    "passes, then open a PR against main.",
  ].join("\n");
}

export async function POST(request: Request) {
  const auth = requireDevAuth(request);
  if (!auth.ok) return auth.response;

  const baseUrl = resolveBaseUrl(request);
  const routes = allRoutes();
  // Parallel with a soft concurrency cap to avoid hammering our own origin.
  const batchSize = 8;
  const pages: PageScan[] = [];
  for (let i = 0; i < routes.length; i += batchSize) {
    const chunk = routes.slice(i, i + batchSize);
    const results = await Promise.all(chunk.map((r) => scanOne(r, baseUrl)));
    pages.push(...results);
  }

  const overall = pages.length
    ? Math.round(pages.reduce((s, p) => s + p.score, 0) / pages.length)
    : 0;
  const fixPrompt = buildFixPrompt(pages);

  return NextResponse.json(
    { scannedAt: new Date().toISOString(), baseUrl, overall, pages, fixPrompt },
    { headers: { "Cache-Control": "no-store" } },
  );
}
