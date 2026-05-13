// Scopes src/styles/legacy.css to the marketing route segments. /dev
// renders under a sibling segment and never pays for the ~7.5k lines
// of marketing-only styles. Theme vars + reset live in theme.css
// (imported from globals.css) so they stay global.

import "@/styles/legacy.css";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
