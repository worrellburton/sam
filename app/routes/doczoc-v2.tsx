import { Link } from "react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import { seoMeta } from "~/seo";

export function meta() {
  return seoMeta({
    title: "DocZoc v2 — Find Your Doctor",
    description: "Tell us what you need. We'll match you with the right specialist in seconds.",
    path: "/doczoc/v2",
  });
}

// ── Doctor Database ────────────────────────────────────────────────
const DOCTORS = [
  {
    id: 1, name: "Dr. Sameh Elguizaoui", title: "Orthopedic Surgeon & Sports Medicine", rating: 4.78, reviews: 1400, image: "/sam/header.webp",
    specialties: ["knee", "shoulder", "acl", "rotator cuff", "meniscus", "cartilage", "joint preservation", "sports medicine", "arthroscopy", "hip", "biologics", "prp", "stem cell", "fracture", "ligament", "tendon"],
    locations: ["Upper East Side", "Greenwich Village", "Brooklyn Heights", "Scarsdale"],
    bio: "Fellowship-trained at Lenox Hill Hospital. Former NY Jets & Islanders team physician. Specializes in joint preservation and biologics.",
    nextAvailable: "Tomorrow, 9:30 AM",
    insurance: ["Aetna", "UHC", "Cigna", "BCBS", "Anthem", "Oscar"],
    website: "/about",
  },
  {
    id: 2, name: "Dr. Rachel Kim", title: "Primary Care Physician", rating: 4.9, reviews: 820, image: null,
    specialties: ["primary care", "general", "checkup", "physical", "sick", "cold", "flu", "fever", "headache", "fatigue", "blood work", "annual", "wellness", "preventive"],
    locations: ["Midtown", "Upper West Side"],
    bio: "Board-certified internist focused on preventive care and chronic disease management. 12+ years in practice.",
    nextAvailable: "Today, 2:00 PM",
    insurance: ["Aetna", "UHC", "Cigna", "BCBS", "Humana"],
  },
  {
    id: 3, name: "Dr. Marcus Chen", title: "Cardiologist", rating: 4.85, reviews: 640, image: null,
    specialties: ["heart", "cardiology", "chest pain", "blood pressure", "hypertension", "cholesterol", "palpitations", "echocardiogram", "ekg", "stent", "arrhythmia"],
    locations: ["Upper East Side", "Midtown"],
    bio: "Interventional cardiologist at Mount Sinai. Expert in preventive cardiology and minimally invasive heart procedures.",
    nextAvailable: "Wednesday, 10:00 AM",
    insurance: ["Aetna", "UHC", "BCBS", "Medicare"],
  },
  {
    id: 4, name: "Dr. Priya Patel", title: "Dermatologist", rating: 4.92, reviews: 1100, image: null,
    specialties: ["skin", "dermatology", "acne", "rash", "mole", "eczema", "psoriasis", "cosmetic", "botox", "laser", "melanoma", "rosacea"],
    locations: ["Greenwich Village", "Brooklyn"],
    bio: "Board-certified dermatologist specializing in medical and cosmetic dermatology. Columbia-trained.",
    nextAvailable: "Thursday, 11:30 AM",
    insurance: ["Aetna", "Cigna", "BCBS", "Oscar"],
  },
  {
    id: 5, name: "Dr. James Okafor", title: "Gastroenterologist", rating: 4.7, reviews: 380, image: null,
    specialties: ["stomach", "gastro", "gi", "digestive", "acid reflux", "gerd", "ibs", "colonoscopy", "endoscopy", "crohns", "ulcer", "nausea", "abdominal pain"],
    locations: ["Midtown", "Brooklyn Heights"],
    bio: "GI specialist with expertise in IBD, IBS, and advanced endoscopic procedures. NYU Langone trained.",
    nextAvailable: "Friday, 3:00 PM",
    insurance: ["UHC", "Cigna", "BCBS", "Anthem"],
  },
  {
    id: 6, name: "Dr. Sofia Rodriguez", title: "OB/GYN", rating: 4.88, reviews: 920, image: null,
    specialties: ["obgyn", "gynecology", "pregnancy", "prenatal", "womens health", "pap smear", "birth control", "fertility", "menstrual", "pcos", "endometriosis"],
    locations: ["Upper East Side", "Greenwich Village"],
    bio: "Women's health specialist offering comprehensive gynecological and obstetric care. Weill Cornell affiliated.",
    nextAvailable: "Tomorrow, 1:00 PM",
    insurance: ["Aetna", "UHC", "Cigna", "BCBS", "Oscar"],
  },
];

