"use client";

import { useState } from "react";

// Shared review card used by the homepage marquee and the /reviews grid.
// Accepts either a Google Places review or a local testimonial; callers
// normalize their shape up front so this component stays thin.

export interface ReviewCardProps {
  name: string;
  time?: string;
  text: string;
  location?: string;
  rating?: number; // defaults to 5 (local testimonials are all 5★)
  avatarUrl?: string; // Google photoUri; when absent we fall back to ui-avatars.com
  showGoogleBadge?: boolean;
}

function starsHTML(rating: number) {
  const rounded = Math.round(rating);
  return "\u2605".repeat(rounded) + "\u2606".repeat(Math.max(0, 5 - rounded));
}

// Initials for the local avatar fallback, e.g. "Sarah M." \u2192 "SM".
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

export function ReviewCard({
  name,
  time,
  text,
  location,
  rating = 5,
  avatarUrl,
  showGoogleBadge,
}: ReviewCardProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const showImg = Boolean(avatarUrl) && !imgFailed;

  return (
    <div className="google-review-card">
      <div className="google-review-header">
        {showImg ? (
          <img
            className="google-review-avatar"
            src={avatarUrl}
            alt={name}
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
        ) : (
          // Local initials avatar — no external request (ui-avatars.com)
          // and no layout shift while it loads.
          <div className="google-review-avatar google-review-avatar-fallback" aria-hidden="true">
            {initials(name)}
          </div>
        )}
        <div>
          <div className="google-review-author">{name}</div>
          {time && <div className="google-review-meta">{time}</div>}
        </div>
        {showGoogleBadge && (
          <div className="google-review-google-icon">
            <GoogleGlyph />
          </div>
        )}
      </div>
      <div className="google-review-stars">{starsHTML(rating)}</div>
      <div className="google-review-text">{text}</div>
      {location && <div className="google-review-location">{location}</div>}
    </div>
  );
}
