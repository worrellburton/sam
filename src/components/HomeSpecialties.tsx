"use client";

import Link from "next/link";
import { Icon } from "./icons";

type SpecialtyCard = {
  title: string;
  href: string;
  video?: string;
  image?: string;
  description?: string;
};

// Videos live in the Supabase `blog-videos` bucket (public read). A single
// base URL + filename keeps the list readable and makes it easy to swap in
// new clips uploaded via /dev/videos.
const V = "https://wgznytmxwslupjhsdeha.supabase.co/storage/v1/object/public/blog-videos";

const ROW_1: SpecialtyCard[] = [
  { title: "Sports Medicine", href: "/services/sports-medicine", video: `${V}/Sports_Medicine.mp4` },
  { title: "Joint Preservation", href: "/services/joint-preservation", video: `${V}/Joint_Preservation.mp4` },
];
const ROW_2: SpecialtyCard[] = [
  { title: "Arthroscopic Surgery", href: "/services/arthroscopic-surgery", video: `${V}/Arthroscopic_Surgery.mp4` },
  { title: "Cartilage Repair", href: "/services/cartilage-repair", video: `${V}/Cartilage_Repair.mp4` },
  { title: "Regenerative Medicine", href: "/services/regenerative-medicine", video: `${V}/Regenerative_Medicine.mp4` },
];
const ROW_3: SpecialtyCard[] = [
  { title: "Shoulder", href: "/services/shoulder-knee-surgery", video: `${V}/Shoulder.mp4` },
  { title: "Knee", href: "/services/sports-medicine", video: `${V}/Knee.mp4` },
  { title: "Elbow", href: "/services/sports-medicine", video: `${V}/Elbow.mp4` },
];
const ROW_4: SpecialtyCard[] = [
  { title: "General Orthopedics", href: "/services/sports-medicine", video: `${V}/General_Orthopedics.mp4` },
  {
    title: "Book a Consultation",
    href: "/book",
    description: "Schedule a visit at one of Dr. Elguizaoui's NYC offices — Manhattan, Brooklyn, or Scarsdale.",
  },
];

export function HomeSpecialties({ reviewTotalDelta = 0 }: { reviewTotalDelta?: number }) {
  const totalReviews = (1466 + reviewTotalDelta).toLocaleString();

  const renderCard = (card: SpecialtyCard) => {
    const isBookCard = !card.video && !card.image;
    return (
      <Link
        href={card.href}
        className={`specialty-card specialty-link${isBookCard ? " book-card" : ""}`}
        key={card.title}
        onMouseEnter={(e) => {
          const v = e.currentTarget.querySelector("video");
          if (v) v.play().catch(() => {});
        }}
        onMouseLeave={(e) => {
          const v = e.currentTarget.querySelector("video");
          if (v) {
            v.pause();
            v.currentTime = 0;
          }
        }}
      >
        {card.video ? (
          <video
            className="specialty-video"
            src={card.video}
            muted
            loop
            playsInline
            preload="metadata"
            onLoadedMetadata={(e) => {
              e.currentTarget.currentTime = 0.01;
            }}
          />
        ) : null}
        {!isBookCard && <div className="specialty-overlay"></div>}
        <span className="specialty-arrow-btn" aria-hidden="true">
          <Icon.ArrowUpRight width={16} height={16} />
        </span>
        <div className="specialty-content">
          {isBookCard && (
            <div className="book-card-badge">
              <Icon.Calendar width={20} height={20} />
              <span>ZocDoc</span>
            </div>
          )}
          <h3 className="specialty-title">{card.title}</h3>
          {card.description && <p className="specialty-description">{card.description}</p>}
          {isBookCard && (
            <div className="book-card-rating">
              <div className="book-card-rating-top">
                <span className="book-card-score">
                  4.8<span className="book-card-star">&#9733;</span>
                </span>
                <span className="book-card-rating-meta">
                  <strong>{totalReviews}</strong> Patient Reviews
                </span>
              </div>
              <span className="book-card-patient-choice">
                <Icon.Trophy width={14} height={14} />
                Patient Choice
              </span>
              <span className="book-card-cta">
                Book on ZocDoc
                <Icon.ArrowRight width={14} height={14} strokeWidth={2.5} />
              </span>
            </div>
          )}
        </div>
      </Link>
    );
  };

  const renderRow = (cards: SpecialtyCard[], rowClass: string) => (
    <div className={`specialties-row ${rowClass}`}>
      {cards.map((c) => renderCard(c))}
    </div>
  );

  return (
    <>
      {renderRow(ROW_1, "specialties-row-1")}
      {renderRow(ROW_2, "specialties-row-2")}
      {renderRow(ROW_3, "specialties-row-3")}
      {renderRow(ROW_4, "specialties-row-4")}
    </>
  );
}
