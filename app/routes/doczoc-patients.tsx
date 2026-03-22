import { useState } from "react";
import { Link } from "react-router";
import { Sidebar, useDzPrefs } from "./doczoc-dashboard";
import { PlatformBg } from "~/components/PlatformBg";

export function meta() {
  return [{ title: "Patients | DocZoc" }];
}

const PATIENTS = [
  { id: 1, name: "Sarah Mitchell", age: 34, phone: "(917) 555-0142", email: "sarah.m@email.com", lastVisit: "Mar 18, 2026", nextAppt: "Mar 25, 2026", condition: "Rotator Cuff Tear", status: "Active" },
  { id: 2, name: "James Kim", age: 28, phone: "(212) 555-0198", email: "j.kim@email.com", lastVisit: "Mar 20, 2026", nextAppt: "Mar 22, 2026", condition: "ACL Injury", status: "New" },
  { id: 3, name: "Maria Lopez", age: 45, phone: "(718) 555-0167", email: "m.lopez@email.com", lastVisit: "Mar 15, 2026", nextAppt: "Apr 1, 2026", condition: "Post-Op ACL", status: "Active" },
  { id: 4, name: "David Ross", age: 52, phone: "(917) 555-0203", email: "d.ross@email.com", lastVisit: "Mar 10, 2026", nextAppt: "Mar 24, 2026", condition: "Hip Replacement Consult", status: "Active" },
  { id: 5, name: "Emily Chen", age: 31, phone: "(646) 555-0119", email: "e.chen@email.com", lastVisit: "Mar 12, 2026", nextAppt: "Mar 26, 2026", condition: "Wrist Fracture", status: "Active" },
  { id: 6, name: "Michael Brown", age: 22, phone: "(917) 555-0187", email: "m.brown@email.com", lastVisit: "Mar 19, 2026", nextAppt: "Apr 2, 2026", condition: "Ankle Sprain", status: "New" },
  { id: 7, name: "Lisa Strassberg", age: 41, phone: "(718) 555-0234", email: "l.strassberg@email.com", lastVisit: "Feb 28, 2026", nextAppt: "Mar 28, 2026", condition: "Knee Arthroscopy Follow-up", status: "Active" },
  { id: 8, name: "Robert Taylor", age: 67, phone: "(212) 555-0156", email: "r.taylor@email.com", lastVisit: "Mar 5, 2026", nextAppt: "-", condition: "Shoulder Replacement", status: "Discharged" },
];

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
                    <div className="dz-table-name">{p.name}</div>
                    <div className="dz-table-sub">{p.email}</div>
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
