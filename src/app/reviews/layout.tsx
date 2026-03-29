import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Patient Reviews | Dr. Sameh Elguizaoui | 4.8 Stars, 1400+ Reviews",
  description:
    "Read 1,400+ patient reviews for Dr. Sameh Elguizaoui, rated 4.8 out of 5 stars. See what patients say about their orthopedic surgery and sports medicine experience in NYC.",
  alternates: { canonical: "/reviews" },
};

export default function ReviewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
