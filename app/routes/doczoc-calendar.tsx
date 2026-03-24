import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Sidebar, useDzPrefs } from "./doczoc-dashboard";
import { PlatformBg } from "~/components/PlatformBg";
import { locations } from "~/data/locations";
import { PATIENTS } from "~/data/patients";

export function meta() {
  return [{ title: "Calendar | DocZoc" }];
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_HEADERS = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
const DAY_HOURS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

const APPT_TYPES = [
  { label: 'Consultation', color: '#a78bfa' },
  { label: 'Follow-up', color: '#34d399' },
  { label: 'Sports Injury', color: '#fbbf24' },
  { label: 'Joint Assessment', color: '#60a5fa' },
  { label: 'Post-Op', color: '#f472b6' },
];

// Build a set of dates that have surgeries from patient data
function getSurgeryDates(): Set<string> {
  const dates = new Set<string>();
  for (const p of PATIENTS) {
    for (const v of p.visits) {
      if (v.type.toLowerCase().includes("surgery") || v.type.toLowerCase().includes("pre-op")) {
        const d = new Date(v.date);
        if (!isNaN(d.getTime())) {
          dates.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
        }
      }
    }
  }
  return dates;
}

const SURGERY_DATES = getSurgeryDates();

function getAppts(date: Date, locId?: string) {
  const dow = date.getDay();
  if (dow === 0 || dow === 6) return [];
  const d = date.getDate(), m = date.getMonth(), y = date.getFullYear();
  const locSeed = locId ? locId.charCodeAt(4) : 0;
  const seed = (d * 7 + m * 13 + y + locSeed) % 30;
  if (seed % 2 === 0) return [];
  const count = seed > 20 ? 3 : seed > 12 ? 2 : 1;
  const LOC_LABELS = ['Upper East Side', 'West Village', 'Brooklyn'];
  return Array.from({ length: count }, (_, i) => ({
    type: APPT_TYPES[(seed + i * 3) % APPT_TYPES.length],
    time: `${8 + ((seed + i * 2) % 9)}:${i % 2 === 0 ? '00' : '30'} AM`,
    patient: ['Sarah M.', 'James K.', 'Maria L.', 'David R.', 'Emily C.', 'Michael B.'][(seed + i) % 6],
    location: LOC_LABELS[(seed + i) % LOC_LABELS.length],
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
  const [locDropOpen, setLocDropOpen] = useState(false);
  const locDropRef = useRef<HTMLDivElement>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [scheduleMode, setScheduleMode] = useState(false);
  const [selectedSchedDates, setSelectedSchedDates] = useState<Set<string>>(new Set());
  // schedule: dateKey -> set of time slots
  const [schedule, setSchedule] = useState<Record<string, Set<string>>>({});
  const TIME_SLOTS = ["Early Morning (7–9 AM)", "Late Morning (9–12 PM)", "Early Afternoon (12–3 PM)"];

  const toggleSchedDate = useCallback((dateKey: string) => {
    setSelectedSchedDates(prev => {
      const next = new Set(prev);
      if (next.has(dateKey)) next.delete(dateKey); else next.add(dateKey);
      return next;
    });
  }, []);

  const toggleScheduleSlot = useCallback((slot: string) => {
    setSchedule(prev => {
      const next = { ...prev };
      // Check if all selected dates have this slot — if so, remove from all; else add to all
      const allHave = [...selectedSchedDates].every(dk => next[dk]?.has(slot));
      for (const dk of selectedSchedDates) {
        const existing = next[dk] ? new Set(next[dk]) : new Set<string>();
        if (allHave) existing.delete(slot); else existing.add(slot);
        if (existing.size === 0) delete next[dk]; else next[dk] = existing;
      }
      return next;
    });
  }, [selectedSchedDates]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (locDropRef.current && !locDropRef.current.contains(e.target as Node)) {
        setLocDropOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
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
    if (scheduleMode) {
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) return;
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      toggleSchedDate(key);
      return;
    }
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
            {/* Location dropdown */}
            <div ref={locDropRef} style={{ position: "relative" }}>
              <button
                onClick={() => setLocDropOpen(!locDropOpen)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "9px 16px", borderRadius: 10,
                  border: "1px solid var(--dz-accent-border, rgba(99,102,241,0.25))",
                  background: locDropOpen ? "var(--dz-accent-bg-active, rgba(99,102,241,0.15))" : "var(--dz-accent-bg, rgba(99,102,241,0.08))",
                  color: "var(--dz-accent, #6366f1)", fontSize: "0.82rem", fontWeight: 600,
                  cursor: "pointer", transition: "all 0.15s",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                {selectedLoc === "all" ? "All Locations" : locations.find(l => l.id === selectedLoc)?.label ?? "All Locations"}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: locDropOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.15s" }}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              {locDropOpen && (
                <div style={{
                  position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 50,
                  background: "var(--dz-card-bg, rgba(15,15,35,0.95))", backdropFilter: "blur(16px)",
                  border: "1px solid rgba(99,102,241,0.15)", borderRadius: 14,
                  padding: 8, minWidth: 340, boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
                }}>
                  {/* Dropdown options */}
                  <button
                    onClick={() => { setSelectedLoc("all"); setLocDropOpen(false); }}
                    style={{
                      display: "flex", alignItems: "center", gap: 8, width: "100%",
                      padding: "8px 10px", borderRadius: 8, border: "none", cursor: "pointer",
                      background: selectedLoc === "all" ? "rgba(99,102,241,0.12)" : "transparent",
                      color: selectedLoc === "all" ? "#818cf8" : "var(--dz-text-secondary, #94a3b8)",
                      fontSize: "0.8rem", fontWeight: 600, transition: "background 0.1s",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                    </svg>
                    All Locations
                    {selectedLoc === "all" && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: "auto" }}><polyline points="20 6 9 17 4 12"/></svg>}
                  </button>
                  {locations.map(loc => (
                    <button
                      key={loc.id}
                      onClick={() => { setSelectedLoc(loc.id); setLocDropOpen(false); }}
                      style={{
                        display: "flex", alignItems: "center", gap: 8, width: "100%",
                        padding: "8px 10px", borderRadius: 8, border: "none", cursor: "pointer",
                        background: selectedLoc === loc.id ? "rgba(99,102,241,0.12)" : "transparent",
                        color: selectedLoc === loc.id ? "#818cf8" : "var(--dz-text-secondary, #94a3b8)",
                        fontSize: "0.8rem", fontWeight: 500, transition: "background 0.1s",
                      }}
                    >
                      <div style={{
                        width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                        background: selectedLoc === loc.id ? "rgba(99,102,241,0.25)" : "rgba(99,102,241,0.08)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                        </svg>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 0, textAlign: "left" }}>
                        <span style={{ fontWeight: 600, color: selectedLoc === loc.id ? "#818cf8" : "var(--dz-text-primary, #f1f5f9)" }}>{loc.label}</span>
                        <span style={{ fontSize: "0.68rem", color: "var(--dz-text-muted, #64748b)" }}>{loc.address}</span>
                      </div>
                      {selectedLoc === loc.id && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: "auto" }}><polyline points="20 6 9 17 4 12"/></svg>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => { setScheduleMode(!scheduleMode); if (scheduleMode) setSelectedSchedDates(new Set()); }}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "9px 18px", borderRadius: 10,
                border: scheduleMode ? "1px solid var(--dz-green-border, #059669)" : "1px solid var(--dz-accent-border, rgba(99,102,241,0.25))",
                background: scheduleMode ? "var(--dz-green-bg, rgba(5,150,105,0.12))" : "var(--dz-accent-bg, rgba(99,102,241,0.08))",
                color: scheduleMode ? "var(--dz-green, #059669)" : "var(--dz-accent, #6366f1)", fontSize: "0.82rem", fontWeight: 600,
                cursor: "pointer", transition: "all 0.15s",
              }}
            >
              {scheduleMode ? (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Done
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  Set Schedule
                </>
              )}
            </button>
          </div>
        </header>

        {/* Day view — when a day is selected */}
        {panelOpen && selectedDate && !scheduleMode ? (
          <div style={{ display: "flex", gap: 16 }}>
            {/* Left: Day schedule timeline */}
            <div style={{ flex: "1 1 60%", minWidth: 0 }}>
              <div className="dz-cal-main">
                <div className="dz-cal-header" style={{ justifyContent: "flex-start", gap: 12 }}>
                  <button className="dz-cal-btn" onClick={() => { setPanelOpen(false); setSelectedDate(null); }} title="Back to month">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                  </button>
                  <h2 style={{ margin: 0 }}>
                    {DAY_HEADERS[selectedDate.getDay()]}, {MONTHS[selectedDate.getMonth()]} {selectedDate.getDate()}, {selectedDate.getFullYear()}
                  </h2>
                  <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
                    <button className="dz-cal-btn" onClick={() => {
                      const prev = new Date(selectedDate);
                      prev.setDate(prev.getDate() - 1);
                      setSelectedDate(prev);
                      setMonth(prev.getMonth());
                      setYear(prev.getFullYear());
                    }} title="Previous day">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                    </button>
                    <button className="dz-cal-btn" onClick={() => {
                      const next = new Date(selectedDate);
                      next.setDate(next.getDate() + 1);
                      setSelectedDate(next);
                      setMonth(next.getMonth());
                      setYear(next.getFullYear());
                    }} title="Next day">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                  </div>
                </div>

                {/* Day timeline — fills available viewport height */}
                <div style={{ display: "flex", flexDirection: "column", marginTop: 8, height: "calc(100vh - 220px)" }}>
                  {DAY_HOURS.map(hour => {
                    const hourAppts = [...selectedAppts, ...userAppts.map(a => {
                      const typeObj = APPT_TYPES.find(t => t.label === a.type) || APPT_TYPES[0];
                      const locLabel = locations.find(l => l.id === a.location)?.label;
                      return { patient: a.patient, time: a.time, type: typeObj, location: locLabel };
                    })].filter(a => {
                      const h = parseInt(a.time);
                      const isPM = a.time.includes("PM");
                      const hour24 = isPM && h !== 12 ? h + 12 : (!isPM && h === 12 ? 0 : h);
                      return hour24 === hour;
                    });

                    return (
                      <div key={hour} style={{
                        display: "flex", alignItems: "stretch", flex: 1,
                        borderBottom: "1px solid rgba(148,163,184,0.06)",
                      }}>
                        <div style={{
                          width: 60, flexShrink: 0, fontSize: "0.7rem", fontWeight: 600,
                          color: "var(--dz-text-muted, #64748b)", paddingTop: 6, textAlign: "right", paddingRight: 12,
                        }}>
                          {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
                        </div>
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, padding: "4px 0" }}>
                          {hourAppts.map((a, i) => (
                            <div key={i} style={{
                              display: "flex", alignItems: "center", gap: 8,
                              padding: "6px 10px", borderRadius: 8, borderLeft: `3px solid ${a.type.color}`,
                              background: `${a.type.color}10`,
                            }}>
                              <div style={{
                                width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                                background: `${a.type.color}20`, color: a.type.color,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "0.55rem", fontWeight: 700,
                              }}>
                                {a.patient.split(" ").map(n => n[0]).join("")}
                              </div>
                              <div>
                                <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--dz-text-primary, #f1f5f9)" }}>{a.patient}</div>
                                <div style={{ fontSize: "0.68rem", color: "var(--dz-text-muted, #64748b)" }}>
                                  {a.time} &middot; {a.type.label}
                                  {"location" in a && a.location && <> &middot; <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: "inline", verticalAlign: "middle", marginRight: 2 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>{a.location}</>}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Options panel */}
            <div style={{ flex: "0 0 300px", minWidth: 260 }}>
              <div className="dz-cal-main" style={{ padding: 16 }}>
                <h3 style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--dz-text-primary, #f1f5f9)", margin: "0 0 6px" }}>
                  {MONTHS[selectedDate.getMonth()]} {selectedDate.getDate()}
                </h3>
                <p style={{ fontSize: "0.72rem", color: "var(--dz-text-muted, #64748b)", margin: "0 0 14px" }}>
                  {selectedAppts.length + userAppts.length} appointment{selectedAppts.length + userAppts.length !== 1 ? "s" : ""}
                </p>

                {/* Location filter */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 16 }}>
                  <button className={`dz-loc-chip${selectedLoc === "all" ? " active" : ""}`} onClick={() => setSelectedLoc("all")}>All</button>
                  {locations.map(loc => (
                    <button key={loc.id} className={`dz-loc-chip${selectedLoc === loc.id ? " active" : ""}`} onClick={() => setSelectedLoc(loc.id)}>{loc.label}</button>
                  ))}
                </div>

                {/* Appointment list */}
                {(selectedAppts.length > 0 || userAppts.length > 0) ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
                    {selectedAppts.map((a, i) => (
                      <div key={`gen-${i}`} style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "8px 10px", borderRadius: 8,
                        background: "var(--dz-input-bg, rgba(148,163,184,0.06))",
                        border: "1px solid rgba(148,163,184,0.06)",
                      }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: a.type.color, flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--dz-text-primary, #f1f5f9)" }}>{a.patient}</div>
                          <div style={{ fontSize: "0.68rem", color: "var(--dz-text-muted, #64748b)" }}>{a.time} &middot; {a.type.label}</div>
                          {a.location && <div style={{ fontSize: "0.62rem", color: "var(--dz-text-dim, #475569)", display: "flex", alignItems: "center", gap: 3, marginTop: 1 }}>
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            {a.location}
                          </div>}
                        </div>
                      </div>
                    ))}
                    {userAppts.map((a, i) => {
                      const typeObj = APPT_TYPES.find(t => t.label === a.type) || APPT_TYPES[0];
                      return (
                        <div key={`user-${i}`} style={{
                          display: "flex", alignItems: "center", gap: 8,
                          padding: "8px 10px", borderRadius: 8,
                          background: "var(--dz-input-bg, rgba(148,163,184,0.06))",
                          border: "1px solid rgba(99,102,241,0.15)",
                        }}>
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: typeObj.color, flexShrink: 0 }} />
                          <div>
                            <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--dz-text-primary, #f1f5f9)" }}>{a.patient}</div>
                            <div style={{ fontSize: "0.68rem", color: "var(--dz-text-muted, #64748b)" }}>{a.time} &middot; {a.type}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p style={{ fontSize: "0.78rem", color: "var(--dz-text-muted, #64748b)", textAlign: "center", padding: "16px 0" }}>
                    No appointments
                  </p>
                )}

                {/* Add appointment */}
                {showAddForm ? (
                  <div style={{ borderTop: "1px solid rgba(148,163,184,0.08)", paddingTop: 12 }}>
                    <h4 style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--dz-text-primary, #f1f5f9)", margin: "0 0 10px" }}>New Appointment</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <div>
                        <label style={{ fontSize: "0.68rem", color: "var(--dz-text-muted)", fontWeight: 600, display: "block", marginBottom: 3 }}>Patient</label>
                        <select className="dz-cal-add-input" value={newAppt.patient} onChange={e => setNewAppt(prev => ({ ...prev, patient: e.target.value }))}>
                          <option value="">Select patient...</option>
                          {PATIENTS.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                        </select>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: "0.68rem", color: "var(--dz-text-muted)", fontWeight: 600, display: "block", marginBottom: 3 }}>Time</label>
                          <select className="dz-cal-add-input" value={newAppt.time} onChange={e => setNewAppt(prev => ({ ...prev, time: e.target.value }))}>
                            {["8:00 AM","8:30 AM","9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","12:00 PM","12:30 PM","1:00 PM","1:30 PM","2:00 PM","2:30 PM","3:00 PM","3:30 PM","4:00 PM","4:30 PM","5:00 PM"].map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: "0.68rem", color: "var(--dz-text-muted)", fontWeight: 600, display: "block", marginBottom: 3 }}>Type</label>
                          <select className="dz-cal-add-input" value={newAppt.type} onChange={e => setNewAppt(prev => ({ ...prev, type: e.target.value }))}>
                            {APPT_TYPES.map(t => <option key={t.label} value={t.label}>{t.label}</option>)}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: "0.68rem", color: "var(--dz-text-muted)", fontWeight: 600, display: "block", marginBottom: 3 }}>Location</label>
                        <select className="dz-cal-add-input" value={newAppt.location} onChange={e => setNewAppt(prev => ({ ...prev, location: e.target.value }))}>
                          {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.label}</option>)}
                        </select>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 10, justifyContent: "flex-end" }}>
                      <button className="dz-cal-add-cancel" onClick={() => setShowAddForm(false)}>Cancel</button>
                      <button className="dz-cal-add-save" onClick={handleAddAppt} disabled={!newAppt.patient}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        Add
                      </button>
                    </div>
                  </div>
                ) : (
                  <button className="dz-cal-add-trigger" onClick={() => setShowAddForm(true)} style={{ width: "100%" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Add Appointment
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 16 }}>
            {/* Calendar grid — squeeze when schedule mode has selections */}
            <div style={{ flex: scheduleMode && selectedSchedDates.size > 0 ? "1 1 55%" : "1 1 100%", minWidth: 0, transition: "flex 0.3s ease" }}>
              <div className="dz-cal-main">
                <div className="dz-cal-header" style={{ justifyContent: "center", gap: 16 }}>
                  <button className="dz-cal-btn" onClick={prevMonth} style={{ position: "absolute", left: 16 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                  </button>
                  <h2 style={{ margin: 0 }}>{MONTHS[month]} {year}</h2>
                  <button className="dz-cal-btn" onClick={nextMonth} style={{ position: "absolute", right: 16 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
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
                      const isSelected = scheduleMode
                        ? selectedSchedDates.has(dateStr)
                        : (selectedDate && date.getTime() === selectedDate.getTime());
                      const appts = getAppts(date, selectedLoc === "all" ? undefined : selectedLoc);
                      const hasSurgery = SURGERY_DATES.has(dateStr);
                      const schedSlots = schedule[dateStr];
                      const hasSchedule = schedSlots && schedSlots.size > 0;
                      return (
                        <div
                          key={di}
                          className={`dz-cal-cell${appts.length > 0 ? ' has-appts' : ''}${isSelected ? ' selected' : ''}${scheduleMode ? ' schedule-mode' : ''}`}
                          onClick={() => handleDateClick(date)}
                          style={scheduleMode && hasSchedule ? { borderColor: "rgba(52,211,153,0.3)" } : undefined}
                        >
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                            <span className={`dz-cal-date${isToday ? ' today' : ''}`}>{date.getDate()}</span>
                            {hasSurgery && (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f472b6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" title="Surgery scheduled" style={{ flexShrink: 0, opacity: 0.85 }}>
                                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                              </svg>
                            )}
                          </div>
                          {scheduleMode ? (
                            hasSchedule ? (
                              <div style={{ display: "flex", gap: 3, marginTop: 2 }}>
                                {TIME_SLOTS.map((slot, si) => (
                                  <div key={si} style={{
                                    width: 6, height: 6, borderRadius: "50%",
                                    background: schedSlots.has(slot) ? "#34d399" : "rgba(148,163,184,0.15)",
                                  }} title={slot} />
                                ))}
                              </div>
                            ) : (
                              <span style={{ fontSize: "0.6rem", color: "var(--dz-text-muted, #64748b)", marginTop: 2 }}>
                                {date.getDay() === 0 || date.getDay() === 6 ? "" : "Click to set"}
                              </span>
                            )
                          ) : (
                            <>
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
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Right panel — schedule mode options */}
            {scheduleMode && selectedSchedDates.size > 0 && (
              <div style={{ flex: "0 0 320px", minWidth: 280, transition: "all 0.3s ease" }}>
                <div className="dz-cal-main" style={{ padding: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <h3 style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--dz-text-primary, #f1f5f9)", margin: 0 }}>
                      Set Availability
                    </h3>
                    <span style={{ fontSize: "0.65rem", fontWeight: 600, padding: "2px 8px", borderRadius: 10, background: "rgba(52,211,153,0.12)", color: "#34d399" }}>
                      {selectedSchedDates.size} day{selectedSchedDates.size !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Selected dates chips */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 16 }}>
                    {[...selectedSchedDates].sort().map(dk => {
                      const [, m, d] = dk.split("-").map(Number);
                      return (
                        <span key={dk} style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          padding: "3px 8px", borderRadius: 6, fontSize: "0.68rem", fontWeight: 600,
                          background: "rgba(99,102,241,0.1)", color: "var(--dz-accent-text, #a5b4fc)",
                        }}>
                          {MONTHS[m].slice(0, 3)} {d}
                          <button onClick={() => toggleSchedDate(dk)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: 0, lineHeight: 1 }}>&times;</button>
                        </span>
                      );
                    })}
                  </div>

                  {/* Time slots — vertical */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                    {TIME_SLOTS.map(slot => {
                      const allHave = [...selectedSchedDates].every(dk => schedule[dk]?.has(slot));
                      const someHave = [...selectedSchedDates].some(dk => schedule[dk]?.has(slot));
                      return (
                        <button
                          key={slot}
                          onClick={() => toggleScheduleSlot(slot)}
                          style={{
                            display: "flex", alignItems: "center", gap: 10, width: "100%",
                            padding: "10px 12px", borderRadius: 8, cursor: "pointer",
                            border: allHave ? "1px solid rgba(52,211,153,0.4)" : "1px solid var(--dz-input-border, rgba(148,163,184,0.1))",
                            background: allHave ? "rgba(52,211,153,0.1)" : "transparent",
                            color: allHave ? "#34d399" : "var(--dz-text-secondary, #94a3b8)",
                            fontSize: "0.76rem", fontWeight: 500, transition: "all 0.15s",
                          }}
                        >
                          <div style={{
                            width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                            border: allHave ? "2px solid #34d399" : someHave ? "2px solid rgba(52,211,153,0.4)" : "2px solid rgba(148,163,184,0.2)",
                            background: allHave ? "rgba(52,211,153,0.2)" : someHave ? "rgba(52,211,153,0.08)" : "transparent",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            {allHave && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                            {someHave && !allHave && <div style={{ width: 8, height: 2, background: "#34d399", borderRadius: 1 }} />}
                          </div>
                          {slot}
                        </button>
                      );
                    })}
                  </div>

                  {/* Clear + Save buttons */}
                  <div style={{ display: "flex", gap: 8, borderTop: "1px solid rgba(148,163,184,0.08)", paddingTop: 14 }}>
                    <button onClick={() => setSelectedSchedDates(new Set())} style={{
                      flex: 1, padding: "10px 14px", borderRadius: 8, cursor: "pointer",
                      border: "1px solid rgba(148,163,184,0.1)", background: "transparent",
                      color: "var(--dz-text-muted, #64748b)", fontSize: "0.76rem", fontWeight: 600,
                    }}>Clear</button>
                    <button onClick={() => { setScheduleMode(false); setSelectedSchedDates(new Set()); }} style={{
                      flex: 2, padding: "10px 14px", borderRadius: 8, cursor: "pointer",
                      border: "none", background: "linear-gradient(135deg, #059669, #34d399)",
                      color: "#fff", fontSize: "0.78rem", fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
