import { Link } from "react-router";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";

export function meta() {
  return [
    { title: "Book an Appointment | Dr. Sam Elguizaoui, M.D. | NYC Orthopedic Surgeon" },
    { name: "description", content: "Schedule your appointment with Dr. Sam Elguizaoui, board-certified orthopedic surgeon in NYC. Same-week appointments available." },
  ];
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_HEADERS = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
const TIMES = ['8:00 AM','8:30 AM','9:00 AM','9:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','1:00 PM','1:30 PM','2:00 PM','2:30 PM','3:00 PM','3:30 PM','4:00 PM','4:30 PM'];

const APPT_TYPES = [
  { label: 'Consultation', color: '#a78bfa' },
  { label: 'Follow-up', color: '#34d399' },
  { label: 'Sports Injury', color: '#fbbf24' },
  { label: 'Joint Assessment', color: '#60a5fa' },
  { label: 'Second Opinion', color: '#f472b6' },
];

function getApptSlots(date: Date) {
  const dow = date.getDay();
  if (dow === 0 || dow === 6) return [];
  const today = new Date(); today.setHours(0,0,0,0);
  if (date < today) return [];
  const d = date.getDate(), m = date.getMonth(), y = date.getFullYear();
  const seed = (d * 7 + m * 13 + y) % 30;
  if (dow === 2 || dow === 5) return seed > 15 ? [APPT_TYPES[seed % APPT_TYPES.length]] : [];
  const count = seed > 20 ? 2 : seed > 8 ? 1 : 0;
  if (count === 0) return [];
  const slots = [];
  for (let i = 0; i < count; i++) {
    slots.push(APPT_TYPES[(seed + i * 3) % APPT_TYPES.length]);
  }
  return slots;
}

function getApptCount(date: Date) {
  const slots = getApptSlots(date);
  if (slots.length === 0) return 0;
  const d = date.getDate(), m = date.getMonth(), y = date.getFullYear();
  return ((d * 7 + m * 13 + y) % 20) + 10;
}

function getTimeAvail(day: number, month: number) {
  return TIMES.map((_, i) => ((day * 7 + month * 3 + i * 11) % 10) > 3);
}

// Background animation types
type BgType = 'particles' | 'grid' | 'waves' | 'aurora' | 'none';

const BG_OPTIONS: { id: BgType; label: string }[] = [
  { id: 'particles', label: 'Particles' },
  { id: 'grid', label: 'Grid Pulse' },
  { id: 'waves', label: 'Waves' },
  { id: 'aurora', label: 'Aurora' },
  { id: 'none', label: 'None' },
];

function useAnimatedBackground(canvasRef: React.RefObject<HTMLCanvasElement | null>, bgType: BgType) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || bgType === 'none') return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number;
    const resize = () => {
      canvas.width = canvas.clientWidth * window.devicePixelRatio;
      canvas.height = canvas.clientHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    const w = () => canvas.clientWidth;
    const h = () => canvas.clientHeight;
    let t = 0;

    // Particles
    const NUM = 50;
    const pts = Array.from({ length: NUM }, () => ({
      x: Math.random(), y: Math.random(),
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 2 + 1,
    }));

    function renderParticles() {
      ctx!.clearRect(0, 0, w(), h());
      pts.forEach(p => {
        p.x += p.vx / w(); p.y += p.vy / h();
        if (p.x < 0 || p.x > 1) p.vx *= -1;
        if (p.y < 0 || p.y > 1) p.vy *= -1;
        ctx!.beginPath();
        ctx!.arc(p.x * w(), p.y * h(), p.r, 0, Math.PI * 2);
        ctx!.fillStyle = 'rgba(99,102,241,0.12)';
        ctx!.fill();
      });
      // connections
      for (let i = 0; i < NUM; i++) {
        for (let j = i + 1; j < NUM; j++) {
          const dx = (pts[i].x - pts[j].x) * w();
          const dy = (pts[i].y - pts[j].y) * h();
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx!.beginPath();
            ctx!.moveTo(pts[i].x * w(), pts[i].y * h());
            ctx!.lineTo(pts[j].x * w(), pts[j].y * h());
            ctx!.strokeStyle = `rgba(99,102,241,${0.06 * (1 - dist / 120)})`;
            ctx!.lineWidth = 0.5;
            ctx!.stroke();
          }
        }
      }
    }

    function renderGrid() {
      ctx!.clearRect(0, 0, w(), h());
      const spacing = 40;
      const cols = Math.ceil(w() / spacing) + 1;
      const rows = Math.ceil(h() / spacing) + 1;
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const pulse = Math.sin(t * 0.02 + i * 0.3 + j * 0.3) * 0.5 + 0.5;
          const alpha = 0.03 + pulse * 0.06;
          ctx!.beginPath();
          ctx!.arc(i * spacing, j * spacing, 1 + pulse * 1.5, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(99,102,241,${alpha})`;
          ctx!.fill();
        }
      }
    }

    function renderWaves() {
      ctx!.clearRect(0, 0, w(), h());
      for (let layer = 0; layer < 3; layer++) {
        ctx!.beginPath();
        const amp = 30 + layer * 15;
        const freq = 0.008 - layer * 0.001;
        const speed = 0.015 + layer * 0.005;
        const yBase = h() * (0.4 + layer * 0.15);
        for (let x = 0; x <= w(); x += 2) {
          const y = yBase + Math.sin(x * freq + t * speed) * amp + Math.sin(x * freq * 2.3 + t * speed * 1.5) * amp * 0.4;
          if (x === 0) ctx!.moveTo(x, y);
          else ctx!.lineTo(x, y);
        }
        ctx!.strokeStyle = `rgba(99,102,241,${0.06 - layer * 0.015})`;
        ctx!.lineWidth = 1;
        ctx!.stroke();
      }
    }

    function renderAurora() {
      ctx!.clearRect(0, 0, w(), h());
      for (let i = 0; i < 5; i++) {
        const grad = ctx!.createLinearGradient(0, 0, w(), h());
        const shift = Math.sin(t * 0.008 + i) * 0.1;
        grad.addColorStop(0, 'rgba(99,102,241,0)');
        grad.addColorStop(0.3 + shift, `rgba(99,102,241,${0.04 - i * 0.006})`);
        grad.addColorStop(0.5 + shift, `rgba(129,140,248,${0.05 - i * 0.008})`);
        grad.addColorStop(0.7 - shift, `rgba(99,102,241,${0.03 - i * 0.005})`);
        grad.addColorStop(1, 'rgba(99,102,241,0)');
        ctx!.fillStyle = grad;
        const yOff = Math.sin(t * 0.01 + i * 1.5) * 60;
        ctx!.fillRect(0, yOff + i * 40, w(), h());
      }
    }

    const renderers = { particles: renderParticles, grid: renderGrid, waves: renderWaves, aurora: renderAurora };

    function loop() {
      t++;
      renderers[bgType as keyof typeof renderers]?.();
      raf = requestAnimationFrame(loop);
    }
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [canvasRef, bgType]);
}

// Google Places API for reviews
const PLACES_API_KEY = 'AIzaSyCDYVX9sM-Tkoun755-ZLP4KpjZGufBJbM';
const PLACE_IDS = [
  { id: 'ChIJmQNsqXpZwokRoKDGBL8w9LM', label: 'Upper East Side' },
  { id: 'ChIJFTfVAb5ZwokRuFvoKEMtQag', label: 'West Village' },
  { id: 'ChIJzeD6h0VawokRCfzPOz9Oi7E', label: 'Brooklyn' },
];
const REVIEW_FIELDS = 'id,rating,userRatingCount,reviews.rating,reviews.text,reviews.authorAttribution,reviews.relativePublishTimeDescription,reviews.publishTime';

interface GoogleReview {
  rating: number;
  text?: { text?: string };
  authorAttribution?: { displayName?: string; photoUri?: string };
  relativePublishTimeDescription?: string;
  publishTime?: string;
  locationLabel: string;
}

function useGoogleReviews() {
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    async function fetchAllReviews() {
      try {
        const results = await Promise.all(PLACE_IDS.map(async (place) => {
          const resp = await fetch(`https://places.googleapis.com/v1/places/${place.id}?fields=${REVIEW_FIELDS}&key=${PLACES_API_KEY}`);
          if (!resp.ok) throw new Error(`API error: ${resp.status}`);
          const data = await resp.json();
          return {
            count: data.userRatingCount || 0,
            reviews: (data.reviews || []).map((r: GoogleReview) => ({ ...r, locationLabel: place.label })),
          };
        }));
        setTotalCount(results.reduce((s, r) => s + r.count, 0));
        const all = results.flatMap(r => r.reviews)
          .filter((r: GoogleReview) => r.rating >= 4)
          .sort((a: GoogleReview, b: GoogleReview) => new Date(b.publishTime || 0).getTime() - new Date(a.publishTime || 0).getTime());
        setReviews(all);
      } catch (err) {
        console.warn('Google Reviews fetch failed:', err);
      }
    }
    fetchAllReviews();
  }, []);

  return { reviews, totalCount };
}

