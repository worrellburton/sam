"use client";

import { createContext, useContext, useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/lib/doczoc/Sidebar";
import { useDzPrefs } from "@/lib/doczoc/useDzPrefs";
import { PlatformBg } from "@/components/PlatformBg";

// Consolidates the `<div class="dz-platform"> + <PlatformBg> + <Sidebar>`
// boilerplate that used to live at the top of every /doczoc/* page.
//
// Pages now render just the inner content (typically their own <main>).
// They pull the `collapsed` flag via `useDoczocCollapsed()` if they need
// to toggle the `dz-main-expanded` class on their <main>.
//
// A handful of /doczoc/* routes aren't "platform" surfaces (the landing
// page, slide deck, signin screen). Those sit outside the (platform)
// route group and don't get wrapped.

type Ctx = {
  collapsed: boolean;
  toggle: () => void;
};

const DoczocCollapsedContext = createContext<Ctx | null>(null);

export function useDoczocCollapsed(): Ctx {
  const ctx = useContext(DoczocCollapsedContext);
  if (!ctx) {
    // Graceful default for pages that opt out of the shell — they just
    // always render in the "expanded" state.
    return { collapsed: false, toggle: () => {} };
  }
  return ctx;
}

export function DoczocPlatformShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { bgId } = useDzPrefs();

  const toggle = () => setCollapsed((c) => !c);

  return (
    <DoczocCollapsedContext.Provider value={{ collapsed, toggle }}>
      <div
        className="dz-platform"
        data-pathname={pathname}
        data-collapsed={collapsed ? "true" : "false"}
      >
        <PlatformBg bgId={bgId} />
        <Sidebar collapsed={collapsed} onToggle={toggle} />
        {children}
      </div>
    </DoczocCollapsedContext.Provider>
  );
}
