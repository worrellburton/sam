import { Link } from "react-router";
import type { Route } from "./+types/home";
import { GetStarted } from "~/components/GetStarted";
import { Locations } from "~/components/Locations";
import { services } from "~/data/services";
import { blogPosts } from "~/data/blog";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sameh Elguizaoui, M.D. | Orthopedic Surgeon & Sports Medicine | NYC" },
    {
      name: "description",
      content:
        "Board-certified orthopedic surgeon Dr. Sameh Elguizaoui specializes in sports medicine, knee & shoulder surgery, and cartilage repair in NYC. 1,400+ reviews.",
    },
  ];
}

const tickerItems = [
  {
    icon: (
      <img src="https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/nyj.png&h=40&w=40" alt="New York Jets" width="32" height="32" />
    ),
    text: "New York Jets Team Physician",
    em: "NFL",
  },
  {
    icon: (
      <img src="https://a.espncdn.com/combiner/i?img=/i/teamlogos/nhl/500/nyi.png&h=40&w=40" alt="New York Islanders" width="32" height="32" />
    ),
    text: "New York Islanders Team Physician",
    em: "NHL",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    text: "Board Certified",
    em: "Orthopedic Surgery",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e8792b" strokeWidth="1.5">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
    text: "4.8 \u2605 Rating",
    em: "1,466+ Reviews",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5">
        <path d="M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7H3l2-4h14l2 4M5 21V10.87M19 21V10.87" />
      </svg>
    ),
    text: "Lenox Hill Hospital",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5">
        <path d="M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7H3l2-4h14l2 4M5 21V10.87M19 21V10.87" />
      </svg>
    ),
    text: "Cleveland Clinic Trained",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    text: "International Fellowship",
    em: "Switzerland \u2022 Netherlands \u2022 Italy",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
        <path d="M9 14l2 2 4-4" />
      </svg>
    ),
    text: "Magna Cum Laude",
    em: "Ohio State University",
  },
];

const insuranceLogos = [
  { name: "Aetna", logo: "https://logo.clearbit.com/aetna.com" },
  { name: "BlueCross BlueShield", logo: "https://logo.clearbit.com/bcbs.com" },
  { name: "UnitedHealthcare", logo: "https://logo.clearbit.com/uhc.com" },
  { name: "UnitedHealthcare Oxford", logo: "https://logo.clearbit.com/oxfordhealth.com" },
  { name: "Cigna", logo: "https://logo.clearbit.com/cigna.com" },
  { name: "Empire BlueCross", logo: "https://logo.clearbit.com/empireblue.com" },
];

const slideImages = [
  "https://images.unsplash.com/photo-1461896836934-bd45ba55ae57?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1544298621-35a764866120?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=1920&q=80",
];

const timeline = [
  { label: "Fellowship", title: "Sports Medicine Fellowship", place: "Lenox Hill Hospital, New York City", detail: "Advanced training in minimally invasive and arthroscopic techniques. Care of NY Jets and NY Islanders athletes." },
  { label: "International Fellowship", title: "Joint Preservation Traveling Fellowship", place: "Switzerland, Netherlands & Italy", detail: "Specialized training in cartilage repair and transplant techniques at leading European clinics." },
  { label: "Residency", title: "Orthopedic Surgery Residency", place: "Cleveland Clinic Akron General Hospital" },
  { label: "Medical School", title: "Doctor of Medicine (M.D.)", place: "The Ohio State University College of Medicine", detail: "Graduated cum laude" },
  { label: "Undergraduate", title: "Bachelor of Science, Biology", place: "The Ohio State University", detail: "Graduated magna cum laude, Psychology minor" },
];