const highlights = [
  { icon: "return", label: "Patients often return", sub: "More patients return than other providers in the area" },
  { icon: "clock", label: "Excellent wait time", sub: "91% of patients waited less than 30 minutes" },
  { icon: "new", label: "New patient appointments", sub: "Appointments available for new patients" },
];

const insurances = "Aetna, BlueCross BlueShield, UnitedHealthcare, UnitedHealthcare Oxford";

const locations = [
  {
    name: "NY Orthopedics – Lenox Hill Greenwich Village",
    address: "200 W 13th St, 6th Fl, New York, NY 10011",
    phone: "(917) 905-9370",
    hours: "Mon, Wed, Thu: 8AM–5PM",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=200+West+13th+Street+New+York+NY",
  },
  {
    name: "NY Orthopedics – Upper East Side",
    address: "159 East 74th St, New York, NY 10021",
    phone: "(917) 905-9370",
    hours: "Mon, Wed, Thu: 8AM–5PM",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=159+East+74th+Street+New+York+NY",
  },
  {
    name: "NY Orthopedics – Brooklyn Heights",
    address: "161 Atlantic Ave, Brooklyn, NY 11201",
    phone: "(917) 905-9370",
    hours: "Mon, Wed, Thu: 8AM–5PM",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=161+Atlantic+Avenue+Brooklyn+NY",
  },
];

