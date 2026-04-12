import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Sameh Elguizaoui, M.D. | Orthopedic Surgeon & Sports Medicine | NYC",
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
  telephone: "+1-212-828-3838",
  image:
    "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=1200&h=630&fit=crop&q=80",
  priceRange: "$$",
  medicalSpecialty: "Orthopedic Surgery",
  address: [
    {
      "@type": "PostalAddress",
      streetAddress: "1155 Park Avenue",
      addressLocality: "New York",
      addressRegion: "NY",
      postalCode: "10128",
      addressCountry: "US",
    },
    {
      "@type": "PostalAddress",
      streetAddress: "4802 10th Avenue",
      addressLocality: "Brooklyn",
      addressRegion: "NY",
      postalCode: "11219",
      addressCountry: "US",
    },
    {
      "@type": "PostalAddress",
      streetAddress: "600 Mamaroneck Avenue, Suite 101",
      addressLocality: "Harrison",
      addressRegion: "NY",
      postalCode: "10528",
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
        <meta name="theme-color" content="#0a1628" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
        </Script>
        <ClientLayout>{children}</ClientLayout>
        <SpeedInsights />
      </body>
    </html>
  );
}
