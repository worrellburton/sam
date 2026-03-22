import { useState, useEffect, useRef } from "react";
import { Sidebar, useDzPrefs } from "./doczoc-dashboard";
import { PlatformBg } from "~/components/PlatformBg";

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

export default function InsightsPage() {
  const [collapsed, setCollapsed] = useState(false);
  const { bgId } = useDzPrefs();
  const [period, setPeriod] = useState<"week" | "month" | "year">("month");

  return (
    <div className="dz-platform">
      <PlatformBg bgId={bgId} />
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className={`dz-platform-main${collapsed ? " dz-main-expanded" : ""}`}>
        <header className="dz-platform-header">
          <div>
            <h1>Insights</h1>
            <p>Practice analytics & performance metrics</p>
          </div>
          <div className="dz-platform-header-right">
            <div className="dz-insight-period-tabs">
              {(["week", "month", "year"] as const).map((p) => (
                <button
                  key={p}
                  className={`dz-insight-period-btn${period === p ? " active" : ""}`}
                  onClick={() => setPeriod(p)}
                >
                  {p === "week" ? "This Week" : p === "month" ? "This Month" : "This Year"}
                </button>
              ))}
            </div>
          </div>
        </header>

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
                  {TOP_CODES.map((c) => (
                    <tr key={c.code}>
                      <td>
                        <span style={{
                          fontFamily: "'SF Mono', Consolas, monospace",
                          fontWeight: 700, color: "#818cf8", fontSize: "0.82rem",
                        }}>{c.code}</span>
                      </td>
                      <td>{c.desc}</td>
                      <td style={{ textAlign: "right", fontWeight: 600, color: "#e4e4ee" }}>{c.count}</td>
                      <td style={{ textAlign: "right", fontFamily: "'SF Mono', Consolas, monospace", fontWeight: 600, color: "#22c55e" }}>
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
      </main>
    </div>
  );
}
