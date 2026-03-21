# CLAUDE.md

## Project Overview

Static website for **Dr. Sameh Elguizaoui, M.D.** — a board-certified orthopedic surgeon & sports medicine specialist in NYC (Manhattan, Brooklyn, Scarsdale).

## Tech Stack

- Plain HTML/CSS (no build tools, no JavaScript framework)
- Single `styles.css` for all styling
- GitHub Pages deployment via `.github/workflows/deploy.yml`

## Site Structure

- `index.html` — Main landing page
- `blog.html` — Blog/articles listing
- `faq.html` — Frequently asked questions
- `arthroscopic-surgery.html` — Service page
- `cartilage-repair.html` — Service page
- `joint-preservation.html` — Service page
- `regenerative-medicine.html` — Service page
- `shoulder-knee-surgery.html` — Service page
- `sports-medicine.html` — Service page
- `styles.css` — Global stylesheet
- `header.jpg` — Header image
- `media` — Media directory placeholder

## Deployment

- Auto-deploys to GitHub Pages on push to `main` or `claude/**` branches
- No build step — files are served as-is
- Live URL: https://rwb8771.github.io/sammd/

## Development Notes

- No package manager, linter, or test suite — this is a static site
- All pages share the same CSS file (`styles.css`)
- Site uses a dark theme (`data-theme="dark"`)
- Navigation uses a mega menu pattern across all pages
