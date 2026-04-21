import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orthopedic Surgery Blog | Dr. Sameh Elguizaoui",
  description:
    "Expert insights on orthopedic surgery, sports medicine, joint preservation, injury prevention, and recovery from Dr. Sameh Elguizaoui, board-certified orthopedic surgeon in NYC.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Clinical Clarity | Orthopedic Surgery Blog",
    description:
      "Expert insights on orthopedic surgery, sports medicine, and recovery from Dr. Sameh Elguizaoui, board-certified orthopedic surgeon in NYC.",
    url: "/blog",
    type: "website",
    images: [{ url: "/images/header.jpg", width: 1200, height: 630, alt: "Clinical Clarity Blog" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Clinical Clarity | Orthopedic Surgery Blog",
    description:
      "Expert insights on orthopedic surgery, sports medicine, and recovery from Dr. Sameh Elguizaoui in NYC.",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
