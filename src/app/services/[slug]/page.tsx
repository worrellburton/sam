"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { getServiceBySlug } from "@/data/services";
import { conditionToBlogSlug } from "@/data/condition-blogs";
import { SpecialtyCanvas } from "@/components/SpecialtyCanvas";
import { GetStarted } from "@/components/GetStarted";
import { Locations } from "@/components/Locations";

const serviceFaqs: Record<string, { question: string; answer: string }[]> = {
  "sports-medicine": [
    { question: "What does a sports medicine doctor treat?", answer: "A sports medicine doctor treats injuries and conditions related to physical activity and athletics, including sprains, strains, fractures, tendon injuries, ligament tears (such as ACL and MCL), dislocations, and overuse injuries. Dr. Elguizaoui also provides concussion management and return-to-sport protocols." },
    { question: "When should I see a sports medicine specialist?", answer: "You should see a sports medicine specialist if you have a sports-related injury that isn't improving with rest, persistent joint or muscle pain during activity, a sudden injury such as a pop or snap in a joint, or if you need a customized plan to safely return to your sport after an injury." },
    { question: "Do I need surgery for a sports injury?", answer: "Not all sports injuries require surgery. Many can be treated with physical therapy, bracing, injections, or regenerative medicine such as PRP therapy. Dr. Elguizaoui evaluates each case individually and always explores conservative options before recommending surgical intervention." },
    { question: "What is the typical recovery time for a sports injury?", answer: "Recovery time varies widely depending on the type and severity of the injury. Minor sprains may heal in a few weeks, while ligament reconstructions like ACL surgery can take 6 to 9 months for full return to sport. Dr. Elguizaoui develops personalized rehabilitation protocols to optimize recovery." },
  ],
  "arthroscopic-surgery": [
    { question: "What is arthroscopic surgery?", answer: "Arthroscopic surgery is a minimally invasive surgical technique that uses a small camera (arthroscope) and specialized instruments inserted through tiny incisions to diagnose and treat joint problems. It results in less pain, less scarring, and faster recovery compared to traditional open surgery." },
    { question: "How long is recovery from arthroscopic surgery?", answer: "Recovery from arthroscopic surgery depends on the procedure performed. Simple procedures like a meniscus cleanup may allow return to normal activities within 1 to 2 weeks, while more complex repairs such as rotator cuff or ACL reconstruction may require several months of rehabilitation." },
    { question: "Is arthroscopic surgery performed as an outpatient procedure?", answer: "Yes, most arthroscopic procedures are performed on an outpatient basis, meaning you can go home the same day. Dr. Elguizaoui performs these procedures at accredited surgical centers in New York City with a focus on patient comfort and safety." },
    { question: "What joints can be treated with arthroscopic surgery?", answer: "Arthroscopic surgery can be performed on many joints including the knee, shoulder, hip, ankle, elbow, and wrist. Dr. Elguizaoui most commonly performs arthroscopic procedures on the knee and shoulder to treat conditions like meniscus tears, rotator cuff tears, labral tears, and loose bodies." },
  ],
  "regenerative-medicine": [
    { question: "What is PRP therapy and how does it work?", answer: "Platelet-rich plasma (PRP) therapy involves drawing a small amount of your blood, concentrating the platelets and growth factors through a centrifuge process, and injecting the concentrated solution into the injured area. The growth factors help stimulate your body's natural healing response to repair damaged tissue." },
    { question: "Is regenerative medicine a good alternative to surgery?", answer: "For many patients, regenerative medicine can be an effective alternative to surgery, particularly for mild to moderate arthritis, tendinitis, ligament sprains, and chronic joint pain. Dr. Elguizaoui evaluates each patient individually to determine if biologic treatments can help delay or avoid surgical intervention." },
    { question: "How many PRP treatments will I need?", answer: "The number of PRP treatments varies by condition and individual response. Some patients experience significant improvement after a single injection, while others may benefit from a series of 2 to 3 treatments spaced several weeks apart. Dr. Elguizaoui tailors the treatment plan to your specific condition and goals." },
    { question: "What is the recovery time after a PRP injection?", answer: "PRP injections involve minimal downtime. Most patients can resume daily activities within 1 to 2 days. You may experience mild soreness at the injection site for a few days. Dr. Elguizaoui typically recommends avoiding strenuous activity for 1 to 2 weeks to allow the healing process to begin." },
  ],
  "joint-preservation": [
    { question: "What is joint preservation surgery?", answer: "Joint preservation surgery encompasses advanced techniques designed to protect, repair, and restore your natural joint to delay or avoid the need for joint replacement. These procedures address cartilage damage, joint malalignment, and ligament injuries to maintain joint function and an active lifestyle." },
    { question: "Who is a good candidate for joint preservation?", answer: "Ideal candidates for joint preservation are typically younger, active patients with early-stage arthritis, cartilage defects, or joint injuries who want to maintain their natural joint. Dr. Elguizaoui's international fellowship training in Europe provided specialized expertise in evaluating patients for these procedures." },
    { question: "How does joint preservation differ from joint replacement?", answer: "Joint preservation focuses on saving and restoring your natural joint through techniques like cartilage repair, realignment osteotomy, and biologic treatments. Joint replacement removes the damaged joint surfaces and replaces them with artificial components. Preservation is preferred when possible, especially in younger patients." },
  ],
  "cartilage-repair": [
    { question: "What are the options for cartilage repair?", answer: "Cartilage repair options include microfracture, osteochondral autograft and allograft transplantation (OATS), autologous chondrocyte implantation (ACI), and newer scaffold-based techniques. Dr. Elguizaoui's international fellowship across Switzerland, the Netherlands, and Italy provided training in the latest cartilage repair and transplant methods." },
    { question: "Can damaged cartilage heal on its own?", answer: "Articular cartilage has very limited ability to heal on its own because it lacks a direct blood supply. Small areas of damage may remain stable, but larger defects tend to worsen over time and may lead to arthritis. Cartilage repair procedures aim to restore the joint surface before further damage occurs." },
    { question: "What is the recovery time after cartilage repair surgery?", answer: "Recovery from cartilage repair surgery typically takes 3 to 6 months depending on the procedure and location of the defect. Weight-bearing may be restricted for 4 to 8 weeks, and physical therapy is critical for a successful outcome. Full return to high-impact activities may take 6 to 12 months." },
    { question: "How long do cartilage repair results last?", answer: "With proper rehabilitation and activity modification, cartilage repair results can last many years. Studies show favorable outcomes at 10 to 15 years for many techniques. Dr. Elguizaoui helps patients develop long-term plans to protect their repaired cartilage and maintain joint health." },
  ],
  "shoulder-knee-surgery": [
    { question: "How long does ACL reconstruction surgery take to recover from?", answer: "ACL reconstruction typically requires 6 to 9 months of recovery before return to full sports activity. The first 6 weeks focus on reducing swelling and restoring range of motion, followed by progressive strengthening and sport-specific rehabilitation. Dr. Elguizaoui provides individualized rehab protocols for each patient." },
    { question: "When is rotator cuff surgery necessary?", answer: "Rotator cuff surgery is typically recommended when conservative treatments such as physical therapy, anti-inflammatory medications, and injections fail to relieve symptoms, or when the tear is large or acute. Factors like tear size, patient age, activity level, and degree of weakness help Dr. Elguizaoui determine the best approach." },
    { question: "What is the difference between a partial and complete rotator cuff tear?", answer: "A partial rotator cuff tear involves damage to the tendon without complete separation from the bone, while a complete (full-thickness) tear means the tendon is fully detached. Partial tears may respond to conservative treatment, while complete tears more often require surgical repair to restore strength and function." },
    { question: "Can a meniscus tear be repaired or does it need to be removed?", answer: "Whether a meniscus tear can be repaired depends on the location, size, and pattern of the tear. Tears in the outer third of the meniscus where blood supply is present have the best chance of healing with repair. When repair is not possible, Dr. Elguizaoui removes only the damaged portion to preserve as much healthy meniscus as possible." },
  ],
};

