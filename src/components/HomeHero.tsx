"use client";

import Image from "next/image";
import { useState } from "react";
import { HeroGradient } from "./HeroGradient";
import { HeroOverlayGradient } from "./HeroOverlayGradient";
import { HeroTicker } from "./HeroTicker";
import { Icon } from "./icons";

// Hero header lives in its own client island so the rest of the homepage
// can stay server-rendered. `heroReady` gates the `.hero-loaded` class
// that the legacy CSS uses to stagger entrance animations for the
// headline, rating card, ticker, etc.
export function HomeHero() {
  const [heroReady, setHeroReady] = useState(false);

  return (
    <header className={`hero${heroReady ? " hero-loaded" : ""}`} id="hero">
      <Image
        className={`hero-bg-img${heroReady ? " loaded" : ""}`}
        src="/images/header.jpg"
        alt="Dr. Sameh Elguizaoui performing orthopedic surgery"
        aria-hidden="true"
        width={1920}
        height={1080}
        sizes="100vw"
        priority
        onLoad={() => setHeroReady(true)}
      />
      <HeroGradient />
      <div className="hero-overlay"></div>
      <HeroOverlayGradient />
      <div className="container hero-content">
        <div className="hero-text">
          <p className="hero-label">Board-Certified Orthopedic Excellence</p>
          <h1>
            NYC&rsquo;s Most Trusted <em>Orthopedic</em> Surgeon
          </h1>
          <div className="hero-divider" />
          <p className="hero-desc">
            Sports medicine and joint preservation specialist trained at Cleveland Clinic and Lenox Hill Hospital. Former team physician for the NY Jets and NY Islanders.
          </p>
          <a href="#about" className="btn btn-hero">
            Learn More
          </a>
        </div>
        <a
          href="https://www.zocdoc.com/doctor/sam-elguizaoui-md-236423"
          target="_blank"
          rel="noopener"
          className="hero-rating-card"
          aria-label="View Dr. Elguizaoui on Zocdoc"
        >
          <div className="rating-top">
            <div className="rating-score">
              4.8<span className="rating-star">&#9733;</span>
            </div>
            <div className="rating-info">
              <span className="rating-platform">Patient Rating</span>
              <span className="rating-count">
                <strong>1,466</strong> Reviews
              </span>
            </div>
          </div>
          <div className="rating-bottom">
            <div className="rating-avatars">
              <div className="avatar">S</div>
              <div className="avatar">M</div>
              <div className="avatar">A</div>
            </div>
            <span className="rating-patient-choice" aria-label="Zocdoc Patient Choice">
              <Icon.Trophy width={14} height={14} />
              Patient Choice
            </span>
          </div>
        </a>
      </div>
      <HeroTicker />
    </header>
  );
}
