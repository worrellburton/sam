"use client";

import { useState } from "react";
import { Locations } from "@/components/Locations";
import { GetStarted } from "@/components/GetStarted";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Where are Dr. Elguizaoui's orthopedic offices located?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Dr. Elguizaoui has three office locations in the New York City area: Upper East Side (Manhattan), Greenwich Village (Manhattan), and Brooklyn Heights (Brooklyn). All offices are easily accessible by public transportation."
        }
      },
      {
        "@type": "Question",
        "name": "How do I schedule an appointment with Dr. Elguizaoui?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You can schedule an appointment by calling (917) 905-9370, booking online through our website, or using the contact form on this page. Our team typically responds within one business day. Same-week appointments are often available."
        }
      },
      {
        "@type": "Question",
        "name": "What insurance plans does Dr. Elguizaoui accept?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Dr. Elguizaoui accepts most major insurance plans. Our office staff can verify your specific coverage and benefits before your visit. Please call (917) 905-9370 or submit an inquiry through our contact form for insurance verification."
        }
      },
      {
        "@type": "Question",
        "name": "What should new patients expect at their first visit?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "New patients should bring their insurance card, photo ID, any relevant imaging (X-rays or MRI), and a list of current medications. Your first visit will include a thorough evaluation, review of imaging, a diagnosis, and a personalized treatment plan. Dr. Elguizaoui takes time to explain all options and answer questions."
        }
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <section className="service-hero has-bg" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1600&h=600&fit=crop&q=80')" }}>
        <div className="container">
          <p className="hero-label">Get in Touch</p>
          <h1>Contact Us</h1>
          <p>Schedule an appointment or reach out with any questions. We typically respond within one business day.</p>
        </div>
      </section>

      <section className="section contact-form-section">
        <div className="container">
          <div className="contact-form-grid">
            <div className="contact-form-info">
              <h2>We&rsquo;d Love to Hear From You</h2>
              <p>Whether you have a question about treatment options, want to schedule a consultation, or need a second opinion &mdash; our team is here to help.</p>

              <div className="contact-info-items">
                <div className="contact-info-item">
                  <div className="contact-info-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--primary)" }}>
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </div>
                  <div>
                    <h4>Phone</h4>
                    <p><a href="tel:+19179059370">(917) 905-9370</a></p>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-info-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--primary)" }}>
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div>
                    <h4>Locations</h4>
                    <p>Upper East Side &bull; Greenwich Village &bull; Brooklyn Heights</p>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-info-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--primary)" }}>
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <div>
                    <h4>Office Hours</h4>
                    <p>Monday &ndash; Friday, by appointment</p>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-info-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--primary)" }}>
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                      <line x1="8" y1="21" x2="16" y2="21" />
                      <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                  </div>
                  <div>
                    <h4>Online</h4>
                    <p>
                      <a href="https://www.instagram.com/sportsdocsam" target="_blank" rel="noopener">Instagram</a>
                      {" "}&bull;{" "}
                      <a href="https://www.linkedin.com/in/samelguizaoui" target="_blank" rel="noopener">LinkedIn</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="contact-form-card">
              {submitted ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "16px" }}>
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <h3 style={{ marginBottom: "8px" }}>Message Sent</h3>
                  <p style={{ color: "var(--text-light)", marginBottom: "20px" }}>Thank you for reaching out. We&rsquo;ll get back to you within one business day.</p>
                  <button onClick={() => setSubmitted(false)} className="btn btn-outline" style={{ fontSize: "0.9rem" }}>Send Another Message</button>
                </div>
              ) : (
                <>
                  <h3>Send Us a Message</h3>
                  <p>Fill out the form below and we&rsquo;ll get back to you promptly.</p>
                  <form className="contact-form" onSubmit={handleSubmit}>
                    <div className="contact-form-row">
                      <div className="contact-field">
                        <label>First Name <span className="required">*</span></label>
                        <input type="text" placeholder="John" required />
                      </div>
                      <div className="contact-field">
                        <label>Last Name <span className="required">*</span></label>
                        <input type="text" placeholder="Doe" required />
                      </div>
                    </div>
                    <div className="contact-form-row">
                      <div className="contact-field">
                        <label>Email <span className="required">*</span></label>
                        <input type="email" placeholder="john@example.com" required />
                      </div>
                      <div className="contact-field">
                        <label>Phone</label>
                        <input type="tel" placeholder="(555) 123-4567" />
                      </div>
                    </div>
                    <div className="contact-field">
                      <label>Subject</label>
                      <select defaultValue="">
                        <option value="" disabled>Select a topic...</option>
                        <option>Schedule an Appointment</option>
                        <option>Second Opinion</option>
                        <option>Insurance Question</option>
                        <option>Post-Surgery Follow-Up</option>
                        <option>General Inquiry</option>
                      </select>
                    </div>
                    <div className="contact-field">
                      <label>Message <span className="required">*</span></label>
                      <textarea placeholder="Tell us about your concern or question. Include any relevant details such as injury type, symptoms, or prior treatments..." required />
                    </div>
                    <button type="submit" className="contact-submit">
                      Send Message
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    </button>
                    <p className="contact-form-note">We respect your privacy. Your information will never be shared.</p>
                  </form>
                </>
              )}
              <div className="contact-trust-badges">
                <div className="trust-badge">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  HIPAA Compliant
                </div>
                <div className="trust-badge">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  Response within 24 hours
                </div>
                <div className="trust-badge">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Secure &amp; Private
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <GetStarted />
      <Locations />
    </>
  );
}