const insuranceLogos = [
  { name: "Aetna", logo: "https://1000logos.net/wp-content/uploads/2020/09/Aetna-Logo.png" },
  { name: "BlueCross BlueShield", logo: "https://1000logos.net/wp-content/uploads/2021/04/Blue-Cross-Blue-Shield-logo.png" },
  { name: "UnitedHealthcare", logo: "https://1000logos.net/wp-content/uploads/2021/05/UnitedHealthcare-logo.png" },
  { name: "Oxford", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Oxford_Health_Plans_logo.svg/1200px-Oxford_Health_Plans_logo.svg.png" },
  { name: "Cigna", logo: "https://1000logos.net/wp-content/uploads/2021/05/Cigna-logo.png" },
  { name: "Empire BCBS", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Empire_BlueCross_BlueShield_logo.svg/1200px-Empire_BlueCross_BlueShield_logo.svg.png" },
];

export default function BookPage() {
  const today = new Date();
  today.setHours(0,0,0,0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bgType, setBgType] = useState<BgType>(() => {
    if (typeof window !== 'undefined') return (localStorage.getItem('dz-bg') as BgType) || 'particles';
    return 'particles';
  });
  useAnimatedBackground(canvasRef, bgType);
  const { reviews: googleReviews, totalCount: googleTotal } = useGoogleReviews();

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [patientType, setPatientType] = useState<'new' | 'existing'>('existing');
  const [selectedLocs, setSelectedLocs] = useState<Set<number>>(() => new Set(locations.map((_, i) => i)));
  const toggleLoc = (idx: number) => {
    setSelectedLocs(prev => {
      const next = new Set(prev);
      if (next.has(idx)) { if (next.size > 1) next.delete(idx); }
      else next.add(idx);
      return next;
    });
  };
  const toggleAllLocs = () => {
    setSelectedLocs(prev => prev.size === locations.length ? new Set([0]) : new Set(locations.map((_, i) => i)));
  };
  const [activeTab, setActiveTab] = useState('highlights');
  const [confirmed, setConfirmed] = useState(false);
  const [dzTheme, setDzTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') return (localStorage.getItem('dz-theme') as 'dark' | 'light') || 'dark';
    return 'dark';
  });
  const toggleDzTheme = () => {
    const next = dzTheme === 'dark' ? 'light' : 'dark';
    setDzTheme(next);
    localStorage.setItem('dz-theme', next);
  };

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const calendarWeeks = useMemo(() => {
    const weeks: (Date | null)[][] = [];
    let week: (Date | null)[] = [];
    for (let i = 0; i < firstDayOfMonth; i++) week.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      week.push(new Date(currentYear, currentMonth, d));
      if (week.length === 7) { weeks.push(week); week = []; }
    }
    if (week.length > 0) {
      while (week.length < 7) week.push(null);
      weeks.push(week);
    }
    return weeks;
  }, [currentMonth, currentYear, firstDayOfMonth, daysInMonth]);

  const timeAvail = useMemo(() => {
    if (!selectedDate) return [];
    return getTimeAvail(selectedDate.getDate(), selectedDate.getMonth());
  }, [selectedDate]);

  const handlePrevMonth = useCallback(() => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
    setSelectedDate(null); setSelectedSlot(null);
  }, [currentMonth]);

  const handleNextMonth = useCallback(() => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
    setSelectedDate(null); setSelectedSlot(null);
  }, [currentMonth]);

  const handleConfirm = () => {
    if (selectedDate && selectedSlot) setConfirmed(true);
  };

  const isToday = (d: Date) => d.toDateString() === new Date().toDateString();
  const [calHover, setCalHover] = useState(false);
  const calActive = selectedDate !== null || calHover;

  const tabs = ['Highlights', 'About', 'Insurances', 'Locations', 'Reviews', 'FAQs'];

  return (
    <div className={`dz${dzTheme === 'light' ? ' dz-light' : ''}`}>
      <canvas ref={canvasRef} className="dz-webgl-bg" />

      {/* Top Nav */}
      <nav className="dz-nav">
        <div className="dz-nav-inner">
          <Link to="/" className="dz-logo">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#6366f1"/>
              <text x="16" y="22" textAnchor="middle" fontWeight="700" fontSize="16" fill="#fff" fontFamily="Inter, sans-serif">D</text>
            </svg>
            <span>DocZoc</span>
          </Link>
          <div className="dz-nav-links">
            <div className="dz-bg-switcher">
              {BG_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  className={`dz-bg-opt${bgType === opt.id ? ' active' : ''}`}
                  onClick={() => { setBgType(opt.id); localStorage.setItem('dz-bg', opt.id); }}
                  title={opt.label}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button className="dz-theme-toggle" onClick={toggleDzTheme} aria-label="Toggle theme">
              {dzTheme === 'dark' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              )}
            </button>
            <a href="tel:+19179059370" className="dz-nav-phone">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              (917) 905-9370
            </a>
          </div>
        </div>
      </nav>

      <div className={`dz-main${calActive ? ' cal-active' : ''}`}>
        {/* LEFT: Doctor Profile */}
        <div className="dz-profile">
          <div className="dz-doctor-card">
            <div className="dz-doctor-header">
              <div className="dz-avatar">
                <img src="/sammd/header.jpg" alt="Dr. Sam Elguizaoui" />
              </div>
              <div className="dz-doctor-info">
                <span className="dz-badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1l3.09 6.26L22 8.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 13.14 2 8.27l6.91-1.01L12 1z"/></svg>
                  Patient Choice
                </span>
                <h1>Dr. Sam Elguizaoui, MD</h1>
                <p className="dz-specialty">Orthopedic Surgeon</p>
                <p className="dz-address">200 W 13th St, 6th Fl, New York, NY</p>
              </div>
            </div>
            <div className="dz-rating-row">
              <div className="dz-rating-score">
                <span className="dz-big-number">4.78</span>
                <span className="dz-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
              </div>
              {googleReviews.length > 0 ? (
                <div className="dz-review-snippet">
                  <div className="dz-snippet-author">
                    {googleReviews[0].authorAttribution?.photoUri ? (
                      <img src={googleReviews[0].authorAttribution.photoUri} alt="" className="dz-snippet-avatar" />
                    ) : (
                      <div className="dz-snippet-avatar dz-snippet-avatar-placeholder">
                        {(googleReviews[0].authorAttribution?.displayName || '?')[0]}
                      </div>
                    )}
                  </div>
                  <p>&ldquo;{googleReviews[0].text?.text?.slice(0, 180)}{(googleReviews[0].text?.text?.length || 0) > 180 ? '...' : ''}&rdquo;</p>
                  <span className="dz-review-meta">{googleReviews[0].authorAttribution?.displayName} &middot; {googleReviews[0].relativePublishTimeDescription} &middot; {googleReviews[0].locationLabel}</span>
                </div>
              ) : (
                <div className="dz-review-snippet">
                  <p className="dz-snippet-loading">Loading reviews...</p>
                </div>
              )}
              <Link to="/reviews" className="dz-see-reviews">See all {googleTotal > 0 ? googleTotal.toLocaleString() : '1,470'} reviews</Link>
            </div>
          </div>

          <div className="dz-tabs">
            {tabs.map(t => (
              <button key={t} className={`dz-tab${activeTab === t.toLowerCase() ? ' active' : ''}`} onClick={() => setActiveTab(t.toLowerCase())}>{t}</button>
            ))}
          </div>

          <div className="dz-tab-content">
            {activeTab === 'highlights' && (
              <div className="dz-highlights">
                {highlights.map((h, i) => (
                  <div className="dz-highlight-row" key={i}>
                    <div className="dz-highlight-icon">
                      {h.icon === 'return' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>}
                      {h.icon === 'clock' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
                      {h.icon === 'new' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>}
                    </div>
                    <div>
                      <strong>{h.label}</strong>
                      <p>{h.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'about' && (
              <div className="dz-about-tab">
                <p>Board-certified orthopedic surgeon and fellowship-trained sports medicine specialist. Former team physician for the NY Jets (NFL) and NY Islanders (NHL). Trained at Cleveland Clinic and Lenox Hill Hospital with an international fellowship across Switzerland, the Netherlands, and Italy.</p>
                <div className="dz-about-stats">
                  <div className="dz-about-stat" style={{ animationDelay: '0.1s' }}>
                    <span className="dz-about-stat-num">15+</span>
                    <span className="dz-about-stat-label">Years Experience</span>
                  </div>
                  <div className="dz-about-stat" style={{ animationDelay: '0.2s' }}>
                    <span className="dz-about-stat-num">10K+</span>
                    <span className="dz-about-stat-label">Patients Treated</span>
                  </div>
                  <div className="dz-about-stat" style={{ animationDelay: '0.3s' }}>
                    <span className="dz-about-stat-num">3</span>
                    <span className="dz-about-stat-label">NYC Locations</span>
                  </div>
                </div>
                <div className="dz-about-credentials">
                  <div className="dz-about-cred" style={{ animationDelay: '0.15s' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5"/></svg>
                    Cleveland Clinic &mdash; Orthopedic Residency
                  </div>
                  <div className="dz-about-cred" style={{ animationDelay: '0.25s' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5"/></svg>
                    Lenox Hill Hospital &mdash; Sports Medicine Fellowship
                  </div>
                  <div className="dz-about-cred" style={{ animationDelay: '0.35s' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                    International Fellowship &mdash; Switzerland, Netherlands, Italy
                  </div>
                  <div className="dz-about-cred" style={{ animationDelay: '0.45s' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    Board Certified &mdash; American Board of Orthopaedic Surgery
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'insurances' && (
              <div className="dz-insurance-tab">
                <p>We accept 200+ insurance plans including Aetna, BlueCross BlueShield, UnitedHealthcare, Oxford, Cigna, and many more.</p>
                <div className="dz-ins-logos">
                  {insuranceLogos.map((ins) => (
                    <div className="dz-ins-logo" key={ins.name}>
                      <img src={ins.logo} alt={ins.name} />
                      <span>{ins.name}</span>
                    </div>
                  ))}
                  <div className="dz-ins-logo dz-ins-more">
                    <span className="dz-ins-more-num">200+</span>
                    <span>more plans</span>
                  </div>
                </div>
                <p style={{ marginTop: '16px', color: '#4a4a5e', fontSize: '0.85rem' }}>Please call our office to verify your specific plan.</p>
              </div>
            )}
            {activeTab === 'locations' && (
              <div className="dz-locations-tab">
                {locations.map((l, i) => (
                  <div className="dz-loc-card" key={i}>
                    <div className="dz-loc-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    </div>
                    <div className="dz-loc-info">
                      <strong>{l.name}</strong>
                      <p>{l.address}</p>
                      <div className="dz-loc-details">
                        <span>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                          {l.phone}
                        </span>
                        <span>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                          {l.hours}
                        </span>
                      </div>
                      <a href={l.mapsUrl} target="_blank" rel="noopener" className="dz-loc-link">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                        View on Google Maps
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'reviews' && (
              <div className="dz-reviews-tab">
                {googleReviews.length > 0 ? (
                  <div className="dz-reviews-summary">
                    <div className="dz-reviews-summary-left">
                      <span className="dz-reviews-big-score">4.78</span>
                      <span className="dz-reviews-big-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
                      <span className="dz-reviews-total">{googleTotal.toLocaleString()} reviews</span>
                    </div>
                    <div className="dz-reviews-summary-right">
                      {[5,4,3,2,1].map(star => {
                        const count = googleReviews.filter(r => r.rating === star).length;
                        const pct = googleReviews.length > 0 ? (count / googleReviews.length) * 100 : 0;
                        return (
                          <div className="dz-reviews-bar-row" key={star}>
                            <span className="dz-reviews-bar-label">{star}&#9733;</span>
                            <div className="dz-reviews-bar-track"><div className="dz-reviews-bar-fill" style={{ width: `${pct}%` }} /></div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="dz-reviews-summary-footer">
                      <p>Across {PLACE_IDS.length} locations in NYC</p>
                      <Link to="/reviews" className="dz-reviews-all">Read all reviews</Link>
                    </div>
                  </div>
                ) : (
                  <div className="dz-reviews-loading">
                    <div className="dz-spinner" />
                    <p>Loading reviews from Google...</p>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'faqs' && (
              <div className="dz-faqs-tab">
                <details><summary>What should I bring to my first visit?</summary><p>Insurance card, photo ID, any relevant imaging (X-rays, MRI), and a list of current medications.</p></details>
                <details><summary>How long is a typical appointment?</summary><p>Initial consultations are usually 30-45 minutes. Follow-ups are 15-20 minutes.</p></details>
                <details><summary>Do you accept walk-ins?</summary><p>We prefer scheduled appointments but can accommodate urgent orthopedic concerns. Call our office for same-day availability.</p></details>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Booking Panel */}
        <div
          className={`dz-booking${selectedDate ? ' expanded' : ''}`}
          onMouseEnter={() => setCalHover(true)}
          onMouseLeave={() => { if (!selectedDate) setCalHover(false); }}
        >
          {selectedDate && (
            <button className="dz-cal-back" onClick={() => { setSelectedDate(null); setSelectedSlot(null); }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Back to calendar
            </button>
          )}
          <div className="dz-booking-card">
            {confirmed ? (
              <div className="dz-confirmed">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <h2>Appointment Requested!</h2>
                <p className="dz-confirmed-date">
                  {selectedDate && `${MONTHS[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`} at {selectedSlot}
                </p>
                <p className="dz-confirmed-loc">{[...selectedLocs].map(i => locations[i].name.replace('NY Orthopedics – ', '')).join(', ')}</p>
                <p className="dz-confirmed-note">Dr. Elguizaoui&rsquo;s office will confirm your appointment via email.</p>
                <button className="dz-btn dz-btn-primary" onClick={() => { setConfirmed(false); setSelectedDate(null); setSelectedSlot(null); }}>Book Another</button>
                <Link to="/" className="dz-btn dz-btn-outline" style={{ marginTop: '8px' }}>Return to Site</Link>
              </div>
            ) : (
              <>
                <h2>Book an appointment for free</h2>
                <p className="dz-booking-sub">Schedule directly with Dr. Elguizaoui&rsquo;s office</p>

                <h3 className="dz-section-label">Locations</h3>
                <div className="dz-loc-toggles">
                  <button
                    className={`dz-loc-chip${selectedLocs.size === locations.length ? ' active' : ''}`}
                    onClick={toggleAllLocs}
                  >All Locations</button>
                  {locations.map((l, i) => (
                    <button
                      key={i}
                      className={`dz-loc-chip${selectedLocs.has(i) ? ' active' : ''}`}
                      onClick={() => toggleLoc(i)}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {l.name.replace('NY Orthopedics – ', '')}
                    </button>
                  ))}
                </div>

                {/* Month Calendar */}
                <div className="dz-cal-header">
                  <h3>{MONTHS[currentMonth]} {currentYear}</h3>
                  <div className="dz-cal-nav">
                    <button className="dz-cal-btn" onClick={handlePrevMonth}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                    </button>
                    <button className="dz-cal-btn" onClick={handleNextMonth}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 6 15 12 9 18"/></svg>
                    </button>
                  </div>
                </div>

                <div className="dz-cal">
                  <div className="dz-cal-row dz-cal-day-headers">
                    {DAY_HEADERS.map(d => <div className="dz-cal-dh" key={d}>{d}</div>)}
                  </div>
                  {calendarWeeks.map((week, wi) => (
                    <div className="dz-cal-row" key={wi}>
                      {week.map((date, di) => {
                        if (!date) return <div className="dz-cal-cell empty" key={di} />;
                        const slots = getApptSlots(date);
                        const count = getApptCount(date);
                        const selected = selectedDate?.toDateString() === date.toDateString();
                        const todayCell = isToday(date);
                        return (
                          <div
                            key={di}
                            className={`dz-cal-cell${selected ? ' selected' : ''}${slots.length > 0 ? ' has-appts' : ''}`}
                            onClick={() => { if (slots.length > 0) { setSelectedDate(date); setSelectedSlot(null); }}}
                          >
                            <div className="dz-cal-cell-top">
                              <span className={`dz-cal-date${todayCell ? ' today' : ''}`}>{date.getDate()}</span>
                              <span className={`dz-cal-shift-count${slots.length > 0 ? ' has' : ''}`}>
                                {slots.length > 0 ? `${count} slots` : 'No avail.'}
                              </span>
                            </div>
                            <div className="dz-cal-pills">
                              {slots.map((s, si) => (
                                <div key={si} className="dz-cal-pill" style={{ background: s.color }}>{s.label}</div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* Time Slots */}
                {selectedDate && (
                  <div className="dz-times">
                    <h3>Select a time — {MONTHS[selectedDate.getMonth()]} {selectedDate.getDate()}</h3>
                    <div className="dz-time-grid">
                      {TIMES.map((t, i) => (
                        <button
                          key={t}
                          className={`dz-time-slot${!timeAvail[i] ? ' off' : ''}${selectedSlot === t ? ' picked' : ''}`}
                          onClick={() => timeAvail[i] && setSelectedSlot(t)}
                          disabled={!timeAvail[i]}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedSlot && (
                  <div className="dz-scheduling-details">
                    <h3 className="dz-section-label">Scheduling details</h3>
                    <select className="dz-select">
                      <option>Orthopedic Consultation</option>
                      <option>Sports Injury Evaluation</option>
                      <option>Follow-up Visit</option>
                      <option>Second Opinion</option>
                      <option>Joint Pain Assessment</option>
                    </select>

                    <label className="dz-insurance-check">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="#6366f1" stroke="#fff" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="3"/><polyline points="9 11 12 14 22 4" stroke="#fff" strokeWidth="2.5"/></svg>
                      Insurance carrier and plan
                    </label>

                    <div className="dz-patient-toggle">
                      <button className={`dz-pt-btn${patientType === 'new' ? ' active' : ''}`} onClick={() => setPatientType('new')}>
                        New patient
                      </button>
                      <button className={`dz-pt-btn${patientType === 'existing' ? ' active' : ''}`} onClick={() => setPatientType('existing')}>
                        {patientType === 'existing' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>}
                        Existing patient
                      </button>
                    </div>

                    <button className="dz-btn dz-btn-confirm" onClick={handleConfirm}>
                      Confirm Appointment
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
