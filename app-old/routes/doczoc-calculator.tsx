import { useState, useMemo } from "react";
import { Sidebar, useDzPrefs } from "./doczoc-dashboard";
import { PlatformBg } from "~/components/PlatformBg";

export function meta() {
  return [{ title: "Revenue Calculator | DocZoc" }];
}

// ── Helpers ──────────────────────────────────────────────────────────
function fmt(n: number) {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}
function fmtD(n: number) {
  return "$" + fmt(n);
}
function pct(a: number, b: number) {
  if (b === 0) return 0;
  return ((a - b) / b) * 100;
}

interface ScenarioValues {
  visits: number;
  conversionRate: number;
  avgCost: number;
  collectionRate: number;
  consultFee: number;
}

function calcRevenue(v: ScenarioValues) {
  const surgeries = Math.round(v.visits * (v.conversionRate / 100));
  const surgicalRevenue = surgeries * v.avgCost;
  const consultRevenue = (v.visits - surgeries) * v.consultFee;
  const grossRevenue = surgicalRevenue + consultRevenue;
  const netCollected = grossRevenue * (v.collectionRate / 100);
  const revenuePerVisit = v.visits > 0 ? netCollected / v.visits : 0;
  return { surgeries, surgicalRevenue, consultRevenue, grossRevenue, netCollected, revenuePerVisit };
}

// ── Slider ───────────────────────────────────────────────────────────
function CalcSlider({ label, value, onChange, min, max, step, suffix, prefix, color }: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; step: number;
  suffix?: string; prefix?: string; color: string;
}) {
  const pctFill = ((value - min) / (max - min)) * 100;
  return (
    <div className="dz-calc-slider">
      <div className="dz-calc-slider-header">
        <span className="dz-calc-slider-label">{label}</span>
        <span className="dz-calc-slider-value" style={{ color }}>
          {prefix}{typeof value === "number" && !suffix ? fmt(value) : value}{suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{
          background: `linear-gradient(90deg, ${color} ${pctFill}%, rgba(100,116,139,0.2) ${pctFill}%)`,
          accentColor: color,
        }}
      />
      <div className="dz-calc-slider-range">
        <span>{prefix}{fmt(min)}{suffix}</span>
        <span>{prefix}{fmt(max)}{suffix}</span>
      </div>
    </div>
  );
}

// ── Metric Card ──────────────────────────────────────────────────────
function MetricRow({ label, a, b, format = "dollar" }: {
  label: string; a: number; b: number; format?: "dollar" | "number";
}) {
  const diff = a - b;
  const diffPct = pct(a, b);
  const isUp = diff > 0;
  const fmtFn = format === "dollar" ? fmtD : fmt;
  return (
    <div className="dz-calc-metric-row">
      <div className="dz-calc-metric-label">{label}</div>
      <div className="dz-calc-metric-vals">
        <span className="dz-calc-metric-a">{fmtFn(a)}</span>
        <span className="dz-calc-metric-b">{fmtFn(b)}</span>
        <span className={`dz-calc-metric-diff ${isUp ? "up" : diff < 0 ? "down" : ""}`}>
          {isUp ? "+" : ""}{fmtFn(diff)}
          <span className="dz-calc-metric-pct">
            ({isUp ? "+" : ""}{diffPct.toFixed(1)}%)
          </span>
        </span>
      </div>
    </div>
  );
}

