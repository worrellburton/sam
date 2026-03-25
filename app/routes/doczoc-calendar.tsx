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
const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
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
  return Array.from({ length: count }, (_, i) => {
    const rawHour = 8 + ((seed + i * 2) % 9); // 8-16
    const mins = i % 2 === 0 ? 0 : 30;
    const h12 = rawHour > 12 ? rawHour - 12 : rawHour;
    const ampm = rawHour >= 12 ? "PM" : "AM";
    return {
      type: APPT_TYPES[(seed + i * 3) % APPT_TYPES.length],
      time: `${h12}:${mins === 0 ? "00" : "30"} ${ampm}`,
      startMin: rawHour * 60 + mins,
      duration: 30 + ((seed + i) % 3) * 15, // 30, 45, or 60 min
      patient: ['Sarah M.', 'James K.', 'Maria L.', 'David R.', 'Emily C.', 'Michael B.'][(seed + i) % 6],
      location: LOC_LABELS[(seed + i) % LOC_LABELS.length],
    };
  });
}

// Timeline constants
const TIMELINE_START = 7; // 7 AM
const TIMELINE_END = 18; // 6 PM
const TIMELINE_HOURS = TIMELINE_END - TIMELINE_START; // 11 hours
const SNAP_MINUTES = 15;

function minToTime(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function snapTo(min: number, snap: number) {
  return Math.round(min / snap) * snap;
}

// ── Draggable Day View ──────────────────────────────────────────────
interface DayAppt {
  id: string;
  patient: string;
  type: { label: string; color: string };
  location?: string;
  startMin: number;
  duration: number;
}

function DayView({
  selectedDate, selectedAppts, userAppts, apptOverrides, setApptOverrides,
  timelineRef, onBack, onPrev, onNext, selectedLoc, setSelectedLoc,
  showAddForm, setShowAddForm, newAppt, setNewAppt, handleAddAppt,
}: {
  selectedDate: Date;
  selectedAppts: ReturnType<typeof getAppts>;
  userAppts: { patient: string; time: string; type: string; location: string }[];
  apptOverrides: Record<string, { startMin: number; duration: number }>;
  setApptOverrides: React.Dispatch<React.SetStateAction<Record<string, { startMin: number; duration: number }>>>;
  timelineRef: React.RefObject<HTMLDivElement | null>;
  onBack: () => void;
  onPrev: () => void;
  onNext: () => void;
  selectedLoc: string;
  setSelectedLoc: (v: string) => void;
  showAddForm: boolean;
  setShowAddForm: (v: boolean) => void;
  newAppt: { patient: string; time: string; type: string; location: string };
  setNewAppt: React.Dispatch<React.SetStateAction<{ patient: string; time: string; type: string; location: string }>>;
  handleAddAppt: () => void;
}) {
  const [dragState, setDragState] = useState<{ id: string; offsetMin: number; startY: number; origMin: number } | null>(null);
  const [resizeState, setResizeState] = useState<{ id: string; startY: number; origDur: number } | null>(null);
  const [resizeTopState, setResizeTopState] = useState<{ id: string; startY: number; origStartMin: number; origDur: number } | null>(null);
  const [notifyPrompt, setNotifyPrompt] = useState<{ appt: DayAppt; oldStart: number; oldEnd: number; newStart: number; newEnd: number } | null>(null);
  const [emailPreview, setEmailPreview] = useState<{ appt: DayAppt; newStart: number; newEnd: number } | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  // Track pre-drag values for notification prompt
  const preDragRef = useRef<Record<string, { startMin: number; duration: number }>>({});

  // Build unified appointment list with overrides applied
  const allAppts: DayAppt[] = useMemo(() => {
    const result: DayAppt[] = [];
    for (let i = 0; i < selectedAppts.length; i++) {
      const a = selectedAppts[i];
      const id = `gen-${i}`;
      const ov = apptOverrides[id];
      result.push({
        id,
        patient: a.patient,
        type: a.type,
        location: a.location,
        startMin: ov ? ov.startMin : a.startMin,
        duration: ov ? ov.duration : a.duration,
      });
    }
    for (let i = 0; i < userAppts.length; i++) {
      const a = userAppts[i];
      const id = `user-${i}`;
      const typeObj = APPT_TYPES.find(t => t.label === a.type) || APPT_TYPES[0];
      const locLabel = locations.find(l => l.id === a.location)?.label;
      // Parse time string to minutes
      const parts = a.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
      let sm = 9 * 60;
      if (parts) {
        let h = parseInt(parts[1]);
        const m = parseInt(parts[2]);
        const pm = parts[3].toUpperCase() === "PM";
        if (pm && h !== 12) h += 12;
        if (!pm && h === 12) h = 0;
        sm = h * 60 + m;
      }
      const ov = apptOverrides[id];
      result.push({
        id,
        patient: a.patient,
        type: typeObj,
        location: locLabel,
        startMin: ov ? ov.startMin : sm,
        duration: ov ? ov.duration : 30,
      });
    }
    return result.sort((a, b) => a.startMin - b.startMin);
  }, [selectedAppts, userAppts, apptOverrides]);

  // Convert minutes to % position in timeline
  const totalMin = TIMELINE_HOURS * 60;
  const minToPct = (min: number) => ((min - TIMELINE_START * 60) / totalMin) * 100;
  const durToPct = (dur: number) => (dur / totalMin) * 100;

  // Detect overlapping appointments
  const overlaps = useMemo(() => {
    const result: Set<string> = new Set();
    for (let i = 0; i < allAppts.length; i++) {
      for (let j = i + 1; j < allAppts.length; j++) {
        const a = allAppts[i], b = allAppts[j];
        const aEnd = a.startMin + a.duration;
        const bEnd = b.startMin + b.duration;
        if (a.startMin < bEnd && b.startMin < aEnd) {
          result.add(a.id);
          result.add(b.id);
        }
      }
    }
    return result;
  }, [allAppts]);

  // Mouse handlers for drag
  const handleDragStart = useCallback((e: React.MouseEvent, appt: DayAppt) => {
    e.preventDefault();
    e.stopPropagation();
    preDragRef.current[appt.id] = { startMin: appt.startMin, duration: appt.duration };
    setDragState({ id: appt.id, offsetMin: 0, startY: e.clientY, origMin: appt.startMin });
  }, []);

  const handleResizeStart = useCallback((e: React.MouseEvent, appt: DayAppt) => {
    e.preventDefault();
    e.stopPropagation();
    preDragRef.current[appt.id] = { startMin: appt.startMin, duration: appt.duration };
    setResizeState({ id: appt.id, startY: e.clientY, origDur: appt.duration });
  }, []);

  const handleResizeTopStart = useCallback((e: React.MouseEvent, appt: DayAppt) => {
    e.preventDefault();
    e.stopPropagation();
    preDragRef.current[appt.id] = { startMin: appt.startMin, duration: appt.duration };
    setResizeTopState({ id: appt.id, startY: e.clientY, origStartMin: appt.startMin, origDur: appt.duration });
  }, []);

  useEffect(() => {
    if (!dragState && !resizeState && !resizeTopState) return;

    const handleMouseMove = (e: MouseEvent) => {
      const tl = timelineRef.current;
      if (!tl) return;
      const tlHeight = tl.clientHeight;
      const pxPerMin = tlHeight / totalMin;

      if (dragState) {
        const dy = e.clientY - dragState.startY;
        const dMin = dy / pxPerMin;
        const newStart = snapTo(dragState.origMin + dMin, SNAP_MINUTES);
        const clamped = Math.max(TIMELINE_START * 60, Math.min(TIMELINE_END * 60 - 15, newStart));
        setApptOverrides(prev => {
          const existing = prev[dragState.id];
          return { ...prev, [dragState.id]: { startMin: clamped, duration: existing?.duration ?? allAppts.find(a => a.id === dragState.id)!.duration } };
        });
      }

      if (resizeState) {
        const dy = e.clientY - resizeState.startY;
        const dMin = dy / pxPerMin;
        const newDur = snapTo(resizeState.origDur + dMin, SNAP_MINUTES);
        const clamped = Math.max(15, Math.min(180, newDur));
        setApptOverrides(prev => {
          const existing = prev[resizeState.id];
          return { ...prev, [resizeState.id]: { startMin: existing?.startMin ?? allAppts.find(a => a.id === resizeState.id)!.startMin, duration: clamped } };
        });
      }

      if (resizeTopState) {
        const dy = e.clientY - resizeTopState.startY;
        const dMin = dy / pxPerMin;
        const endMin = resizeTopState.origStartMin + resizeTopState.origDur;
        const newStart = snapTo(resizeTopState.origStartMin + dMin, SNAP_MINUTES);
        const clampedStart = Math.max(TIMELINE_START * 60, Math.min(endMin - 15, newStart));
        const newDur = endMin - clampedStart;
        setApptOverrides(prev => ({
          ...prev,
          [resizeTopState.id]: { startMin: clampedStart, duration: newDur },
        }));
      }
    };

    const handleMouseUp = () => {
      // Check if appointment was actually moved/resized and show notification prompt
      const activeId = dragState?.id || resizeState?.id || resizeTopState?.id;
      if (activeId) {
        const pre = preDragRef.current[activeId];
        const appt = allAppts.find(a => a.id === activeId);
        if (pre && appt && (pre.startMin !== appt.startMin || pre.duration !== appt.duration)) {
          setNotifyPrompt({
            appt,
            oldStart: pre.startMin,
            oldEnd: pre.startMin + pre.duration,
            newStart: appt.startMin,
            newEnd: appt.startMin + appt.duration,
          });
        }
      }
      setDragState(null);
      setResizeState(null);
      setResizeTopState(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragState, resizeState, resizeTopState, totalMin, timelineRef, setApptOverrides, allAppts]);

  const isDragging = dragState !== null || resizeState !== null || resizeTopState !== null;

  // Hour labels for the timeline
  const hourLabels = [];
  for (let h = TIMELINE_START; h <= TIMELINE_END; h++) {
    hourLabels.push(h);
  }

  return (
    <div style={{ display: "flex", gap: 16, height: "calc(100vh - 160px)" }}>
      {/* Left: Day schedule timeline */}
      <div style={{ flex: "1 1 65%", minWidth: 0, display: "flex", flexDirection: "column" }}>
        <div className="dz-cal-main" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div className="dz-cal-header" style={{ justifyContent: "flex-start", gap: 12, flexShrink: 0 }}>
            <button className="dz-cal-btn" onClick={onBack} title="Back to month">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <h2 style={{ margin: 0 }}>
              {DAY_NAMES[selectedDate.getDay()]}, {MONTHS[selectedDate.getMonth()]} {selectedDate.getDate()}, {selectedDate.getFullYear()}
            </h2>
            <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
              <button className="dz-cal-btn" onClick={onPrev} title="Previous day">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <button className="dz-cal-btn" onClick={onNext} title="Next day">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
          </div>

          {/* Pixel-based timeline */}
          <div style={{ flex: 1, display: "flex", marginTop: 4, overflow: "hidden", userSelect: isDragging ? "none" : undefined }}>
            {/* Hour labels */}
            <div style={{ width: 56, flexShrink: 0, position: "relative" }}>
              {hourLabels.map(h => (
                <div key={h} style={{
                  position: "absolute",
                  top: `${((h - TIMELINE_START) / TIMELINE_HOURS) * 100}%`,
                  right: 8,
                  fontSize: "0.68rem", fontWeight: 600,
                  color: "var(--dz-text-muted, #64748b)",
                  transform: "translateY(-50%)",
                  lineHeight: 1,
                }}>
                  {h === 0 ? "12 AM" : h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h - 12} PM`}
                </div>
              ))}
            </div>

            {/* Timeline body with grid lines + positioned appointments */}
            <div ref={timelineRef} style={{ flex: 1, position: "relative", borderLeft: "1px solid rgba(148,163,184,0.08)" }}>
              {/* Hour grid lines */}
              {hourLabels.map(h => (
                <div key={h} style={{
                  position: "absolute", left: 0, right: 0,
                  top: `${((h - TIMELINE_START) / TIMELINE_HOURS) * 100}%`,
                  borderTop: "1px solid rgba(148,163,184,0.06)",
                }} />
              ))}
              {/* Half-hour grid lines */}
              {hourLabels.slice(0, -1).map(h => (
                <div key={`half-${h}`} style={{
                  position: "absolute", left: 0, right: 0,
                  top: `${((h - TIMELINE_START + 0.5) / TIMELINE_HOURS) * 100}%`,
                  borderTop: "1px dashed rgba(148,163,184,0.03)",
                }} />
              ))}

              {/* Appointment blocks — draggable + resizable */}
              {allAppts.map(appt => {
                const topPct = minToPct(appt.startMin);
                const heightPct = durToPct(appt.duration);
                const isActive = dragState?.id === appt.id || resizeState?.id === appt.id || resizeTopState?.id === appt.id;
                const hasOverlap = overlaps.has(appt.id);
                return (
                  <div
                    key={appt.id}
                    onMouseDown={(e) => handleDragStart(e, appt)}
                    style={{
                      position: "absolute",
                      top: `${topPct}%`,
                      height: `${heightPct}%`,
                      left: 4, right: 4,
                      minHeight: 28,
                      borderRadius: 8,
                      borderLeft: `3px solid ${appt.type.color}`,
                      background: hasOverlap ? `${appt.type.color}22` : `${appt.type.color}14`,
                      cursor: isDragging ? "grabbing" : "grab",
                      zIndex: isActive ? 10 : 1,
                      boxShadow: isActive ? "0 4px 16px rgba(0,0,0,0.2)" : hasOverlap ? `0 0 0 1.5px #ef444480, inset 0 0 12px rgba(239,68,68,0.08)` : "none",
                      transition: isActive ? "none" : "top 0.15s, height 0.15s",
                      display: "flex", alignItems: "flex-start", gap: 8,
                      padding: "18px 10px 18px",
                      overflow: "hidden",
                    }}
                  >
                    {/* Resize handle at top */}
                    <div
                      onMouseDown={(e) => handleResizeTopStart(e, appt)}
                      className="dz-cal-resize-handle"
                      style={{
                        position: "absolute", top: 0, left: 0, right: 0, height: 14,
                        cursor: "ns-resize",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        borderRadius: "8px 8px 0 0",
                        background: `${appt.type.color}08`,
                        transition: "background 0.15s",
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                        <div style={{ width: 18, height: 2.5, borderRadius: 2, background: `${appt.type.color}35` }} />
                        <div style={{ width: 28, height: 2.5, borderRadius: 2, background: `${appt.type.color}50` }} />
                      </div>
                    </div>

                    {/* Overlap warning badge */}
                    {hasOverlap && (
                      <div style={{
                        position: "absolute", top: 3, right: 8,
                        display: "flex", alignItems: "center", gap: 3,
                        padding: "1px 6px", borderRadius: 6,
                        background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
                        fontSize: "0.55rem", fontWeight: 700, color: "#f87171",
                        zIndex: 2,
                      }}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                        Overlap
                      </div>
                    )}

                    <div style={{
                      width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                      background: `${appt.type.color}20`, color: appt.type.color,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.52rem", fontWeight: 700, marginTop: 1,
                    }}>
                      {appt.patient.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: "0.76rem", fontWeight: 600, color: "var(--dz-text-primary, #f1f5f9)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{appt.patient}</div>
                      <div style={{ fontSize: "0.65rem", color: "var(--dz-text-muted, #64748b)", whiteSpace: "nowrap" }}>
                        {minToTime(appt.startMin)} – {minToTime(appt.startMin + appt.duration)} &middot; {appt.type.label}
                      </div>
                    </div>

                    {/* Resize handle at bottom */}
                    <div
                      onMouseDown={(e) => handleResizeStart(e, appt)}
                      className="dz-cal-resize-handle"
                      style={{
                        position: "absolute", bottom: 0, left: 0, right: 0, height: 14,
                        cursor: "ns-resize",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        borderRadius: "0 0 8px 8px",
                        background: `${appt.type.color}08`,
                        transition: "background 0.15s",
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                        <div style={{ width: 28, height: 2.5, borderRadius: 2, background: `${appt.type.color}50` }} />
                        <div style={{ width: 18, height: 2.5, borderRadius: 2, background: `${appt.type.color}35` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Right: Panel with time-aligned appointment list */}
      <div style={{ flex: "0 0 280px", minWidth: 240, display: "flex", flexDirection: "column" }}>
        <div className="dz-cal-main" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Header */}
          <div style={{ padding: "12px 16px 0", flexShrink: 0 }}>
            <h3 style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--dz-text-primary, #f1f5f9)", margin: "0 0 4px" }}>
              {MONTHS[selectedDate.getMonth()]} {selectedDate.getDate()}
            </h3>
            <p style={{ fontSize: "0.72rem", color: "var(--dz-text-muted, #64748b)", margin: "0 0 10px" }}>
              {allAppts.length} appointment{allAppts.length !== 1 ? "s" : ""}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
              <button className={`dz-loc-chip${selectedLoc === "all" ? " active" : ""}`} onClick={() => setSelectedLoc("all")}>All</button>
              {locations.map(loc => (
                <button key={loc.id} className={`dz-loc-chip${selectedLoc === loc.id ? " active" : ""}`} onClick={() => setSelectedLoc(loc.id)}>{loc.label}</button>
              ))}
            </div>
          </div>

          {/* Time-aligned appointment cards — same timeline as left */}
          <div style={{ flex: 1, position: "relative", overflow: "hidden", margin: "0 8px" }}>
            {/* Hour tick marks on right panel */}
            {hourLabels.map(h => (
              <div key={h} style={{
                position: "absolute", left: 0, right: 0,
                top: `${((h - TIMELINE_START) / TIMELINE_HOURS) * 100}%`,
                borderTop: "1px solid rgba(148,163,184,0.04)",
              }}>
                <span style={{
                  position: "absolute", left: 0, top: -7,
                  fontSize: "0.58rem", color: "var(--dz-text-dim, #475569)",
                }}>
                  {h === 0 ? "12A" : h < 12 ? `${h}A` : h === 12 ? "12P" : `${h - 12}P`}
                </span>
              </div>
            ))}

            {/* Appointment cards aligned to timeline */}
            {allAppts.map(appt => {
              const topPct = minToPct(appt.startMin);
              const heightPct = durToPct(appt.duration);
              return (
                <div key={appt.id} style={{
                  position: "absolute",
                  top: `${topPct}%`,
                  height: `${Math.max(heightPct, 5)}%`,
                  left: 24, right: 0,
                  padding: "4px 8px",
                  borderRadius: 6,
                  background: "var(--dz-input-bg, rgba(148,163,184,0.06))",
                  border: "1px solid rgba(148,163,184,0.06)",
                  borderLeft: `3px solid ${appt.type.color}`,
                  overflow: "hidden",
                  display: "flex", flexDirection: "column", justifyContent: "center",
                }}>
                  <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--dz-text-primary, #f1f5f9)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{appt.patient}</div>
                  <div style={{ fontSize: "0.62rem", color: "var(--dz-text-muted, #64748b)" }}>
                    {minToTime(appt.startMin)} &middot; {appt.type.label}
                  </div>
                  {appt.location && (
                    <div style={{ fontSize: "0.58rem", color: "var(--dz-text-dim, #475569)", display: "flex", alignItems: "center", gap: 2 }}>
                      <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {appt.location}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add appointment button */}
          <div style={{ padding: "8px 16px 12px", flexShrink: 0 }}>
            {showAddForm ? (
              <div style={{ borderTop: "1px solid rgba(148,163,184,0.08)", paddingTop: 10 }}>
                <h4 style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--dz-text-primary, #f1f5f9)", margin: "0 0 8px" }}>New Appointment</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <select className="dz-cal-add-input" value={newAppt.patient} onChange={e => setNewAppt(prev => ({ ...prev, patient: e.target.value }))}>
                    <option value="">Select patient...</option>
                    {PATIENTS.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                  </select>
                  <div style={{ display: "flex", gap: 4 }}>
                    <select className="dz-cal-add-input" value={newAppt.time} onChange={e => setNewAppt(prev => ({ ...prev, time: e.target.value }))}>
                      {["8:00 AM","8:30 AM","9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","12:00 PM","12:30 PM","1:00 PM","1:30 PM","2:00 PM","2:30 PM","3:00 PM","3:30 PM","4:00 PM","4:30 PM","5:00 PM"].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <select className="dz-cal-add-input" value={newAppt.type} onChange={e => setNewAppt(prev => ({ ...prev, type: e.target.value }))}>
                      {APPT_TYPES.map(t => <option key={t.label} value={t.label}>{t.label}</option>)}
                    </select>
                  </div>
                  <select className="dz-cal-add-input" value={newAppt.location} onChange={e => setNewAppt(prev => ({ ...prev, location: e.target.value }))}>
                    {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.label}</option>)}
                  </select>
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 8, justifyContent: "flex-end" }}>
                  <button className="dz-cal-add-cancel" onClick={() => setShowAddForm(false)}>Cancel</button>
                  <button className="dz-cal-add-save" onClick={handleAddAppt} disabled={!newAppt.patient}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    Add
                  </button>
                </div>
              </div>
            ) : (
              <button className="dz-cal-add-trigger" onClick={() => setShowAddForm(true)} style={{ width: "100%", fontSize: "0.75rem" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add Appointment
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Notification prompt modal */}
      {notifyPrompt && !emailPreview && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 100,
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }} onClick={() => setNotifyPrompt(null)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "var(--dz-card-bg, rgba(15,15,35,0.97))", border: "1px solid rgba(99,102,241,0.2)",
            borderRadius: 16, padding: 24, width: 420, maxWidth: "90vw",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "rgba(251,191,36,0.15)", color: "#fbbf24",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "0.92rem", fontWeight: 700, color: "var(--dz-text-primary, #f1f5f9)" }}>Appointment Changed</h3>
                <p style={{ margin: 0, fontSize: "0.72rem", color: "var(--dz-text-muted, #64748b)" }}>Notify {notifyPrompt.appt.patient} about the schedule change?</p>
              </div>
            </div>

            <div style={{
              padding: 12, borderRadius: 10, marginBottom: 16,
              background: "var(--dz-input-bg, rgba(148,163,184,0.06))",
              border: "1px solid rgba(148,163,184,0.08)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", marginBottom: 6 }}>
                <span style={{ color: "var(--dz-text-muted, #64748b)" }}>Previous</span>
                <span style={{ color: "#ef4444", fontWeight: 600, textDecoration: "line-through" }}>
                  {minToTime(notifyPrompt.oldStart)} – {minToTime(notifyPrompt.oldEnd)}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem" }}>
                <span style={{ color: "var(--dz-text-muted, #64748b)" }}>New time</span>
                <span style={{ color: "#34d399", fontWeight: 600 }}>
                  {minToTime(notifyPrompt.newStart)} – {minToTime(notifyPrompt.newEnd)}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setNotifyPrompt(null)} style={{
                flex: 1, padding: "10px", borderRadius: 8, cursor: "pointer",
                border: "1px solid rgba(148,163,184,0.15)", background: "transparent",
                color: "var(--dz-text-muted, #64748b)", fontSize: "0.76rem", fontWeight: 600,
              }}>Skip</button>
              <button onClick={() => {
                setEmailPreview({ appt: notifyPrompt.appt, newStart: notifyPrompt.newStart, newEnd: notifyPrompt.newEnd });
                setEmailSent(false);
              }} style={{
                flex: 2, padding: "10px", borderRadius: 8, cursor: "pointer",
                border: "none", background: "linear-gradient(135deg, #6366f1, #818cf8)",
                color: "#fff", fontSize: "0.78rem", fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
                Send Notification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email preview modal */}
      {emailPreview && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 110,
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }} onClick={() => { setEmailPreview(null); setNotifyPrompt(null); }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "var(--dz-card-bg, rgba(15,15,35,0.97))", border: "1px solid rgba(99,102,241,0.2)",
            borderRadius: 16, padding: 0, width: 480, maxWidth: "90vw",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)", overflow: "hidden",
          }}>
            {/* Email header */}
            <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(148,163,184,0.1)", display: "flex", alignItems: "center", gap: 10 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--dz-text-primary, #f1f5f9)" }}>Email Preview</span>
              <button onClick={() => { setEmailPreview(null); setNotifyPrompt(null); }} style={{
                marginLeft: "auto", background: "none", border: "none", color: "var(--dz-text-muted, #64748b)", cursor: "pointer", fontSize: "1.1rem",
              }}>&times;</button>
            </div>

            {/* Email content */}
            <div style={{ padding: "20px", background: "var(--dz-input-bg, rgba(255,255,255,0.03))" }}>
              <div style={{ fontSize: "0.7rem", color: "var(--dz-text-muted, #64748b)", marginBottom: 4 }}>
                <strong>To:</strong> {emailPreview.appt.patient.toLowerCase().replace(/\s+/g, "").replace(".", "")}@email.com
              </div>
              <div style={{ fontSize: "0.7rem", color: "var(--dz-text-muted, #64748b)", marginBottom: 4 }}>
                <strong>From:</strong> appointments@doczoc.com
              </div>
              <div style={{ fontSize: "0.7rem", color: "var(--dz-text-muted, #64748b)", marginBottom: 12 }}>
                <strong>Subject:</strong> Appointment Rescheduled — Dr. Elguizaoui
              </div>

              <div style={{
                padding: 16, borderRadius: 10,
                background: "var(--dz-card-bg, rgba(15,15,35,0.8))",
                border: "1px solid rgba(148,163,184,0.08)",
              }}>
                <p style={{ margin: "0 0 10px", fontSize: "0.78rem", color: "var(--dz-text-primary, #f1f5f9)" }}>
                  Dear {emailPreview.appt.patient},
                </p>
                <p style={{ margin: "0 0 10px", fontSize: "0.74rem", color: "var(--dz-text-secondary, #94a3b8)", lineHeight: 1.6 }}>
                  Your <strong style={{ color: emailPreview.appt.type.color }}>{emailPreview.appt.type.label}</strong> appointment
                  with <strong>Dr. Sameh Elguizaoui, M.D.</strong> has been rescheduled.
                </p>
                <div style={{
                  padding: 12, borderRadius: 8, marginBottom: 10,
                  background: "rgba(148,163,184,0.04)", border: "1px solid rgba(148,163,184,0.06)",
                }}>
                  <div style={{ fontSize: "0.72rem", color: "var(--dz-text-muted, #64748b)", marginBottom: 6 }}>
                    <strong>New Time:</strong>
                  </div>
                  <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#34d399" }}>
                    {minToTime(emailPreview.newStart)} – {minToTime(emailPreview.newEnd)}
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "var(--dz-text-muted, #64748b)", marginTop: 4 }}>
                    {DAY_NAMES[selectedDate.getDay()]}, {MONTHS[selectedDate.getMonth()]} {selectedDate.getDate()}, {selectedDate.getFullYear()}
                  </div>
                  {emailPreview.appt.location && (
                    <div style={{ fontSize: "0.68rem", color: "var(--dz-text-muted, #64748b)", marginTop: 2, display: "flex", alignItems: "center", gap: 3 }}>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {emailPreview.appt.location}
                    </div>
                  )}
                </div>
                <p style={{ margin: "0 0 6px", fontSize: "0.72rem", color: "var(--dz-text-secondary, #94a3b8)", lineHeight: 1.5 }}>
                  If you need to reschedule or cancel, please contact our office at least 24 hours in advance.
                </p>
                <p style={{ margin: 0, fontSize: "0.72rem", color: "var(--dz-text-secondary, #94a3b8)" }}>
                  — Dr. Elguizaoui&apos;s Office
                </p>
              </div>
            </div>

            {/* Send button */}
            <div style={{ padding: "14px 20px", borderTop: "1px solid rgba(148,163,184,0.1)", display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => { setEmailPreview(null); setNotifyPrompt(null); }} style={{
                padding: "9px 16px", borderRadius: 8, cursor: "pointer",
                border: "1px solid rgba(148,163,184,0.15)", background: "transparent",
                color: "var(--dz-text-muted, #64748b)", fontSize: "0.76rem", fontWeight: 600,
              }}>Cancel</button>
              {emailSent ? (
                <div style={{
                  padding: "9px 20px", borderRadius: 8,
                  background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.3)",
                  color: "#34d399", fontSize: "0.78rem", fontWeight: 700,
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  Sent!
                </div>
              ) : (
                <button onClick={() => {
                  setEmailSent(true);
                  setTimeout(() => { setEmailPreview(null); setNotifyPrompt(null); setEmailSent(false); }, 1200);
                }} style={{
                  padding: "9px 20px", borderRadius: 8, cursor: "pointer",
                  border: "none", background: "linear-gradient(135deg, #6366f1, #818cf8)",
                  color: "#fff", fontSize: "0.78rem", fontWeight: 700,
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                  Send Email
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
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
  const [hoveredCell, setHoveredCell] = useState<{ date: Date; rect: DOMRect } | null>(null);
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Drag/resize overrides: key = "gen-{i}" or "user-{i}", value = { startMin, duration }
  const [apptOverrides, setApptOverrides] = useState<Record<string, { startMin: number; duration: number }>>({});
  const timelineRef = useRef<HTMLDivElement>(null);
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
          <DayView
            selectedDate={selectedDate}
            selectedAppts={selectedAppts}
            userAppts={userAppts}
            apptOverrides={apptOverrides}
            setApptOverrides={setApptOverrides}
            timelineRef={timelineRef}
            onBack={() => { setPanelOpen(false); setSelectedDate(null); }}
            onPrev={() => {
              const prev = new Date(selectedDate);
              prev.setDate(prev.getDate() - 1);
              setSelectedDate(prev);
              setMonth(prev.getMonth());
              setYear(prev.getFullYear());
            }}
            onNext={() => {
              const next = new Date(selectedDate);
              next.setDate(next.getDate() + 1);
              setSelectedDate(next);
              setMonth(next.getMonth());
              setYear(next.getFullYear());
            }}
            selectedLoc={selectedLoc}
            setSelectedLoc={setSelectedLoc}
            showAddForm={showAddForm}
            setShowAddForm={setShowAddForm}
            newAppt={newAppt}
            setNewAppt={setNewAppt}
            handleAddAppt={handleAddAppt}
          />
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
                          onMouseEnter={(e) => {
                            if (scheduleMode || appts.length === 0) return;
                            const rect = e.currentTarget.getBoundingClientRect();
                            if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
                            hoverTimeout.current = setTimeout(() => setHoveredCell({ date, rect }), 300);
                          }}
                          onMouseLeave={() => {
                            if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
                            setHoveredCell(null);
                          }}
                          style={scheduleMode && hasSchedule ? { borderColor: "rgba(52,211,153,0.3)" } : undefined}
                        >
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                            <span className={`dz-cal-date${isToday ? ' today' : ''}`}>{date.getDate()}</span>
                            {hasSurgery && (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f472b6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="Surgery scheduled" style={{ flexShrink: 0, opacity: 0.85 }}>
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
                              {appts.length > 0 ? (
                                <>
                                  {/* Mini timeline visualization */}
                                  <div style={{
                                    width: "80%", height: 28, position: "relative",
                                    background: "rgba(148,163,184,0.04)", borderRadius: 3,
                                    marginTop: 4, overflow: "hidden",
                                    border: "1px solid rgba(148,163,184,0.06)",
                                  }}>
                                    {appts.map((a, i) => {
                                      const tStart = Math.max(0, (a.startMin - 7 * 60) / (11 * 60));
                                      const tHeight = Math.max(0.08, a.duration / (11 * 60));
                                      return (
                                        <div key={i} style={{
                                          position: "absolute",
                                          top: `${tStart * 100}%`,
                                          height: `${tHeight * 100}%`,
                                          left: 2, right: 2,
                                          background: `${a.type.color}50`,
                                          borderLeft: `2px solid ${a.type.color}`,
                                          borderRadius: 2,
                                          minHeight: 3,
                                        }} />
                                      );
                                    })}
                                  </div>
                                  <span className="dz-cal-shift-count has">{appts.length} appt{appts.length !== 1 ? "s" : ""}</span>
                                </>
                              ) : (
                                <span className="dz-cal-shift-count">
                                  {date.getDay() === 0 || date.getDay() === 6 ? '' : 'No avail.'}
                                </span>
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

            {/* Hover tooltip for day overview */}
            {hoveredCell && (() => {
              const hAppts = getAppts(hoveredCell.date, selectedLoc === "all" ? undefined : selectedLoc)
                .slice().sort((a, b) => a.startMin - b.startMin);
              if (hAppts.length === 0) return null;
              const r = hoveredCell.rect;
              return (
                <div
                  style={{
                    position: "fixed",
                    top: r.bottom + 6,
                    left: Math.min(r.left, window.innerWidth - 280),
                    zIndex: 1000,
                    width: 260,
                    background: "var(--dz-card-bg, rgba(15,15,35,0.97))",
                    border: "1px solid rgba(99,102,241,0.2)",
                    borderRadius: 12,
                    padding: "12px 14px",
                    boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
                    pointerEvents: "none",
                  }}
                >
                  <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--dz-text-primary, #f1f5f9)", marginBottom: 8 }}>
                    {DAY_NAMES[hoveredCell.date.getDay()]}, {MONTHS[hoveredCell.date.getMonth()]} {hoveredCell.date.getDate()}
                    <span style={{ fontWeight: 500, color: "var(--dz-text-muted, #64748b)", marginLeft: 6 }}>{hAppts.length} appt{hAppts.length !== 1 ? "s" : ""}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                    {hAppts.map((a, i) => {
                      // Calculate break from previous appointment
                      const prevEnd = i > 0 ? hAppts[i - 1].startMin + hAppts[i - 1].duration : null;
                      const breakMin = prevEnd !== null ? a.startMin - prevEnd : null;
                      return (
                        <div key={i}>
                          {breakMin !== null && breakMin > 0 && (
                            <div style={{
                              display: "flex", alignItems: "center", gap: 6,
                              padding: "3px 8px", margin: "2px 0",
                            }}>
                              <div style={{ flex: 1, height: 1, background: "rgba(148,163,184,0.12)" }} />
                              <span style={{
                                fontSize: "0.55rem", fontWeight: 700, color: "var(--dz-text-dim, #475569)",
                                whiteSpace: "nowrap",
                              }}>
                                {breakMin >= 60 ? `${Math.floor(breakMin / 60)}h ${breakMin % 60 > 0 ? `${breakMin % 60}m` : ""}` : `${breakMin}m`} break
                              </span>
                              <div style={{ flex: 1, height: 1, background: "rgba(148,163,184,0.12)" }} />
                            </div>
                          )}
                          {breakMin !== null && breakMin <= 0 && (
                            <div style={{
                              display: "flex", alignItems: "center", gap: 6,
                              padding: "3px 8px", margin: "2px 0",
                            }}>
                              <div style={{ flex: 1, height: 1, background: "rgba(239,68,68,0.2)" }} />
                              <span style={{
                                fontSize: "0.55rem", fontWeight: 700, color: "#f87171",
                                whiteSpace: "nowrap",
                              }}>
                                {breakMin === 0 ? "back-to-back" : "overlap"}
                              </span>
                              <div style={{ flex: 1, height: 1, background: "rgba(239,68,68,0.2)" }} />
                            </div>
                          )}
                          <div style={{
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "6px 8px", borderRadius: 6,
                            background: `${a.type.color}0a`,
                            borderLeft: `3px solid ${a.type.color}`,
                          }}>
                            <div style={{
                              width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                              background: `${a.type.color}20`, color: a.type.color,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: "0.5rem", fontWeight: 700,
                            }}>
                              {a.patient.split(" ").map(n => n[0]).join("")}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--dz-text-primary, #f1f5f9)" }}>{a.patient}</div>
                              <div style={{ fontSize: "0.6rem", color: "var(--dz-text-muted, #64748b)" }}>
                                {minToTime(a.startMin)} – {minToTime(a.startMin + a.duration)} · {a.type.label}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

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
