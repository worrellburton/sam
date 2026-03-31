"use client";

import Link from "next/link";
import Image from "next/image";
import { GetStarted } from "@/components/GetStarted";
import { Locations } from "@/components/Locations";
import { Insurance } from "@/components/Insurance";
import { useEffect, useRef, useState } from "react";

// ── SVG Icons ──────────────────────────────────────────────────────
const icons = {
  shield: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <polyline points="9 12 11 14 15 10"/>
    </svg>
  ),
  globe: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
  activity: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
  ),
  droplet: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
    </svg>
  ),
  award: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
    </svg>
  ),
  users: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  heart: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  microscope: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 14h2"/><path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"/><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/>
    </svg>
  ),
  star: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  ),
  book: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  ),
  plane: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
    </svg>
  ),
  check: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  dumbbell: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6.5 6.5h11M6 12h12M2 8v8M6 6v12M18 6v12M22 8v8"/>
    </svg>
  ),
};

// ── Animated Counter ───────────────────────────────────────────────
function AnimatedStat({ value, suffix = "", label }: { value: number; suffix?: string; label: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const duration = 1200;
        const start = performance.now();
        const animate = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.round(eased * value));
          if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="abt-stat">
      <div className="abt-stat-value">{count}{suffix}</div>
      <div className="abt-stat-label">{label}</div>
    </div>
  );
}

// ── Data ───────────────────────────────────────────────────────────
const timeline = [
  { year: "2007", label: "Undergraduate", title: "B.S. Biology, Minor in Psychology", place: "The Ohio State University", detail: "Graduated magna cum laude. Psychology minor informs his biopsychosocial approach to patient care.", icon: icons.book },
  { year: "2011", label: "Medical School", title: "Doctor of Medicine (M.D.)", place: "The Ohio State University College of Medicine", detail: "Graduated cum laude. Sustained trajectory of academic excellence.", icon: icons.award },
  { year: "2016", label: "Residency", title: "Orthopedic Surgery Residency", place: "Cleveland Clinic Akron General Hospital", detail: "High-volume trauma exposure in the Cleveland Clinic system. Began research on antibiotic-impregnated bone cement.", icon: icons.microscope },
  { year: "2017", label: "Fellowship", title: "Sports Medicine Fellowship", place: "Lenox Hill Hospital — NISMAT, NYC", detail: "Trained at America's first hospital-based sports medicine institute. Team physician for the NY Jets, NY Islanders, and collegiate programs.", icon: icons.activity },
  { year: "2018", label: "International", title: "Joint Preservation Traveling Fellowship", place: "Switzerland • Netherlands • Italy", detail: "Mastered European cartilage repair, osteotomy, and meniscus transplantation techniques at premier centers.", icon: icons.plane },
];

const kneeProcs = [
  { name: "ACL Reconstruction", desc: "Anatomic graft placement to restore stability and prevent future arthritis" },
  { name: "Meniscus Transplantation", desc: "Donor meniscus to restore load transmission and protect cartilage" },
  { name: "Cartilage Repair (OATS/MACI)", desc: "Lab-grown cells or bone/cartilage plugs to fill chondral defects" },
  { name: "Total Knee Arthroplasty", desc: "When preservation is impossible — minimally invasive replacement" },
];

const shoulderProcs = [
  { name: "Rotator Cuff Repair", desc: "Arthroscopic reattachment of torn shoulder tendons" },
  { name: "Labrum / Instability Repair", desc: "Treating dislocations common in contact athletes" },
  { name: "Shoulder Arthroplasty", desc: "Total or reverse shoulder replacement for end-stage arthritis" },
];

const researchPubs = [
  { title: "Intraarticular Concentration of Tobramycin Using Low-dose Tobramycin Bone Cement in TKA", journal: "Clinical Orthopaedics and Related Research (CORR)", impact: "Established safety protocols for antibiotic delivery in knee implants" },
  { title: "Press-fit Stability of an Osteochondral Autograft: Influence of Plug Length and Depth Alignment", journal: "Orthopedic Research", impact: "Demonstrated importance of precise graft placement in OATS procedures" },
];

