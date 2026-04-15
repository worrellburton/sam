import { DoczocPlatformShell } from "@/components/DoczocPlatformShell";

// Every page under /doczoc/(platform)/* renders inside the shared
// DoczocPlatformShell — that component mounts <PlatformBg>, <Sidebar>,
// and the dz-platform wrapper exactly once, then provides `collapsed`
// via context so each page's <main> can still toggle `dz-main-expanded`.
//
// Routes that aren't "platform" surfaces (the /doczoc landing page,
// /doczoc/deck slides, /doczoc/signin screen) sit outside this route
// group and render without the shell.

export default function DoczocPlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DoczocPlatformShell>{children}</DoczocPlatformShell>;
}
