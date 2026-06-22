import { SITE_URL } from "@/lib/env";

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=1200&h=630&fit=crop&q=80";
const SITE_NAME = "Dr. Sameh Elguizaoui, M.D. — Orthopedic Surgeon NYC";

export function seoMeta({
  title,
  description,
  path,
  image,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
}) {
  const url = `${SITE_URL}${path}`;
  const img = image || DEFAULT_IMAGE;

  return [
    { title },
    { name: "description", content: description },
    // Canonical
    { tagName: "link", rel: "canonical", href: url },
    // Open Graph
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:image", content: img },
    { property: "og:type", content: type },
    { property: "og:site_name", content: SITE_NAME },
    // Twitter Card
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: img },
  ];
}

export const MEDICAL_BUSINESS_JSONLD = {
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  name: "Dr. Sameh Elguizaoui, M.D.",
  description:
    "Board-certified orthopedic surgeon specializing in sports medicine, knee & shoulder surgery, cartilage repair, and joint preservation in NYC.",
  url: SITE_URL,
  telephone: "+1-212-828-3838",
  image: DEFAULT_IMAGE,
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
    medicalSpecialty: [
      "Orthopedic Surgery",
      "Sports Medicine",
    ],
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
