import { useState, useMemo, useCallback } from "react";
import { Sidebar, useDzPrefs } from "./doczoc-dashboard";
import { PlatformBg } from "~/components/PlatformBg";
import { locations } from "~/data/locations";
import { PATIENTS } from "~/data/patients";

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
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAppt, setNewAppt] = useState({ patient: "", time: "9:00 AM", type: "Consultation", location: "manhattan" });
  const [savedAppts, setSavedAppts] = useState<{ date: string; patient: string; time: string; type: string; location: string }[]>([]);

  const handleAddAppt = useCallback(() => {
    if (!selectedDate || !newAppt.patient) return;
    const dateKey = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`;
    setSavedAppts(prev => [...prev, { date: dateKey, ...newAppt }]);
    setNewAppt({ patient: "", time: "9:00 AM", type: "Consultation", location: "manhattan" });
    setShowAddForm(false);
  }, [selectedDate, newAppt]);

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
  const selectedDateKey = selectedDate ? `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}` : "";
  const userAppts = savedAppts.filter(a => a.date === selectedDateKey);
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
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "9px 18px", borderRadius: 10,
                border: "1px solid rgba(99,102,241,0.2)",
                background: "rgba(99,102,241,0.08)",
                color: "#818cf8", fontSize: "0.82rem", fontWeight: 600,
                cursor: "pointer", transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(99,102,241,0.15)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(99,102,241,0.08)"; }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Set Schedule
            </button>
            <button
              className="dz-add-btn"
              onClick={() => {
                if (!selectedDate) {
                  setSelectedDate(now);
                }
                setPanelOpen(true);
                setShowAddForm(true);
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New Appointment
            </button>
          </div>
        </header>

        {/* Location selector */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
          <button
            onClick={() => setSelectedLoc("all")}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 18px", borderRadius: 12, cursor: "pointer",
              border: selectedLoc === "all" ? "2px solid #818cf8" : "1px solid var(--dz-input-border, rgba(148,163,184,0.12))",
              background: selectedLoc === "all" ? "rgba(99,102,241,0.1)" : "var(--dz-card-bg, rgba(15,15,35,0.6))",
              color: selectedLoc === "all" ? "#818cf8" : "var(--dz-text-secondary, #94a3b8)",
              fontSize: "0.82rem", fontWeight: 600, whiteSpace: "nowrap",
              transition: "all 0.15s", flexShrink: 0,
              backdropFilter: "blur(12px)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            All Locations
          </button>
          {locations.map(loc => (
            <button
              key={loc.id}
              onClick={() => setSelectedLoc(loc.id)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 14px", borderRadius: 12, cursor: "pointer",
                border: selectedLoc === loc.id ? "2px solid #818cf8" : "1px solid var(--dz-input-border, rgba(148,163,184,0.12))",
                background: selectedLoc === loc.id ? "rgba(99,102,241,0.1)" : "var(--dz-card-bg, rgba(15,15,35,0.6))",
                color: "var(--dz-text-secondary, #94a3b8)",
                fontSize: "0.78rem", fontWeight: 500, whiteSpace: "nowrap",
                transition: "all 0.15s", flexShrink: 0,
                backdropFilter: "blur(12px)",
              }}
            >
              <div style={{
                width: 56, height: 40, borderRadius: 6, overflow: "hidden", flexShrink: 0,
                background: "rgba(99,102,241,0.06)", position: "relative",
              }}>
                <img
                  src={`https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/${loc.lng},${loc.lat},13,0/112x80@2x?access_token=pk.placeholder&attribution=false`}
                  alt={loc.label}
                  style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.6 }}
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.style.display = "none";
                    if (img.parentElement) {
                      img.parentElement.style.display = "flex";
                      img.parentElement.style.alignItems = "center";
                      img.parentElement.style.justifyContent = "center";
                    }
                  }}
                />
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", opacity: 0.6 }}>
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 1, textAlign: "left" }}>
                <span style={{
                  fontSize: "0.8rem", fontWeight: 700,
                  color: selectedLoc === loc.id ? "#818cf8" : "var(--dz-text-primary, #f1f5f9)",
                }}>{loc.label}</span>
                <span style={{ fontSize: "0.65rem", color: "var(--dz-text-muted, #64748b)" }}>{loc.address}</span>
              </div>
            </button>
          ))}
        </div>

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
                <>
                  {(selectedAppts.length > 0 || userAppts.length > 0) ? (
                    <div className="dz-cal-appt-list">
                      {selectedAppts.map((a, i) => (
                        <div key={`gen-${i}`} className="dz-cal-appt-item">
                          <div className="dz-cal-appt-dot" style={{ background: a.type.color }} />
                          <div className="dz-cal-appt-detail">
                            <div className="dz-cal-appt-patient">{a.patient}</div>
                            <div className="dz-cal-appt-meta">{a.time} &middot; {a.type.label}</div>
                          </div>
                        </div>
                      ))}
                      {userAppts.map((a, i) => {
                        const typeObj = APPT_TYPES.find(t => t.label === a.type) || APPT_TYPES[0];
                        return (
                          <div key={`user-${i}`} className="dz-cal-appt-item">
                            <div className="dz-cal-appt-dot" style={{ background: typeObj.color }} />
                            <div className="dz-cal-appt-detail">
                              <div className="dz-cal-appt-patient">{a.patient}</div>
                              <div className="dz-cal-appt-meta">{a.time} &middot; {a.type}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="dz-cal-no-appts">No appointments scheduled</p>
                  )}

                  {/* Add appointment form */}
                  {showAddForm ? (
                    <div className="dz-cal-add-form">
                      <h4 className="dz-cal-add-title">New Appointment</h4>
                      <div className="dz-cal-add-fields">
                        <div>
                          <label className="dz-cal-add-label">Patient</label>
                          <select
                            className="dz-cal-add-input"
                            value={newAppt.patient}
                            onChange={e => setNewAppt(prev => ({ ...prev, patient: e.target.value }))}
                          >
                            <option value="">Select patient...</option>
                            {PATIENTS.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                          </select>
                        </div>
                        <div className="dz-cal-add-row">
                          <div style={{ flex: 1 }}>
                            <label className="dz-cal-add-label">Time</label>
                            <select
                              className="dz-cal-add-input"
                              value={newAppt.time}
                              onChange={e => setNewAppt(prev => ({ ...prev, time: e.target.value }))}
                            >
                              {["8:00 AM","8:30 AM","9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","12:00 PM","12:30 PM","1:00 PM","1:30 PM","2:00 PM","2:30 PM","3:00 PM","3:30 PM","4:00 PM","4:30 PM","5:00 PM"].map(t => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                          </div>
                          <div style={{ flex: 1 }}>
                            <label className="dz-cal-add-label">Type</label>
                            <select
                              className="dz-cal-add-input"
                              value={newAppt.type}
                              onChange={e => setNewAppt(prev => ({ ...prev, type: e.target.value }))}
                            >
                              {APPT_TYPES.map(t => <option key={t.label} value={t.label}>{t.label}</option>)}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="dz-cal-add-label">Location</label>
                          <select
                            className="dz-cal-add-input"
                            value={newAppt.location}
                            onChange={e => setNewAppt(prev => ({ ...prev, location: e.target.value }))}
                          >
                            {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.label}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="dz-cal-add-actions">
                        <button className="dz-cal-add-cancel" onClick={() => setShowAddForm(false)}>Cancel</button>
                        <button className="dz-cal-add-save" onClick={handleAddAppt} disabled={!newAppt.patient}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          Add
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="dz-cal-add-trigger"
                      onClick={() => setShowAddForm(true)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                      Add Appointment
                    </button>
                  )}
                </>
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
