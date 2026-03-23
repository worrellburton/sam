import { Link } from "react-router";
import { useState, useMemo, useCallback, useEffect, useRef, useContext } from "react";
import { BookingContext } from "~/root";

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
type BgType = 'aurorawaves' | 'particles' | 'grid' | 'waves' | 'aurora' | 'none';

const BG_OPTIONS: { id: BgType; label: string }[] = [
  { id: 'aurorawaves', label: 'Aurora Waves' },
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

    const ctx = canvas.getContext('2d')!;
    if (!ctx) return;

    let raf: number;
    let cw = 0;
    let ch = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      cw = canvas.clientWidth;
      ch = canvas.clientHeight;
      canvas.width = cw * dpr;
      canvas.height = ch * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    // Particles state
    const NUM = 60;
    const pts = Array.from({ length: NUM }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2.5 + 1,
    }));

    function renderParticles(time: number) {
      ctx.clearRect(0, 0, cw, ch);
      const dt = 0.016;
      pts.forEach(p => {
        p.x += p.vx * dt / cw * 60;
        p.y += p.vy * dt / ch * 60;
        if (p.x < 0 || p.x > 1) p.vx *= -1;
        if (p.y < 0 || p.y > 1) p.vy *= -1;
        p.x = Math.max(0, Math.min(1, p.x));
        p.y = Math.max(0, Math.min(1, p.y));
        const glow = ctx.createRadialGradient(p.x * cw, p.y * ch, 0, p.x * cw, p.y * ch, p.r * 4);
        glow.addColorStop(0, 'rgba(129,140,248,0.35)');
        glow.addColorStop(1, 'rgba(129,140,248,0)');
        ctx.beginPath();
        ctx.arc(p.x * cw, p.y * ch, p.r * 4, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p.x * cw, p.y * ch, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(129,140,248,0.5)';
        ctx.fill();
      });
      for (let i = 0; i < NUM; i++) {
        for (let j = i + 1; j < NUM; j++) {
          const dx = (pts[i].x - pts[j].x) * cw;
          const dy = (pts[i].y - pts[j].y) * ch;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            const alpha = 0.15 * (1 - dist / 140);
            ctx.beginPath();
            ctx.moveTo(pts[i].x * cw, pts[i].y * ch);
            ctx.lineTo(pts[j].x * cw, pts[j].y * ch);
            ctx.strokeStyle = `rgba(129,140,248,${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
    }

    function renderGrid(time: number) {
      ctx.clearRect(0, 0, cw, ch);
      const spacing = 36;
      const cols = Math.ceil(cw / spacing) + 1;
      const rows = Math.ceil(ch / spacing) + 1;
      const t = time * 0.001;
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const cx = i * spacing;
          const cy = j * spacing;
          const distFromCenter = Math.sqrt((cx - cw / 2) ** 2 + (cy - ch / 2) ** 2) / Math.max(cw, ch);
          const pulse = Math.sin(t * 1.5 + i * 0.4 + j * 0.4) * 0.5 + 0.5;
          const wave = Math.sin(t * 0.8 + distFromCenter * 8) * 0.5 + 0.5;
          const alpha = 0.06 + (pulse * 0.12 + wave * 0.08);
          const radius = 1.2 + pulse * 2 + wave * 1;
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(129,140,248,${alpha})`;
          ctx.fill();
        }
      }
    }

    function renderWaves(time: number) {
      ctx.clearRect(0, 0, cw, ch);
      const t = time * 0.001;
      for (let layer = 0; layer < 5; layer++) {
        ctx.beginPath();
        const amp = 25 + layer * 12;
        const freq = 0.006 - layer * 0.0008;
        const speed = 0.8 + layer * 0.3;
        const yBase = ch * (0.3 + layer * 0.12);
        for (let x = 0; x <= cw; x += 2) {
          const y = yBase +
            Math.sin(x * freq + t * speed) * amp +
            Math.sin(x * freq * 2.1 + t * speed * 1.4) * amp * 0.35 +
            Math.cos(x * freq * 0.5 + t * speed * 0.6) * amp * 0.2;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        const alpha = 0.12 - layer * 0.018;
        ctx.strokeStyle = `rgba(129,140,248,${Math.max(0.03, alpha)})`;
        ctx.lineWidth = 1.5 - layer * 0.15;
        ctx.stroke();
        // Fill below the wave with a subtle gradient
        ctx.lineTo(cw, ch);
        ctx.lineTo(0, ch);
        ctx.closePath();
        ctx.fillStyle = `rgba(99,102,241,${0.015 - layer * 0.002})`;
        ctx.fill();
      }
    }

    function renderAurora(time: number) {
      ctx.clearRect(0, 0, cw, ch);
      const t = time * 0.001;
      for (let i = 0; i < 4; i++) {
        const yCenter = ch * (0.3 + i * 0.15) + Math.sin(t * 0.5 + i * 1.2) * 60;
        const grad = ctx.createLinearGradient(0, yCenter - 120, 0, yCenter + 120);
        const hueShift = Math.sin(t * 0.3 + i * 0.8) * 20;
        const r = Math.round(99 + hueShift);
        const g = Math.round(102 + hueShift * 0.5);
        const b = 241;
        const alpha = 0.08 + Math.sin(t * 0.4 + i * 1.5) * 0.03;
        grad.addColorStop(0, 'rgba(99,102,241,0)');
        grad.addColorStop(0.3, `rgba(${r},${g},${b},${alpha * 0.6})`);
        grad.addColorStop(0.5, `rgba(${r},${g},${b},${alpha})`);
        grad.addColorStop(0.7, `rgba(${r},${g},${b},${alpha * 0.6})`);
        grad.addColorStop(1, 'rgba(99,102,241,0)');
        ctx.fillStyle = grad;
        const xShift = Math.sin(t * 0.2 + i) * 80;
        ctx.fillRect(-100 + xShift, yCenter - 120, cw + 200, 240);
      }
    }

    function renderAuroraWaves(time: number) {
      ctx.clearRect(0, 0, cw, ch);
      const t = time * 0.001;

      // Aurora bands — smooth drifting color
      for (let i = 0; i < 3; i++) {
        const yCenter = ch * (0.25 + i * 0.2) + Math.sin(t * 0.3 + i * 1.5) * 50;
        const bandHeight = 180 + Math.sin(t * 0.2 + i) * 30;
        const grad = ctx.createLinearGradient(0, yCenter - bandHeight / 2, 0, yCenter + bandHeight / 2);
        const alpha = 0.07 + Math.sin(t * 0.25 + i * 2) * 0.025;
        grad.addColorStop(0, 'rgba(79,70,229,0)');
        grad.addColorStop(0.35, `rgba(99,102,241,${alpha * 0.7})`);
        grad.addColorStop(0.5, `rgba(129,140,248,${alpha})`);
        grad.addColorStop(0.65, `rgba(99,102,241,${alpha * 0.7})`);
        grad.addColorStop(1, 'rgba(79,70,229,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, yCenter - bandHeight / 2, cw, bandHeight);
      }

      // Flowing waves on top
      for (let layer = 0; layer < 4; layer++) {
        ctx.beginPath();
        const amp = 18 + layer * 10;
        const freq = 0.005 - layer * 0.0006;
        const speed = 0.5 + layer * 0.15;
        const yBase = ch * (0.3 + layer * 0.14);
        for (let x = 0; x <= cw; x += 2) {
          const y = yBase +
            Math.sin(x * freq + t * speed) * amp +
            Math.sin(x * freq * 1.8 + t * speed * 0.7) * amp * 0.3;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        const alpha = 0.1 - layer * 0.018;
        ctx.strokeStyle = `rgba(129,140,248,${Math.max(0.03, alpha)})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    }

    const renderers: Record<string, (time: number) => void> = {
      aurorawaves: renderAuroraWaves,
      particles: renderParticles,
      grid: renderGrid,
      waves: renderWaves,
      aurora: renderAurora,
    };

    function loop(time: number) {
      renderers[bgType]?.(time);
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

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
    name: "NY Orthopedics – Greenwich Village",
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

const insuranceNames = [
  "BlueCross BlueShield", "Kaiser Permanente", "UnitedHealthcare", "Aetna",
  "Cigna", "Humana", "Anthem", "Elevance Health",
  "Centene (Ambetter)", "Oscar Health", "Oxford", "Empire BCBS",
];

export default function BookPage() {
  const { closeBooking } = useContext(BookingContext);
  const today = new Date();
  today.setHours(0,0,0,0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeSlotsRef = useRef<HTMLDivElement>(null);
  const patientDetailsRef = useRef<HTMLDivElement>(null);
  const [bgType, setBgType] = useState<BgType>(() => {
    if (typeof window !== 'undefined') return (localStorage.getItem('dz-bg') as BgType) || 'aurorawaves';
    return 'aurorawaves';
  });
  useAnimatedBackground(canvasRef, bgType);
  const { reviews: googleReviews, totalCount: googleTotal } = useGoogleReviews();

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [patientType, setPatientType] = useState<'new' | 'existing'>('existing');
  const [selectedLocs, setSelectedLocs] = useState<Set<number>>(new Set());
  const toggleLoc = (idx: number) => {
    setSelectedLocs(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };
  const toggleAllLocs = () => {
    setSelectedLocs(new Set(locations.map((_, i) => i)));
  };
  const [activeTab, setActiveTab] = useState('highlights');
  const [confirmed, setConfirmed] = useState(false);
  const [intakeStep, setIntakeStep] = useState(0); // 0 = not started, 1-4 = intake steps
  const [issueText, setIssueText] = useState('');
  const [enhancedText, setEnhancedText] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isEnhanced, setIsEnhanced] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploadedLicense, setUploadedLicense] = useState<string | null>(null);
  const [uploadedInsurance, setUploadedInsurance] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const recordingTimerRef = useRef<any>(null);
  const orbCanvasRef = useRef<HTMLCanvasElement>(null);
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
    if (selectedDate && selectedSlot) setIntakeStep(1);
  };

  // Voice-to-text
  const startRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (e: any) => {
      let transcript = '';
      for (let i = 0; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
      }
      setIssueText(prev => {
        const base = prev.replace(/\s*\[listening\.\.\.\]\s*$/, '');
        return base + (base ? ' ' : '') + transcript;
      });
    };
    recognition.onerror = () => stopRecording();
    recognition.onend = () => stopRecording();
    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    setRecordingTime(0);
    recordingTimerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsRecording(false);
    clearInterval(recordingTimerRef.current);
  };

  // Enhance text (clean up typos/grammar)
  const enhanceText = () => {
    setIsEnhancing(true);
    setTimeout(() => {
      let cleaned = issueText;
      // Basic cleanup: capitalize first letter, fix common typos
      const fixes: Record<string, string> = {
        'sholder': 'shoulder', 'shulder': 'shoulder', 'shoudler': 'shoulder',
        'nee': 'knee', 'kne': 'knee', 'knne': 'knee',
        'elbo': 'elbow', 'elbw': 'elbow',
        'ankel': 'ankle', 'ancle': 'ankle',
        'wirst': 'wrist', 'writs': 'wrist',
        'pian': 'pain', 'pai': 'pain',
        'surger': 'surgery', 'surgry': 'surgery',
        'injur': 'injury', 'injry': 'injury',
        'im ': "I'm ", 'i ': 'I ', 'i\'m': "I'm", 'i\'ve': "I've",
        'dont': "don't", 'cant': "can't", 'wont': "won't",
      };
      Object.entries(fixes).forEach(([wrong, right]) => {
        cleaned = cleaned.replace(new RegExp(`\\b${wrong}\\b`, 'gi'), right);
      });
      // Capitalize first letter of sentences
      cleaned = cleaned.replace(/(^|[.!?]\s+)([a-z])/g, (_, pre, c) => pre + c.toUpperCase());
      if (cleaned.length > 0 && cleaned[0] === cleaned[0].toLowerCase()) {
        cleaned = cleaned[0].toUpperCase() + cleaned.slice(1);
      }
      // Add period if missing
      if (cleaned.length > 0 && !/[.!?]$/.test(cleaned.trim())) {
        cleaned = cleaned.trim() + '.';
      }
      setEnhancedText(cleaned);
      setIsEnhancing(false);
      setIsEnhanced(true);
    }, 1500);
  };

  // Orb animation for Step 1
  useEffect(() => {
    if (intakeStep !== 1) return;
    const canvas = orbCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf: number;
    const resize = () => {
      canvas.width = canvas.clientWidth * 2;
      canvas.height = canvas.clientHeight * 2;
      ctx.setTransform(2, 0, 0, 2, 0, 0);
    };
    resize();
    const orbs = [
      { x: 0.3, y: 0.4, r: 80, color: [59, 130, 246], vx: 0.3, vy: 0.2 },
      { x: 0.7, y: 0.3, r: 70, color: [147, 51, 234], vx: -0.2, vy: 0.3 },
      { x: 0.5, y: 0.7, r: 60, color: [6, 182, 212], vx: 0.15, vy: -0.25 },
    ];
    const textLen = () => (issueText.length + (enhancedText || '').length) / 2;
    const render = (time: number) => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      const intensity = Math.min(1, textLen() / 100);
      const t = time * 0.001;
      orbs.forEach((orb, i) => {
        const ox = (0.5 + Math.sin(t * orb.vx + i) * 0.3) * w;
        const oy = (0.5 + Math.cos(t * orb.vy + i * 2) * 0.3) * h;
        const r = orb.r * (0.6 + intensity * 0.6);
        const grad = ctx.createRadialGradient(ox, oy, 0, ox, oy, r);
        const alpha = 0.15 + intensity * 0.25;
        grad.addColorStop(0, `rgba(${orb.color.join(',')},${alpha})`);
        grad.addColorStop(1, `rgba(${orb.color.join(',')},0)`);
        ctx.beginPath();
        ctx.arc(ox, oy, r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [intakeStep, issueText, enhancedText]);

  const isToday = (d: Date) => d.toDateString() === new Date().toDateString();
  const [calHover, setCalHover] = useState(false);
  const calActive = selectedDate !== null || calHover;

  useEffect(() => {
    if (selectedDate && !selectedSlot) {
      requestAnimationFrame(() => {
        timeSlotsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, [selectedDate, selectedSlot]);

  useEffect(() => {
    if (selectedSlot) {
      requestAnimationFrame(() => {
        patientDetailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, [selectedSlot]);

  const tabs = ['Highlights', 'About', 'Insurances', 'Locations', 'Reviews', 'FAQs'];

  return (
    <div className={`dz${dzTheme === 'light' ? ' dz-light' : ''}`}>
      <canvas ref={canvasRef} className="dz-webgl-bg" />

      {/* Top Nav */}
      <nav className="dz-nav">
        <div className="dz-nav-inner">
          <div className="dz-logo-group">
            <Link to="/" className="dz-logo">
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="#6366f1"/>
                <text x="16" y="22" textAnchor="middle" fontWeight="700" fontSize="16" fill="#fff" fontFamily="Inter, sans-serif">D</text>
              </svg>
              <span>DocZoc</span>
            </Link>
            {intakeStep > 0 ? (
              <button className="dz-back-site" onClick={() => { if (intakeStep > 1 && !confirmed) setIntakeStep(intakeStep - 1); else { setIntakeStep(0); setConfirmed(false); } }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                Back
              </button>
            ) : selectedSlot ? (
              <button className="dz-back-site" onClick={() => setSelectedSlot(null)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                Back
              </button>
            ) : selectedDate ? (
              <button className="dz-back-site" onClick={() => { setSelectedDate(null); setSelectedSlot(null); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                Back
              </button>
            ) : (
              <button className="dz-back-site" onClick={closeBooking}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                Back to site
              </button>
            )}
          </div>
          <div className="dz-nav-links">
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
              {(() => {
                const photoReview = googleReviews.find(r => r.authorAttribution?.photoUri);
                return photoReview ? (
                  <div className="dz-review-snippet">
                    <div className="dz-snippet-author">
                      <img src={photoReview.authorAttribution!.photoUri!} alt="" className="dz-snippet-avatar" />
                    </div>
                    <p>&ldquo;{photoReview.text?.text?.slice(0, 180)}{(photoReview.text?.text?.length || 0) > 180 ? '...' : ''}&rdquo;</p>
                    <span className="dz-review-meta">{photoReview.authorAttribution?.displayName} &middot; {photoReview.relativePublishTimeDescription} &middot; {photoReview.locationLabel}</span>
                  </div>
                ) : (
                  <div className="dz-review-snippet">
                    <p className="dz-snippet-loading">Loading reviews...</p>
                  </div>
                );
              })()}
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
                  {insuranceNames.map((name) => (
                    <div className="dz-ins-logo" key={name}>
                      <span>{name}</span>
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
                    <iframe
                      title={l.name}
                      src={`https://www.google.com/maps/embed/v1/place?key=${PLACES_API_KEY}&q=${encodeURIComponent(l.address)}&zoom=13`}
                      className="dz-loc-minimap"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      allowFullScreen
                    />
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
          onClick={(e) => {
            if (!calActive) setCalHover(true);
            if (e.target === e.currentTarget) {
              if (selectedSlot) { setSelectedSlot(null); }
              else if (selectedDate) { setSelectedDate(null); }
            }
          }}
        >
          <div className="dz-booking-card" onClick={(e) => e.stopPropagation()}>
            {intakeStep > 0 ? (
              <div className="dz-intake-overlay">
                <div className="dz-intake-progress">
                  {[1,2,3,4].map(s => (
                    <div key={s} className={`dz-intake-dot${intakeStep >= s ? ' active' : ''}${intakeStep === s ? ' current' : ''}`} />
                  ))}
                </div>

                {/* Step 1: Describe Your Issue */}
                {intakeStep === 1 && (
                  <div className="dz-intake-step dz-intake-describe">
                    <canvas ref={orbCanvasRef} className="dz-orb-canvas" />
                    <div className="dz-intake-glass">
                      <h2>Describe Your Issue</h2>
                      <p className="dz-intake-sub">Tell us what's bothering you so Dr. Elguizaoui can prepare for your visit.</p>
                      <div className="dz-textarea-wrap">
                        <textarea
                          className={`dz-intake-textarea${issueText.length > 0 ? ' typing' : ''}`}
                          placeholder="e.g. I've been having pain in my right shoulder for about 3 weeks, especially when reaching overhead..."
                          value={isEnhanced ? enhancedText : issueText}
                          onChange={(e) => { setIssueText(e.target.value); setIsEnhanced(false); setEnhancedText(''); }}
                          rows={5}
                        />
                        <button
                          className={`dz-voice-btn${isRecording ? ' recording' : ''}`}
                          onClick={isRecording ? stopRecording : startRecording}
                          title={isRecording ? 'Stop recording' : 'Voice to text'}
                        >
                          {isRecording ? (
                            <>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
                              <span className="dz-rec-timer">{Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, '0')}</span>
                            </>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                          )}
                        </button>
                      </div>
                      {issueText.length >= 10 && !isEnhanced && (
                        <button className={`dz-enhance-btn${isEnhancing ? ' enhancing' : ''}`} onClick={enhanceText} disabled={isEnhancing}>
                          {isEnhancing ? (
                            <><div className="dz-spinner-sm" /> Enhancing...</>
                          ) : (
                            <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> Enhance</>
                          )}
                        </button>
                      )}
                      {isEnhanced && (
                        <button className="dz-btn dz-btn-primary dz-intake-continue" onClick={() => setIntakeStep(2)}>
                          Continue
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 2: Good Fit Confirmation */}
                {intakeStep === 2 && (
                  <div className="dz-intake-step dz-intake-goodfit">
                    <div className="dz-goodfit-check">
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    </div>
                    <h2>You're a Great Fit!</h2>
                    <p className="dz-goodfit-desc">Based on what you've described, Dr. Elguizaoui can help. Continue with booking &mdash; we'll need your card information next.</p>
                    <button className="dz-btn dz-btn-primary dz-intake-continue" onClick={() => setIntakeStep(3)}>
                      Continue
                    </button>
                  </div>
                )}

                {/* Step 3: Upload Cards */}
                {intakeStep === 3 && (
                  <div className="dz-intake-step dz-intake-upload">
                    <h2>Upload Your Cards</h2>
                    <p className="dz-intake-sub">We need a copy of your ID and insurance card to complete booking.</p>
                    <div className="dz-upload-zones">
                      <label className={`dz-upload-zone${uploadedLicense ? ' uploaded' : ''}`}>
                        <input type="file" accept="image/*,.pdf" className="dz-file-input" onChange={(e) => setUploadedLicense(e.target.files?.[0]?.name || null)} />
                        {uploadedLicense ? (
                          <>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                            <span className="dz-upload-label">Driver's License</span>
                            <span className="dz-upload-status">Uploaded</span>
                          </>
                        ) : (
                          <>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                            <span className="dz-upload-label">Driver's License</span>
                            <span className="dz-upload-hint">Click or drag to upload</span>
                          </>
                        )}
                      </label>
                      <label className={`dz-upload-zone${uploadedInsurance ? ' uploaded' : ''}`}>
                        <input type="file" accept="image/*,.pdf" className="dz-file-input" onChange={(e) => setUploadedInsurance(e.target.files?.[0]?.name || null)} />
                        {uploadedInsurance ? (
                          <>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                            <span className="dz-upload-label">Insurance Card</span>
                            <span className="dz-upload-status">Uploaded</span>
                          </>
                        ) : (
                          <>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                            <span className="dz-upload-label">Insurance Card</span>
                            <span className="dz-upload-hint">Click or drag to upload</span>
                          </>
                        )}
                      </label>
                    </div>
                    <button
                      className="dz-btn dz-btn-primary dz-intake-continue"
                      disabled={!uploadedLicense || !uploadedInsurance}
                      onClick={() => setIntakeStep(4)}
                    >
                      Continue
                    </button>
                  </div>
                )}

                {/* Step 4: Summary & Book */}
                {intakeStep === 4 && (
                  <div className="dz-intake-step dz-intake-summary">
                    {!confirmed ? (
                      <>
                        <h2>Review & Book</h2>
                        <div className="dz-summary-card">
                          <div className="dz-summary-row">
                            <span className="dz-summary-label">Date & Time</span>
                            <span>{selectedDate && `${MONTHS[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`} at {selectedSlot}</span>
                          </div>
                          <div className="dz-summary-row">
                            <span className="dz-summary-label">Patient Type</span>
                            <span style={{ textTransform: 'capitalize' }}>{patientType} patient</span>
                          </div>
                          <div className="dz-summary-row">
                            <span className="dz-summary-label">Concern</span>
                            <span className="dz-summary-concern">{(enhancedText || issueText).slice(0, 150)}{(enhancedText || issueText).length > 150 ? '...' : ''}</span>
                          </div>
                          <div className="dz-summary-row">
                            <span className="dz-summary-label">Documents</span>
                            <span>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> License &nbsp;
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> Insurance
                            </span>
                          </div>
                        </div>
                        <button className="dz-btn dz-btn-book" onClick={() => setConfirmed(true)}>
                          Book Appointment
                        </button>
                      </>
                    ) : (
                      <div className="dz-intake-booked">
                        <div className="dz-booked-check">
                          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                        </div>
                        <h2>Appointment Booked!</h2>
                        <p className="dz-booked-date">
                          {selectedDate && `${MONTHS[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`} at {selectedSlot}
                        </p>
                        <p className="dz-booked-note">Dr. Elguizaoui's office will confirm via email.</p>
                        <button className="dz-btn dz-btn-primary" onClick={() => { setConfirmed(false); setIntakeStep(0); setSelectedDate(null); setSelectedSlot(null); setIssueText(''); setEnhancedText(''); setIsEnhanced(false); setUploadedLicense(null); setUploadedInsurance(null); }}>
                          Done
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <>
                <h2>Book an appointment for free</h2>
                <p className="dz-booking-sub">Schedule directly with Dr. Elguizaoui&rsquo;s office</p>

                <h3 className="dz-section-label">Locations</h3>
                <div className="dz-loc-circles">
                  {locations.map((l, i) => {
                    const isActive = selectedLocs.has(i);
                    const mapSrc = `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(l.address)}&zoom=14&size=200x200&scale=2&maptype=roadmap&style=feature:poi|visibility:off&markers=color:0x6366f1|${encodeURIComponent(l.address)}&key=${PLACES_API_KEY}`;
                    return (
                      <button
                        key={i}
                        className={`dz-loc-circle${isActive ? ' active' : ''}`}
                        onClick={() => toggleLoc(i)}
                      >
                        <div className="dz-loc-circle-img">
                          <img
                            src={mapSrc}
                            alt={l.name}
                            loading="lazy"
                          />
                          <div className="dz-loc-circle-check">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                          </div>
                        </div>
                        <span className="dz-loc-circle-label">{l.name.replace('NY Orthopedics – ', '')}</span>
                        <span className="dz-loc-circle-addr">{l.address.split(',')[0]}</span>
                      </button>
                    );
                  })}
                </div>

                <div className={selectedLocs.size === 0 ? 'dz-cal-disabled' : ''}>
                {selectedLocs.size === 0 && (
                  <div className="dz-cal-overlay">
                    <p className="dz-loc-prompt">Select a location to get started</p>
                  </div>
                )}
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
                        const todayCell = isToday(date);
                        const avail = slots.length > 0;
                        const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
                        return (
                          <div
                            key={di}
                            className={`dz-cal-cell${avail ? ' has-appts' : ''}${isSelected ? ' selected' : ''}`}
                            onClick={() => { if (avail) { setSelectedDate(date); setSelectedSlot(null); }}}
                          >
                            <span className={`dz-cal-date${todayCell ? ' today' : ''}`}>{date.getDate()}</span>
                            <span className={`dz-cal-shift-count${avail ? ' has' : ''}`}>
                              {avail ? 'Avail.' : 'No avail.'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* Time Slots — inline below calendar */}
                {selectedDate && !selectedSlot && (
                  <div className="dz-times-inline" ref={timeSlotsRef}>
                    <div className="dz-times-header">
                      <h3>{MONTHS[selectedDate.getMonth()]} {selectedDate.getDate()} — Select a time</h3>
                      <div className="dz-daylight">
                        <span className="dz-sunrise">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2"><path d="M17 18a5 5 0 0 0-10 0"/><line x1="12" y1="9" x2="12" y2="2"/><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/><line x1="1" y1="18" x2="3" y2="18"/><line x1="21" y1="18" x2="23" y2="18"/><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/><line x1="23" y1="22" x2="1" y2="22"/><polyline points="8 6 12 2 16 6"/></svg>
                          6:58 AM
                        </span>
                        <span className="dz-sunset">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2"><path d="M17 18a5 5 0 0 0-10 0"/><line x1="12" y1="9" x2="12" y2="2"/><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/><line x1="1" y1="18" x2="3" y2="18"/><line x1="21" y1="18" x2="23" y2="18"/><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/><line x1="23" y1="22" x2="1" y2="22"/><polyline points="16 6 12 10 8 6"/></svg>
                          7:15 PM
                        </span>
                      </div>
                    </div>
                    <div className="dz-time-columns">
                      {[
                        { label: 'Early Morning', times: TIMES.filter((t, i) => timeAvail[i] && t.includes('AM') && parseInt(t) >= 8 && parseInt(t) < 10) },
                        { label: 'Late Morning', times: TIMES.filter((t, i) => timeAvail[i] && t.includes('AM') && parseInt(t) >= 10) },
                        { label: 'Early Afternoon', times: TIMES.filter((t, i) => timeAvail[i] && t.includes('PM') && parseInt(t) >= 1 && parseInt(t) < 3 && parseInt(t) !== 12) },
                        { label: 'Afternoon', times: TIMES.filter((t, i) => timeAvail[i] && t.includes('PM') && (parseInt(t) >= 3 || parseInt(t) === 12)) },
                      ].filter(g => g.times.length > 0).map((group) => (
                        <div className="dz-time-col" key={group.label}>
                          <span className="dz-time-col-label">{group.label}</span>
                          {group.times.map((t) => (
                            <button
                              key={t}
                              className="dz-time-chip"
                              onClick={() => setSelectedSlot(t)}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 3: Patient Details */}
                {selectedSlot && (
                  <div className="dz-step" ref={patientDetailsRef}>
                    <div className="dz-step-header">
                      <button className="dz-step-back" onClick={() => setSelectedSlot(null)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                        Back to times
                      </button>
                      <div className="dz-step-badge">Step 3 of 3</div>
                    </div>
                    <div className="dz-step-summary">
                      <span>{MONTHS[selectedDate!.getMonth()]} {selectedDate!.getDate()}, {selectedDate!.getFullYear()}</span>
                      <span className="dz-step-dot" />
                      <span>{selectedSlot}</span>
                    </div>

                    <h3 className="dz-step-title">Patient details</h3>
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
              </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bottom credentials bar */}
      <div className="dz-bottom-bar">
        <div className="dz-bottom-bar-inner">
          <div className="dz-bottom-rating">
            <svg width="14" height="14" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span className="dz-bottom-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
            <span>4.8</span>
            <span className="dz-bottom-count">(1,469 reviews)</span>
          </div>
          <div className="dz-bottom-marquee">
            <div className="dz-bottom-track">
              {[1, 2].map((k) => (
                <span key={k}>
                  <span className="dz-bottom-hl">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    Board Certified
                  </span>
                  <span><img src="https://cdn.brandfetch.io/newyorkjets.com/w/32/h/32/theme/dark/fallback/lettermark/type/icon?c=1id3n10pdBTarCHI0db" alt="" className="sticky-team-logo" referrerPolicy="origin" /> NY Jets Team Physician</span>
                  <span><img src="https://cdn.brandfetch.io/newyorkislanders.com/w/32/h/32/theme/dark/fallback/lettermark/type/icon?c=1id3n10pdBTarCHI0db" alt="" className="sticky-team-logo" referrerPolicy="origin" /> NY Islanders Team Physician</span>
                  <span>Lenox Hill Fellowship</span>
                  <span>Minimally Invasive Surgery</span>
                  <span>Ohio State Magna Cum Laude</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
