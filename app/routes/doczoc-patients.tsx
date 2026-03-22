import { useState } from "react";
import { Link } from "react-router";
import { Sidebar, useDzPrefs } from "./doczoc-dashboard";
import { PlatformBg } from "~/components/PlatformBg";
import { PATIENTS } from "~/data/patients";

export function meta() {
  return [{ title: "Patients | DocZoc" }];
}

export default function PatientsPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");
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
          <div className="dz-platform-header-right">
            <input
              type="text"
              placeholder="Search patients..."
              className="dz-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </header>

        <div className="dz-table-wrap">
          <table className="dz-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Age</th>
                <th>Condition</th>
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
                      <div className="dz-table-sub">{p.email}</div>
                    </Link>
                  </td>
                  <td>{p.age}</td>
                  <td>{p.condition}</td>
                  <td>{p.lastVisit}</td>
                  <td>{p.nextAppt}</td>
                  <td><span className={`dz-status-badge dz-status-${p.status.toLowerCase()}`}>{p.status}</span></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: 32, color: "#64748b" }}>No patients found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
