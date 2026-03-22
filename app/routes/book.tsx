import { Link } from "react-router";
import { useState, useMemo, useCallback } from "react";

export function meta() {
  return [
    { title: "Book an Appointment | Dr. Sam Elguizaoui, M.D. | NYC Orthopedic Surgeon" },
    { name: "description", content: "Schedule your appointment with Dr. Sam Elguizaoui, board-certified orthopedic surgeon in NYC. Same-week appointments available." },
  ];
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const SHORT_DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const TIMES = ['8:00 AM','8:30 AM','9:00 AM','9:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','1:00 PM','1:30 PM','2:00 PM','2:30 PM','3:00 PM','3:30 PM','4:00 PM','4:30 PM'];

function getWeekStart(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0,0,0,0);
  return d;
}

function getApptCount(date: Date) {
  const dow = date.getDay();
  if (dow === 0 || dow === 6) return 0; // no weekends
  if (dow === 2 || dow === 5) return 0; // Tue/Fri off
  const today = new Date(); today.setHours(0,0,0,0);
  if (date < today) return 0;
  const d = date.getDate(), m = date.getMonth(), y = date.getFullYear();
  return ((d * 7 + m * 13 + y) % 20) + 10;
}

function getTimeAvail(day: number, month: number) {
  return TIMES.map((_, i) => ((day * 7 + month * 3 + i * 11) % 10) > 3);
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
  const [weekStart, setWeekStart] = useState(() => getWeekStart(today));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [patientType, setPatientType] = useState<'new' | 'existing'>('existing');
  const [locationIdx, setLocationIdx] = useState(0);
  const [activeTab, setActiveTab] = useState('highlights');
  const [confirmed, setConfirmed] = useState(false);

  // Two weeks of dates
  const weeks = useMemo(() => {
    const result: Date[][] = [];
    for (let w = 0; w < 2; w++) {
      const week: Date[] = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + w * 7 + d);
        week.push(date);
      }
      result.push(week);
    }
    return result;
  }, [weekStart]);

  const weekEnd = useMemo(() => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 13);
    return d;
  }, [weekStart]);

  const timeAvail = useMemo(() => {
    if (!selectedDate) return [];
    return getTimeAvail(selectedDate.getDate(), selectedDate.getMonth());
  }, [selectedDate]);

  const handlePrevWeek = useCallback(() => {
    setWeekStart(prev => { const d = new Date(prev); d.setDate(d.getDate() - 14); return d; });
    setSelectedDate(null); setSelectedSlot(null);
  }, []);

  const handleNextWeek = useCallback(() => {
    setWeekStart(prev => { const d = new Date(prev); d.setDate(d.getDate() + 14); return d; });
    setSelectedDate(null); setSelectedSlot(null);
  }, []);

  const handleConfirm = () => {
    if (selectedDate && selectedSlot) setConfirmed(true);
  };

  const formatShortDate = (d: Date) => `${SHORT_DAYS[d.getDay() === 0 ? 6 : d.getDay() - 1]}\n${MONTHS[d.getMonth()].slice(0,3)} ${d.getDate()}`;

  const tabs = ['Highlights', 'About', 'Insurances', 'Locations', 'Reviews', 'FAQs'];

  return (
    <div className="dz">
      {/* Top Nav */}
      <nav className="dz-nav">
        <div className="dz-nav-inner">
          <Link to="/" className="dz-logo">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#FFD60A"/>
              <text x="16" y="22" textAnchor="middle" fontWeight="700" fontSize="16" fill="#1a1a2e" fontFamily="Inter, sans-serif">D</text>
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
          {/* Doctor Card */}
          <div className="dz-doctor-card">
            <div className="dz-doctor-header">
              <div className="dz-avatar">
                <img src="/sammd/header.jpg" alt="Dr. Sam Elguizaoui" />
              </div>
              <div className="dz-doctor-info">
                <span className="dz-badge">Patient Choice</span>
                <h1>Dr. Sam Elguizaoui, MD</h1>
                <p className="dz-specialty">Orthopedic Surgeon</p>
                <p className="dz-address">200 W 13th St, 6th Fl, New York, NY</p>
              </div>
            </div>

            {/* Rating + Review snippet */}
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

          {/* Tabs */}
          <div className="dz-tabs">
            {tabs.map(t => (
              <button
                key={t}
                className={`dz-tab${activeTab === t.toLowerCase() ? ' active' : ''}`}
                onClick={() => setActiveTab(t.toLowerCase())}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="dz-tab-content">
            {activeTab === 'highlights' && (
              <div className="dz-highlights">
                {highlights.map((h, i) => (
                  <div className="dz-highlight-row" key={i}>
                    <div className="dz-highlight-icon">
                      {h.icon === 'return' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFD60A" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>}
                      {h.icon === 'clock' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFD60A" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
                      {h.icon === 'new' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFD60A" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>}
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
                <p style={{ marginTop: '12px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Please call our office to verify your specific plan.</p>
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
                <p className="dz-booking-sub">The office partners with Zocdoc to schedule appointments</p>

                <h3 className="dz-section-label">Scheduling details</h3>
                <select className="dz-select">
                  <option>Orthopedic Consultation</option>
                  <option>Sports Injury Evaluation</option>
                  <option>Follow-up Visit</option>
                  <option>Second Opinion</option>
                  <option>Joint Pain Assessment</option>
                </select>

                <label className="dz-insurance-check">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--primary)" stroke="white" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="3"/><polyline points="9 11 12 14 22 4" stroke="white" strokeWidth="2.5"/></svg>
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

                {/* Week Calendar */}
                <div className="dz-week-header">
                  <span>{MONTHS[weekStart.getMonth()].slice(0,3)} {weekStart.getDate()} – {MONTHS[weekEnd.getMonth()].slice(0,3)} {weekEnd.getDate()}</span>
                  <div className="dz-week-nav">
                    <button className="dz-week-btn" onClick={handlePrevWeek}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                    </button>
                    <button className="dz-week-btn" onClick={handleNextWeek}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 6 15 12 9 18"/></svg>
                    </button>
                  </div>
                </div>

                <div className="dz-week-grid">
                  {weeks.map((week, wi) => (
                    <div className="dz-week-row" key={wi}>
                      {week.map((date, di) => {
                        const count = getApptCount(date);
                        const isSelected = selectedDate?.toDateString() === date.toDateString();
                        const hasAppts = count > 0;
                        return (
                          <button
                            key={di}
                            className={`dz-day-cell${isSelected ? ' selected' : ''}${hasAppts ? ' available' : ''}`}
                            onClick={() => { if (hasAppts) { setSelectedDate(date); setSelectedSlot(null); }}}
                            disabled={!hasAppts}
                          >
                            <span className="dz-day-name">{SHORT_DAYS[di]}</span>
                            <span className="dz-day-date">{MONTHS[date.getMonth()].slice(0,3)} {date.getDate()}</span>
                            <span className={`dz-day-count${hasAppts ? ' has' : ''}`}>
                              {hasAppts ? `${count} appts` : 'No appts'}
                            </span>
                          </button>
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
                  <a href="https://www.zocdoc.com/doctor/sam-elguizaoui-md-236423" target="_blank" rel="noopener">View more availability</a>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