const serviceStats: Record<string, { stat: string; label: string }[]> = {
  "sports-medicine": [
    { stat: "1,400+", label: "Athletes Treated" },
    { stat: "NFL & NHL", label: "Team Physician" },
    { stat: "98%", label: "Return to Sport" },
  ],
  "arthroscopic-surgery": [
    { stat: "5,000+", label: "Procedures" },
    { stat: "Same Day", label: "Go Home" },
    { stat: "95%", label: "Success Rate" },
  ],
  "regenerative-medicine": [
    { stat: "Non-Surgical", label: "Treatment" },
    { stat: "PRP", label: "Therapy" },
    { stat: "Minimal", label: "Downtime" },
  ],
  "joint-preservation": [
    { stat: "International", label: "Fellowship" },
    { stat: "3 Countries", label: "Trained In" },
    { stat: "Preserve", label: "Natural Joints" },
  ],
  "cartilage-repair": [
    { stat: "European", label: "Fellowship" },
    { stat: "Advanced", label: "Techniques" },
    { stat: "Restore", label: "Joint Function" },
  ],
  "shoulder-knee-surgery": [
    { stat: "Lenox Hill", label: "Fellowship" },
    { stat: "Expert", label: "Surgical Care" },
    { stat: "Comprehensive", label: "Rehab Plans" },
  ],
};

