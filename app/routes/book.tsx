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

// Subtle WebGL particle background
function useWebGLBackground(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { alpha: true, antialias: true });
    if (!gl) return;

    const vsSource = `
      attribute vec2 a_position;
      attribute float a_size;
      attribute float a_alpha;
      varying float v_alpha;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        gl_PointSize = a_size;
        v_alpha = a_alpha;
      }
    `;
    const fsSource = `
      precision mediump float;
      varying float v_alpha;
      void main() {
        float dist = length(gl_PointCoord - vec2(0.5));
        if (dist > 0.5) discard;
        float fade = 1.0 - smoothstep(0.2, 0.5, dist);
        gl_FragColor = vec4(0.39, 0.4, 0.95, v_alpha * fade * 0.15);
      }
    `;

    function createShader(g: WebGLRenderingContext, type: number, source: string) {
      const s = g.createShader(type)!;
      g.shaderSource(s, source);
      g.compileShader(s);
      return s;
    }
    const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    const NUM = 60;
    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number }[] = [];
    for (let i = 0; i < NUM; i++) {
      particles.push({
        x: Math.random() * 2 - 1,
        y: Math.random() * 2 - 1,
        vx: (Math.random() - 0.5) * 0.0008,
        vy: (Math.random() - 0.5) * 0.0008,
        size: Math.random() * 3 + 1.5,
        alpha: Math.random() * 0.6 + 0.2,
      });
    }

    const posLoc = gl.getAttribLocation(program, 'a_position');
    const sizeLoc = gl.getAttribLocation(program, 'a_size');
    const alphaLoc = gl.getAttribLocation(program, 'a_alpha');

    const posBuf = gl.createBuffer()!;
    const sizeBuf = gl.createBuffer()!;
    const alphaBuf = gl.createBuffer()!;

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    let raf: number;
    const resize = () => {
      canvas.width = canvas.clientWidth * window.devicePixelRatio;
      canvas.height = canvas.clientHeight * window.devicePixelRatio;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    const posData = new Float32Array(NUM * 2);
    const sizeData = new Float32Array(NUM);
    const alphaData = new Float32Array(NUM);

    function render() {
      gl!.clearColor(0, 0, 0, 0);
      gl!.clear(gl!.COLOR_BUFFER_BIT);

      for (let i = 0; i < NUM; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -1 || p.x > 1) p.vx *= -1;
        if (p.y < -1 || p.y > 1) p.vy *= -1;
        posData[i * 2] = p.x;
        posData[i * 2 + 1] = p.y;
        sizeData[i] = p.size * window.devicePixelRatio;
        alphaData[i] = p.alpha;
      }

      gl!.bindBuffer(gl!.ARRAY_BUFFER, posBuf);
      gl!.bufferData(gl!.ARRAY_BUFFER, posData, gl!.DYNAMIC_DRAW);
      gl!.enableVertexAttribArray(posLoc);
      gl!.vertexAttribPointer(posLoc, 2, gl!.FLOAT, false, 0, 0);

      gl!.bindBuffer(gl!.ARRAY_BUFFER, sizeBuf);
      gl!.bufferData(gl!.ARRAY_BUFFER, sizeData, gl!.DYNAMIC_DRAW);
      gl!.enableVertexAttribArray(sizeLoc);
      gl!.vertexAttribPointer(sizeLoc, 1, gl!.FLOAT, false, 0, 0);

      gl!.bindBuffer(gl!.ARRAY_BUFFER, alphaBuf);
      gl!.bufferData(gl!.ARRAY_BUFFER, alphaData, gl!.DYNAMIC_DRAW);
      gl!.enableVertexAttribArray(alphaLoc);
      gl!.vertexAttribPointer(alphaLoc, 1, gl!.FLOAT, false, 0, 0);

      gl!.drawArrays(gl!.POINTS, 0, NUM);
      raf = requestAnimationFrame(render);
    }
    render();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [canvasRef]);
}

const highlights = [
  { icon: "return", label: "Patients often return", sub: "More patients return than other providers in the area" },
  { icon: "clock", label: "Excellent wait time", sub: "91% of patients waited less than 30 minutes" },
  { icon: "new", label: "New patient appointments", sub: "Appointments available for new patients" },
];

const insurances = "Aetna, BlueCross BlueShield, UnitedHealthcare, UnitedHealthcare Oxford";

