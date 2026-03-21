import { Link } from "react-router";
import { useState, useMemo, useCallback } from "react";

export function meta() {
  return [
    { title: "Book an Appointment | Dr. Sameh Elguizaoui, M.D. | NYC Orthopedic Surgeon" },
    { name: "description", content: "Schedule your appointment with Dr. Sameh Elguizaoui, board-certified orthopedic surgeon in NYC. Same-week appointments available." },
  ];
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
const TIMES = ['8:00 AM','8:30 AM','9:00 AM','9:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','1:00 PM','1:30 PM','2:00 PM','2:30 PM','3:00 PM','3:30 PM','4:00 PM','4:30 PM'];

function getAvailability(year: number, month: number) {
  const today = new Date();
  const avail: Record<number, number> = {};
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const dow = date.getDay();
    if (dow === 1 || dow === 3 || dow === 4) {
      if (date >= today || date.toDateString() === today.toDateString()) {
        // Deterministic pseudo-random based on date
        avail[d] = ((d * 7 + month * 13 + year) % 20) + 10;
      }
    }
  }
  return avail;
}

function getTimeAvailability(day: number, month: number) {
  return TIMES.map((t, i) => {
    const seed = (day * 7 + month * 3 + i * 11) % 10;
    return seed > 3;
  });
}

