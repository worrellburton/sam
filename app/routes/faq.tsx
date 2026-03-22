import { useState, useRef, useEffect } from "react";
import { GetStarted } from "~/components/GetStarted";
import { Locations } from "~/components/Locations";

export function meta() {
  return [
    { title: "FAQ | Dr. Sam Elguizaoui, M.D." },
    { name: "description", content: "Find answers to common questions about Dr. Elguizaoui's practice, treatments, insurance, and what to expect at your appointment." },
  ];
}

const faqs = [
  {
    q: "What conditions does Dr. Elguizaoui treat?",
    a: "Dr. Elguizaoui treats a wide range of orthopedic conditions including rotator cuff tears, ACL and meniscus injuries, labral tears, shoulder instability, arthritis in young active patients, cartilage damage, sports injuries, fractures, and general orthopedic trauma. He specializes in shoulder and knee disorders.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    ),
  },
  {
    q: "Does Dr. Elguizaoui offer non-surgical treatments?",
    a: "Yes. Dr. Elguizaoui is a strong advocate for conservative care and biologic alternatives to surgery. He offers regenerative medicine treatments, PRP therapy, and other non-surgical options. Surgery is recommended only when conservative measures have been exhausted or when the condition clearly requires surgical intervention.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3"/>
      </svg>
    ),
  },
  {
    q: "What is arthroscopic surgery?",
    a: "Arthroscopic surgery is a minimally invasive procedure where a small camera and specialized instruments are inserted through tiny incisions. This approach results in less tissue damage, reduced pain, smaller scars, and significantly faster recovery compared to traditional open surgery. Dr. Elguizaoui is fellowship-trained in advanced arthroscopic techniques.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
  },
  {
    q: "What insurance plans are accepted?",
    a: "Dr. Elguizaoui accepts most major insurance plans. Please contact the office directly to verify your specific insurance coverage and to understand any out-of-pocket costs before your appointment.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
  {
    q: "How do I schedule an appointment?",
    a: "You can schedule an appointment by calling the office directly, or booking online through our website. Same-week appointments are often available for urgent orthopedic concerns.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  {
    q: "What should I bring to my first appointment?",
    a: "Please bring your insurance card, a photo ID, any relevant imaging (X-rays, MRI), a list of current medications, and any referral paperwork if required by your insurance. Arriving 15 minutes early is recommended to complete intake forms.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M9 14l2 2 4-4"/>
      </svg>
    ),
  },
  {
    q: "What hospitals does Dr. Elguizaoui operate at?",
    a: "Dr. Elguizaoui operates at Lenox Hill Hospital (Upper East Side), Mount Sinai West, and NYP Brooklyn Methodist Hospital.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1"/><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/>
      </svg>
    ),
  },
  {
    q: "How long is recovery after arthroscopic surgery?",
    a: "Recovery varies by procedure. Many patients return to daily activities within 1-2 weeks, with full recovery typically 3-6 months depending on the specific surgery and rehabilitation protocol.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  },
  {
    q: "Does Dr. Elguizaoui treat non-athletes?",
    a: "Absolutely. While Dr. Elguizaoui has experience treating professional athletes, the majority of his patients are everyday individuals dealing with joint pain, sports injuries, or orthopedic conditions.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    q: "What is PRP therapy?",
    a: "Platelet-Rich Plasma (PRP) therapy uses concentrated growth factors from your own blood to accelerate healing. It's used for tendon injuries, mild arthritis, and other musculoskeletal conditions as a non-surgical treatment option.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
      </svg>
    ),
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
      <button className="faq-summary" onClick={() => setOpen(!open)}>
        <div className="faq-icon-wrap">{faq.icon}</div>
        <h3>{faq.q}</h3>
        <span className={`faq-toggle${open ? " faq-toggle-open" : ""}`}>
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

export default function FAQPage() {
  return (
    <>
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
