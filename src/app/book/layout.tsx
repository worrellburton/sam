import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Book an Appointment | Dr. Sameh Elguizaoui | NYC Orthopedic Surgeon",
  description:
    "Schedule an appointment with Dr. Sameh Elguizaoui, board-certified orthopedic surgeon in NYC. Book online for offices in Manhattan, Brooklyn, or Scarsdale.",
  alternates: { canonical: "/book" },
};

export default function BookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
