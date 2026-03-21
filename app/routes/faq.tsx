import { GetStarted } from "~/components/GetStarted";

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
    a: "You can schedule an appointment by calling the office directly, or booking online through Zocdoc. Same-week appointments are often available for urgent orthopedic concerns.",
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

export default function FAQPage() {
  return (
    <>
      <section className="service-hero">
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
              <details className="faq-item" key={i}>
                <summary>
                  <h3>{faq.q}</h3>
                </summary>
                <p>{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <GetStarted />
    </>
  );
}
