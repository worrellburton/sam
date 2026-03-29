import Link from "next/link";

export function GetStarted() {
  return (
    <section className="section contact reveal" id="contact">
      <div className="container">
        <div className="contact-content">
          <div className="contact-text">
            <p className="section-label">Get Started</p>
            <h2>
              Get Back to <span className="text-accent">What You Love</span>
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
              <Link href="/book" className="btn btn-primary btn-lg btn-block">
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
