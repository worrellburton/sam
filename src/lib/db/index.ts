/**
 * DB helpers — typed, thin wrappers over the Supabase client.
 *
 * These helpers are safe to call from Server Components, Route Handlers,
 * and (via the anon key) Client Components. They all return plain data
 * (no Supabase response envelopes) and log errors server-side.
 */
export * as blog from "./blog";
export * as patients from "./patients";
export * as appointments from "./appointments";
export * as booking from "./booking";
export * as providers from "./providers";
export * as locations from "./locations";
export * as reviews from "./reviews";
