import type { MetadataRoute } from "next";
import { allBlogPosts, isPostReleased } from "@/data/blog";
import { services } from "@/data/services";
import { conditions } from "@/data/conditions";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://sammd.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly" as const, priority: 1 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly" as const, priority: 0.9 },
    { url: `${SITE_URL}/contact`, changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${SITE_URL}/book`, changeFrequency: "monthly" as const, priority: 0.9 },
    { url: `${SITE_URL}/reviews`, changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${SITE_URL}/faq`, changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${SITE_URL}/blog`, changeFrequency: "weekly" as const, priority: 0.8 },
  ].map((r) => ({ ...r, lastModified: now }));

  const serviceRoutes: MetadataRoute.Sitemap = services.map((s) => ({
    url: `${SITE_URL}/services/${s.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const conditionRoutes: MetadataRoute.Sitemap = conditions.map((c) => ({
    url: `${SITE_URL}/conditions/${c.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const blogRoutes: MetadataRoute.Sitemap = allBlogPosts
    .filter((p) => isPostReleased(p, now))
    .map((p) => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      lastModified: p.date ? new Date(p.date) : now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

  return [...staticRoutes, ...serviceRoutes, ...conditionRoutes, ...blogRoutes];
}
