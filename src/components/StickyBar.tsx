"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useScrollPosition } from "@/hooks/useScrollPosition";

export function StickyBar() {
  const { scrollY } = useScrollPosition();
  const [nearBottom, setNearBottom] = useState(false);

  useEffect(() => {
    function checkBottom() {
      const scrollBottom = window.innerHeight + window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      setNearBottom(docHeight - scrollBottom < 300);
    }
    window.addEventListener("scroll", checkBottom, { passive: true });
    checkBottom();
    return () => window.removeEventListener("scroll", checkBottom);
  }, []);

  const visible = scrollY > 300 && !nearBottom;

  return (
    <div className={`sticky-bottom-bar${visible ? " visible" : ""}`} role="complementary" aria-label="Quick info bar">
      <div className="sticky-bar-info">
        <Link href="/reviews" className="sticky-bar-rating">
          <svg className="sticky-bar-google-icon" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          <span className="sticky-bar-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
          <span className="sticky-bar-rating-text">4.8</span>
          <span className="sticky-bar-review-count">(1,469 reviews)</span>
        </Link>
        <div className="sticky-bar-divider"></div>
        <div className="sticky-bar-marquee">
          <div className="sticky-bar-track">
            {[1, 2].map((i) => (
              <span key={i}>
                <span className="sticky-highlight">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>{" "}
                  Board Certified
                </span>
                <span className="sticky-bar-dot">·</span>
                <span className="sticky-highlight">
                  <Image src="https://cdn.brandfetch.io/newyorkjets.com/w/32/h/32/theme/dark/fallback/lettermark/type/icon?c=1id3n10pdBTarCHI0db" alt="NY Jets" width={32} height={32} className="sticky-team-logo" referrerPolicy="origin" />{" "}
                  NY Jets Team Physician
                </span>
                <span className="sticky-bar-dot">·</span>
                <span className="sticky-highlight">
                  <Image src="https://cdn.brandfetch.io/newyorkislanders.com/w/32/h/32/theme/dark/fallback/lettermark/type/icon?c=1id3n10pdBTarCHI0db" alt="NY Islanders" width={32} height={32} className="sticky-team-logo" referrerPolicy="origin" />{" "}
                  NY Islanders Team Physician
                </span>
                <span className="sticky-bar-dot">·</span>
                <span>Lenox Hill Fellowship</span>
                <span className="sticky-bar-dot">·</span>
                <span>Minimally Invasive Surgery</span>
                <span className="sticky-bar-dot">·</span>
                <span>Ohio State Magna Cum Laude</span>
                <span className="sticky-bar-dot">·</span>
              </span>
            ))}
          </div>
        </div>
      </div>
      <a href="https://www.zocdoc.com/doctor/sam-elguizaoui-md-236423" target="_blank" rel="noopener" className="sticky-bar-btn">
        Book Now
      </a>
    </div>
  );
}
