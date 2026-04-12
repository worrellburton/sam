"use client";

import { useEffect, useState, useCallback, lazy, Suspense } from "react";
import { usePathname } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { StickyBar } from "@/components/StickyBar";
import { useTheme } from "@/hooks/useTheme";
import { BookingContext } from "@/lib/BookingContext";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [bookingOpen, setBookingOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  const openBooking = useCallback(() => {
    setBookingOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const closeBooking = useCallback(() => {
    setBookingOpen(false);
  }, []);

  // Scroll to top on route change (fixes mobile back-to-top issue)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Intercept clicks on any link to /book
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest("a, button");
      if (!target) return;

      const anchor = target as HTMLAnchorElement;
      const href = anchor.getAttribute("href") || "";
      const to = anchor.getAttribute("data-to") || "";

      if (href === "/book" || href.endsWith("/book") || to === "/book") {
        e.preventDefault();
        e.stopPropagation();
        openBooking();
      }
    }

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [openBooking]);

  // IntersectionObserver for .reveal animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    function observeRevealElements() {
      document
        .querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-stagger")
        .forEach((el) => {
          if (!el.classList.contains("visible")) {
            observer.observe(el);
          }
        });
    }

    observeRevealElements();

    const mutationObserver = new MutationObserver(() => {
      observeRevealElements();
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    const bgElements = document.querySelectorAll(".move-easier-bg");
    if (bgElements.length > 1) {
      let currentSlide = 0;
      const interval = setInterval(() => {
        bgElements[currentSlide]?.classList.remove("active");
        currentSlide = (currentSlide + 1) % bgElements.length;
        bgElements[currentSlide]?.classList.add("active");
      }, 4000);
      return () => {
        clearInterval(interval);
        observer.disconnect();
        mutationObserver.disconnect();
      };
    }

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  // Specialty video playback:
  //  - Desktop (fine pointer): play only while the card is hovered
  //  - Mobile / touch: play when the video is ~centered in the viewport
  useEffect(() => {
    const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;

    const hoverHandlers = new WeakMap<HTMLElement, { enter: () => void; leave: () => void }>();
    let videoObserver: IntersectionObserver | null = null;

    if (isTouch) {
      videoObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const video = entry.target as HTMLVideoElement;
            if (entry.isIntersecting) {
              video.play().catch(() => {});
            } else {
              video.pause();
            }
          });
        },
        { threshold: 0.5 }
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
  }, [pathname]);

  const isDocZocPage = pathname.startsWith("/doczoc");
  const isDevPage = pathname.startsWith("/dev");
  const showChrome = !isDocZocPage && !isDevPage;

  return (
    <BookingContext.Provider value={{ openBooking, closeBooking, isBookingOpen: bookingOpen }}>
      {/* Booking layer — always rendered, sits behind the site */}
      <div className={`booking-layer${bookingOpen ? " booking-visible" : ""}`}>
        {/* BookPage will be added in Batch 3 */}
      </div>

      {/* Site layer — fades out when booking opens */}
      <div className={`site-layer${bookingOpen ? " site-hidden" : ""}`}>
        {showChrome && <Navigation />}
        {showChrome && <StickyBar />}
        {children}
        {showChrome && <Footer />}
        {showChrome && (
          <button className="theme-toggle-fixed" onClick={toggleTheme} aria-label="Toggle theme">
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
      </div>
    </BookingContext.Provider>
  );
}
