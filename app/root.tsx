import { useEffect } from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { StickyBar } from "~/components/StickyBar";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap",
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

    // Re-observe after route changes (MutationObserver on body)
    const mutationObserver = new MutationObserver(() => {
      observeRevealElements();
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    // Move-easier slideshow
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

  return (
    <>
      <Navigation />
      <StickyBar />
      <Outlet />
      <Footer />
    </>
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
