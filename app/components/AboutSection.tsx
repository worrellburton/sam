import { useRef, useEffect } from "react";

export function AboutSection() {
  const aboutPhotoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleScroll() {
      if (!aboutPhotoRef.current) return;
      const rect = aboutPhotoRef.current.getBoundingClientRect();
      const viewH = window.innerHeight;
      if (rect.top < viewH && rect.bottom > 0) {
        const progress = (viewH - rect.top) / (viewH + rect.height);
        const offset = (progress - 0.5) * 60;
        aboutPhotoRef.current.style.transform = `translateY(${offset}px)`;
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="section about reveal" id="about">
      <div className="container">
        <div className="about-layout">
          <div className="about-photo" ref={aboutPhotoRef}>
            <picture>
              <source srcSet="/sammd/header.webp" type="image/webp" />
              <img src="/sammd/header.jpg" alt="Dr. Sam Elguizaoui - Orthopedic Surgeon" className="about-portrait" loading="lazy" width="1200" height="669" />
            </picture>
          </div>
          <div className="about-right">
            <div className="about-header">
              <p className="section-label">About Dr. Elguizaoui</p>
              <h2>Orthopedic Excellence, <span className="text-accent">Patient-First Approach</span></h2>
            </div>
            <div className="about-content">
              <p className="about-lead">Board-certified orthopedic surgeon and fellowship-trained sports medicine specialist in New York City, combining world-class surgical training with conservative, patient-centered care.</p>
              <p>Trained at <strong>Cleveland Clinic</strong> and <strong>Lenox Hill Hospital</strong>, with an international fellowship across <strong>Switzerland, the Netherlands, and Italy</strong> in joint preservation and cartilage repair.</p>
              <p>Former team physician for the <strong>New York Jets (NFL)</strong> and <strong>New York Islanders (NHL)</strong>.</p>
            </div>
            <div className="about-highlights">
              <div className="highlight-card">
                <div className="highlight-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1a3a5c" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                </div>
                <h3>Board Certified</h3>
                <p>American Board of Orthopaedic Surgery</p>
              </div>
              <div className="highlight-card">
                <div className="highlight-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1a3a5c" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                </div>
                <h3>International Training</h3>
                <p>Fellowship across Switzerland, Netherlands &amp; Italy</p>
              </div>
              <div className="highlight-card">
                <div className="highlight-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1a3a5c" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                </div>
                <h3>Pro Sports Experience</h3>
                <p>NY Jets (NFL) &bull; NY Islanders (NHL)</p>
              </div>
              <div className="highlight-card">
                <div className="highlight-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1a3a5c" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                </div>
                <h3>1,400+ Reviews</h3>
                <p>4.8/5 stars across major platforms</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
