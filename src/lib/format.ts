// Small pure formatting helpers shared across components (and unit-tested
// in src/lib/__tests__). Kept free of React so they can be imported from
// both server and client code and exercised in a plain node test env.

/** Initials for an avatar fallback, e.g. "Sarah M." → "SM", "Cher" → "CH". */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
