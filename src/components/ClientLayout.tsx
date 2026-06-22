"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { StickyBar } from "@/components/StickyBar";
import { useTheme } from "@/hooks/useTheme";
import { useScrollPosition } from "@/hooks/useScrollPosition";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const { scrollY } = useScrollPosition();
  // Hide the floating theme toggle while the hero is in view — the hero
  // doesn't change with theme, so the control is meaningless there.
  const showThemeToggle = scrollY > 100;

  // Scroll to top on route change (fixes mobile back-to-top issue)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const isDevRoute = pathname.startsWith("/dev");
  const isMarketingRoute = !isDevRoute;

  // IntersectionObserver for .reveal animations. Only marketing routes
  // use these classes, so skip the whole setup on /dev.
  // Previously we ran a MutationObserver on document.body to catch
  // dynamically-injected reveal targets, but the only real source of
  // new targets is route changes — which the pathname dep already
  // handles. Dropping the body-wide observer removes a persistent cost
  // that fired on every DOM mutation (lazy images, hydration, etc.).
  useEffect(() => {
    if (!isMarketingRoute) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );

    document
      .querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-stagger")
      .forEach((el) => {
        if (!el.classList.contains("visible")) {
          observer.observe(el);
        }
      });

    return () => observer.disconnect();
  }, [pathname, isMarketingRoute]);

  // Specialty video playback (homepage only):
  //  - Desktop (fine pointer): play only while the card is hovered
  //  - Mobile / touch: play when the video is ~centered in the viewport
  useEffect(() => {
    if (!isMarketingRoute) return;
    const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;

    const hoverHandlers = new WeakMap<HTMLElement, { enter: () => void; leave: () => void }>();
    let videoObserver: IntersectionObserver | null = null;

    // On touch devices, track which video is most-visible and play only
    // that one — avoids multiple autoplaying videos thrashing bandwidth
    // and stacking audio (even if muted, decoders are finite).
    const videoVisibility = new Map<HTMLVideoElement, number>();

    if (isTouch) {
      videoObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            videoVisibility.set(
              entry.target as HTMLVideoElement,
              entry.intersectionRatio
            );
          });
          let best: HTMLVideoElement | null = null;
          let bestRatio = 0.35;
          for (const [v, ratio] of videoVisibility) {
            if (ratio > bestRatio) {
              best = v;
              bestRatio = ratio;
            }
          }
          videoVisibility.forEach((_, v) => {
            if (v === best) {
              v.play().catch(() => {});
            } else if (!v.paused) {
              v.pause();
            }
          });
        },
        { threshold: [0, 0.15, 0.3, 0.5, 0.7, 0.85, 1] }
      );
    }

    function attach() {
      document.querySelectorAll<HTMLVideoElement>(".specialty-video").forEach((video) => {
        if (isTouch) {
          videoObserver?.observe(video);
        } else {
          video.pause();
          const card = (video.closest(".specialty-card") as HTMLElement) || video;
          const enter = () => video.play().catch(() => {});
          const leave = () => {
            video.pause();
            video.currentTime = 0;
          };
          card.addEventListener("mouseenter", enter);
          card.addEventListener("mouseleave", leave);
          hoverHandlers.set(card, { enter, leave });
        }
      });
    }

    const timer = setTimeout(attach, 500);

    return () => {
      clearTimeout(timer);
      videoObserver?.disconnect();
      document.querySelectorAll<HTMLVideoElement>(".specialty-video").forEach((video) => {
        const card = (video.closest(".specialty-card") as HTMLElement) || video;
        const h = hoverHandlers.get(card);
        if (h) {
          card.removeEventListener("mouseenter", h.enter);
          card.removeEventListener("mouseleave", h.leave);
        }
      });
    };
  }, [pathname, isMarketingRoute]);

  const showChrome = isMarketingRoute;

  return (
    <>
      {/* Skip link — only visible when focused via keyboard.
          Targets the <main id="main"> wrapper below. */}
      <a href="#main" className="skip-to-content">
        Skip to main content
      </a>
      {showChrome && <Navigation />}
      {showChrome && <StickyBar />}
      <main id="main">{children}</main>
      {showChrome && <Footer />}
      {showChrome && (
        <button
          className={`theme-toggle-fixed${showThemeToggle ? " visible" : ""}`}
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          aria-pressed={theme === "dark"}
          title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
        >
          <svg className="icon-sun" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
          <svg className="icon-moon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </button>
      )}
    </>
  );
}
