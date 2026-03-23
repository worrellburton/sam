import { useState, useMemo } from "react";
import { Sidebar, useDzPrefs } from "./doczoc-dashboard";
import { PlatformBg } from "~/components/PlatformBg";
import { locations } from "~/data/locations";

export function meta() {
  return [{ title: "Calendar | DocZoc" }];
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_HEADERS = ['SUN','MON','TUE','WED','THU','FRI','SAT'];

const APPT_TYPES = [
  { label: 'Consultation', color: '#a78bfa' },
  { label: 'Follow-up', color: '#34d399' },
  { label: 'Sports Injury', color: '#fbbf24' },
  { label: 'Joint Assessment', color: '#60a5fa' },
  { label: 'Post-Op', color: '#f472b6' },
];

function getAppts(date: Date, locId?: string) {
  const dow = date.getDay();
  if (dow === 0 || dow === 6) return [];
  const d = date.getDate(), m = date.getMonth(), y = date.getFullYear();
  const locSeed = locId ? locId.charCodeAt(4) : 0;
  const seed = (d * 7 + m * 13 + y + locSeed) % 30;
  if (seed % 2 === 0) return [];
  const count = seed > 20 ? 3 : seed > 12 ? 2 : 1;
  return Array.from({ length: count }, (_, i) => ({
    type: APPT_TYPES[(seed + i * 3) % APPT_TYPES.length],
    time: `${8 + ((seed + i * 2) % 9)}:${i % 2 === 0 ? '00' : '30'} AM`,
    patient: ['Sarah M.', 'James K.', 'Maria L.', 'David R.', 'Emily C.', 'Michael B.'][(seed + i) % 6],
  }));
}

export default function CalendarPage() {
  const [collapsed, setCollapsed] = useState(false);
  const { bgId } = useDzPrefs();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedLoc, setSelectedLoc] = useState<string>("all");

  const weeks = useMemo(() => {
    const first = new Date(year, month, 1);
    const startDay = first.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const rows: (Date | null)[][] = [];
    let row: (Date | null)[] = [];
    for (let i = 0; i < startDay; i++) row.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      row.push(new Date(year, month, d));
      if (row.length === 7) { rows.push(row); row = []; }
    }
    if (row.length > 0) { while (row.length < 7) row.push(null); rows.push(row); }
    return rows;
  }, [year, month]);

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1); };

  const todayStr = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  const selectedAppts = selectedDate ? getAppts(selectedDate, selectedLoc === "all" ? undefined : selectedLoc) : [];

  function handleDateClick(date: Date) {
    setSelectedDate(date);
    setPanelOpen(true);
  }

  return (
    <div className="dz-platform">
      <PlatformBg bgId={bgId} />
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className={`dz-platform-main${collapsed ? " dz-main-expanded" : ""}`}>
        <header className="dz-platform-header">
          <div>
            <h1>Calendar</h1>
            <p>{MONTHS[month]} {year}</p>
          </div>
          <div className="dz-platform-header-right" style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              className="dz-add-btn"
              onClick={() => setPanelOpen(!panelOpen)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09"/>
              </svg>
              Set Up Calendar
            </button>
          </div>
        </header>

        <div style={{ position: "relative" }}>
          {/* Calendar grid */}
          <div className="dz-cal-main" style={{ flex: 1 }}>
            <div className="dz-cal-header">
              <h2>{MONTHS[month]} {year}</h2>
              <div className="dz-cal-nav">
                <button className="dz-cal-btn" onClick={prevMonth}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <button className="dz-cal-btn" onClick={nextMonth}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>
            </div>

            <div className="dz-cal-row dz-cal-day-headers">
              {DAY_HEADERS.map(d => <div className="dz-cal-dh" key={d}>{d}</div>)}
            </div>

            {weeks.map((week, wi) => (
              <div className="dz-cal-row" key={wi}>
                {week.map((date, di) => {
                  if (!date) return <div className="dz-cal-cell empty" key={di} />;
                  const dateStr = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
                  const isToday = dateStr === todayStr;
                  const isSelected = selectedDate && date.getTime() === selectedDate.getTime();
                  const appts = getAppts(date, selectedLoc === "all" ? undefined : selectedLoc);
                  return (
                    <div
                      key={di}
                      className={`dz-cal-cell${appts.length > 0 ? ' has-appts' : ''}${isSelected ? ' selected' : ''}`}
                      onClick={() => handleDateClick(date)}
                    >
                      <span className={`dz-cal-date${isToday ? ' today' : ''}`}>{date.getDate()}</span>
                      <span className={`dz-cal-shift-count${appts.length > 0 ? ' has' : ''}`}>
                        {appts.length > 0 ? `${appts.length} appts` : date.getDay() === 0 || date.getDay() === 6 ? '' : 'No avail.'}
                      </span>
                      {appts.length > 0 && (
                        <div className="dz-cal-dots">
                          {appts.slice(0, 3).map((a, i) => (
                            <span key={i} className="dz-cal-dot" style={{ background: a.type.color }} />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Right slide-out panel */}
          <div className={`dz-cal-slide-panel${panelOpen ? " dz-cal-panel-open" : ""}`}>
            <div className="dz-cal-panel-header">
              <h3>{selectedDate ? `${MONTHS[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}` : 'Select a day'}</h3>
              <button className="dz-cal-panel-close" onClick={() => setPanelOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Location filter inside panel */}
            <div style={{ padding: "0 20px 16px", display: "flex", gap: 6, flexWrap: "wrap" }}>
              <button
                className={`dz-loc-chip${selectedLoc === "all" ? " active" : ""}`}
                onClick={() => setSelectedLoc("all")}
              >All</button>
              {locations.map(loc => (
                <button
                  key={loc.id}
                  className={`dz-loc-chip${selectedLoc === loc.id ? " active" : ""}`}
                  onClick={() => setSelectedLoc(loc.id)}
                >{loc.label}</button>
              ))}
            </div>

            <div style={{ padding: "0 20px 20px" }}>
              {selectedDate ? (
                selectedAppts.length > 0 ? (
                  <div className="dz-cal-appt-list">
                    {selectedAppts.map((a, i) => (
                      <div key={i} className="dz-cal-appt-item">
                        <div className="dz-cal-appt-dot" style={{ background: a.type.color }} />
                        <div className="dz-cal-appt-detail">
                          <div className="dz-cal-appt-patient">{a.patient}</div>
                          <div className="dz-cal-appt-meta">{a.time} &middot; {a.type.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="dz-cal-no-appts">No appointments scheduled</p>
                )
              ) : (
                <p className="dz-cal-no-appts">Click a date on the calendar</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