export default function ServicePage() {
  const params = useParams();
  const slug = params.slug as string;
  const service = getServiceBySlug(slug || "");

  if (!service) {
    return (
      <main style={{ padding: "4rem 2rem", textAlign: "center" }}>
        <h1>Service Not Found</h1>
        <Link href="/">Return Home</Link>
      </main>
    );
  }

  const stats = serviceStats[slug || ""] || [];

  const faqs = serviceFaqs[slug || ""] || [];

  const serviceJsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "MedicalWebPage",
      name: service.title,
      description: service.description,
      url: `https://www.samelguizaoui.com/services/${slug}`,
      author: {
        "@type": "Physician",
        name: "Dr. Sameh Elguizaoui, M.D.",
        medicalSpecialty: "Orthopedic Surgery",
        description: "Board-certified orthopedic surgeon and sports medicine specialist with offices in Manhattan, Brooklyn, and Scarsdale, NY.",
      },
      provider: {
        "@type": "Physician",
        name: "Dr. Sameh Elguizaoui, M.D.",
        medicalSpecialty: "Orthopedic Surgery",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />
      <section className="svc-hero">
        <div className="svc-hero-visual">
          <SpecialtyCanvas slug={slug || ""} />
          <div className="svc-hero-visual-overlay" />
        </div>
        <div className="svc-hero-content">
          <Link href="/#specialties" className="svc-back-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            All Services
          </Link>
          <h1>{service.title}</h1>
          <p className="svc-hero-subtitle">{service.subtitle}</p>
          <p className="svc-hero-desc">{service.description}</p>
          <div className="svc-hero-stats">
            {stats.map((s, i) => (
              <div className="svc-hero-stat" key={i}>
                <span className="svc-stat-value">{s.stat}</span>
                <span className="svc-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
          <div className="svc-hero-actions">
            <Link href="/book" className="btn btn-primary">Book Consultation</Link>
            <a href="tel:+19179059370" className="btn btn-outline">(917) 905-9370</a>
          </div>
        </div>
      </section>

      <section className="svc-conditions">
        <div className="container">
          <div className="svc-section-header">
            <p className="section-label">What We Treat</p>
            <h2>Conditions Treated</h2>
          </div>
          <div className="svc-conditions-row">
            <div className="svc-conditions-list">
              {service.conditions.map((c, i) => {
                const blogSlug = conditionToBlogSlug[c];
                const condSlug = c.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                const linkTo = blogSlug ? `/blog/${blogSlug}` : `/conditions/${condSlug}`;
                return (
                  <Link
                    href={linkTo}
                    className="svc-condition-row"
                    key={i}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    <span className="svc-condition-name">{c}</span>
                    <svg className="svc-condition-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="9 6 15 12 9 18" />
                    </svg>
                  </Link>
                );
              })}
            </div>
            <div className="svc-conditions-sidebar">
              <div className="svc-sidebar-card">
                <div className="svc-sidebar-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                </div>
                <h4>Expert Diagnosis</h4>
                <p>Advanced imaging and hands-on evaluation to pinpoint the exact issue</p>
              </div>
              <div className="svc-sidebar-card">
                <div className="svc-sidebar-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <h4>Personalized Plan</h4>
                <p>Treatment tailored to your activity level, goals, and lifestyle</p>
              </div>
              <div className="svc-sidebar-card">
                <div className="svc-sidebar-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                </div>
                <h4>Faster Recovery</h4>
                <p>Evidence-based protocols to get you back to what you love sooner</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {service.approach && (
        <section className="svc-approach">
          <div className="container">
            <div className="svc-section-header">
              <p className="section-label">How It Works</p>
              <h2>Our Approach</h2>
            </div>
            <div className="svc-approach-grid">
              {service.approach.map((a, i) => (
                <div className="svc-approach-card" key={i}>
                  <div className="svc-approach-num">{i + 1}</div>
                  <p>{a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="svc-cta">
        <div className="container" style={{ textAlign: "center" }}>
          <h2>Ready to Get Started?</h2>
          <p>Book a consultation to discuss your condition and explore treatment options with Dr. Elguizaoui.</p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "24px", flexWrap: "wrap" }}>
            <Link href="/book" className="btn btn-primary">Book Appointment</Link>
            <Link href="/contact" className="btn btn-outline" style={{ borderColor: "rgba(255,255,255,0.3)", color: "#fff" }}>Contact Us</Link>
          </div>
        </div>
      </section>

      <GetStarted />
      <Locations />
    </>
  );
}
