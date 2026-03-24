import { useState } from "react";
import { Sidebar, useDzPrefs } from "./doczoc-dashboard";
import { PlatformBg } from "~/components/PlatformBg";

export function meta() {
  return [{ title: "Reports | DocZoc" }];
}

const REPORTS = [
  {
    id: 1,
    title: "Monthly Revenue Summary",
    category: "Financial",
    generated: "Mar 15, 2026",
    status: "Ready",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
  },
  {
    id: 2,
    title: "Patient Visit Trends",
    category: "Clinical",
    generated: "Mar 14, 2026",
    status: "Ready",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
  {
    id: 3,
    title: "Insurance Claims Report",
    category: "Financial",
    generated: "Mar 12, 2026",
    status: "Ready",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  },
  {
    id: 4,
    title: "Surgical Outcomes Q1 2026",
    category: "Clinical",
    generated: "Mar 10, 2026",
    status: "Ready",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    ),
  },
  {
    id: 5,
    title: "No-Show & Cancellation Analysis",
    category: "Operations",
    generated: "Mar 8, 2026",
    status: "Ready",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
    ),
  },
  {
    id: 6,
    title: "Referral Source Breakdown",
    category: "Marketing",
    generated: "Mar 5, 2026",
    status: "Ready",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
      </svg>
    ),
  },
  {
    id: 7,
    title: "Provider Productivity Report",
    category: "Operations",
    generated: "Mar 1, 2026",
    status: "Generating",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },
  {
    id: 8,
    title: "Operative Report",
    category: "Clinical",
    generated: "Mar 20, 2026",
    status: "Ready",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
      </svg>
    ),
  },
];

const CATEGORIES = ["All", "Financial", "Clinical", "Operations", "Marketing"];

export default function ReportsPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [category, setCategory] = useState("All");
  const { bgId } = useDzPrefs();

  const filtered = category === "All" ? REPORTS : REPORTS.filter(r => r.category === category);

  return (
    <div className="dz-platform">
      <PlatformBg bgId={bgId} />
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className={`dz-platform-main${collapsed ? " dz-main-expanded" : ""}`}>
        <header className="dz-platform-header">
          <div>
            <h1>Reports</h1>
            <p>Generate and download practice reports</p>
          </div>
        </header>

        <div className="dz-reports-filters">
          {CATEGORIES.map(c => (
            <button
              key={c}
              className={`dz-report-filter-btn${category === c ? " dz-report-filter-active" : ""}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="dz-reports-grid">
          {filtered.map(r => (
            <div key={r.id} className="dz-report-card">
              <div className="dz-report-card-icon">{r.icon}</div>
              <div className="dz-report-card-body">
                <div className="dz-report-card-title">{r.title}</div>
                <div className="dz-report-card-meta">
                  <span className="dz-report-category">{r.category}</span>
                  <span className="dz-report-date">{r.generated}</span>
                </div>
              </div>
              <div className="dz-report-card-actions">
                {r.status === "Ready" ? (
                  <button className="dz-report-download-btn" title="Download">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                  </button>
                ) : (
                  <span className="dz-report-generating">
                    <span className="dz-report-spinner" />
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
