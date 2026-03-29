import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ | Dr. Sameh Elguizaoui | Orthopedic Surgery Questions",
  description:
    "Find answers to frequently asked questions about orthopedic surgery, sports medicine, joint replacement, recovery times, insurance, and appointments with Dr. Sameh Elguizaoui in NYC.",
  alternates: { canonical: "/faq" },
};

export default function FaqLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
