import { useEffect, useState, useCallback, createContext, useContext, lazy, Suspense } from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useNavigate,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { StickyBar } from "~/components/StickyBar";

const BookPage = lazy(() => import("~/routes/book"));

interface BookingContextType {
  openBooking: () => void;
  closeBooking: () => void;
  isBookingOpen: boolean;
}

export const BookingContext = createContext<BookingContextType>({
  openBooking: () => {},
  closeBooking: () => {},
  isBookingOpen: false,
});

export function useBooking() {
  return useContext(BookingContext);
}

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap",
  },
  { rel: "icon", type: "image/svg+xml", href: "/sammd/favicon.svg" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // If user navigates directly to /book, open the booking overlay
  useEffect(() => {
    if (location.pathname.startsWith("/book")) {
      setBookingOpen(true);
      // Navigate back to home so the site content is there underneath
      navigate("/", { replace: true });
    }
  }, []);

  const openBooking = useCallback(() => {
    setBookingOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const closeBooking = useCallback(() => {
    setBookingOpen(false);
  }, []);

  // Intercept clicks on any link to /book
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest("a, button");
      if (!target) return;

      const anchor = target as HTMLAnchorElement;
      const href = anchor.getAttribute("href") || "";
      const to = anchor.getAttribute("data-to") || "";

      // Check for links to /book or /sammd/book
      if (
        href === "/book" ||
        href === "/sammd/book" ||
        href.endsWith("/book") ||
        to === "/book"
      ) {
        e.preventDefault();
        e.stopPropagation();
        openBooking();
      }
    }

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [openBooking]);

  useEffect(() => {
    // IntersectionObserver for .reveal animations
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

  const isDevPage = location.pathname.startsWith("/dev");
  const isWebGLPage = location.pathname.startsWith("/webgl");
  const showChrome = !isDevPage && !isWebGLPage;

  return (
    <BookingContext.Provider value={{ openBooking, closeBooking, isBookingOpen: bookingOpen }}>
      {/* Booking layer — always rendered, sits behind the site */}
      <div className={`booking-layer${bookingOpen ? " booking-visible" : ""}`}>
        <Suspense fallback={null}>
          <BookPage />
        </Suspense>
      </div>

      {/* Site layer — fades out when booking opens */}
      <div className={`site-layer${bookingOpen ? " site-hidden" : ""}`}>
        {showChrome && <Navigation />}
        {showChrome && <StickyBar />}
        <Outlet />
        {showChrome && <Footer />}
      </div>
    </BookingContext.Provider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main style={{ padding: "4rem 2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre style={{ overflow: "auto", padding: "1rem" }}>
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
