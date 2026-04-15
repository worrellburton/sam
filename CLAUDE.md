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

- All page components use `"use client"` directive (client-side rendering)
- Theme toggle saves to localStorage, default is light
- Legacy CSS uses CSS variables for theming (`:root` and `[data-theme="light"]`)
- Navigation auto-closes on route change
- Service, blog, and condition pages are data-driven from `src/data/` files
- DocZoc pages share `Sidebar` and `useDzPrefs` exported from `doczoc/dashboard/page.tsx`
- `BookingContext` exported from `src/components/ClientLayout.tsx`
