# CLAUDE.md

## Project Overview

Website for **Dr. Sameh Elguizaoui, M.D.** — a board-certified orthopedic surgeon & sports medicine specialist in NYC (Manhattan, Brooklyn, Scarsdale). Includes a companion SaaS platform called **DocZoc** at `/doczoc/*`.

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
│   ├── book/page.tsx         — Booking page
│   ├── blog/page.tsx         — Blog listing
│   ├── blog/[slug]/page.tsx  — Blog post
│   ├── services/[slug]/page.tsx    — Service page
│   ├── conditions/[slug]/page.tsx  — Condition page
│   └── doczoc/              — DocZoc SaaS platform (24 pages)
│       ├── dashboard/page.tsx — Dashboard + shared Sidebar/useDzPrefs
│       ├── patients/page.tsx  — Patient list
│       ├── billing/page.tsx   — Claims & billing
│       └── ...               — Other DocZoc pages
├── components/
│   ├── ClientLayout.tsx      — Client layout wrapper (BookingContext, nav, footer, theme)
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
    ├── useAthena.ts          — athenahealth EHR API integration
    ├── useStedi.ts           — Stedi claims API
    ├── useApiStatus.ts       — API status monitoring
    ├── useCrosshairFocus.tsx  — Table focus/crosshair UI
    ├── useDragReorder.ts     — Drag reorder lists
    ├── useDraggableColumns.ts — Draggable table columns
    └── useElevenLabs.ts      — ElevenLabs TTS API
```

## Deployment

- Deploys to **Vercel** automatically on push
- Build command: `npm run build`
- Framework: Next.js (auto-detected)

## Environment Variables

Set in Vercel dashboard or `.env.local`. See `.env.example` for the full list.

**Server-only secrets (never `NEXT_PUBLIC_`):**

- `ATHENA_CLIENT_ID` — athenahealth OAuth client ID
- `ATHENA_CLIENT_SECRET` — athenahealth OAuth client secret
- `ATHENA_ENV` — athenahealth environment (preview/production) used server-side
- `GOOGLE_PLACES_API_KEY` — used by `/api/places`
- `GOOGLE_MAPS_SERVER_KEY` — used by `/api/maps`
- `STEDI_API_KEY` — Stedi healthcare API key (server-side)
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
- `NEXT_PUBLIC_ATHENA_ENV` — non-secret athena environment string
- `NEXT_PUBLIC_ATHENA_PRACTICE_ID` — non-secret practice ID

> Never prefix API secrets with `NEXT_PUBLIC_` — it embeds them in the client bundle.

## Development Notes

- Static and display pages (`/about`, `/faq`, `/contact`, `/reviews`, `/blog`, `/blog/[slug]`, `/services/[slug]`, `/conditions/[slug]`) are now Server Components with per-page `metadata`. Interactive bits are hydration islands under `src/components/` (e.g. `FaqAccordion`, `ContactForm`, `GoogleReviewsGrid`, `BlogAudioPlayer`, `BlogReveal`, `AnimatedStat`).
- `/book` and all of `/doczoc/*` remain client components — migration deferred due to their interactivity.
- Theme toggle saves to localStorage, default is light
- Legacy CSS uses CSS variables for theming (`:root` and `[data-theme="light"]`)
- DocZoc-specific CSS lives in `src/styles/doczoc.css` and is loaded only under `/doczoc/*` via `src/app/doczoc/layout.tsx`.
- Navigation auto-closes on route change
- Service, blog, condition, FAQ content are data-driven from `src/data/` files (`services.ts`, `service-content.ts`, `conditions.ts`, `condition-content.ts`, `blog.ts`, `faq.ts`, `patient-reviews.ts`).
- DocZoc pages currently mount `Sidebar` and `useDzPrefs` individually; a shared layout consolidation is deferred.
- `BookingContext` exported from `src/components/ClientLayout.tsx`
- Shared icon library: `src/components/icons.tsx` (use `<Icon.Star />` etc.). Shared review card: `src/components/ReviewCard.tsx`.
- Structured logging: use `logError(scope, err, context?)` from `@/lib/log` instead of silent `.catch(() => {})`.
- Persistent client cache: `@/lib/idb` wraps IndexedDB; hooks hydrate TTS blobs + Athena tokens across reloads.
- Accessibility: a global skip-to-content link targets `<main id="main">`, and `prefers-reduced-motion` disables reveal animations and marquees.

## Scripts

- `npm run dev` — dev server (Turbopack)
- `npm run build` — production build
- `npm run typecheck` — `tsc --noEmit`
- `npm run lint` / `npm run format`

> To restore the bundle analyzer: `npm install --save-dev @next/bundle-analyzer` (commits the lockfile), then re-wrap `nextConfig` in `next.config.ts` and re-add `"analyze": "ANALYZE=true next build"` to `package.json`.

## CI

`.github/workflows/ci.yml` runs on every PR against `main`:
- Typecheck (`npm run typecheck`)
- ESLint (`npm run lint`)
- Production build (gated to same-repo PRs so env secrets aren't exposed to fork builds).

## Deferred optimizations

Tracked here so future passes don't re-discover the same work:

1. **Book page SC migration** — `/book` is 1,300+ lines of interactive state. Candidate for splitting into smaller islands.
2. **DocZoc Sidebar consolidation** — 21 DocZoc pages still mount `<Sidebar />` and `useDzPrefs()` individually. Route-level `layout.tsx` only scopes CSS today.
3. **Oversized files** — `src/app/dev/blog/page.tsx` (2,385 lines), `src/app/doczoc/calendar/page.tsx` (1,324), `src/app/book/page.tsx` (1,302), `src/data/blog.ts` (2,326). Candidates for extraction.
4. **DocZoc per-page metadata** — unlocked once the DocZoc SC migration lands.
5. **Lighthouse CI + bundle-size budget** — add to `.github/workflows/ci.yml` against a Vercel preview URL.