const locations = [
  { name: "NY Orthopedics – Lenox Hill Greenwich Village", address: "200 W 13th St, 6th Fl, New York, NY 10011" },
  { name: "NY Orthopedics – Upper East Side", address: "159 East 74th St, New York, NY 10021" },
  { name: "NY Orthopedics – Brooklyn Heights", address: "161 Atlantic Ave, Brooklyn, NY 11201" },
];

export default function BookPage() {
  const today = new Date();
  today.setHours(0,0,0,0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useWebGLBackground(canvasRef);

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [patientType, setPatientType] = useState<'new' | 'existing'>('existing');
  const [locationIdx, setLocationIdx] = useState(0);
  const [activeTab, setActiveTab] = useState('highlights');
  const [confirmed, setConfirmed] = useState(false);

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

  const tabs = ['Highlights', 'About', 'Insurances', 'Locations', 'Reviews', 'FAQs'];

  return (
    <div className="dz">
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
            <a href="tel:+19179059370" className="dz-nav-phone">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              (917) 905-9370
            </a>
          </div>
        </div>
      </nav>

      <div className="dz-main">
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
              <div className="dz-review-snippet">
                <p>&ldquo;Honestly, highly recommend. This is the 2nd time I broke a bone and came straight back to Dr. Elguizaoui. Not sure how many times an Ortho gets a repeat client, but that...&rdquo;</p>
                <span className="dz-review-meta">Carlos G. &middot; March 16, 2026</span>
              </div>
              <Link to="/reviews" className="dz-see-reviews">See all 1470 reviews</Link>
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
                <div className="dz-insurance-row">
                  <h4>In-network insurances</h4>
                  <p>{insurances}</p>
                  <button className="dz-link-btn">(200+) more in-network plans</button>
                </div>
              </div>
            )}
            {activeTab === 'about' && (
              <div className="dz-about-tab">
                <p>Board-certified orthopedic surgeon and fellowship-trained sports medicine specialist. Former team physician for the NY Jets (NFL) and NY Islanders (NHL). Trained at Cleveland Clinic and Lenox Hill Hospital with an international fellowship across Switzerland, the Netherlands, and Italy.</p>
              </div>
            )}
            {activeTab === 'insurances' && (
              <div className="dz-insurance-tab">
                <p>We accept 200+ insurance plans including Aetna, BlueCross BlueShield, UnitedHealthcare, UnitedHealthcare Oxford, Cigna, Humana, and many more.</p>
                <p style={{ marginTop: '12px', color: '#6b6b80', fontSize: '0.9rem' }}>Please call our office to verify your specific plan.</p>
              </div>
            )}
            {activeTab === 'locations' && (
              <div className="dz-locations-tab">
                {locations.map((l, i) => (
                  <div className="dz-location-item" key={i}>
                    <strong>{l.name}</strong>
                    <p>{l.address}</p>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'reviews' && (
              <div className="dz-reviews-tab">
                <p>See all patient reviews on our <Link to="/reviews">reviews page</Link>.</p>
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
        <div className="dz-booking">
          <div className="dz-booking-card">
            {confirmed ? (
              <div className="dz-confirmed">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <h2>Appointment Requested!</h2>
                <p className="dz-confirmed-date">
                  {selectedDate && `${MONTHS[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`} at {selectedSlot}
                </p>
                <p className="dz-confirmed-loc">{locations[locationIdx].name}</p>
                <p className="dz-confirmed-note">Dr. Elguizaoui&rsquo;s office will confirm your appointment via email.</p>
                <button className="dz-btn dz-btn-primary" onClick={() => { setConfirmed(false); setSelectedDate(null); setSelectedSlot(null); }}>Book Another</button>
                <Link to="/" className="dz-btn dz-btn-outline" style={{ marginTop: '8px' }}>Return to Site</Link>
              </div>
            ) : (
              <>
                <h2>Book an appointment for free</h2>
                <p className="dz-booking-sub">Schedule directly with Dr. Elguizaoui&rsquo;s office</p>

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

                <h3 className="dz-section-label">Available appointments</h3>
                <select className="dz-select dz-location-select" value={locationIdx} onChange={e => setLocationIdx(Number(e.target.value))}>
                  {locations.map((l, i) => (
                    <option key={i} value={i}>{l.name} — {l.address}</option>
                  ))}
                </select>
                <p className="dz-more-locations">{locations.length - 1} more locations with availability</p>

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
                              {slots.length > 0 && <span className="dz-cal-shift-count">{count} appts</span>}
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
                  <button className="dz-btn dz-btn-confirm" onClick={handleConfirm}>
                    Confirm Appointment
                  </button>
                )}

                <p className="dz-view-more">
                  <Link to="/contact">View more availability</Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
