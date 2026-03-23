import { useState } from "react";
import { Link } from "react-router";
import { Sidebar, useDzPrefs } from "./doczoc-dashboard";
import { PlatformBg } from "~/components/PlatformBg";
import { PATIENTS } from "~/data/patients";

export function meta() {
  return [{ title: "Patients | DocZoc" }];
}

function GridIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? "#818cf8" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}

function TableIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? "#818cf8" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function statusColor(status: string) {
  switch (status.toLowerCase()) {
    case "active": return "#22c55e";
    case "new": return "#6366f1";
    case "discharged": return "#f59e0b";
    default: return "#64748b";
  }
}

export default function PatientsPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"table" | "grid">("table");
  const { bgId } = useDzPrefs();

  const filtered = PATIENTS.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.condition.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dz-platform">
      <PlatformBg bgId={bgId} />
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className={`dz-platform-main${collapsed ? " dz-main-expanded" : ""}`}>
        <header className="dz-platform-header">
          <div>
            <h1>Patients</h1>
            <p>{PATIENTS.length} total patients</p>
          </div>
          <div className="dz-platform-header-right" style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div className="dz-view-toggle">
              <button
                className={`dz-view-btn${view === "table" ? " dz-view-active" : ""}`}
                onClick={() => setView("table")}
                title="Table view"
              >
                <TableIcon active={view === "table"} />
              </button>
              <button
                className={`dz-view-btn${view === "grid" ? " dz-view-active" : ""}`}
                onClick={() => setView("grid")}
                title="Grid view"
              >
                <GridIcon active={view === "grid"} />
              </button>
            </div>
          </div>
        </header>

        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
          <input
            type="text"
            placeholder="Search patients..."
            className="dz-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {view === "table" ? (
          <div className="dz-table-wrap">
            <table className="dz-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Condition</th>
                  <th>Contact</th>
                  <th>Last Visit</th>
                  <th>Next Appt</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <Link to={`/doczoc/patients/${p.id}`} className="dz-patient-link">
                        <div className="dz-table-name">{p.name}</div>
                      </Link>
                    </td>
                    <td>{p.age}</td>
                    <td>{p.condition}</td>
                    <td>
                      <div className="dz-table-sub">{p.phone}</div>
                      <div className="dz-table-sub">{p.email}</div>
                    </td>
                    <td>{p.lastVisit}</td>
                    <td>{p.nextAppt}</td>
                    <td><span className={`dz-status-badge dz-status-${p.status.toLowerCase()}`}>{p.status}</span></td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: "center", padding: 32, color: "#64748b" }}>No patients found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="dz-patients-grid">
            {filtered.map((p) => (
              <Link to={`/doczoc/patients/${p.id}`} key={p.id} className="dz-patient-card">
                <div className="dz-patient-card-header">
                  <div className="dz-patient-card-avatar">
                    {p.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <span className="dz-status-dot" style={{ background: statusColor(p.status) }} title={p.status} />
                </div>
                <div className="dz-patient-card-name">{p.name}</div>
                <div className="dz-patient-card-condition">{p.condition}</div>
                <div className="dz-patient-card-meta">
                  <div><span className="dz-patient-card-label">Age</span> {p.age}</div>
                  <div><span className="dz-patient-card-label">Next</span> {p.nextAppt}</div>
                </div>
                <div className="dz-patient-card-status">
                  <span className={`dz-status-badge dz-status-${p.status.toLowerCase()}`}>{p.status}</span>
                </div>
              </Link>
            ))}
            {filtered.length === 0 && (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 32, color: "#64748b" }}>No patients found</div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