// ── Donut Chart ──────────────────────────────────────────────────────
function RevenueDonut({ surgical, consult, label }: { surgical: number; consult: number; label: string }) {
  const total = surgical + consult;
  const surgPct = total > 0 ? (surgical / total) * 100 : 0;
  const consPct = total > 0 ? (consult / total) * 100 : 0;
  const r = 40;
  const c = 2 * Math.PI * r;
  const surgLen = (surgPct / 100) * c;
  const consLen = (consPct / 100) * c;
  return (
    <div className="dz-calc-donut-wrap">
      <svg viewBox="0 0 100 100" className="dz-calc-donut">
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(100,116,139,0.15)" strokeWidth="10" />
        <circle cx="50" cy="50" r={r} fill="none" stroke="#8b5cf6" strokeWidth="10"
          strokeDasharray={`${surgLen} ${c}`} strokeDashoffset={c * 0.25}
          strokeLinecap="round" style={{ transition: "stroke-dasharray 0.6s ease" }} />
        <circle cx="50" cy="50" r={r} fill="none" stroke="#22c55e" strokeWidth="10"
          strokeDasharray={`${consLen} ${c}`} strokeDashoffset={c * 0.25 - surgLen}
          strokeLinecap="round" style={{ transition: "stroke-dasharray 0.6s ease, stroke-dashoffset 0.6s ease" }} />
        <text x="50" y="47" textAnchor="middle" fill="var(--dz-text-primary, #f1f5f9)" fontSize="10" fontWeight="800">{fmtD(total)}</text>
        <text x="50" y="59" textAnchor="middle" fill="var(--dz-text-muted, #64748b)" fontSize="5.5" fontWeight="600">{label}</text>
      </svg>
      <div className="dz-calc-donut-legend">
        <span><i style={{ background: "#8b5cf6" }} /> Surgical {surgPct.toFixed(0)}%</span>
        <span><i style={{ background: "#22c55e" }} /> Consult {consPct.toFixed(0)}%</span>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────
const DEFAULTS_A: ScenarioValues = { visits: 400, conversionRate: 28, avgCost: 18000, collectionRate: 72, consultFee: 350 };
const DEFAULTS_B: ScenarioValues = { visits: 400, conversionRate: 35, avgCost: 18000, collectionRate: 85, consultFee: 350 };

export default function CalculatorPage() {
  const [collapsed, setCollapsed] = useState(false);
  const { bgId } = useDzPrefs();
  const [a, setA] = useState<ScenarioValues>(DEFAULTS_A);
  const [b, setB] = useState<ScenarioValues>(DEFAULTS_B);

  const resA = useMemo(() => calcRevenue(a), [a]);
  const resB = useMemo(() => calcRevenue(b), [b]);

  const updateA = (key: keyof ScenarioValues) => (v: number) => setA(prev => ({ ...prev, [key]: v }));
  const updateB = (key: keyof ScenarioValues) => (v: number) => setB(prev => ({ ...prev, [key]: v }));

  return (
    <div className="dz-platform">
      <PlatformBg bgId={bgId} />
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className={`dz-platform-main${collapsed ? " dz-main-expanded" : ""}`}>
        <header className="dz-platform-header">
          <div>
            <h1>Revenue Calculator</h1>
            <p>Model scenarios &amp; compare outcomes</p>
          </div>
          <button
            onClick={() => { setA(DEFAULTS_A); setB(DEFAULTS_B); }}
            style={{
              display: "flex", alignItems: "center", gap: 8, padding: "9px 18px",
              borderRadius: 10, border: "1px solid rgba(99,102,241,0.3)",
              background: "rgba(99,102,241,0.1)", color: "#a5b4fc",
              fontSize: "0.85rem", fontWeight: 600, cursor: "pointer",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            Reset
          </button>
        </header>

        {/* Scenario inputs side by side */}
        <div className="dz-calc-scenarios">
          {/* Scenario A */}
          <div className="dz-card dz-calc-scenario">
            <div className="dz-calc-scenario-header" style={{ borderColor: "#6366f1" }}>
              <div className="dz-calc-scenario-dot" style={{ background: "#6366f1" }} />
              <span>Scenario A</span>
              <span className="dz-calc-scenario-tag" style={{ background: "rgba(99,102,241,0.15)", color: "#a5b4fc" }}>Current</span>
            </div>
            <CalcSlider label="Monthly Patient Visits" value={a.visits} onChange={updateA("visits")} min={50} max={1500} step={10} color="#6366f1" />
            <CalcSlider label="Surgery Conversion Rate" value={a.conversionRate} onChange={updateA("conversionRate")} min={5} max={60} step={1} suffix="%" color="#6366f1" />
            <CalcSlider label="Average Surgery Cost" value={a.avgCost} onChange={updateA("avgCost")} min={2000} max={80000} step={500} prefix="$" color="#6366f1" />
            <CalcSlider label="Billing Collection Rate" value={a.collectionRate} onChange={updateA("collectionRate")} min={40} max={100} step={1} suffix="%" color="#6366f1" />
            <CalcSlider label="Avg Consultation Fee" value={a.consultFee} onChange={updateA("consultFee")} min={100} max={1000} step={25} prefix="$" color="#6366f1" />
          </div>

          {/* Scenario B */}
          <div className="dz-card dz-calc-scenario">
            <div className="dz-calc-scenario-header" style={{ borderColor: "#22c55e" }}>
              <div className="dz-calc-scenario-dot" style={{ background: "#22c55e" }} />
              <span>Scenario B</span>
              <span className="dz-calc-scenario-tag" style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80" }}>Projected</span>
            </div>
            <CalcSlider label="Monthly Patient Visits" value={b.visits} onChange={updateB("visits")} min={50} max={1500} step={10} color="#22c55e" />
            <CalcSlider label="Surgery Conversion Rate" value={b.conversionRate} onChange={updateB("conversionRate")} min={5} max={60} step={1} suffix="%" color="#22c55e" />
            <CalcSlider label="Average Surgery Cost" value={b.avgCost} onChange={updateB("avgCost")} min={2000} max={80000} step={500} prefix="$" color="#22c55e" />
            <CalcSlider label="Billing Collection Rate" value={b.collectionRate} onChange={updateB("collectionRate")} min={40} max={100} step={1} suffix="%" color="#22c55e" />
            <CalcSlider label="Avg Consultation Fee" value={b.consultFee} onChange={updateB("consultFee")} min={100} max={1000} step={25} prefix="$" color="#22c55e" />
          </div>
        </div>

        {/* Results comparison */}
        <div className="dz-card" style={{ padding: 0, overflow: "hidden", marginTop: 20 }}>
          <div style={{ padding: "18px 24px", borderBottom: "1px solid rgba(99,102,241,0.1)", display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            <span style={{ fontSize: "1rem", fontWeight: 700, color: "var(--dz-text-primary, #f1f5f9)" }}>Results Comparison</span>
          </div>
          <div className="dz-calc-results-header">
            <div />
            <div style={{ color: "#a5b4fc", fontWeight: 700 }}>Scenario A</div>
            <div style={{ color: "#4ade80", fontWeight: 700 }}>Scenario B</div>
            <div style={{ color: "#94a3b8", fontWeight: 700 }}>Difference</div>
          </div>
          <MetricRow label="Surgeries / Month" a={resA.surgeries} b={resB.surgeries} format="number" />
          <MetricRow label="Surgical Revenue" a={resA.surgicalRevenue} b={resB.surgicalRevenue} />
          <MetricRow label="Consult Revenue" a={resA.consultRevenue} b={resB.consultRevenue} />
          <MetricRow label="Gross Revenue" a={resA.grossRevenue} b={resB.grossRevenue} />
          <MetricRow label="Net Collected" a={resA.netCollected} b={resB.netCollected} />
          <MetricRow label="Revenue / Visit" a={resA.revenuePerVisit} b={resB.revenuePerVisit} />
        </div>

        {/* Donut charts */}
        <div className="dz-calc-donuts">
          <div className="dz-card">
            <RevenueDonut surgical={resA.surgicalRevenue} consult={resA.consultRevenue} label="Scenario A" />
          </div>
          <div className="dz-card dz-calc-diff-card">
            <div className="dz-calc-diff-big">
              <span className={`dz-calc-diff-value ${resB.netCollected >= resA.netCollected ? "up" : "down"}`}>
                {resB.netCollected >= resA.netCollected ? "+" : ""}{fmtD(resB.netCollected - resA.netCollected)}
              </span>
              <span className="dz-calc-diff-label">monthly difference</span>
              <span className={`dz-calc-diff-annual ${resB.netCollected >= resA.netCollected ? "up" : "down"}`}>
                {resB.netCollected >= resA.netCollected ? "+" : ""}{fmtD((resB.netCollected - resA.netCollected) * 12)}/yr
              </span>
            </div>
          </div>
          <div className="dz-card">
            <RevenueDonut surgical={resB.surgicalRevenue} consult={resB.consultRevenue} label="Scenario B" />
          </div>
        </div>

        {/* Annual projection */}
        <div className="dz-calc-annual">
          <div className="dz-card dz-calc-annual-card" style={{ borderColor: "rgba(99,102,241,0.3)" }}>
            <div className="dz-calc-annual-label">Scenario A — Annual</div>
            <div className="dz-calc-annual-value" style={{ color: "#a5b4fc" }}>{fmtD(resA.netCollected * 12)}</div>
            <div className="dz-calc-annual-sub">{fmt(resA.surgeries * 12)} surgeries · {fmt(a.visits * 12)} visits</div>
          </div>
          <div className="dz-card dz-calc-annual-card" style={{ borderColor: "rgba(34,197,94,0.3)" }}>
            <div className="dz-calc-annual-label">Scenario B — Annual</div>
            <div className="dz-calc-annual-value" style={{ color: "#4ade80" }}>{fmtD(resB.netCollected * 12)}</div>
            <div className="dz-calc-annual-sub">{fmt(resB.surgeries * 12)} surgeries · {fmt(b.visits * 12)} visits</div>
          </div>
        </div>
      </main>
    </div>
  );
}
