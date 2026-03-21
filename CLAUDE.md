# CLAUDE.md

## Project Overview

Website for **Dr. Sameh Elguizaoui, M.D.** — a board-certified orthopedic surgeon & sports medicine specialist in NYC (Manhattan, Brooklyn, Scarsdale).

## Tech Stack

- **React Router v7** (framework mode, SPA)
- **React 19** + **TypeScript**
- **Vite 7** build tool
- **Tailwind CSS v4** + legacy CSS (`app/legacy.css`)
- GitHub Pages deployment via `.github/workflows/deploy.yml`

## Commands

- `npm run dev` — Start dev server
- `npm run build` — Production build (outputs to `build/client/`)
- `npm run start` — Start production server
- `npm run typecheck` — Run TypeScript checks

## Project Structure

```
app/
├── root.tsx              — Root layout (Nav + StickyBar + Footer)
├── routes.ts             — Route configuration
├── app.css               — Tailwind + legacy CSS import
├── legacy.css            — Original site styles (3400 lines)
├── components/
│   ├── Navigation.tsx    — Mega menu + mobile nav + theme toggle
│   ├── Footer.tsx        — Site footer
│   ├── StickyBar.tsx     — Floating bottom bar with rating
│   ├── GetStarted.tsx    — CTA section
│   └── Locations.tsx     — Google Maps locations section
├── data/
│   ├── services.ts       — 6 service pages content
│   ├── blog.ts           — 6 blog posts content
│   └── locations.ts      — 3 office locations
├── hooks/
│   ├── useTheme.ts       — Dark/light theme with localStorage
│   └── useScrollPosition.ts — Scroll position + direction
└── routes/
    ├── home.tsx           — Homepage (/)
    ├── about.tsx          — About page (/about)
    ├── contact.tsx        — Contact page (/contact)
    ├── reviews.tsx        — Reviews page (/reviews)
    ├── faq.tsx            — FAQ page (/faq)
    ├── blog.tsx           — Blog listing (/blog)
    ├── blog-post.tsx      — Blog post (/blog/:slug)
    ├── book.tsx           — Booking page (/book)
    └── service.tsx        — Service page (/services/:slug)
```

## Deployment

- Auto-deploys to GitHub Pages on push to `main` or `claude/**` branches
- Build step: `npm ci && npm run build`
- Serves from `build/client/`
- Live URL: https://rwb8771.github.io/sammd/
- `basename: "/sammd/"` configured in `react-router.config.ts`

## Development Notes

- SPA mode (`ssr: false` in react-router.config.ts)
- Theme toggle saves to localStorage, default is light
- Legacy CSS uses CSS variables for theming (`:root` and `[data-theme="light"]`)
- Navigation auto-closes on route change
- Service and blog pages are data-driven from `app/data/` files
