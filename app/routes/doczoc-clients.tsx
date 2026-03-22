import { useState } from "react";
import { Sidebar } from "./doczoc-dashboard";

export function meta() {
  return [{ title: "Clients | DocZoc" }];
}

const CLIENTS = [
  { id: 1, name: "NY Jets", type: "Sports Team", contacts: 3, patients: 45, status: "Active", since: "Jan 2024" },
  { id: 2, name: "NY Islanders", type: "Sports Team", contacts: 2, patients: 38, status: "Active", since: "Mar 2024" },
  { id: 3, name: "Greenwich Village Clinic", type: "Referring Practice", contacts: 4, patients: 120, status: "Active", since: "Jun 2022" },
  { id: 4, name: "Upper East Side Ortho", type: "Referring Practice", contacts: 2, patients: 67, status: "Active", since: "Sep 2023" },
  { id: 5, name: "Brooklyn Heights PT", type: "Physical Therapy", contacts: 3, patients: 89, status: "Active", since: "Feb 2023" },
  { id: 6, name: "Metro Insurance Group", type: "Insurance", contacts: 1, patients: 210, status: "Active", since: "Jan 2022" },
  { id: 7, name: "Aetna PPO Network", type: "Insurance", contacts: 1, patients: 185, status: "Active", since: "Apr 2022" },
  { id: 8, name: "Scarsdale Sports Med", type: "Referring Practice", contacts: 2, patients: 34, status: "Inactive", since: "Aug 2024" },
];

export default function ClientsPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = CLIENTS.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dz-platform">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className={`dz-platform-main${collapsed ? " dz-main-expanded" : ""}`}>
        <header className="dz-platform-header">
          <div>
            <h1>Clients</h1>
            <p>{CLIENTS.length} organizations</p>
          </div>
          <div className="dz-platform-header-right">
            <input
              type="text"
              placeholder="Search clients..."
              className="dz-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </header>

        <div className="dz-clients-grid">
          {filtered.map((c) => (
            <div key={c.id} className="dz-client-card">
              <div className="dz-client-card-header">
                <div className="dz-client-avatar">{c.name.charAt(0)}</div>
                <div>
                  <div className="dz-client-name">{c.name}</div>
                  <div className="dz-client-type">{c.type}</div>
                </div>
              </div>
              <div className="dz-client-stats">
                <div className="dz-client-stat">
                  <span className="dz-client-stat-num">{c.patients}</span>
                  <span className="dz-client-stat-label">Patients</span>
                </div>
                <div className="dz-client-stat">
                  <span className="dz-client-stat-num">{c.contacts}</span>
                  <span className="dz-client-stat-label">Contacts</span>
                </div>
              </div>
              <div className="dz-client-footer">
                <span className={`dz-status-badge dz-status-${c.status.toLowerCase()}`}>{c.status}</span>
                <span className="dz-client-since">Since {c.since}</span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 32, color: "#64748b" }}>No clients found</div>
          )}
        </div>
      </main>
    </div>
  );
}
