import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Dr. Sameh Elguizaoui | Board-Certified Orthopedic Surgeon NYC",
  description:
    "Learn about Dr. Sameh Elguizaoui, M.D. — trained at Ohio State with a sports medicine fellowship at Lenox Hill Hospital. Specializing in joint preservation, sports medicine, and minimally invasive surgery. Team physician for the NY Jets and NY Islanders.",
  alternates: { canonical: "/about" },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