export default function Home() {
  const recentPosts = blogPosts.slice(0, 3);

  return (
    <>
      {/* Hero */}
      <header className="hero" id="hero">
        <img className="hero-bg-img loaded" src="/sammd/header.jpg" alt="" aria-hidden="true" />
        <div className="hero-overlay"></div>
        <div className="container hero-content">
          <div className="hero-text">
            <h1>NYC&rsquo;s Most Trusted Orthopedic Surgeon &mdash; Sports Medicine and Joint Preservation Expert</h1>
            <a href="#about" className="btn btn-hero">Learn More</a>
          </div>
          <div className="hero-rating-card">
            <div className="rating-top">
              <div className="rating-score">4.8<span className="rating-star">&#9733;</span></div>
              <div className="rating-info">
                <span className="rating-platform">Rating on Zocdoc</span>
                <span className="rating-count"><strong>1,466</strong> Reviews</span>
              </div>
            </div>
            <div className="rating-bottom">
              <div className="rating-avatars">
                <div className="avatar">S</div>
                <div className="avatar">M</div>
                <div className="avatar">A</div>
              </div>
              <span className="rating-zocdoc">Zocdoc</span>
            </div>
          </div>
        </div>
        <div className="ticker-bar">
          <div className="ticker-track">
            {[1, 2].map((set) =>
              tickerItems.map((item, i) => (
                <span key={`${set}-${i}`}>
                  {i > 0 && <div className="ticker-sep">&bull;</div>}
                  <div className="ticker-item">
                    {item.icon}
                    <span>{item.text} {item.em && <em>{item.em}</em>}</span>
                  </div>
                </span>
              ))
            )}
          </div>
        </div>
      </header>

      {/* About */}
      <section className="section about reveal" id="about">
        <div className="container">
          <div className="about-layout">
            <div className="about-photo">
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

      {/* Insurance */}
      <section className="section insurance reveal" id="insurance">
        <div className="container">
          <div className="section-header">
            <p className="section-label">Insurance</p>
            <h2>In-Network <span className="text-accent">Insurance Plans</span></h2>
            <p className="section-desc">Dr. Elguizaoui accepts most major insurance plans. <strong style={{ color: "var(--accent)" }}>99% of patients</strong> have successfully booked with their insurance.</p>
          </div>
          <div className="insurance-grid">
            {insuranceLogos.map((ins) => (
              <div className="insurance-card" key={ins.name}>
                <div className="insurance-logo" style={{ background: "transparent" }}>
                  <img src={ins.logo} alt={`${ins.name} logo`} width="56" height="56" loading="lazy" style={{ borderRadius: "8px", objectFit: "contain" }} />
                </div>
                <span>{ins.name}</span>
              </div>
            ))}
            <div className="insurance-card insurance-more">
              <span>200+ more in-network plans</span>
              <a href="https://www.zocdoc.com/doctor/sam-elguizaoui-md-236423" target="_blank" rel="noopener">View All on Zocdoc</a>
            </div>
          </div>
        </div>
      </section>

      {/* Specialties */}
      <section className="section specialties reveal" id="specialties">
        <div className="container">
          <div className="section-header">
            <p className="section-label">Areas of Expertise</p>
            <h2>Specialized Orthopedic <span className="text-accent">Treatments</span></h2>
            <p className="section-desc">From advanced arthroscopic surgery to cutting-edge regenerative therapies, Dr. Elguizaoui offers comprehensive orthopedic care tailored to your needs and goals.</p>
          </div>
          <div className="specialties-grid">
            {services.map((svc) => (
              <Link to={`/services/${svc.slug}`} className="specialty-card specialty-link" key={svc.slug}>
                <div className="specialty-overlay"></div>
                <h3 className="specialty-title">{svc.title}</h3>
                <div className="specialty-detail">
                  <p>{svc.detail}</p>
                  <span className="specialty-arrow">Learn more &rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Move Easier Banner */}
      <section className="move-easier-section" id="moveEasierSection">
        {slideImages.map((url, i) => (
          <div key={i} className={`move-easier-bg${i === 0 ? " active" : ""}`} style={{ backgroundImage: `url('${url}')` }}></div>
        ))}
        <div className="move-easier-marquee">
          <div className="marquee-track">
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i}>Move easier</span>
            ))}
          </div>
        </div>
        <div className="move-easier-content">
          <h2>Getting you back in the game!</h2>
          <p>Whether you are a world class athlete or a weekend warrior, Dr. Elguizaoui understands the importance of getting you back to the sports and activities that you love.</p>
          <Link to="/services/sports-medicine" className="btn btn-hero">View Sports Medicine &rarr;</Link>
        </div>
      </section>

      {/* Credentials */}
      <section className="section credentials reveal" id="credentials">
        <div className="container">
          <div className="section-header">
            <p className="section-label">Training &amp; Credentials</p>
            <h2>World-Class <span className="text-accent">Education &amp; Training</span></h2>
          </div>
          <div className="credentials-timeline">
            {timeline.map((item, i) => (
              <div className="timeline-item" key={i}>
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <span className="timeline-label">{item.label}</span>
                  <h3>{item.title}</h3>
                  <p>{item.place}</p>
                  {item.detail && <p className="timeline-detail">{item.detail}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="section reviews reveal" id="reviews">
        <div className="container">
          <div className="section-header">
            <p className="section-label">Patient Reviews</p>
            <h2>Trusted by <span className="text-accent">Patients</span></h2>
            <p className="section-desc">Consistently rated among the top orthopedic surgeons in New York City.</p>
          </div>
          <div className="reviews-cta">
            <p>See what patients are saying about Dr. Elguizaoui</p>
            <a href="https://www.zocdoc.com/doctor/sam-elguizaoui-md-236423" target="_blank" rel="noopener" className="btn btn-outline">Read Reviews on Zocdoc</a>
          </div>
        </div>
      </section>

      {/* Blog Preview */}
      <section className="section blog-home reveal" id="blog">
        <div className="container">
          <div className="section-header">
            <p className="section-label">From the Blog</p>
            <h2>Orthopedic <span className="text-accent">Insights</span></h2>
            <p className="section-desc">Expert tips on joint health, recovery, and sports medicine from Dr. Elguizaoui.</p>
          </div>
          <div className="blog-home-grid">
            {recentPosts.map((post) => (
              <Link to={`/blog/${post.slug}`} className="blog-card" key={post.slug}>
                <img className="blog-card-img" src={post.image} alt={post.imageAlt} loading="lazy" />
                <div className="blog-card-body">
                  <span className="blog-card-tag">{post.tag}</span>
                  <h3>{post.title}</h3>
                  <span className="blog-card-meta">{post.date}</span>
                </div>
              </Link>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: "40px" }}>
            <Link to="/blog" className="btn btn-outline">View All Articles &rarr;</Link>
          </div>
        </div>
      </section>

      <GetStarted />
      <Locations />
    </>
  );
}
