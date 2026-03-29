import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Sidebar, useDzPrefs } from "./doczoc-dashboard";
import { PlatformBg } from "~/components/PlatformBg";
import { useCrosshairFocus, CrosshairToggle } from "~/hooks/useCrosshairFocus";

export function meta() {
  return [{ title: "Insights | DocZoc" }];
}

// ── Sparkline SVG ──────────────────────────────────────────────────
function Sparkline({ data, color, width = 120, height = 36 }: { data: number[]; color: string; width?: number; height?: number }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  const areaPoints = `0,${height} ${points} ${width},${height}`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: "block" }}>
      <defs>
        <linearGradient id={`sg-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#sg-${color.replace("#", "")})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Bar Chart ──────────────────────────────────────────────────────
function BarChart({ data, labels, color }: { data: number[]; labels: string[]; color: string }) {
  const max = Math.max(...data);
  return (
    <div className="dz-insight-bar-chart">
      {data.map((v, i) => (
        <div key={i} className="dz-insight-bar-col">
          <div className="dz-insight-bar-track">
            <div
              className="dz-insight-bar-fill"
              style={{ height: `${(v / max) * 100}%`, background: color }}
            />
          </div>
          <span className="dz-insight-bar-label">{labels[i]}</span>
          <span className="dz-insight-bar-value">{v}</span>
        </div>
      ))}
    </div>
  );
}

// ── Donut Chart ────────────────────────────────────────────────────
function Donut({ segments, size = 120 }: { segments: { value: number; color: string; label: string }[]; size?: number }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  const r = (size - 12) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="dz-insight-donut-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {segments.map((seg, i) => {
          const dash = (seg.value / total) * circumference;
          const gap = circumference - dash;
          const el = (
            <circle
              key={i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth="10"
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          );
          offset += dash;
          return el;
        })}
        <text x={cx} y={cy - 6} textAnchor="middle" fill="#e4e4ee" fontSize="18" fontWeight="800">{total}</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="#5a5a6e" fontSize="9" fontWeight="600">TOTAL</text>
      </svg>
      <div className="dz-insight-donut-legend">
        {segments.map((seg, i) => (
          <div key={i} className="dz-insight-legend-item">
            <span className="dz-insight-legend-dot" style={{ background: seg.color }} />
            <span className="dz-insight-legend-label">{seg.label}</span>
            <span className="dz-insight-legend-val">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Timeline Range Picker ────────────────────────────────────────────
const MONTH_ABBRS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

interface TimelineMonth {
  year: number;
  month: number;
  label: string;
  key: string;
}

function buildTimeline(startYear: number, endYear: number): TimelineMonth[] {
  const months: TimelineMonth[] = [];
  for (let y = startYear; y <= endYear; y++) {
    for (let m = 0; m <= 11; m++) {
      months.push({ year: y, month: m, label: MONTH_ABBRS[m], key: `${y}-${m}` });
    }
  }
  return months;
}

function TimelineRangePicker({
  startIdx,
  endIdx,
  onChange,
}: {
  startIdx: number;
  endIdx: number;
  onChange: (start: number, end: number) => void;
}) {
  const now = new Date();
  const timeline = useMemo(() => buildTimeline(now.getFullYear() - 1, now.getFullYear() + 1), []);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectionRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<"start" | "end" | "range" | null>(null);
  const dragOffset = useRef(0);
  const liveStart = useRef(startIdx);
  const liveEnd = useRef(endIdx);
  const rafRef = useRef<number>(0);
  const CELL_W = 52;

  // Keep refs in sync with props
  useEffect(() => { liveStart.current = startIdx; }, [startIdx]);
  useEffect(() => { liveEnd.current = endIdx; }, [endIdx]);

  // Scroll to center the selection on mount
  useEffect(() => {
    if (containerRef.current) {
      const center = ((startIdx + endIdx) / 2) * CELL_W;
      containerRef.current.scrollLeft = center - containerRef.current.clientWidth / 2;
    }
  }, []);

  const getPreciseIdx = useCallback((clientX: number) => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const scrollX = containerRef.current.scrollLeft;
    const x = clientX - rect.left + scrollX;
    return Math.max(0, Math.min(timeline.length - 1, x / CELL_W));
  }, [timeline.length]);

  const snapIdx = (v: number) => Math.max(0, Math.min(timeline.length - 1, Math.round(v)));

  // Direct DOM update for 120fps — bypasses React render cycle during drag
  const updateSelectionDOM = useCallback((s: number, e: number) => {
    const sel = selectionRef.current;
    if (!sel) return;
    sel.style.left = `${s * CELL_W}px`;
    sel.style.width = `${(e - s + 1) * CELL_W}px`;
    // Update in-range highlighting on month ticks
    const track = sel.parentElement;
    if (track) {
      const months = track.querySelectorAll<HTMLElement>('.dz-timeline-month');
      months.forEach((el, i) => {
        if (i >= s && i <= e) el.classList.add('in-range');
        else el.classList.remove('in-range');
      });
    }
    // Update label text
    const label = sel.querySelector<HTMLElement>('.dz-timeline-range-label');
    if (label) {
      const sm = timeline[s], em = timeline[e];
      if (sm && em) {
        label.textContent = `${MONTH_ABBRS[sm.month]} ${sm.year === em.year ? '' : sm.year + ' '}${sm.month === em.month && sm.year === em.year ? String(sm.year) : `- ${MONTH_ABBRS[em.month]} ${em.year}`}`;
      }
    }
    liveStart.current = s;
    liveEnd.current = e;
  }, [timeline]);

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const idx = getPreciseIdx(e.clientX);
    const s = liveStart.current, en = liveEnd.current;
    if (Math.abs(idx - s) <= 1.2) {
      dragging.current = "start";
    } else if (Math.abs(idx - en) <= 1.2) {
      dragging.current = "end";
    } else if (snapIdx(idx) > s && snapIdx(idx) < en) {
      dragging.current = "range";
      dragOffset.current = idx - s;
    } else {
      const rangeSize = en - s;
      const newStart = Math.max(0, Math.min(timeline.length - 1 - rangeSize, snapIdx(idx - rangeSize / 2)));
      updateSelectionDOM(newStart, newStart + rangeSize);
      dragging.current = "range";
      dragOffset.current = idx - newStart;
    }
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, [getPreciseIdx, updateSelectionDOM, timeline.length]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    // Cancel any pending frame and schedule a new one for this pointer event
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const clientX = e.clientX;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      const idx = getPreciseIdx(clientX);
      const s = liveStart.current, en = liveEnd.current;
      if (dragging.current === "start") {
        const ns = snapIdx(idx);
        if (ns < en) updateSelectionDOM(ns, en);
      } else if (dragging.current === "end") {
        const ne = snapIdx(idx);
        if (ne > s) updateSelectionDOM(s, ne);
      } else if (dragging.current === "range") {
        const rangeSize = en - s;
        const newStart = snapIdx(Math.max(0, idx - dragOffset.current));
        const newEnd = Math.min(timeline.length - 1, newStart + rangeSize);
        updateSelectionDOM(newEnd - rangeSize, newEnd);
      }
    });
  }, [getPreciseIdx, updateSelectionDOM, timeline.length]);

  const handlePointerUp = useCallback(() => {
    if (dragging.current) {
      dragging.current = null;
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = 0; }
      // Commit final position to React state
      onChange(liveStart.current, liveEnd.current);
    }
  }, [onChange]);

  // Render year markers
  const years: { year: number; startIdx: number }[] = [];
  let lastYear = -1;
  timeline.forEach((m, i) => {
    if (m.year !== lastYear) {
      years.push({ year: m.year, startIdx: i });
      lastYear = m.year;
    }
  });

  const rangeLabel = `${MONTH_ABBRS[timeline[startIdx].month]} ${timeline[startIdx].year === timeline[endIdx].year ? '' : timeline[startIdx].year + ' '}${timeline[startIdx].month === timeline[endIdx].month && timeline[startIdx].year === timeline[endIdx].year ? timeline[startIdx].year : `- ${MONTH_ABBRS[timeline[endIdx].month]} ${timeline[endIdx].year}`}`;

  return (
    <div className="dz-timeline-picker">
      <button
        className="dz-timeline-arrow"
        onClick={() => { if (containerRef.current) containerRef.current.scrollLeft -= 200; }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <div
        ref={containerRef}
        className="dz-timeline-scroll"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ touchAction: "none" }}
      >
        <div className="dz-timeline-track" style={{ width: timeline.length * CELL_W }}>
          {/* Year labels */}
          {years.map((y) => (
            <div
              key={y.year}
              className="dz-timeline-year"
              style={{ left: y.startIdx * CELL_W }}
            >
              {y.year}
            </div>
          ))}
          {/* Month ticks */}
          {timeline.map((m, i) => (
            <div
              key={m.key}
              className={`dz-timeline-month${i >= startIdx && i <= endIdx ? ' in-range' : ''}`}
              style={{ left: i * CELL_W, width: CELL_W }}
            >
              <div className="dz-timeline-tick" />
              <span>{m.label}</span>
            </div>
          ))}
          {/* Selection range overlay */}
          <div
            ref={selectionRef}
            className="dz-timeline-selection"
            style={{
              left: startIdx * CELL_W,
              width: (endIdx - startIdx + 1) * CELL_W,
              willChange: "left, width",
            }}
          >
            <div className="dz-timeline-handle left" title="In point" />
            <span className="dz-timeline-range-label">{rangeLabel}</span>
            <div className="dz-timeline-handle right" title="Out point" />
          </div>
        </div>
      </div>
      <button
        className="dz-timeline-arrow"
        onClick={() => { if (containerRef.current) containerRef.current.scrollLeft += 200; }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    </div>
  );
}

// ── Data ───────────────────────────────────────────────────────────
const WEEKLY_APPTS = [18, 22, 19, 24, 21, 26, 24];
const WEEKLY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MONTHLY_REVENUE = [32400, 28900, 35100, 31200, 38400, 34700, 41200, 37800, 42100, 39500, 44200, 46800];
const MONTHLY_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const PROCEDURE_MIX = [
  { value: 34, color: "#6366f1", label: "ACL Repair" },
  { value: 28, color: "#22c55e", label: "Rotator Cuff" },
  { value: 18, color: "#f59e0b", label: "Meniscectomy" },
  { value: 14, color: "#60a5fa", label: "Hip Arthroplasty" },
  { value: 12, color: "#f472b6", label: "Other" },
];

const BILLING_STATUS = [
  { value: 42, color: "#22c55e", label: "Paid" },
  { value: 18, color: "#f59e0b", label: "Pending" },
  { value: 8, color: "#6366f1", label: "Submitted" },
  { value: 3, color: "#ef4444", label: "Denied" },
];

const TOP_CODES = [
  { code: "29888", desc: "ACL Reconstruction", count: 34, revenue: 289000 },
  { code: "29827", desc: "Rotator Cuff Repair", count: 28, revenue: 224000 },
  { code: "29881", desc: "Knee Meniscectomy", count: 18, revenue: 57600 },
  { code: "27130", desc: "Total Hip Arthroplasty", count: 14, revenue: 168000 },
  { code: "99214", desc: "Office Visit (Established)", count: 156, revenue: 27300 },
  { code: "99203", desc: "Office Visit (New)", count: 48, revenue: 10800 },
];

const PAYER_MIX = [
  { payer: "UnitedHealthcare", patients: 38, pct: 28 },
  { payer: "Aetna", patients: 31, pct: 23 },
  { payer: "Cigna", patients: 24, pct: 18 },
  { payer: "Blue Cross", patients: 21, pct: 15 },
  { payer: "Medicare", patients: 14, pct: 10 },
  { payer: "Self-Pay", patients: 8, pct: 6 },
];

const STAT_ITEMS = [
  { id: "appts", label: "Today's Appointments", value: "24", change: "+3", color: "#6366f1" },
  { id: "newpat", label: "New Patients (Week)", value: "18", change: "+5", color: "#22c55e" },
  { id: "show", label: "Show Rate", value: "96%", change: "+2%", color: "#a78bfa" },
  { id: "reviews", label: "Pending Reviews", value: "7", change: "-2", color: "#f59e0b" },
];

function DraggableStats() {
  const [items, setItems] = useState(STAT_ITEMS);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);

  const handleDragStart = (idx: number) => {
    dragItem.current = idx;
    setDraggingIdx(idx);
  };

  const handleDragEnter = (idx: number) => {
    dragOverItem.current = idx;
  };

  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null) {
      setDraggingIdx(null);
      return;
    }
    const copy = [...items];
    const dragged = copy.splice(dragItem.current, 1)[0];
    copy.splice(dragOverItem.current, 0, dragged);
    setItems(copy);
    dragItem.current = null;
    dragOverItem.current = null;
    setDraggingIdx(null);
  };

  return (
    <div className="dz-stats-grid">
      {items.map((s, i) => (
        <div
          key={s.id}
          className={`dz-stat-card dz-glass-card${draggingIdx === i ? " dz-dragging" : ""}`}
          draggable
          onDragStart={() => handleDragStart(i)}
          onDragEnter={() => handleDragEnter(i)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => e.preventDefault()}
          style={{ cursor: "grab" }}
        >
          <div className="dz-drag-handle">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.3">
              <circle cx="9" cy="5" r="1"/><circle cx="15" cy="5" r="1"/>
              <circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/>
              <circle cx="9" cy="19" r="1"/><circle cx="15" cy="19" r="1"/>
            </svg>
          </div>
          <div className="dz-stat-card-label">{s.label}</div>
          <div className="dz-stat-card-value" style={{ color: s.color }}>{s.value}</div>
          <div className="dz-stat-card-change" style={{ color: "#22c55e" }}>{s.change} from last week</div>
        </div>
      ))}
    </div>
  );
}

export default function InsightsPage() {
  const [collapsed, setCollapsed] = useState(false);
  const { bgId } = useDzPrefs();
  // Default range: ~6 months centered around current month
  // Timeline starts at previous year Jan (index 0), current year starts at index 12
  const now = new Date();
  const currentMonthIdx = 12 + now.getMonth(); // offset into timeline (prev year = 0-11, current = 12-23)
  const [rangeStart, setRangeStart] = useState(Math.max(0, currentMonthIdx - 5));
  const [rangeEnd, setRangeEnd] = useState(currentMonthIdx);

  const { focusMode, toggleFocus, onCellEnter, onCellLeave, getCellStyle } = useCrosshairFocus(new Set([2, 3]));

  return (
    <div className="dz-platform">
      <PlatformBg bgId={bgId} />
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main
        className={`dz-platform-main${collapsed ? " dz-main-expanded" : ""} dz-snap-container`}
        style={{ padding: "32px 36px" }}
      >
        {/* ── Screen 1: Dashboard ── */}
        <section className="dz-snap-section">
        <header className="dz-platform-header">
          <div>
            <h1>Insights</h1>
            <p>Practice analytics & performance metrics</p>
          </div>
        </header>

        {/* Timeline Range Picker */}
        <TimelineRangePicker
          startIdx={rangeStart}
          endIdx={rangeEnd}
          onChange={(s, e) => { setRangeStart(s); setRangeEnd(e); }}
        />

        {/* Top KPIs */}
        <div className="dz-insight-kpi-row">
          <div className="dz-insight-kpi">
            <div className="dz-insight-kpi-top">
              <div>
                <div className="dz-insight-kpi-label">Total Revenue</div>
                <div className="dz-insight-kpi-value">$462,200</div>
              </div>
              <div className="dz-insight-kpi-change up">+12.4%</div>
            </div>
            <Sparkline data={MONTHLY_REVENUE} color="#22c55e" />
          </div>
          <div className="dz-insight-kpi">
            <div className="dz-insight-kpi-top">
              <div>
                <div className="dz-insight-kpi-label">Patients Seen</div>
                <div className="dz-insight-kpi-value">1,248</div>
              </div>
              <div className="dz-insight-kpi-change up">+8.2%</div>
            </div>
            <Sparkline data={[98, 105, 112, 108, 115, 120, 118, 125, 130, 128, 135, 142]} color="#6366f1" />
          </div>
          <div className="dz-insight-kpi">
            <div className="dz-insight-kpi-top">
              <div>
                <div className="dz-insight-kpi-label">Avg. Collection Rate</div>
                <div className="dz-insight-kpi-value">94.2%</div>
              </div>
              <div className="dz-insight-kpi-change up">+1.8%</div>
            </div>
            <Sparkline data={[88, 89, 91, 90, 92, 91, 93, 92, 94, 93, 94, 94]} color="#a78bfa" />
          </div>
          <div className="dz-insight-kpi">
            <div className="dz-insight-kpi-top">
              <div>
                <div className="dz-insight-kpi-label">Denial Rate</div>
                <div className="dz-insight-kpi-value">4.2%</div>
              </div>
              <div className="dz-insight-kpi-change down">-0.8%</div>
            </div>
            <Sparkline data={[7, 6.5, 6, 5.8, 5.5, 5.2, 5, 4.8, 4.5, 4.4, 4.3, 4.2]} color="#f59e0b" />
          </div>
        </div>

        <div className="dz-insight-grid">
          {/* Weekly appointments bar chart */}
          <div className="dz-insight-card">
            <div className="dz-insight-card-header">
              <h3>Weekly Appointments</h3>
              <span className="dz-insight-card-sub">Last 7 days</span>
            </div>
            <BarChart data={WEEKLY_APPTS} labels={WEEKLY_LABELS} color="#6366f1" />
          </div>

          {/* Procedure mix donut */}
          <div className="dz-insight-card">
            <div className="dz-insight-card-header">
              <h3>Procedure Mix</h3>
              <span className="dz-insight-card-sub">Year to date</span>
            </div>
            <Donut segments={PROCEDURE_MIX} />
          </div>

          {/* Billing status donut */}
          <div className="dz-insight-card">
            <div className="dz-insight-card-header">
              <h3>Billing Status</h3>
              <span className="dz-insight-card-sub">Current claims</span>
            </div>
            <Donut segments={BILLING_STATUS} />
          </div>

          {/* Top CPT codes table */}
          <div className="dz-insight-card dz-insight-card-wide">
            <div className="dz-insight-card-header">
              <h3>Top Procedure Codes</h3>
              <span className="dz-insight-card-sub">By volume</span>
              <CrosshairToggle active={focusMode} onClick={toggleFocus} />
            </div>
            <div className="dz-table-wrap">
              <table className="dz-table">
                <thead>
                  <tr>
                    <th>CPT Code</th>
                    <th>Description</th>
                    <th style={{ textAlign: "right" }}>Count</th>
                    <th style={{ textAlign: "right" }}>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {TOP_CODES.map((c, index) => (
                    <tr key={c.code}>
                      <td
                        onMouseEnter={() => onCellEnter(String(index), 0)}
                        onMouseLeave={onCellLeave}
                        style={{
                          ...getCellStyle(String(index), 0),
                          transition: "opacity 0.2s ease",
                        }}
                      >
                        <span style={{
                          fontFamily: "'SF Mono', Consolas, monospace",
                          fontWeight: 700, color: "#818cf8", fontSize: "0.82rem",
                        }}>{c.code}</span>
                      </td>
                      <td
                        onMouseEnter={() => onCellEnter(String(index), 1)}
                        onMouseLeave={onCellLeave}
                        style={{
                          ...getCellStyle(String(index), 1),
                          transition: "opacity 0.2s ease",
                        }}
                      >{c.desc}</td>
                      <td
                        onMouseEnter={() => onCellEnter(String(index), 2)}
                        onMouseLeave={onCellLeave}
                        style={{
                          textAlign: "right", fontWeight: 600, color: "#e4e4ee",
                          ...getCellStyle(String(index), 2),
                          transition: "opacity 0.2s ease",
                        }}
                      >{c.count}</td>
                      <td
                        onMouseEnter={() => onCellEnter(String(index), 3)}
                        onMouseLeave={onCellLeave}
                        style={{
                          textAlign: "right", fontFamily: "'SF Mono', Consolas, monospace", fontWeight: 600, color: "#22c55e",
                          ...getCellStyle(String(index), 3),
                          transition: "opacity 0.2s ease",
                        }}
                      >
                        ${c.revenue.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payer mix */}
          <div className="dz-insight-card dz-insight-card-wide">
            <div className="dz-insight-card-header">
              <h3>Payer Mix</h3>
              <span className="dz-insight-card-sub">Patient distribution by insurance</span>
            </div>
            <div className="dz-insight-payer-list">
              {PAYER_MIX.map((p) => (
                <div key={p.payer} className="dz-insight-payer-row">
                  <span className="dz-insight-payer-name">{p.payer}</span>
                  <div className="dz-insight-payer-bar-track">
                    <div className="dz-insight-payer-bar-fill" style={{ width: `${p.pct}%` }} />
                  </div>
                  <span className="dz-insight-payer-pct">{p.pct}%</span>
                  <span className="dz-insight-payer-count">{p.patients}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        </section>

      </main>
    </div>
  );
}
