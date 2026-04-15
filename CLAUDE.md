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

**Client-safe (`NEXT_PUBLIC_` prefix, shipped to the browser):**

- `NEXT_PUBLIC_SITE_URL` — canonical site URL for SEO
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key (public by design; RLS protects data)
- `NEXT_PUBLIC_ATHENA_ENV` — non-secret athena environment string
- `NEXT_PUBLIC_ATHENA_PRACTICE_ID` — non-secret practice ID

> Never prefix API secrets with `NEXT_PUBLIC_` — it embeds them in the client bundle.

## Development Notes

- Most page components currently use `"use client"`. New static/display pages should prefer Server Components — see _Deferred optimizations_ below.
- Theme toggle saves to localStorage, default is light
- Legacy CSS uses CSS variables for theming (`:root` and `[data-theme="light"]`)
- DocZoc-specific CSS lives in `src/styles/doczoc.css` and is loaded only under `/doczoc/*` via `src/app/doczoc/layout.tsx`.
- Navigation auto-closes on route change
- Service, blog, and condition pages are data-driven from `src/data/` files
- DocZoc pages share `Sidebar` and `useDzPrefs` exported from `doczoc/dashboard/page.tsx`
- `BookingContext` exported from `src/components/ClientLayout.tsx`
- Shared icon library: `src/components/icons.tsx` (use `<Icon.Star />` etc.). Shared review card: `src/components/ReviewCard.tsx`.

## Scripts

- `npm run dev` — dev server (Turbopack)
- `npm run build` — production build
- `npm run analyze` — production build with the bundle analyzer enabled (opens treemaps)
- `npm run typecheck` — `tsc --noEmit`
- `npm run lint` / `npm run format`

## Deferred optimizations

Tracked here so future passes don't re-discover the same work:

1. **Server Component migration** — most `src/app/**/page.tsx` files still carry `"use client"` even when they only render static data. The dynamic `[slug]` routes use `useParams()` and would need to be converted to accept `params` as a prop (plus `generateMetadata`). Big Core Web Vitals win when tackled.
2. **`/doczoc/v2/page.tsx`** — no inbound references anywhere in the codebase; likely dead. Left in place pending confirmation; noindex via `/doczoc/layout.tsx`.
3. **Shared DocZoc layout** — 24 DocZoc pages each mount `Sidebar` and `useDzPrefs` independently. The route-level `layout.tsx` currently only scopes the CSS; moving the Sidebar into the layout would DRY up ~24 files.
4. **Oversized files** — `src/app/dev/blog/page.tsx` (2,385 lines), `src/app/doczoc/calendar/page.tsx` (1,324), `src/app/book/page.tsx` (1,302), `src/data/blog.ts` (2,326). Candidates for extraction.
5. **Silent `.catch(() => {})`** — several hooks swallow errors; swap for logged fallbacks.
6. **Persistent client cache** — `useElevenLabs` and `useAthena` token cache live in memory only. IndexedDB would survive reloads.
7. **Metadata on DocZoc sub-pages** — the layout provides defaults; per-page `export const metadata` would sharpen titles.
