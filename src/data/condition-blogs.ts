import type { BlogPost } from "./blog";

// Maps condition text (as it appears in services.ts) to blog post slug.
// Currently empty — service pages fall back to /conditions/<slug> when no
// mapping exists here.
export const conditionToBlogSlug: Record<string, string> = {};

export const conditionBlogPosts: BlogPost[] = [];
