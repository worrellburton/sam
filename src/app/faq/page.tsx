import type { Metadata } from "next";
import { GetStarted } from "@/components/GetStarted";
import { Locations } from "@/components/Locations";
import { FaqAccordion } from "@/components/FaqAccordion";
import { siteFaqs } from "@/data/faq";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://sammd.vercel.app";

export const metadata: Metadata = {
  title: "FAQ | Dr. Sameh Elguizaoui, M.D.",
  description:
    "Frequently asked questions about Dr. Elguizaoui's orthopedic practice, treatments, insurance, and appointments.",
  alternates: { canonical: `${SITE_URL}/faq` },
};

const FAQ_JSONLD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: siteFaqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function FAQPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSONLD) }}
      />
      <section
        className="service-hero has-bg"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=1600&h=600&fit=crop&q=80')",
        }}
      >
        <div className="container">
          <p className="hero-label">Resources</p>
          <h1>Frequently Asked Questions</h1>
          <p>
            Find answers to common questions about Dr. Elguizaoui&rsquo;s
            practice, treatments, insurance, and what to expect at your
            appointment.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: "800px" }}>
          <div className="faq-container">
            <FaqAccordion faqs={siteFaqs} />
          </div>
        </div>
      </section>

      <GetStarted />
      <Locations />
    </>
  );
}
