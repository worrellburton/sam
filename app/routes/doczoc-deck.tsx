import { useState, useEffect, useRef, useCallback } from "react";
import { seoMeta } from "~/seo";

export function meta() {
  return seoMeta({
    title: "DocZoc — Pitch Deck",
    description: "DocZoc: The AI-powered platform connecting patients with the right doctors. Investor pitch deck.",
    path: "/doczoc/deck",
  });
}

// ── Slide Data ─────────────────────────────────────────────────────
const SLIDES: {
  id: string;
  label: string;
  title: string;
  accent?: string;
  content: () => React.ReactNode;
}[] = [
  // 1. INTRO
  {
    id: "intro",
    label: "Intro",
    title: "",
    content: () => (
      <div className="dk-intro-slide">
        <div className="dk-intro-logo dk-stagger" style={{ animationDelay: "0.1s" }}>
          <div className="dk-logo-mark">D</div>
        </div>
        <h1 className="dk-intro-title dk-stagger" style={{ animationDelay: "0.2s" }}>
          Doc<span>Zoc</span>
        </h1>
        <p className="dk-intro-tagline dk-stagger" style={{ animationDelay: "0.35s" }}>
          The right doctor, in seconds.<br />Not hours.
        </p>
        <div className="dk-intro-chips dk-stagger" style={{ animationDelay: "0.5s" }}>
          <span>AI-Powered Matching</span>
          <span>NYC-First</span>
          <span>Pre-Seed</span>
        </div>
      </div>
    ),
  },

  // 2. PROBLEM
  {
    id: "problem",
    label: "Problem",
    title: "Healthcare Has a $45B Matching Problem",
    accent: "Matching Problem",
    content: () => (
      <>
        <div className="dk-problem-grid">
          <div className="dk-problem-card dk-stagger" style={{ animationDelay: "0.15s" }}>
            <div className="dk-problem-num">47%</div>
            <p>of patients see the <strong>wrong specialist</strong> on their first visit — costing time, money, and trust</p>
          </div>
          <div className="dk-problem-card dk-stagger" style={{ animationDelay: "0.25s" }}>
            <div className="dk-problem-num">$210B</div>
            <p>wasted annually on <strong>unnecessary referrals</strong> and misrouted care in the US alone</p>
          </div>
          <div className="dk-problem-card dk-stagger" style={{ animationDelay: "0.35s" }}>
            <div className="dk-problem-num">30%</div>
            <p>of physician revenue lost to <strong>billing errors, denied claims,</strong> and administrative overhead</p>
          </div>
        </div>
        <div className="dk-problem-quote dk-stagger" style={{ animationDelay: "0.5s" }}>
          <p>&ldquo;Zocdoc shows me whoever paid for placement. I booked a &lsquo;sports medicine&rsquo; doctor who turned out to be a general practitioner. Wasted a $50 copay and 3 weeks.&rdquo;</p>
          <span>— Patient in Manhattan, 2024</span>
        </div>
        <p className="dk-problem-bottom dk-stagger" style={{ animationDelay: "0.6s" }}>
          <strong>Existing platforms like Zocdoc optimize for volume, not accuracy.</strong> They match patients with whoever has availability and paid for ads — not who can actually treat their condition. Meanwhile, doctors drown in billing paperwork instead of seeing patients.
        </p>
      </>
    ),
  },

  // 3. INSIGHT / EDGE
  {
    id: "insight",
    label: "Insight",
    title: "Zocdoc Broke Trust. We're Rebuilding It.",
    accent: "Rebuilding It.",
    content: () => (
      <>
        <p className="dk-insight-lead dk-stagger" style={{ animationDelay: "0.15s" }}>
          Zocdoc became a <strong>pay-to-play marketplace</strong>. Doctors pay $300/mo to appear in search results. Patients get matched with whoever paid — not whoever is best. The result: 47% wrong-specialist rate, inflated costs, and broken trust on both sides.
        </p>
        <div className="dk-insight-compare dk-stagger" style={{ animationDelay: "0.3s" }}>
          <div className="dk-insight-old">
            <h3>Zocdoc (Broken)</h3>
            <ul>
              <li>Pay-to-play doctor placement</li>
              <li>Matches by availability, not expertise</li>
              <li>No understanding of clinical pathways</li>
              <li>Patient does all the research</li>
              <li>Billing is the doctor's problem</li>
            </ul>
          </div>
          <div className="dk-insight-arrow">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </div>
          <div className="dk-insight-new">
            <h3>DocZoc (The Fix)</h3>
            <ul>
              <li>AI matches by clinical relevance</li>
              <li>Physician-curated referral network</li>
              <li>Understands subspecialty nuance</li>
              <li>Patient just describes what's wrong</li>
              <li>End-to-end billing built in</li>
            </ul>
          </div>
        </div>
        <p className="dk-insight-edge dk-stagger" style={{ animationDelay: "0.45s" }}>
          <strong>Our edge:</strong> Built by a practicing orthopedic surgeon (Dr. Elguizaoui, 1,400+ reviews) who lives the referral problem every day — and built the billing system his own practice needed.
        </p>
      </>
    ),
  },

  // 4. SOLUTION
  {
    id: "solution",
    label: "Solution",
    title: "Match. Book. Bill. All in One.",
    accent: "All in One.",
    content: () => (
      <>
        <div className="dk-solution-demo dk-stagger" style={{ animationDelay: "0.15s" }}>
          <div className="dk-demo-chat">
            <div className="dk-demo-msg dk-demo-user">&ldquo;My knee hurts when I run and it sometimes gives way&rdquo;</div>
            <div className="dk-demo-msg dk-demo-ai">
              <div className="dk-demo-ai-label">
                <div className="dk-demo-ai-dot">D</div>
                DocZoc AI
              </div>
              <p>Based on your symptoms, this sounds like an <strong>ACL or meniscus issue</strong>. You need a sports medicine orthopedic surgeon — not a general orthopedist. Here's your top match:</p>
              <div className="dk-demo-card">
                <strong>Dr. Sameh Elguizaoui</strong>
                <span>Orthopedic Surgeon · Sports Medicine · Joint Preservation</span>
                <span>★ 4.78 · 1,400+ reviews · Next: Tomorrow, 9:30 AM</span>
                <span>✓ Your insurance (Aetna PPO) accepted · $30 copay</span>
              </div>
            </div>
          </div>
        </div>
        <div className="dk-solution-features dk-stagger" style={{ animationDelay: "0.35s" }}>
          <div className="dk-feat">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <div><strong>AI Matching</strong><p>Understands clinical pathways, not just keywords</p></div>
          </div>
          <div className="dk-feat">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            <div><strong>Instant Booking</strong><p>30 seconds from symptom to confirmed appointment</p></div>
          </div>
          <div className="dk-feat">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            <div><strong>Built-In Billing</strong><p>Claims, coding, and RCM — no third-party software needed</p></div>
          </div>
          <div className="dk-feat">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <div><strong>Physician-Verified</strong><p>Real referral pathways, not pay-to-play listings</p></div>
          </div>
        </div>
      </>
    ),
  },

  // 5. THREE-SIDED VALUE
  {
    id: "value",
    label: "Value",
    title: "Three-Sided Value Creation",
    accent: "Value Creation",
    content: () => (
      <div className="dk-value-grid">
        <div className="dk-value-card dk-stagger" style={{ animationDelay: "0.15s", borderColor: "rgba(99,102,241,0.3)" }}>
          <div className="dk-value-icon" style={{ background: "rgba(99,102,241,0.12)", color: "#818cf8" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <h3>For Patients</h3>
          <ul>
            <li>Right doctor, first time</li>
            <li>No more phone tag</li>
            <li>Insurance pre-verified</li>
            <li>Appointment in seconds</li>
          </ul>
        </div>
        <div className="dk-value-card dk-stagger" style={{ animationDelay: "0.25s", borderColor: "rgba(34,197,94,0.3)" }}>
          <div className="dk-value-icon" style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          </div>
          <h3>For Doctors</h3>
          <ul>
            <li>Pre-qualified patient flow</li>
            <li>Built-in billing & claims management</li>
            <li>Right patients, not just any patients</li>
            <li>Zero marketing spend, reduced admin</li>
          </ul>
        </div>
        <div className="dk-value-card dk-stagger" style={{ animationDelay: "0.35s", borderColor: "rgba(245,158,11,0.3)" }}>
          <div className="dk-value-icon" style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <h3>For Payers</h3>
          <ul>
            <li>Fewer unnecessary referrals</li>
            <li>Lower cost per episode</li>
            <li>Better outcomes from first-visit accuracy</li>
            <li>Data-driven network optimization</li>
          </ul>
        </div>
      </div>
    ),
  },

  // 6. HOW IT WORKS
  {
    id: "how",
    label: "How It Works",
    title: "From Symptom to Specialist in 30 Seconds",
    accent: "30 Seconds",
    content: () => (
      <div className="dk-how-steps">
        {[
          { num: "01", title: "Describe", desc: "Patient types what's wrong in natural language — no medical jargon needed.", icon: "💬" },
          { num: "02", title: "Match", desc: "AI cross-references symptoms with specialty, subspecialty, availability, insurance, and location.", icon: "🧠" },
          { num: "03", title: "Review", desc: "Patient sees ranked results with ratings, bios, next available slot, and accepted insurance.", icon: "📋" },
          { num: "04", title: "Book", desc: "One-tap booking with instant confirmation. No phone calls, no voicemail.", icon: "✅" },
        ].map((step, i) => (
          <div className="dk-how-step dk-stagger" key={step.num} style={{ animationDelay: `${0.1 + i * 0.12}s` }}>
            <div className="dk-how-num">{step.icon}</div>
            <div className="dk-how-text">
              <div className="dk-how-step-label">Step {step.num}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    ),
  },

  // 7. MARKET OPPORTUNITY
  {
    id: "market",
    label: "Market",
    title: "A $45B Problem Hiding in Plain Sight",
    accent: "$45B Problem",
    content: () => (
      <>
        <div className="dk-market-circles dk-stagger" style={{ animationDelay: "0.15s" }}>
          <div className="dk-market-circle dk-market-tam">
            <div className="dk-market-circle dk-market-sam">
              <div className="dk-market-circle dk-market-som">
                <span>$12M</span>
                <small>SOM</small>
              </div>
              <span className="dk-market-label-sam">$850M <small>SAM</small></span>
            </div>
            <span className="dk-market-label-tam">$45B <small>TAM</small></span>
          </div>
        </div>
        <div className="dk-market-details dk-stagger" style={{ animationDelay: "0.35s" }}>
          <div className="dk-market-row">
            <strong>TAM</strong>
            <span>US physician referral & patient acquisition market</span>
            <em>$45B</em>
          </div>
          <div className="dk-market-row">
            <strong>SAM</strong>
            <span>NYC metro specialist matching & booking</span>
            <em>$850M</em>
          </div>
          <div className="dk-market-row">
            <strong>SOM</strong>
            <span>Year 3 target: orthopedics + 5 specialties in NYC</span>
            <em>$12M</em>
          </div>
        </div>
      </>
    ),
  },

  // 8. MATH / ECONOMICS
  {
    id: "math",
    label: "Unit Economics",
    title: "The Math Works at Scale",
    accent: "at Scale",
    content: () => (
      <div className="dk-math-grid">
        <div className="dk-math-card dk-stagger" style={{ animationDelay: "0.1s" }}>
          <div className="dk-math-label">Revenue per Booking</div>
          <div className="dk-math-value">$35</div>
          <p>Platform fee per confirmed appointment</p>
        </div>
        <div className="dk-math-card dk-stagger" style={{ animationDelay: "0.2s" }}>
          <div className="dk-math-label">CAC (Patient)</div>
          <div className="dk-math-value">$8</div>
          <p>Organic + referral-driven acquisition</p>
        </div>
        <div className="dk-math-card dk-stagger" style={{ animationDelay: "0.3s" }}>
          <div className="dk-math-label">LTV</div>
          <div className="dk-math-value">$280</div>
          <p>8 bookings/year avg × 3.5 yr retention</p>
        </div>
        <div className="dk-math-card dk-stagger" style={{ animationDelay: "0.4s" }}>
          <div className="dk-math-label">LTV:CAC</div>
          <div className="dk-math-value dk-math-highlight">35:1</div>
          <p>Best-in-class for health-tech platforms</p>
        </div>
        <div className="dk-math-card dk-math-wide dk-stagger" style={{ animationDelay: "0.5s" }}>
          <div className="dk-math-label">Gross Margin Target</div>
          <div className="dk-math-value">78%</div>
          <p>Software-like margins — no physical infrastructure needed</p>
        </div>
      </div>
    ),
  },

  // 9. FLYWHEEL
  {
    id: "flywheel",
    label: "Flywheel",
    title: "The DocZoc Flywheel",
    accent: "Flywheel",
    content: () => (
      <div className="dk-flywheel dk-stagger" style={{ animationDelay: "0.15s" }}>
        <div className="dk-fw-ring">
          {[
            { label: "More Patients", pos: "top" },
            { label: "Better Data", pos: "right" },
            { label: "Smarter Matching", pos: "bottom" },
            { label: "More Doctors", pos: "left" },
          ].map((node) => (
            <div className={`dk-fw-node dk-fw-${node.pos}`} key={node.label}>
              <span>{node.label}</span>
            </div>
          ))}
          <div className="dk-fw-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              <polyline points="22 2 22 8 16 8"/>
            </svg>
          </div>
          <svg className="dk-fw-arrows" viewBox="0 0 300 300" fill="none">
            <path d="M150 30 A120 120 0 0 1 270 150" stroke="rgba(99,102,241,0.3)" strokeWidth="2" strokeDasharray="6 4" />
            <path d="M270 150 A120 120 0 0 1 150 270" stroke="rgba(34,197,94,0.3)" strokeWidth="2" strokeDasharray="6 4" />
            <path d="M150 270 A120 120 0 0 1 30 150" stroke="rgba(245,158,11,0.3)" strokeWidth="2" strokeDasharray="6 4" />
            <path d="M30 150 A120 120 0 0 1 150 30" stroke="rgba(139,92,246,0.3)" strokeWidth="2" strokeDasharray="6 4" />
          </svg>
        </div>
        <p className="dk-fw-desc dk-stagger" style={{ animationDelay: "0.4s" }}>
          Each booking improves matching accuracy. Better matches attract more doctors. More doctors attract more patients. <strong>The flywheel compounds.</strong>
        </p>
      </div>
    ),
  },

  // 10. THE ASK
  {
    id: "ask",
    label: "The Ask",
    title: "",
    content: () => (
      <div className="dk-ask-slide">
        <h2 className="dk-ask-title dk-stagger" style={{ animationDelay: "0.15s" }}>
          We're Raising <span>$2M Pre-Seed</span>
        </h2>
        <p className="dk-ask-sub dk-stagger" style={{ animationDelay: "0.3s" }}>
          To build the AI-powered doctor matching platform that NYC — and eventually every city — deserves.
        </p>
        <div className="dk-ask-use dk-stagger" style={{ animationDelay: "0.4s" }}>
          <h3>Use of Funds</h3>
          <div className="dk-ask-bars">
            {[
              { label: "Engineering & AI", pct: 45, color: "#6366f1" },
              { label: "Provider Onboarding", pct: 25, color: "#22c55e" },
              { label: "Patient Acquisition", pct: 20, color: "#f59e0b" },
              { label: "Operations", pct: 10, color: "#64748b" },
            ].map((item) => (
              <div className="dk-ask-bar-row" key={item.label}>
                <span className="dk-ask-bar-label">{item.label}</span>
                <div className="dk-ask-bar-track">
                  <div className="dk-ask-bar-fill" style={{ width: `${item.pct}%`, background: item.color }} />
                </div>
                <span className="dk-ask-bar-pct">{item.pct}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="dk-ask-cta dk-stagger" style={{ animationDelay: "0.55s" }}>
          <a href="mailto:info@doczoc.com" className="dk-ask-btn">Let's Talk</a>
          <p>info@doczoc.com</p>
        </div>
      </div>
    ),
  },
];

// ── Deck Page ──────────────────────────────────────────────────────
export default function DeckPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { requestAnimationFrame(() => setLoaded(true)); }, []);

  const goTo = useCallback((idx: number) => {
    if (idx < 0 || idx >= SLIDES.length || idx === currentSlide) return;
    setCurrentSlide(idx);
    setAnimKey(k => k + 1);
  }, [currentSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        goTo(currentSlide + 1);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        goTo(currentSlide - 1);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [currentSlide, goTo]);

  const slide = SLIDES[currentSlide];
  const progress = ((currentSlide + 1) / SLIDES.length) * 100;

  return (
    <div className={`dk-page${loaded ? " dk-loaded" : ""}`} ref={containerRef}>
      {/* Progress bar */}
      <div className="dk-progress">
        <div className="dk-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Nav dots */}
      <nav className="dk-dots">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            className={`dk-dot${i === currentSlide ? " dk-dot-active" : ""}`}
            onClick={() => goTo(i)}
            title={s.label}
          >
            <span className="dk-dot-label">{s.label}</span>
          </button>
        ))}
      </nav>

      {/* Slide Content */}
      <main className="dk-slide" key={animKey}>
        <div className="dk-slide-inner">
          {slide.title && (
            <div className="dk-slide-header dk-stagger" style={{ animationDelay: "0s" }}>
              <span className="dk-slide-num">{String(currentSlide + 1).padStart(2, "0")}</span>
              <h2 className="dk-slide-title">
                {slide.accent
                  ? <>{slide.title.replace(slide.accent, "")}<span className="dk-accent">{slide.accent}</span></>
                  : slide.title
                }
              </h2>
            </div>
          )}
          {slide.content()}
        </div>
      </main>

      {/* Bottom controls */}
      <footer className="dk-controls">
        <div className="dk-controls-inner">
          <button className="dk-arrow" onClick={() => goTo(currentSlide - 1)} disabled={currentSlide === 0}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span className="dk-counter">{currentSlide + 1} / {SLIDES.length}</span>
          <button className="dk-arrow" onClick={() => goTo(currentSlide + 1)} disabled={currentSlide === SLIDES.length - 1}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </footer>
    </div>
  );
}
