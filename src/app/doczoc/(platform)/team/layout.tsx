import type { Metadata } from "next";

// Nested layout just for the title — the parent (platform) layout
// already handles the dz-* CSS + the DoczocPlatformShell wrapper.
// The root /doczoc layout sets a template of '%s | DocZoc', so this
// layout's `title` slots into it: 'Team | DocZoc'.
export const metadata: Metadata = {
  title: "Team",
};

export default function DoczocPlatformSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