export default function BookPage() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [patientType, setPatientType] = useState<'existing' | 'new'>('existing');

  const avail = useMemo(() => getAvailability(currentYear, currentMonth), [currentYear, currentMonth]);
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const timeAvail = useMemo(() => {
    if (!selectedDate) return [];
    return getTimeAvailability(selectedDate.getDate(), selectedDate.getMonth());
  }, [selectedDate]);

  const handleDayClick = useCallback((day: number) => {
    setSelectedDate(new Date(currentYear, currentMonth, day));
    setSelectedSlot(null);
    setExpanded(true);
  }, [currentYear, currentMonth]);

  const handlePrev = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
    setSelectedDate(null); setSelectedSlot(null);
  };

  const handleNext = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
    setSelectedDate(null); setSelectedSlot(null);
  };

  const handleBack = () => {
    setExpanded(false);
    setSelectedDate(null);
    setSelectedSlot(null);
  };

  const handleConfirm = () => {
    if (selectedDate && selectedSlot) {
      const dateStr = `${MONTHS[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`;
      alert(`Appointment requested!\n\n${dateStr} at ${selectedSlot}\n\nDr. Elguizaoui's office will confirm your appointment via email.`);
    }
  };

  return (
    <>
      {/* Top bar */}
      <div className="book-topbar">
        <div className="container book-topbar-inner">
          <Link to="/" className="book-back">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Sam Elguizaoui, M.D.
          </Link>
          <a href="tel:+19179059370" className="book-phone">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            +1-917-905-9370
          </a>
        </div>
      </div>

      {/* Booking stage */}
      <div className={`book-stage${expanded ? ' expanded' : ''}`}>
        <div className={`book-panel`}>
          {/* Sidebar */}
          <div className="book-sidebar-content">
            <h2>Book an appointment for free</h2>
            <p className="book-sub">Schedule directly with Dr. Elguizaoui&rsquo;s office</p>

            <p className="book-section-label">Scheduling details</p>
            <select className="book-select">
              <option>Orthopedic Consultation</option>
              <option>Sports Injury Evaluation</option>
              <option>Follow-up Visit</option>
              <option>Second Opinion</option>
              <option>Joint Pain Assessment</option>
            </select>

            <label className="book-insurance-check">
              <input type="checkbox" defaultChecked /> Insurance carrier and plan
            </label>

            <div className="patient-toggle">
              <button
                className={`patient-toggle-btn${patientType === 'new' ? ' active' : ''}`}
                onClick={() => setPatientType('new')}
              >
                {patientType === 'new' ? '\u2713 ' : ''}New patient
              </button>
              <button
                className={`patient-toggle-btn${patientType === 'existing' ? ' active' : ''}`}
                onClick={() => setPatientType('existing')}
              >
                {patientType === 'existing' ? '\u2713 ' : ''}Existing patient
              </button>
            </div>

            <p className="book-section-label">Available appointments</p>
            <select className="book-select">
              <option value="greenwich">NY Orthopedics &ndash; Greenwich Village (200 W 13th St, 6th Fl)</option>
              <option value="ues">NY Orthopedics &ndash; Upper East Side (159 East 74th St)</option>
              <option value="brooklyn">NY Orthopedics &ndash; Brooklyn Heights (161 Atlantic Ave)</option>
            </select>

            {/* Doctor info card (sidebar mode only) */}
            <div className="sidebar-doc">
              <div className="sidebar-doc-header">
                <div className="sidebar-doc-avatar"><img src="/sammd/header.jpg" alt="Dr. Sam Elguizaoui" /></div>
                <div>
                  <div className="sidebar-doc-name">Dr. Sam Elguizaoui, MD</div>
                  <div className="sidebar-doc-spec">Orthopedic Surgeon</div>
                </div>
              </div>
              <div className="sidebar-doc-rating">
                <span className="score">4.78</span>
                <span className="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
                <Link to="/reviews" className="count">1,470 reviews</Link>
              </div>
              <div className="sidebar-highlight">
                <div className="sidebar-highlight-icon">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
                </div>
                Patients often return
              </div>
              <div className="sidebar-highlight">
                <div className="sidebar-highlight-icon">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                91% wait less than 30 min
              </div>
              <div className="sidebar-highlight">
                <div className="sidebar-highlight-icon">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                </div>
                Accepting new patients
              </div>
              <div className="sidebar-insurance">
                <p>Aetna, BlueCross BlueShield, UnitedHealthcare, Oxford</p>
                <Link to="/#insurance">(200+) more in-network plans</Link>
              </div>
              <div className="sidebar-zocdoc">
                Also on <a href="https://www.zocdoc.com/doctor/sam-elguizaoui-md-236423" target="_blank" rel="noopener">Zocdoc</a>
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div className="book-cal-content">
            {expanded && (
              <button className="cal-back-btn" onClick={handleBack} style={{ display: 'inline-flex' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                Back to overview
              </button>
            )}

            <div className="cal-header">
              <h3>{MONTHS[currentMonth]} {currentYear}</h3>
              <div className="cal-nav">
                <button className="cal-nav-btn" onClick={handlePrev}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
                </button>
                <button className="cal-nav-btn" onClick={handleNext}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
                </button>
              </div>
            </div>

            <div className="cal-grid">
              {DAYS.map(d => <div className="cal-day-header" key={d}>{d}</div>)}
              {Array.from({ length: firstDay }).map((_, i) => <div className="cal-day empty" key={`e${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
                const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === currentMonth && selectedDate?.getFullYear() === currentYear;
                return (
                  <div
                    key={day}
                    className={`cal-day${isToday ? ' today' : ''}${isSelected ? ' selected' : ''}`}
                    onClick={() => handleDayClick(day)}
                  >
                    <div className="cal-date">{day}</div>
                    {avail[day] && <div className="cal-event green">{avail[day]} appts</div>}
                  </div>
                );
              })}
            </div>

            {/* Time slots */}
            {selectedDate && (
              <div className="time-slots">
                <h3>Select a time &mdash; {MONTHS[selectedDate.getMonth()]} {selectedDate.getDate()}</h3>
                {avail[selectedDate.getDate()] ? (
                  <div className="time-slots-grid">
                    {TIMES.map((t, i) => (
                      <button
                        key={t}
                        className={`time-slot${!timeAvail[i] ? ' unavailable' : ''}${selectedSlot === t ? ' selected' : ''}`}
                        onClick={() => timeAvail[i] && setSelectedSlot(t)}
                        disabled={!timeAvail[i]}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No appointments available on this date. Please select another day.</p>
                )}
              </div>
            )}

            {/* Confirm */}
            {selectedSlot && (
              <div className="book-confirm">
                <button className="btn btn-primary btn-lg" onClick={handleConfirm} style={{ width: '100%', padding: '14px', fontSize: '1rem' }}>
                  Confirm Appointment
                </button>
                <p className="book-footer-note">By booking, you agree to our terms and privacy policy.</p>
              </div>
            )}

            {!expanded && (
              <div className="book-zocdoc-alt">
                You can also book through{' '}
                <a href="https://www.zocdoc.com/doctor/sam-elguizaoui-md-236423" target="_blank" rel="noopener">Zocdoc</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
