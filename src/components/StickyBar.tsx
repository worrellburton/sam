"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export function StickyBar() {
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

  const visible = !nearBottom;

  return (
    <div className={`sticky-bottom-bar${visible ? " visible" : ""}`} role="complementary" aria-label="Quick info bar">
      <div className="sticky-bar-info">
        <Link href="/reviews" className="sticky-bar-rating">
          <svg className="sticky-bar-zocdoc-icon" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="11" fill="#FFD60A" />
            <text x="12" y="16.5" textAnchor="middle" fill="#1a1a1a" fontSize="13" fontWeight="700" fontFamily="Inter, sans-serif">Z</text>
          </svg>
          <span className="sticky-bar-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
          <span className="sticky-bar-rating-text">4.8</span>
          <span className="sticky-bar-review-count">(1,469 reviews)</span>
        </Link>
        <div className="sticky-bar-divider"></div>
        <div className="sticky-bar-marquee">
          <div className="sticky-bar-track">
            {[1, 2].map((i) => (
              <span key={i} aria-hidden={i === 2 ? true : undefined}>
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
      <div className="sticky-bar-cta">
        <a
          href="https://www.zocdoc.com/doctor/sam-elguizaoui-md-236423"
          target="_blank"
          rel="noopener"
          className="sticky-bar-btn sticky-bar-btn-book"
          aria-label="Book a consultation on Zocdoc"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          Book Now
        </a>
        <a
          href="tel:+12125402265"
          className="sticky-bar-btn sticky-bar-btn-call"
          aria-label="Call Dr. Elguizaoui at (212) 540-2265"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          Call
        </a>
      </div>
    </div>
  );
}