// ── Matching Logic ─────────────────────────────────────────────────
function matchDoctors(query: string) {
  const q = query.toLowerCase();
  const scored = DOCTORS.map(doc => {
    let score = 0;
    for (const s of doc.specialties) {
      if (q.includes(s)) score += 10;
      else if (s.split(" ").some(w => q.includes(w))) score += 5;
    }
    if (q.includes(doc.name.toLowerCase())) score += 20;
    if (q.includes(doc.title.toLowerCase())) score += 15;
    // Boost for common symptom keywords
    const symptoms: Record<string, string[]> = {
      "pain": ["knee", "shoulder", "hip", "back", "joint", "stomach", "chest", "head", "abdominal"],
      "hurts": ["knee", "shoulder", "hip", "back", "joint", "stomach", "chest"],
      "injury": ["knee", "shoulder", "acl", "rotator cuff", "fracture", "sports medicine"],
      "torn": ["acl", "meniscus", "rotator cuff", "ligament", "tendon"],
      "broken": ["fracture", "orthopedic"],
      "surgery": ["arthroscopy", "joint preservation", "knee", "shoulder"],
      "pregnant": ["pregnancy", "prenatal", "obgyn"],
      "rash": ["skin", "dermatology", "eczema"],
      "check up": ["primary care", "general", "checkup", "annual"],
    };
    for (const [symptom, related] of Object.entries(symptoms)) {
      if (q.includes(symptom)) {
        for (const r of related) {
          if (doc.specialties.includes(r)) score += 8;
        }
      }
    }
    return { doc, score };
  });
  const results = scored.sort((a, b) => b.score - a.score);
  // Always include Dr. Elguizaoui as a recommended option
  const sam = results.find(s => s.doc.id === 1);
  if (sam && sam.score === 0) sam.score = 3;
  const final = results.filter(s => s.score > 0).sort((a, b) => b.score - a.score).map(s => s.doc);
  // If Sam isn't already in the top results, add him at the end
  if (final.length > 0 && !final.some(d => d.id === 1)) {
    final.push(DOCTORS[0]);
  }
  // If nothing matched at all, still show Sam
  if (final.length === 0) {
    return [DOCTORS[0]];
  }
  return final;
}

// ── Suggested Prompts ──────────────────────────────────────────────
const SUGGESTIONS = [
  { icon: "🦴", text: "My knee hurts when I run" },
  { icon: "❤️", text: "I need a heart checkup" },
  { icon: "🩺", text: "Annual physical exam" },
  { icon: "🏥", text: "I tore my ACL playing basketball" },
  { icon: "💊", text: "Skin rash that won't go away" },
  { icon: "🤰", text: "I think I might be pregnant" },
];

// ── Chat Message Types ─────────────────────────────────────────────
type ChatMessage =
  | { type: "user"; text: string }
  | { type: "thinking" }
  | { type: "results"; doctors: typeof DOCTORS; query: string }
  | { type: "no-results"; query: string }
  | { type: "welcome" };

// ── Star Rating ────────────────────────────────────────────────────
function Stars({ rating }: { rating: number }) {
  return (
    <span className="v2-stars">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i <= Math.round(rating) ? "#fbbf24" : "none"} stroke="#fbbf24" strokeWidth="2">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  );
}

// ── Typing Indicator ───────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="v2-typing">
      <span /><span /><span />
    </div>
  );
}

