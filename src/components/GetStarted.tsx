import { SpecialtyCanvas } from "@/components/SpecialtyCanvas";

export function GetStarted() {
  return (
    <section
      className="section contact reveal"
      id="contact"
      style={{ position: "relative", overflow: "hidden" }}
    >
      {/* Reuse the "sports-medicine" DNA double-helix shader from the
          Areas of Expertise section as the CTA backdrop. A navy overlay
          sits on top so the headline + list stay legible regardless of
          the shader frame brightness. */}
      <SpecialtyCanvas slug="sports-medicine" className="contact-bg-canvas" />
      <div className="contact-bg-overlay" />

      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <div className="contact-content">
          <div className="contact-text">
            <p className="section-label">Get Started</p>
            <h2>
              Get Back to<br /><span className="text-accent">What You Love</span>
            </h2>
            <p>
              Take the first step toward recovery. Schedule a consultation with Dr. Elguizaoui to discuss your condition
              and explore your treatment options.
            </p>
            <ul className="contact-benefits">
              <li>Personalized treatment plans tailored to your goals</li>
              <li>Minimally invasive approaches for faster recovery</li>
              <li>Multiple convenient NYC locations</li>
              <li>Same-week appointments available for urgent concerns</li>
            </ul>
          </div>
          <div className="contact-actions">
            <div className="contact-card">
              <h3>Book Online</h3>
              <p>Schedule your appointment online for instant confirmation.</p>
              <a href="https://www.zocdoc.com/doctor/sam-elguizaoui-md-236423" target="_blank" rel="noopener" className="btn btn-zocdoc btn-lg btn-block">
                Book on Zocdoc
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
