// Scopes src/styles/legacy.css to the marketing route segments. DocZoc
// and /dev render under sibling segments and never pay for the ~7.5k
// lines of marketing-only styles. Theme vars + reset live in theme.css
// (imported from globals.css) so they stay global.

import "@/styles/legacy.css";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
