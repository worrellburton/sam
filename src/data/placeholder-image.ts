// Branded thumbnail placeholder used for blog posts + conditions that
// haven't had a real image generated via /dev/blog yet.
//
// Served by placehold.co — a free dynamic image generator that returns
// a real JPG at whatever dimensions we pass. Using it uniformly makes
// it obvious at a glance which entries still need a real thumbnail:
// open /blog or /dev/blog and every navy "Thumbnail Pending" card is
// a to-do item. Grep the codebase for `PLACEHOLDER_IMAGE` to count
// remaining work:
//
//   grep -rnc 'PLACEHOLDER_IMAGE' src/data/
//
// When you generate and save a real image via /dev/blog, the
// set-blog-image route overwrites this URL with the Supabase-hosted
// asset, dropping the count by one.

// Navy background (#0a1628) + tan text (#c9a96e) so it matches the
// site palette. Size hinted at 16:9 hero proportions — placehold.co
// renders letterboxed text regardless.
export const PLACEHOLDER_IMAGE =
  "https://placehold.co/1200x600/0a1628/c9a96e.jpg?text=Thumbnail+Pending";

// Explicit aspect-ratio variants for the 3:4 (card) and 1:1 (mobile)
// slots in blog.ts so the right proportions render on each surface.
export const PLACEHOLDER_IMAGE_3X4 =
  "https://placehold.co/900x1200/0a1628/c9a96e.jpg?text=Thumbnail+Pending";

export const PLACEHOLDER_IMAGE_1X1 =
  "https://placehold.co/1080x1080/0a1628/c9a96e.jpg?text=Thumbnail+Pending";
