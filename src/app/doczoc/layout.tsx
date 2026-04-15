import type { Metadata } from "next";

// Scopes the ~6.5k lines of DocZoc-specific CSS to just the /doczoc/*
// route segment so the marketing pages never pay for them.
// Also applies shared metadata (noindex — the DocZoc SaaS surface is a
// demo product, not content we want indexed against the doctor's site).
import "@/styles/doczoc.css";

export const metadata: Metadata = {
  title: {
    default: "DocZoc",
    template: "%s | DocZoc",
  },
  description: "DocZoc — orthopedic practice operating system.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function DoczocLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
