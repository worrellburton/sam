import { useState, useMemo } from "react";
import { Sidebar } from "./doczoc-dashboard";
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
  const count = seed > 20 ? 4 : seed > 12 ? 3 : seed > 5 ? 2 : 1;
  return Array.from({ length: count }, (_, i) => ({
    type: APPT_TYPES[(seed + i * 3) % APPT_TYPES.length],
    time: `${8 + ((seed + i * 2) % 9)}:${i % 2 === 0 ? '00' : '30'} AM`,
    patient: ['Sarah M.', 'James K.', 'Maria L.', 'David R.', 'Emily C.', 'Michael B.'][(seed + i) % 6],
  }));
}

export default function CalendarPage() {
  const [collapsed, setCollapsed] = useState(false);
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedLoc, setSelectedLoc] = useState<string>("all");
  const [availMode, setAvailMode] = useState(false);
  const [availSlots, setAvailSlots] = useState<Record<string, string[]>>({});

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

  function toggleAvailSlot(dateKey: string) {
    setAvailSlots(prev => {
      const loc = selectedLoc === "all" ? locations[0].id : selectedLoc;
      const key = `${dateKey}-${loc}`;
      const current = prev[key] || [];
      if (current.length > 0) {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      }
      return { ...prev, [key]: ["9:00 AM - 5:00 PM"] };
    });
  }

  return (
    <div className="dz-platform">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className={`dz-platform-main${collapsed ? " dz-main-expanded" : ""}`}>
        <header className="dz-platform-header">
          <div>
            <h1>Calendar</h1>
            <p>{MONTHS[month]} {year}</p>
          </div>
          <div className="dz-platform-header-right">
            <button
              className={`dz-avail-toggle${availMode ? " active" : ""}`}
              onClick={() => setAvailMode(!availMode)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              {availMode ? "Done Setting" : "Set Availability"}
            </button>
          </div>
        </header>

        {/* Location filter */}
        <div className="dz-loc-filter">
          <button
            className={`dz-loc-btn${selectedLoc === "all" ? " active" : ""}`}
            onClick={() => setSelectedLoc("all")}
          >
            All Locations
          </button>
          {locations.map((loc) => (
            <button
              key={loc.id}
              className={`dz-loc-btn${selectedLoc === loc.id ? " active" : ""}`}
              onClick={() => setSelectedLoc(loc.id)}
            >
              {loc.label}
            </button>
          ))}
        </div>

        <div className="dz-cal-layout">
          <div className="dz-cal-main">
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
                  const loc = selectedLoc === "all" ? locations[0].id : selectedLoc;
                  const hasAvail = availSlots[`${dateStr}-${loc}`];
                  return (
                    <div
                      key={di}
                      className={`dz-cal-cell${appts.length > 0 ? ' has-appts' : ''}${isSelected ? ' selected' : ''}${hasAvail ? ' avail-set' : ''}${availMode ? ' avail-mode' : ''}`}
                      onClick={() => {
                        if (availMode) {
                          toggleAvailSlot(dateStr);
                        } else {
                          setSelectedDate(date);
                        }
                      }}
                    >
                      <span className={`dz-cal-date${isToday ? ' today' : ''}`}>{date.getDate()}</span>
                      <span className={`dz-cal-shift-count${appts.length > 0 ? ' has' : ''}`}>
                        {appts.length > 0 ? `${appts.length} appts` : date.getDay() === 0 || date.getDay() === 6 ? '' : 'No appts'}
                      </span>
                      {appts.length > 0 && (
                        <div className="dz-cal-dots">
                          {appts.slice(0, 3).map((a, i) => (
                            <span key={i} className="dz-cal-dot" style={{ background: a.type.color }} />
                          ))}
                        </div>
                      )}
                      {hasAvail && (
                        <span className="dz-cal-avail-tag">Available</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="dz-cal-sidebar-panel">
            {availMode ? (
              <>
                <h3>Set Availability</h3>
                <p className="dz-cal-no-appts">Click on dates to toggle availability for <strong>{selectedLoc === "all" ? locations[0].label : locations.find(l => l.id === selectedLoc)?.label}</strong></p>
                {Object.keys(availSlots).length > 0 && (
                  <div className="dz-cal-appt-list" style={{ marginTop: 16 }}>
                    <div style={{ fontSize: "0.78rem", color: "#64748b", marginBottom: 8 }}>Available dates:</div>
                    {Object.entries(availSlots).map(([key, slots]) => {
                      const [dateStr, locId] = key.split("-map-");
                      const loc = locations.find(l => l.id === `map-${locId}`);
                      return (
                        <div key={key} className="dz-cal-appt-item">
                          <div className="dz-cal-appt-dot" style={{ background: "#22c55e" }} />
                          <div className="dz-cal-appt-detail">
                            <div className="dz-cal-appt-patient">{dateStr}</div>
                            <div className="dz-cal-appt-meta">{loc?.label} &middot; {slots[0]}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <>
                <h3>{selectedDate ? `${MONTHS[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}` : 'Select a day'}</h3>
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
                  <p className="dz-cal-no-appts">Click a date to see appointments</p>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
