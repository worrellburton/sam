import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-brand footer-brand-card">
          <div className="footer-headshot">
            <Image src="/images/Character Reference Sheet.jpg" alt="Dr. Sameh Elguizaoui" width={144} height={144} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%", transform: "scale(1.4)" }} />
          </div>
          <div className="footer-brand-info">
            <p className="footer-name">Sameh Elguizaoui, M.D.</p>
            <p className="footer-tagline">Board-Certified Orthopedic Surgeon &amp; Sports Medicine Specialist</p>
            <p className="footer-affiliations">Lenox Hill Hospital &bull; Mount Sinai Hospital &bull; NYP Brooklyn Methodist</p>
            <div className="footer-social">
              <a href="https://www.instagram.com/sportsdocsam/" target="_blank" rel="noopener" aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a href="https://www.linkedin.com/in/sam-elguizaoui-md/" target="_blank" rel="noopener" aria-label="LinkedIn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div className="footer-grid">
          <div className="footer-col">
            <h4>Services</h4>
            <Link href="/services/sports-medicine">Sports Medicine</Link>
            <Link href="/services/arthroscopic-surgery">Arthroscopic Surgery</Link>
            <Link href="/services/joint-preservation">Joint Preservation</Link>
            <Link href="/services/cartilage-repair">Cartilage Repair</Link>
            <Link href="/services/regenerative-medicine">Regenerative Medicine</Link>
            <Link href="/services/shoulder-knee-surgery">Shoulder &amp; Knee Surgery</Link>
          </div>
          <div className="footer-col">
            <h4>Quick Links</h4>
            <Link href="/about">About Dr. Elguizaoui</Link>
            <Link href="/#credentials">Credentials</Link>
            <Link href="/reviews">Reviews</Link>
            <Link href="/#locations">Locations</Link>
            <Link href="/contact">Contact</Link>
          </div>
          <div className="footer-col">
            <h4>Resources</h4>
            <Link href="/faq">FAQ</Link>
            <Link href="/blog">Blog</Link>
          </div>
          <div className="footer-col">
            <h4>Contact</h4>
            <a href="tel:+19179059370">+1-917-905-9370</a>
            <a href="https://www.zocdoc.com/doctor/sam-elguizaoui-md-236423" target="_blank" rel="noopener">Book Now</a>
            <a href="https://www.sportsorthomd.com/" target="_blank" rel="noopener">SportsOrthoMD.com</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Sameh Elguizaoui, M.D. &mdash; The information on this website is for general informational purposes only and does not constitute medical advice.</p>
        </div>
      </div>
    </footer>
  );
}
