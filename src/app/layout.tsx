import type { Metadata } from "next";
import ClientLayout from "@/components/ClientLayout";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sameh Elguizaoui, M.D. | Orthopedic Surgeon & Sports Medicine | NYC",
  description:
    "Board-certified orthopedic surgeon Dr. Sameh Elguizaoui specializes in sports medicine, knee & shoulder surgery, and cartilage repair in NYC.",
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  name: "Dr. Sameh Elguizaoui, M.D.",
  description:
    "Board-certified orthopedic surgeon specializing in sports medicine, knee & shoulder surgery, cartilage repair, and joint preservation in NYC.",
  url: "https://sam-elguizaoui.vercel.app",
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
    <html lang="en" data-theme="light">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
