"use client";

import { useEffect, type RefObject } from "react";

// Fades a container's child items in/out as they scroll through the
// viewport. Each matched item is expected to start at opacity:0 (inline
// or via CSS); this hook maps its IntersectionObserver ratio to opacity
// + a small translateY so cards softly float into view.
//
// `resetKey` MUST change whenever the *set* of rendered items changes
// (not just the count) — otherwise the observer keeps watching stale,
// removed nodes and freshly mounted items stay stuck at opacity:0.
export function useFadeInOnScroll(
  containerRef: RefObject<HTMLElement | null>,
  itemSelector: string,
  resetKey: string,
) {
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const items = root.querySelectorAll<HTMLElement>(itemSelector);

    // Respect prefers-reduced-motion — just show everything at full
    // opacity, no animation.
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      items.forEach((el) => (el.style.opacity = "1"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const el = e.target as HTMLElement;
          const ratio = e.intersectionRatio;
          el.style.opacity = String(Math.max(0.15, Math.min(1, ratio * 1.6)));
          el.style.transform = `translateY(${(1 - ratio) * 16}px)`;
        }
      },
      {
        threshold: Array.from({ length: 21 }, (_, i) => i / 20),
        rootMargin: "-10% 0px -25% 0px",
      },
    );
    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [containerRef, itemSelector, resetKey]);
}
