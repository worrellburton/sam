"use client";

import { useState } from "react";

// Contact form client island. Everything outside this component on the
// /contact page is pure server markup.
export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ marginBottom: "16px" }}>
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <h3 style={{ marginBottom: "8px" }}>Message Sent</h3>
        <p style={{ color: "var(--text-light)", marginBottom: "20px" }}>
          Thank you for reaching out. We&rsquo;ll get back to you within one business day.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="btn btn-outline"
          style={{ fontSize: "0.9rem" }}
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <>
      <h3>Send Us a Message</h3>
      <p>Fill out the form below and we&rsquo;ll get back to you promptly.</p>
      <form className="contact-form" onSubmit={handleSubmit}>
        <div className="contact-form-row">
          <div className="contact-field">
            <label htmlFor="contact-first-name">First Name <span className="required">*</span></label>
            <input id="contact-first-name" type="text" placeholder="John" required />
          </div>
          <div className="contact-field">
            <label htmlFor="contact-last-name">Last Name <span className="required">*</span></label>
            <input id="contact-last-name" type="text" placeholder="Doe" required />
          </div>
        </div>
        <div className="contact-form-row">
          <div className="contact-field">
            <label htmlFor="contact-email">Email <span className="required">*</span></label>
            <input id="contact-email" type="email" placeholder="john@example.com" required />
          </div>
          <div className="contact-field">
            <label htmlFor="contact-phone">Phone</label>
            <input id="contact-phone" type="tel" placeholder="(555) 123-4567" />
          </div>
        </div>
        <div className="contact-field">
          <label htmlFor="contact-subject">Subject</label>
          <select id="contact-subject" defaultValue="">
            <option value="" disabled>Select a topic...</option>
            <option>Schedule an Appointment</option>
            <option>Second Opinion</option>
            <option>Insurance Question</option>
            <option>Post-Surgery Follow-Up</option>
            <option>General Inquiry</option>
          </select>
        </div>
        <div className="contact-field">
          <label htmlFor="contact-message">Message <span className="required">*</span></label>
          <textarea id="contact-message" placeholder="Tell us about your concern or question. Include any relevant details such as injury type, symptoms, or prior treatments..." required />
        </div>
        <button type="submit" className="contact-submit">
          Send Message
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
        <p className="contact-form-note">We respect your privacy. Your information will never be shared.</p>
      </form>
    </>
  );
}
