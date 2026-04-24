import type { NextConfig } from "next";

// Note: @next/bundle-analyzer was previously wired here so `npm run
// analyze` could render a treemap. It was removed from the lockfile
// sync, breaking Vercel's `npm ci` step — and the dep isn't used on
// every build. To restore: `npm install --save-dev @next/bundle-analyzer`
// locally (which commits the lockfile diff) and wrap `nextConfig`
// again. Keeping the config plain avoids "lockfile out of sync"
// failures for everyone.

const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://maps.googleapis.com https://va.vercel-scripts.com https://accounts.google.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https://images.unsplash.com https://placehold.co https://maps.googleapis.com https://maps.google.com https://www.google-analytics.com https://www.googletagmanager.com https://wgznytmxwslupjhsdeha.supabase.co",
  "media-src 'self' blob: https://wgznytmxwslupjhsdeha.supabase.co",
  "font-src 'self' https://fonts.gstatic.com",
  "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://www.googletagmanager.com https://maps.googleapis.com https://va.vercel-scripts.com https://vercel-insights.com https://accounts.google.com https://wgznytmxwslupjhsdeha.supabase.co",
  "frame-src 'self' https://maps.google.com https://www.google.com https://accounts.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["@supabase/supabase-js"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "a.espncdn.com" },
      { protocol: "https", hostname: "cdn.brandfetch.io" },
      // Branded thumbnail placeholder served by placehold.co. Every blog
      // post that hasn't had a real thumbnail generated via /dev/blog yet
      // points here so they're visually obvious + easy to grep for.
      { protocol: "https", hostname: "placehold.co" },
      // Supabase Storage: blog thumbnails bucket (public read).
      {
        protocol: "https",
        hostname: "wgznytmxwslupjhsdeha.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    // Allow query strings on local paths so the dev panel can cache-bust
    // blog thumbnails by appending ?v=<timestamp> after re-uploading the
    // same filename. Without this, Next.js 16 refuses the URL at build time.
    localPatterns: [
      { pathname: "/images/**", search: "" },
      { pathname: "/images/**", search: "**" },
      { pathname: "/**", search: "" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspDirectives,
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