export default function AboutPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Where did Dr. Elguizaoui complete his orthopedic training?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Dr. Elguizaoui earned his medical degree from The Ohio State University College of Medicine, completed his orthopedic surgery residency at Cleveland Clinic Akron General Hospital, and his sports medicine fellowship at Lenox Hill Hospital (NISMAT) in NYC. He also completed an international joint preservation traveling fellowship across Switzerland, the Netherlands, and Italy."
        }
      },
      {
        "@type": "Question",
        "name": "Is Dr. Elguizaoui board certified?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, Dr. Sameh Elguizaoui is board certified by the American Board of Orthopaedic Surgery. He is also fellowship-trained in sports medicine, making him doubly qualified to treat complex musculoskeletal and athletic injuries."
        }
      },
      {
        "@type": "Question",
        "name": "What professional sports teams has Dr. Elguizaoui worked with?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Dr. Elguizaoui served as a team physician for the New York Jets (NFL) and the New York Islanders (NHL) during his fellowship at Lenox Hill Hospital. He also provided coverage for collegiate athletics programs including Manhattanville College and Hunter College."
        }
      },
      {
        "@type": "Question",
        "name": "What is Dr. Elguizaoui's approach to orthopedic care?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Dr. Elguizaoui prioritizes a joint preservation and biology-first approach. Rather than defaulting to joint replacement, he uses cutting-edge biologics, cartilage repair techniques, and minimally invasive arthroscopic surgery to extend the natural joint's lifespan, especially for young active patients with high functional demands."
        }
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="abt-hero">
        <div className="abt-hero-bg" />
        <div className="container abt-hero-content reveal">
          <p className="section-label">About Dr. Elguizaoui</p>
          <h1 className="abt-hero-title">
            The Science of <span className="text-accent">Preserving Motion</span>
          </h1>
          <p className="abt-hero-sub">
            Fellowship-trained orthopedic surgeon pioneering joint preservation, biologics, and minimally invasive sports medicine in New York City.
          </p>
          <div className="abt-hero-ctas">
            <Link href="/book" className="btn btn-primary">Book Consultation</Link>
            <a href="#philosophy" className="btn btn-outline">Learn More</a>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ──────────────────────────────────────────── */}
      <section className="abt-stats-bar reveal">
        <div className="container abt-stats-row">
          <AnimatedStat value={1400} suffix="+" label="Patient Reviews" />
          <AnimatedStat value={4} label="NYC Locations" />
          <AnimatedStat value={3} label="Countries Trained In" />
          <AnimatedStat value={91} suffix="%" label="Wait < 30 min" />
        </div>
      </section>

      {/* ── Philosophy ─────────────────────────────────────────── */}
      <section className="section" id="philosophy">
        <div className="container">
          <div className="abt-split reveal">
            <div className="abt-split-img">
              <Image src="/header.jpg" alt="Dr. Sam Elguizaoui performing surgery" className="abt-portrait" width={1200} height={669} />
            </div>
            <div className="abt-split-text">
              <p className="section-label">Clinical Philosophy</p>
              <h2>&ldquo;Preserving the Joint. <span className="text-accent">Restoring the Athlete.</span>&rdquo;</h2>
              <p className="abt-lead-text">
                Dr. Sameh (Sam) Elguizaoui stands at the forefront of a paradigm shift in orthopedics — moving from the historic &ldquo;reconstructive&rdquo; model toward <strong>biological restoration and joint salvage</strong>. His practice prioritizes extending the native joint&rsquo;s lifespan through cutting-edge biologics, cartilage repair, and minimally invasive techniques.
              </p>
              <p>
                His target demographic is the <strong>&ldquo;young active patient&rdquo;</strong> — a group that presents some of the most difficult challenges due to high functional demands and longer life expectancy. Where a standard surgeon might recommend waiting for a replacement, Dr. Elguizaoui sees an opportunity for biologic salvage.
              </p>
              <div className="abt-philosophy-points">
                <div className="abt-point"><span className="abt-point-icon">{icons.check}</span> Preservation over replacement</div>
                <div className="abt-point"><span className="abt-point-icon">{icons.check}</span> Biology-first approach</div>
                <div className="abt-point"><span className="abt-point-icon">{icons.check}</span> Minimally invasive techniques</div>
                <div className="abt-point"><span className="abt-point-icon">{icons.check}</span> Psychology-informed bedside manner</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Training Timeline ──────────────────────────────────── */}
      <section className="section abt-timeline-section">
        <div className="container">
          <div className="section-header reveal">
            <p className="section-label">Training &amp; Credentials</p>
            <h2>From Ohio to <span className="text-accent">NYC &amp; Europe</span></h2>
            <p className="section-desc">A deliberate accumulation of elite training — from Midwest trauma to Manhattan sports medicine to European joint preservation.</p>
          </div>
          <div className="abt-timeline">
            {timeline.map((item, i) => (
              <div className="abt-tl-item reveal" key={i} style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className="abt-tl-line">
                  <div className="abt-tl-dot">{item.icon}</div>
                </div>
                <div className="abt-tl-card">
                  <span className="abt-tl-year">{item.year}</span>
                  <span className="abt-tl-label">{item.label}</span>
                  <h3>{item.title}</h3>
                  <p className="abt-tl-place">{item.place}</p>
                  {item.detail && <p className="abt-tl-detail">{item.detail}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Clinical Expertise ─────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="section-header reveal">
            <p className="section-label">Clinical Specialization</p>
            <h2>The Science of <span className="text-accent">Joint Preservation</span></h2>
            <p className="section-desc">A highly specialized practice focused on Sports Medicine, Arthroscopy, and Biologics — not a high-volume factory for joint replacements.</p>
          </div>

          <div className="abt-expertise-grid">
            <div className="abt-expertise-card reveal">
              <div className="abt-expertise-header">
                <div className="abt-expertise-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                </div>
                <h3>Knee Preservation &amp; Reconstruction</h3>
              </div>
              <div className="abt-proc-list">
                {kneeProcs.map((p) => (
                  <div className="abt-proc" key={p.name}>
                    <div className="abt-proc-name">{p.name}</div>
                    <div className="abt-proc-desc">{p.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="abt-expertise-card reveal">
              <div className="abt-expertise-header">
                <div className="abt-expertise-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="5" r="3"/><path d="M12 22V8M5 12H2a10 10 0 0 0 20 0h-3"/></svg>
                </div>
                <h3>Shoulder Complex</h3>
              </div>
              <div className="abt-proc-list">
                {shoulderProcs.map((p) => (
                  <div className="abt-proc" key={p.name}>
                    <div className="abt-proc-name">{p.name}</div>
                    <div className="abt-proc-desc">{p.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="abt-expertise-card abt-expertise-full reveal">
              <div className="abt-expertise-header">
                <div className="abt-expertise-icon abt-expertise-icon-accent">{icons.droplet}</div>
                <h3>Regenerative Medicine &amp; Biologics</h3>
              </div>
              <p className="abt-bio-desc">A bridge between conservative management and invasive surgery — using the body&rsquo;s own biology to heal.</p>
              <div className="abt-bio-grid">
                <div className="abt-bio-item">
                  <strong>Platelet-Rich Plasma (PRP)</strong>
                  <span>Concentrated growth factors for tendonitis and mild arthritis</span>
                </div>
                <div className="abt-bio-item">
                  <strong>Viscosupplementation</strong>
                  <span>Hyaluronic acid to lubricate and cushion joints</span>
                </div>
                <div className="abt-bio-item">
                  <strong>Bone Marrow Aspirate</strong>
                  <span>Mesenchymal stem cells to augment healing in cuff and cartilage repairs</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Team Coverage ──────────────────────────────────────── */}
      <section className="section abt-teams-section">
        <div className="container">
          <div className="section-header reveal">
            <p className="section-label">Pro Sports Experience</p>
            <h2>Trusted by <span className="text-accent">Elite Athletes</span></h2>
            <p className="section-desc">Sideline coverage with the highest-risk collision athletes in the world — where surgical outcomes are measured in careers.</p>
          </div>
          <div className="abt-teams-grid reveal-stagger">
            <div className="abt-team-card">
              <div className="abt-team-badge" style={{ background: "rgba(30,100,60,0.12)", color: "#1e6a3c" }}>NFL</div>
              <h3>New York Jets</h3>
              <p>Acute trauma management, concussion protocols, and return-to-play clearances for professional football athletes.</p>
            </div>
            <div className="abt-team-card">
              <div className="abt-team-badge" style={{ background: "rgba(0,55,119,0.12)", color: "#003777" }}>NHL</div>
              <h3>New York Islanders</h3>
              <p>High-velocity impact injuries, skate lacerations, and hockey-specific hip and groin pathology management.</p>
            </div>
            <div className="abt-team-card">
              <div className="abt-team-badge" style={{ background: "rgba(99,102,241,0.12)", color: "#6366f1" }}>NCAA</div>
              <h3>Collegiate Athletics</h3>
              <p>Manhattanville College &amp; Hunter College — balancing athletic goals with long-term health and academic obligations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Research ───────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="section-header reveal">
            <p className="section-label">Research &amp; Publications</p>
            <h2>From Bench to <span className="text-accent">Bedside</span></h2>
            <p className="section-desc">Not merely a consumer of medical literature — a contributor addressing fundamental problems in infection control and graft stability.</p>
          </div>
          <div className="abt-research-grid reveal-stagger">
            {researchPubs.map((pub, i) => (
              <div className="abt-research-card" key={i}>
                <div className="abt-research-icon">{icons.microscope}</div>
                <h3>{pub.title}</h3>
                <p className="abt-research-journal">{pub.journal}</p>
                <p className="abt-research-impact">{pub.impact}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Global Health ──────────────────────────────────────── */}
      <section className="section abt-global-section">
        <div className="container">
          <div className="abt-split abt-split-reverse reveal">
            <div className="abt-split-text">
              <p className="section-label">Global Health Leadership</p>
              <h2>Education <span className="text-accent">Over Tourism</span></h2>
              <p>
                Through <strong>Orthonations</strong>, Dr. Elguizaoui participates in medical missions to <strong>Vietnam and Nepal</strong> — not to fly in and leave, but to engage in collaborative learning that builds sustainable healthcare systems.
              </p>
              <div className="abt-global-points">
                <div className="abt-global-point">
                  <div className="abt-global-icon">{icons.book}</div>
                  <div>
                    <strong>Didactic Presentations</strong>
                    <p>Teaching modern techniques to local surgeons</p>
                  </div>
                </div>
                <div className="abt-global-point">
                  <div className="abt-global-icon">{icons.users}</div>
                  <div>
                    <strong>Collaborative Surgery</strong>
                    <p>Scrubbing in with local residents to tackle complex cases together</p>
                  </div>
                </div>
                <div className="abt-global-point">
                  <div className="abt-global-icon">{icons.heart}</div>
                  <div>
                    <strong>Resource Adaptability</strong>
                    <p>Working with limited resources while respecting local expertise</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="abt-split-img abt-global-visual">
              <div className="abt-globe-card">
                <div className="abt-globe-icon">{icons.globe}</div>
                <div className="abt-globe-countries">
                  <span>Vietnam</span>
                  <span>Nepal</span>
                  <span>Switzerland</span>
                  <span>Netherlands</span>
                  <span>Italy</span>
                </div>
                <p>5 countries across 3 continents</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── The Physician-Athlete ──────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="abt-personal reveal">
            <div className="abt-personal-icon">{icons.dumbbell}</div>
            <div className="abt-personal-text">
              <h2>The Physician-Athlete</h2>
              <p>
                A family man married with four children, Dr. Elguizaoui embodies the &ldquo;physician-athlete&rdquo; archetype. His personal interests — <strong>weightlifting and biking</strong> — allow him to empathize experientially with the frustrations of his active patient base. When a patient describes the mechanical pain of a squat or the endurance limits of a cyclist, he doesn&rsquo;t merely analyze the anatomy theoretically — he understands the biomechanics firsthand.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Reputation ─────────────────────────────────────────── */}
      <section className="section abt-reputation-section">
        <div className="container">
          <div className="section-header reveal">
            <p className="section-label">Patient Reputation</p>
            <h2>The <span className="text-accent">&ldquo;Empathy&rdquo; Factor</span></h2>
          </div>
          <div className="abt-reputation-grid reveal-stagger">
            <div className="abt-rep-card">
              <div className="abt-rep-icon">{icons.star}</div>
              <div className="abt-rep-stat">4.78/5</div>
              <div className="abt-rep-source">Zocdoc &middot; 1,400+ reviews</div>
              <p>&ldquo;He listens, takes time, and answers every question.&rdquo;</p>
            </div>
            <div className="abt-rep-card">
              <div className="abt-rep-icon">{icons.star}</div>
              <div className="abt-rep-stat">5.0/5</div>
              <div className="abt-rep-source">Healthgrades</div>
              <p>&ldquo;Very practical advice. Not a surgery-first algorithm.&rdquo;</p>
            </div>
            <div className="abt-rep-card">
              <div className="abt-rep-icon">{icons.users}</div>
              <div className="abt-rep-stat">91%</div>
              <div className="abt-rep-source">Wait &lt; 30 minutes</div>
              <p>Operational efficiency that distinguishes his practice from academic medical centers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Affiliations ───────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="section-header reveal">
            <p className="section-label">Hospital Affiliations</p>
            <h2>Privileged at <span className="text-accent">Premier Institutions</span></h2>
          </div>
          <div className="abt-affiliations reveal-stagger">
            <div className="abt-affil-card">
              <div className="abt-affil-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M3 21h18M3 7v14M21 7v14M6 21V10M10 21V10M14 21V10M18 21V10M12 7V3l-9 4h18l-9-4z"/></svg>
              </div>
              <h3>Lenox Hill Hospital</h3>
              <p>Primary surgical home &middot; Northwell Health &middot; Home of NISMAT</p>
            </div>
            <div className="abt-affil-card">
              <div className="abt-affil-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M3 21h18M3 7v14M21 7v14M6 21V10M10 21V10M14 21V10M18 21V10M12 7V3l-9 4h18l-9-4z"/></svg>
              </div>
              <h3>The Mount Sinai Hospital</h3>
              <p>Associate Physician &middot; One of the largest teaching hospitals in the US</p>
            </div>
            <div className="abt-affil-card">
              <div className="abt-affil-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M3 21h18M3 7v14M21 7v14M6 21V10M10 21V10M14 21V10M18 21V10M12 7V3l-9 4h18l-9-4z"/></svg>
              </div>
              <h3>Mount Sinai Queens</h3>
              <p>Queens &amp; Long Island City surgical access</p>
            </div>
          </div>
        </div>
      </section>

      <Insurance />
      <GetStarted />
      <Locations />
    </>
  );
}
