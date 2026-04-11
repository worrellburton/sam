"use client";

import { useState, useRef, useEffect } from "react";
import { GetStarted } from "@/components/GetStarted";
import { Locations } from "@/components/Locations";

const QuestionIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const faqs = [
  {
    q: "What conditions does Dr. Elguizaoui treat?",
    a: "Dr. Elguizaoui treats a wide range of orthopedic conditions including rotator cuff tears, ACL and meniscus injuries, labral tears, shoulder instability, arthritis in young active patients, cartilage damage, sports injuries, fractures, and general orthopedic trauma. He specializes in shoulder and knee disorders.",
  },
  {
    q: "Does Dr. Elguizaoui offer non-surgical treatments?",
    a: "Yes. Dr. Elguizaoui is a strong advocate for conservative care and biologic alternatives to surgery. He offers regenerative medicine treatments, PRP therapy, and other non-surgical options. Surgery is recommended only when conservative measures have been exhausted or when the condition clearly requires surgical intervention.",
  },
  {
    q: "What is arthroscopic surgery?",
    a: "Arthroscopic surgery is a minimally invasive procedure where a small camera and specialized instruments are inserted through tiny incisions. This approach results in less tissue damage, reduced pain, smaller scars, and significantly faster recovery compared to traditional open surgery. Dr. Elguizaoui is fellowship-trained in advanced arthroscopic techniques.",
  },
  {
    q: "What insurance plans are accepted?",
    a: "Dr. Elguizaoui accepts most major insurance plans. Please contact the office directly to verify your specific insurance coverage and to understand any out-of-pocket costs before your appointment.",
  },
  {
    q: "How do I schedule an appointment?",
    a: "You can schedule an appointment by calling the office directly, or booking online through our website. Same-week appointments are often available for urgent orthopedic concerns.",
  },
  {
    q: "What should I bring to my first appointment?",
    a: "Please bring your insurance card, a photo ID, any relevant imaging (X-rays, MRI), a list of current medications, and any referral paperwork if required by your insurance. Arriving 15 minutes early is recommended to complete intake forms.",
  },
  {
    q: "What hospitals does Dr. Elguizaoui operate at?",
    a: "Dr. Elguizaoui operates at Lenox Hill Hospital (Upper East Side), Mount Sinai West, and NYP Brooklyn Methodist Hospital.",
  },
  {
    q: "How long is recovery after arthroscopic surgery?",
    a: "Recovery varies by procedure. Many patients return to daily activities within 1-2 weeks, with full recovery typically 3-6 months depending on the specific surgery and rehabilitation protocol.",
  },
  {
    q: "Does Dr. Elguizaoui treat non-athletes?",
    a: "Absolutely. While Dr. Elguizaoui has experience treating professional athletes, the majority of his patients are everyday individuals dealing with joint pain, sports injuries, or orthopedic conditions.",
  },
  {
    q: "What is PRP therapy?",
    a: "Platelet-Rich Plasma (PRP) therapy uses concentrated growth factors from your own blood to accelerate healing. It's used for tendon injuries, mild arthritis, and other musculoskeletal conditions as a non-surgical treatment option.",
  },
];

function FAQItem({ faq, index }: { faq: typeof faqs[0]; index: number }) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (open && contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    } else {
      setHeight(0);
    }
  }, [open]);

  return (
    <div
      className={`faq-item${open ? " faq-open" : ""}`}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <button className="faq-summary" onClick={() => setOpen(!open)} aria-expanded={open}>
        <div className="faq-icon-wrap" aria-hidden="true"><QuestionIcon /></div>
        <h3>{faq.q}</h3>
        <span className={`faq-toggle${open ? " faq-toggle-open" : ""}`} aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </span>
      </button>
      <div
        className="faq-answer"
        style={{ height: `${height}px` }}
      >
        <div ref={contentRef} className="faq-answer-inner">
          <p>{faq.a}</p>
        </div>
      </div>
    </div>
  );
}

const FAQ_JSONLD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function FAQPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSONLD) }} />
      <section className="service-hero has-bg" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=1600&h=600&fit=crop&q=80')" }}>
        <div className="container">
          <p className="hero-label">Resources</p>
          <h1>Frequently Asked Questions</h1>
          <p>Find answers to common questions about Dr. Elguizaoui&rsquo;s practice, treatments, insurance, and what to expect at your appointment.</p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: "800px" }}>
          <div className="faq-container">
            {faqs.map((faq, i) => (
              <FAQItem faq={faq} index={i} key={i} />
            ))}
          </div>
        </div>
      </section>

      <GetStarted />
      <Locations />
    </>
  );
}
