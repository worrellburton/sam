import type { SVGProps } from "react";

// Shared SVG icon library. Centralized here so the same icons aren't
// inlined dozens of times across pages/components. All icons inherit
// currentColor unless the caller overrides via the `stroke`/`fill` props.
//
// Usage:
//   <Icon.Shield className="h-6 w-6 text-accent" />
//
// Size defaults to 24×24; override with width/height props.

type IconProps = Omit<SVGProps<SVGSVGElement>, "viewBox" | "xmlns">;

function base(props: IconProps) {
  return {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...props,
  };
}

export const Icon = {
  /** Check inside a shield — board certification / credentials. */
  Shield: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),

  /** Five-pointed star — ratings. */
  Star: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),

  /** Courthouse-style columns — hospital / institution. */
  Hospital: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7H3l2-4h14l2 4M5 21V10.87M19 21V10.87" />
    </svg>
  ),

  /** Globe — international fellowship / reach. */
  Globe: (p: IconProps) => (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),

  /** Clipboard with check — credentials / academic honors. */
  Clipboard: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <path d="M9 14l2 2 4-4" />
    </svg>
  ),

  /** Two people — team / pro sports experience. */
  Users: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),

  /** Arrow right — CTA affordance. */
  ArrowRight: (p: IconProps) => (
    <svg {...base(p)}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  ),

  /** Diagonal up-right arrow — external / specialty link indicator. */
  ArrowUpRight: (p: IconProps) => (
    <svg {...base({ strokeWidth: 2.5, ...p })}>
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </svg>
  ),

  /** Calendar — ZocDoc / booking. */
  Calendar: (p: IconProps) => (
    <svg {...base({ strokeWidth: 2, ...p })}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),

  /** Trophy — Patient Choice / awards. Uses fill=currentColor. */
  Trophy: (p: IconProps) => (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      {...p}
    >
      <path d="M7 4V2h10v2h4v4a4 4 0 0 1-4 4h-.35A5.002 5.002 0 0 1 13 15.9V18h3v2H8v-2h3v-2.1A5.002 5.002 0 0 1 7.35 12H7a4 4 0 0 1-4-4V4h4zm0 2H5v2a2 2 0 0 0 2 2V6zm10 0v4a2 2 0 0 0 2-2V6h-2z" />
    </svg>
  ),
};

export type IconName = keyof typeof Icon;
