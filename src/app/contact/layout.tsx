import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Contact Dr. Elguizaoui | NYC Orthopedic Surgeon | Manhattan, Brooklyn, Scarsdale",
  description:
    "Contact Dr. Sameh Elguizaoui's orthopedic surgery offices in Manhattan, Brooklyn, and Scarsdale. Call to schedule an appointment or request a consultation with a top-rated NYC orthopedic surgeon.",
  alternates: { canonical: "/contact" },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
