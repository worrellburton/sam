export function meta() {
  return [
    { title: "FAQ | Dr. Sam Elguizaoui, M.D." },
    { name: "description", content: "Frequently asked questions about Dr. Elguizaoui's orthopedic practice, services, insurance, and appointments." },
  ];
}

const faqs = [
  {
    q: "What does Dr. Elguizaoui specialize in?",
    a: "Dr. Elguizaoui is a board-certified orthopedic surgeon specializing in sports medicine, arthroscopic surgery, shoulder and knee disorders, joint preservation, cartilage repair and transplant techniques, and regenerative medicine.",
  },
  {
    q: "Where are the office locations?",
    a: "Dr. Elguizaoui sees patients at multiple New York City locations: Upper East Side (159 East 74th Street), Greenwich Village (200 West 13th Street), and Brooklyn Heights (161 Atlantic Avenue).",
  },
  {
    q: "Does Dr. Elguizaoui accept insurance?",
    a: "Yes, Dr. Elguizaoui accepts most major insurance plans including Aetna, BlueCross BlueShield, UnitedHealthcare, Oxford, Cigna, Empire BlueCross, and 200+ more. Check Zocdoc for the full list.",
  },
  {
    q: "How do I schedule an appointment?",
    a: "You can book online through Zocdoc for instant confirmation, or call +1-917-905-9370 to schedule by phone. Same-week appointments are often available for urgent concerns.",
  },
  {
    q: "What should I bring to my first appointment?",
    a: "Please bring your insurance card, photo ID, any relevant imaging (X-rays, MRI), a list of current medications, and any referral paperwork if required by your insurance plan.",
  },
  {
    q: "Does Dr. Elguizaoui offer non-surgical treatments?",
    a: "Yes. Dr. Elguizaoui is a strong advocate for conservative, non-surgical treatments including physical therapy, PRP (platelet-rich plasma) therapy, and other regenerative medicine approaches. Surgery is recommended only when necessary.",
  },
  {
    q: "What is PRP therapy?",
    a: "Platelet-rich plasma (PRP) therapy uses a concentration of your own platelets to accelerate healing. It's effective for tendinitis, mild arthritis, ligament sprains, and other musculoskeletal conditions.",
  },
  {
    q: "How long is recovery after arthroscopic surgery?",
    a: "Recovery varies by procedure, but arthroscopic surgery generally offers faster recovery than open surgery. Many patients return to desk work within 1-2 weeks and to full activity within 4-12 weeks depending on the procedure.",
  },
  {
    q: "What professional sports teams has Dr. Elguizaoui worked with?",
    a: "Dr. Elguizaoui served as a team physician for the New York Jets (NFL) and the New York Islanders (NHL) during his sports medicine fellowship at Lenox Hill Hospital.",
  },
  {
    q: "What are Dr. Elguizaoui's hospital affiliations?",
    a: "Dr. Elguizaoui is affiliated with Lenox Hill Hospital, Mount Sinai Hospital, and NewYork-Presbyterian Brooklyn Methodist Hospital.",
  },
];

export default function FAQPage() {
  return (
    <>
      <section className="service-hero">
        <div className="container">
          <h1>Frequently Asked Questions</h1>
          <p>Common questions about our practice, services, and care</p>
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
    </>
  );
}
