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
          <svg className="sticky-bar-zocdoc-icon" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="11" fill="#4DB77A" />
            <text x="12" y="16.5" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="700" fontFamily="Inter, sans-serif">Z</text>
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
                  <Image src="https://cdn.brandfetch.io/newyorkjets.com/w/32/h/32/theme/dark/fallback/lettermark/type/icon?c=1id3n10pdBTarCHI0db" alt="NY Jets" width={32} height={32} className="sticky-team-logo" referrerPolicy="origin" loading="eager" />{" "}
                  NY Jets Team Physician
                </span>
                <span className="sticky-bar-dot">·</span>
                <span className="sticky-highlight">
                  <Image src="https://cdn.brandfetch.io/newyorkislanders.com/w/32/h/32/theme/dark/fallback/lettermark/type/icon?c=1id3n10pdBTarCHI0db" alt="NY Islanders" width={32} height={32} className="sticky-team-logo" referrerPolicy="origin" loading="eager" />{" "}
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
