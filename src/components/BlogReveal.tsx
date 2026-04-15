"use client";

import { useEffect } from "react";

// Attaches an IntersectionObserver to `.blog-reveal` / `.blog-reveal-left`
// / `.blog-reveal-scale` elements so they fade in as the reader scrolls.
// Previously lived inline in the blog page's client component; now it's a
// tiny hydration-only island next to the server-rendered article body.
export function BlogReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        }),
      { threshold: 0.1 },
    );
    document
      .querySelectorAll(".blog-reveal, .blog-reveal-left, .blog-reveal-scale")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return null;
}