// ── Doctor Card ────────────────────────────────────────────────────
function DoctorCard({ doc, delay }: { doc: typeof DOCTORS[0]; delay: number }) {
  const initials = doc.name.replace("Dr. ", "").split(" ").map(n => n[0]).join("");
  const colors = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"];
  const color = colors[doc.id % colors.length];

  return (
    <div className="v2-doctor-card v2-msg-animate" style={{ animationDelay: `${delay}s` }}>
      <div className="v2-doc-header">
        <div className="v2-doc-avatar" style={{ background: `${color}20`, color }}>
          {doc.image ? <img src={doc.image} alt={doc.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} /> : initials}
        </div>
        <div className="v2-doc-info">
          <div className="v2-doc-name">{doc.name}</div>
          <div className="v2-doc-title">{doc.title}</div>
          <div className="v2-doc-rating">
            <Stars rating={doc.rating} />
            <span>{doc.rating}</span>
            <span className="v2-doc-reviews">({doc.reviews.toLocaleString()} reviews)</span>
          </div>
        </div>
      </div>
      <p className="v2-doc-bio">{doc.bio}</p>
      <div className="v2-doc-details">
        <div className="v2-doc-detail">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="10" r="3"/><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z"/></svg>
          <span>{doc.locations.slice(0, 2).join(" · ")}</span>
        </div>
        <div className="v2-doc-detail">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
          <span>Next: <strong>{doc.nextAvailable}</strong></span>
        </div>
        <div className="v2-doc-detail">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <span>{doc.insurance.slice(0, 3).join(", ")} +{doc.insurance.length - 3} more</span>
        </div>
      </div>
      <div className="v2-doc-actions">
        <Link to="/book" className="v2-doc-book">Book Appointment</Link>
        {doc.website && <Link to={doc.website} className="v2-doc-website">Go to Website</Link>}
        <button className="v2-doc-profile">View Profile</button>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────
export default function DocZocV2() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [phase, setPhase] = useState<"landing" | "transitioning" | "chat">("landing");
  const [loaded, setLoaded] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { requestAnimationFrame(() => setLoaded(true)); }, []);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
    }, 100);
  }, []);

  const handleSubmit = useCallback((text: string) => {
    if (!text.trim() || isSearching) return;
    const query = text.trim();
    setInput("");
    setIsSearching(true);

    if (phase === "landing") {
      // Start transition: fade out landing, then show chat
      setPhase("transitioning");
      setTimeout(() => {
        setPhase("chat");
        setMessages([{ type: "user", text: query }, { type: "thinking" }]);
        // Focus the chat input after transition
        setTimeout(() => {
          chatInputRef.current?.focus();
          scrollToBottom();
        }, 100);
      }, 600); // match the CSS exit animation duration
    } else {
      setMessages(prev => [...prev, { type: "user", text: query }, { type: "thinking" }]);
      scrollToBottom();
    }

    // Simulate AI processing
    const delay = phase === "landing" ? 2100 : 1500;
    setTimeout(() => {
      const results = matchDoctors(query);
      setMessages(prev => {
        const without = prev.filter(m => m.type !== "thinking");
        if (results.length > 0) {
          return [...without, { type: "results", doctors: results, query }];
        }
        return [...without, { type: "no-results", query }];
      });
      setIsSearching(false);
      scrollToBottom();
    }, delay);
  }, [isSearching, scrollToBottom, phase]);

  const handleSuggestion = (text: string) => {
    setInput(text);
    handleSubmit(text);
  };

  const isLandingVisible = phase === "landing";
  const isChatVisible = phase === "chat";
  const isExiting = phase === "transitioning";

  return (
    <div className={`v2-page${loaded ? " v2-loaded" : ""}`}>
      {/* Ambient Background */}
      <div className="v2-bg">
        <div className="v2-bg-orb v2-bg-orb-1" />
        <div className="v2-bg-orb v2-bg-orb-2" />
        <div className="v2-bg-orb v2-bg-orb-3" />
      </div>

      {/* Nav */}
      <nav className="v2-nav v2-anim-fade">
        <div className="v2-nav-inner">
          <Link to="/doczoc" className="v2-logo">
            <div className="v2-logo-icon">D</div>
            <span>DocZoc</span>
          </Link>
          <div className="v2-nav-right">
            <Link to="/doczoc/signin" className="v2-nav-link">Sign In</Link>
            <Link to="/doczoc/signin" className="v2-nav-cta">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Main Content — single continuous layout */}
      <main className="v2-main">

        {/* ── Landing Content (fades out on search) ───────── */}
        {(isLandingVisible || isExiting) && (
          <div className={`v2-landing${isExiting ? " v2-landing-exit" : ""}`}>
            <div className="v2-landing-content">
              <div className="v2-badge v2-anim-up" style={{ animationDelay: "0.1s" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                AI-Powered Doctor Matching
              </div>
              <h1 className="v2-anim-up" style={{ animationDelay: "0.2s" }}>
                Tell us what's going on.<br />
                <span className="v2-accent">We'll find the right doctor.</span>
              </h1>
              <p className="v2-sub v2-anim-up" style={{ animationDelay: "0.3s" }}>
                Describe your symptoms, condition, or what kind of care you need — and we'll match you with the best specialists in New York City.
              </p>

              {/* Search Input */}
              <div className="v2-search-wrap v2-anim-up" style={{ animationDelay: "0.4s" }}>
                <div className="v2-search-box">
                  <svg className="v2-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  <input
                    ref={inputRef}
                    className="v2-search-input"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSubmit(input)}
                    placeholder="Describe what you're looking for..."
                    autoComplete="off"
                  />
                  <button
                    className="v2-search-send"
                    onClick={() => handleSubmit(input)}
                    disabled={!input.trim()}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Suggestions */}
              <div className="v2-suggestions v2-anim-up" style={{ animationDelay: "0.5s" }}>
                {SUGGESTIONS.map((s, i) => (
                  <button key={i} className="v2-suggestion" onClick={() => handleSuggestion(s.text)}>
                    <span className="v2-suggestion-icon">{s.icon}</span>
                    {s.text}
                  </button>
                ))}
              </div>

              {/* Trust */}
              <div className="v2-trust v2-anim-up" style={{ animationDelay: "0.6s" }}>
                <div className="v2-trust-avatars">
                  {["S", "M", "R", "A", "J"].map((l, i) => (
                    <div key={l} className="v2-trust-av" style={{ background: ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"][i], zIndex: 5 - i }}>{l}</div>
                  ))}
                </div>
                <span>Trusted by <strong>2,400+</strong> providers · <strong>1,400+</strong> patient reviews</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Chat (slides in after transition) ──────────── */}
        {isChatVisible && (
          <div className="v2-chat-container v2-chat-enter">
            <div className="v2-chat-scroll" ref={chatRef}>
              <div className="v2-chat-messages">
                {messages.map((msg, i) => {
                  switch (msg.type) {
                    case "user":
                      return (
                        <div key={i} className="v2-msg v2-msg-user v2-msg-animate">
                          <div className="v2-msg-bubble v2-msg-bubble-user">{msg.text}</div>
                        </div>
                      );
                    case "thinking":
                      return (
                        <div key={i} className="v2-msg v2-msg-ai v2-msg-animate">
                          <div className="v2-msg-avatar">
                            <div className="v2-logo-icon v2-logo-icon-sm">D</div>
                          </div>
                          <div className="v2-msg-bubble v2-msg-bubble-ai">
                            <TypingDots />
                          </div>
                        </div>
                      );
                    case "results":
                      return (
                        <div key={i} className="v2-msg v2-msg-ai v2-msg-animate">
                          <div className="v2-msg-avatar">
                            <div className="v2-logo-icon v2-logo-icon-sm">D</div>
                          </div>
                          <div className="v2-msg-content">
                            <div className="v2-msg-bubble v2-msg-bubble-ai">
                              I found <strong>{msg.doctors.length} specialist{msg.doctors.length !== 1 ? "s" : ""}</strong> matching your needs. Here are the best matches:
                            </div>
                            <div className="v2-results-grid">
                              {msg.doctors.slice(0, 3).map((doc, j) => (
                                <DoctorCard key={doc.id} doc={doc} delay={0.15 * j} />
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    case "no-results":
                      return (
                        <div key={i} className="v2-msg v2-msg-ai v2-msg-animate">
                          <div className="v2-msg-avatar">
                            <div className="v2-logo-icon v2-logo-icon-sm">D</div>
                          </div>
                          <div className="v2-msg-bubble v2-msg-bubble-ai">
                            I couldn't find a specific match for "<em>{msg.query}</em>". Try describing your symptoms or the type of doctor you're looking for — like "knee pain", "annual checkup", or "skin rash".
                          </div>
                        </div>
                      );
                    default:
                      return null;
                  }
                })}
              </div>
            </div>

            {/* Chat Input Bar */}
            <div className="v2-chat-input-bar">
              <div className="v2-search-box v2-chat-input-box">
                <input
                  ref={chatInputRef}
                  className="v2-search-input"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSubmit(input)}
                  placeholder="Describe another concern..."
                  autoComplete="off"
                />
                <button
                  className="v2-search-send"
                  onClick={() => handleSubmit(input)}
                  disabled={!input.trim() || isSearching}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer — fades out with landing */}
      {(isLandingVisible || isExiting) && (
        <footer className={`v2-footer v2-anim-fade${isExiting ? " v2-footer-exit" : ""}`} style={{ animationDelay: "0.7s" }}>
          <div className="v2-footer-inner">
            <p>&copy; {new Date().getFullYear()} DocZoc. All rights reserved.</p>
            <div className="v2-footer-links">
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Support</a>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
