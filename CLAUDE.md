# CLAUDE.md

## Project Overview

Website for **Dr. Sameh Elguizaoui, M.D.** — a board-certified orthopedic surgeon & sports medicine specialist in NYC (Manhattan, Brooklyn, Scarsdale). Booking is handled externally via Zocdoc (all "Book" CTAs link out to the Zocdoc profile).

## Tech Stack

- **Next.js 16** (App Router, Turbopack)
- **React 19** + **TypeScript**
- **Tailwind CSS v4** + legacy CSS (`src/app/legacy.css`)
- **Vercel** deployment

## Commands

- `npm run dev` — Start dev server (Turbopack)
- `npm run build` — Production build
- `npm run start` — Start production server
- `npm run typecheck` — Run TypeScript checks

## Project Structure

```
src/
├── app/
│   ├── layout.tsx            — Root server layout (metadata, fonts, JSON-LD)
│   ├── page.tsx              — Homepage (/)
│   ├── globals.css           — Tailwind + legacy CSS import
│   ├── legacy.css            — Original site styles (3400 lines)
│   ├── about/page.tsx        — About page
│   ├── contact/page.tsx      — Contact page
│   ├── reviews/page.tsx      — Reviews page
│   ├── faq/page.tsx          — FAQ page
│   ├── blog/page.tsx         — Blog listing
│   ├── blog/[slug]/page.tsx  — Blog post
│   ├── services/[slug]/page.tsx    — Service page
│   └── conditions/[slug]/page.tsx  — Condition page
├── components/
│   ├── ClientLayout.tsx      — Client layout wrapper (nav, footer, theme)
│   ├── Navigation.tsx        — Mega menu + mobile nav + theme toggle
│   ├── Footer.tsx            — Site footer
│   ├── StickyBar.tsx         — Floating bottom bar with rating
│   ├── GetStarted.tsx        — CTA section
│   └── Locations.tsx         — Google Maps locations section
├── data/
│   ├── services.ts           — 6 service pages content
│   ├── blog.ts               — Blog posts content
│   ├── conditions.ts         — Condition pages content
│   └── locations.ts          — 3 office locations
└── hooks/
    ├── useTheme.ts           — Dark/light theme with localStorage
    ├── useScrollPosition.ts  — Scroll position + direction
    └── useElevenLabs.ts      — ElevenLabs TTS API
```

## Deployment

- Deploys to **Vercel** automatically on push
- Build command: `npm run build`
- Framework: Next.js (auto-detected)

## Environment Variables

Set in Vercel dashboard or `.env.local`. See `.env.example` for the full list.

**Server-only secrets (never `NEXT_PUBLIC_`):**

- `GOOGLE_PLACES_API_KEY` — used by `/api/places`
- `GOOGLE_MAPS_SERVER_KEY` — used by `/api/maps`
- `ELEVENLABS_API_KEY` — ElevenLabs TTS API key (server-side, used by `/api/tts`)
- `GITHUB_TOKEN` — PAT with `contents:write` on `worrellburton/sam`; powers `/api/dev/*` writes to `src/data/blog.ts`
- `ANTHROPIC_API_KEY` — optional, used by `/api/dev/generate-prompt` + `/generate-alt`
- `GEMINI_API_KEY` — optional, used by `/api/dev/generate-image`
- `DEV_PANEL_SECRET` — **required in production** to unlock the `/dev` UI + `/api/dev/*` routes. Missing value → panel fails closed with 503. See `src/lib/dev-auth.ts`.
- `GOOGLE_SITE_VERIFICATION` — Google Search Console HTML-tag verification token. When set, Next renders `<meta name="google-site-verification" content="…">` in `<head>` via `metadata.verification.google` in `src/app/layout.tsx`.

**Client-safe (`NEXT_PUBLIC_` prefix, shipped to the browser):**

- `NEXT_PUBLIC_SITE_URL` — canonical site URL for SEO
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key (public by design; RLS protects data)

> Never prefix API secrets with `NEXT_PUBLIC_` — it embeds them in the client bundle.

## Development Notes

- Static and display pages (`/about`, `/faq`, `/contact`, `/reviews`, `/blog`, `/blog/[slug]`, `/services/[slug]`, `/conditions/[slug]`) are Server Components with per-page `metadata`. Interactive bits are hydration islands under `src/components/` (e.g. `FaqAccordion`, `ContactForm`, `GoogleReviewsGrid`, `BlogAudioPlayer`, `BlogReveal`, `AnimatedStat`).
- Theme toggle saves to localStorage, default is light
- Legacy CSS uses CSS variables for theming (`:root` and `[data-theme="light"]`)
- Navigation auto-closes on route change
- Service, blog, condition, FAQ content are data-driven from `src/data/` files (`services.ts`, `service-content.ts`, `conditions.ts`, `condition-content.ts`, `blog.ts`, `faq.ts`, `patient-reviews.ts`).
- Booking is external: all "Book" CTAs link to the Zocdoc profile (`https://www.zocdoc.com/doctor/sam-elguizaoui-md-236423`). There is no in-app booking route.
- Shared icon library: `src/components/icons.tsx` (use `<Icon.Star />` etc.). Shared review card: `src/components/ReviewCard.tsx`.
- Structured logging: use `logError(scope, err, context?)` from `@/lib/log` instead of silent `.catch(() => {})`.
- Persistent client cache: `@/lib/idb` wraps IndexedDB; hooks hydrate TTS blobs across reloads.
- Accessibility: a global skip-to-content link targets `<main id="main">`, and `prefers-reduced-motion` disables reveal animations and marquees.

## Scripts

- `npm run dev` — dev server (Turbopack)
- `npm run build` — production build
- `npm run typecheck` — `tsc --noEmit`
- `npm test` — Vitest unit tests (`src/**/*.test.ts`, node env)
- `npm run lint` / `npm run format`

> To restore the bundle analyzer: `npm install --save-dev @next/bundle-analyzer` (commits the lockfile), then re-wrap `nextConfig` in `next.config.ts` and re-add `"analyze": "ANALYZE=true next build"` to `package.json`.

## CI

`.github/workflows/ci.yml` runs on every PR against `main`:
- Typecheck (`npm run typecheck`)
- ESLint (`npm run lint`)
- Unit tests (`npm test`)
- Production build (gated to same-repo PRs so env secrets aren't exposed to fork builds).

## Deferred optimizations

Tracked here so future passes don't re-discover the same work:

1. **Oversized files** — `src/app/dev/blog/page.tsx` (2,385 lines), `src/data/blog.ts` (2,326). Candidates for extraction.
2. **Lighthouse CI + bundle-size budget** — add to `.github/workflows/ci.yml` against a Vercel preview URL.
