import type { Metadata } from "next";

// /book is a client component, so we attach metadata via this
// sibling layout.tsx (Next.js resolves metadata by walking up the
// route segment tree — layout metadata applies to all children).
// Anything returned by `generateMetadata` here rides along with the
// page at SSR time even though page.tsx itself is "use client".

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.sportsorthomd.com";

const title = "Book an Appointment | Dr. Sam Elguizaoui, M.D.";
const description =
  "Schedule a consultation with Dr. Sameh Elguizaoui, board-certified orthopedic surgeon in NYC. Same-week appointments at Manhattan, Brooklyn, and Scarsdale offices.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/book` },
  openGraph: {
    title,
    description,
    url: `${SITE_URL}/book`,
    type: "website",
    siteName: "Dr. Sameh Elguizaoui, M.D.",
    images: [{ url: "/images/header.jpg", width: 1200, height: 630, alt: "Dr. Sameh Elguizaoui - Orthopedic Surgeon NYC" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Schedule action + contact point — gives search engines a clean
// signal that /book is the booking entry point for the practice.
const bookingJsonLd = {
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  name: "Dr. Sameh Elguizaoui, M.D.",
  url: `${SITE_URL}/book`,
  medicalSpecialty: "Orthopedic Surgery",
  telephone: "+1-212-540-2265",
  potentialAction: {
    "@type": "ReserveAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate:
        "https://www.zocdoc.com/doctor/sam-elguizaoui-md-236423",
      actionPlatform: [
        "http://schema.org/DesktopWebPlatform",
        "http://schema.org/MobileWebPlatform",
      ],
    },
    result: {
      "@type": "Reservation",
      name: "Orthopedic Surgery Consultation",
    },
  },
};

export default function BookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bookingJsonLd) }}
      />
      {children}
    </>
  );
}
