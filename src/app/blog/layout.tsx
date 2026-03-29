import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orthopedic Surgery Blog | Dr. Sameh Elguizaoui",
  description:
    "Expert insights on orthopedic surgery, sports medicine, joint preservation, injury prevention, and recovery from Dr. Sameh Elguizaoui, board-certified orthopedic surgeon in NYC.",
  alternates: { canonical: "/blog" },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
