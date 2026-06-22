// Centralized, typed access to environment configuration.
//
// Keeps the canonical site URL (and its fallback) in one place instead of
// repeating `process.env.NEXT_PUBLIC_SITE_URL || "https://…"` in ~15
// files, and gives server code a single helper for required secrets that
// fails loudly with a clear message instead of silently using "".

export const DEFAULT_SITE_URL = "https://www.sportsorthomd.com";

/** Canonical site origin used for SEO/canonical links. Safe on client and
 *  server — NEXT_PUBLIC_SITE_URL is inlined at build time. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL;

/**
 * Reads a server-only environment variable, returning "" when unset.
 * Use for optional integrations (API keys) whose routes already degrade
 * gracefully when the key is missing.
 */
export function serverEnv(name: string): string {
  return process.env[name] || "";
}

/**
 * Reads a required server-only secret, throwing if it's missing. Use at
 * the point of need (not module top-level) so a missing secret surfaces
 * a clear error on the request that needs it rather than at import time.
 */
export function requireServerEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}
