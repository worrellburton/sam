import type { Metadata, Viewport } from "next";
import Script from "next/script";
import localFont from "next/font/local";
import { SpeedInsights } from "@vercel/speed-insights/next";
import ClientLayout from "@/components/ClientLayout";
import "./globals.css";

const inter = localFont({
  src: "./fonts/Inter.woff2",
  display: "swap",
  variable: "--font-inter",
});

const GA_ID = "G-HP23C836XM";

const SITE_URL = "https://samelguizaoui.vercel.app";

// `viewport-fit=cover` so env(safe-area-inset-*) values are populated
// on notched iOS devices — required for the StickyBar to clear Safari's
// bottom URL toolbar correctly.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Sam Elguizaoui, M.D. | NYC Orthopedic Surgeon",
  description:
    "Board-certified orthopedic surgeon Dr. Sameh Elguizaoui specializes in sports medicine, knee & shoulder surgery, and cartilage repair in NYC.",
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  openGraph: {
    title: "Dr. Sameh Elguizaoui, M.D. | NYC Orthopedic Surgeon",
    description:
      "Board-certified orthopedic surgeon specializing in sports medicine, knee & shoulder surgery, and cartilage repair in Manhattan, Brooklyn & Scarsdale.",
    url: SITE_URL,
    siteName: "Dr. Sameh Elguizaoui, M.D.",
    type: "website",
    images: [
      {
        url: "/images/header.jpg",
        width: 1200,
        height: 630,
        alt: "Dr. Sameh Elguizaoui - Orthopedic Surgeon NYC",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dr. Sameh Elguizaoui, M.D. | NYC Orthopedic Surgeon",
    description:
      "Board-certified orthopedic surgeon specializing in sports medicine, knee & shoulder surgery, and cartilage repair in NYC.",
    images: ["/images/header.jpg"],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  name: "Dr. Sameh Elguizaoui, M.D.",
  description:
    "Board-certified orthopedic surgeon specializing in sports medicine, knee & shoulder surgery, cartilage repair, and joint preservation in NYC.",
  url: SITE_URL,
  telephone: "+1-917-905-9370",
  image: `${SITE_URL}/images/header.jpg`,
  priceRange: "$$",
  medicalSpecialty: "Orthopedic Surgery",
  address: [
    {
      "@type": "PostalAddress",
      streetAddress: "159 East 74th Street",
      addressLocality: "New York",
      addressRegion: "NY",
      postalCode: "10021",
      addressCountry: "US",
    },
    {
      "@type": "PostalAddress",
      streetAddress: "200 West 13th Street",
      addressLocality: "New York",
      addressRegion: "NY",
      postalCode: "10011",
      addressCountry: "US",
    },
    {
      "@type": "PostalAddress",
      streetAddress: "161 Atlantic Avenue",
      addressLocality: "Brooklyn",
      addressRegion: "NY",
      postalCode: "11201",
      addressCountry: "US",
    },
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    reviewCount: "1400",
    bestRating: "5",
  },
  physician: {
    "@type": "Physician",
    name: "Dr. Sameh Elguizaoui",
    medicalSpecialty: ["Orthopedic Surgery", "Sports Medicine"],
    alumniOf: [
      {
        "@type": "CollegeOrUniversity",
        name: "The Ohio State University College of Medicine",
      },
    ],
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "17:00",
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="light" className={inter.variable}>
      <head>
        {/* Navy theme-color in every color-scheme so iOS Safari tints
            the URL/status bar navy regardless of the user's system theme. */}
        <meta name="theme-color" content="#0a1628" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#0a1628" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0a1628" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        {/* `black-translucent` lets the navy nav bleed under the iOS
            status bar in standalone PWA mode. */}
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body>
        {/* GA4 is analytics-only; defer until after load so it doesn't
            compete with hero/LCP work on the main thread. */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="lazyOnload"
        />
        <Script id="ga4-init" strategy="lazyOnload">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
        </Script>
        <ClientLayout>{children}</ClientLayout>
        <SpeedInsights />
      </body>
    </html>
  );
}
