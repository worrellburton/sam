import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Sidebar, useDzPrefs } from "./doczoc-dashboard";
import { PlatformBg } from "~/components/PlatformBg";
import { PATIENTS } from "~/data/patients";

const PAYER_BRANDS: Record<string, { color: string; initial: string; bg: string }> = {
  UnitedHealthcare: { color: "#fff", initial: "U", bg: "#002677" },
  Aetna: { color: "#fff", initial: "A", bg: "#7b2d8e" },
  Cigna: { color: "#fff", initial: "C", bg: "#e47e30" },
  "Blue Cross Blue Shield": { color: "#fff", initial: "BC", bg: "#0075c9" },
  Medicare: { color: "#fff", initial: "M", bg: "#003da5" },
};

function InsuranceLogo({ name }: { name: string }) {
  const brand = Object.entries(PAYER_BRANDS).find(([k]) => name.toLowerCase().includes(k.toLowerCase()))?.[1]
    || { color: "#fff", initial: name.charAt(0), bg: "#475569" };
  const domain = name.toLowerCase().includes("united") ? "uhc.com"
    : name.toLowerCase().includes("aetna") ? "aetna.com"
    : name.toLowerCase().includes("cigna") ? "cigna.com"
    : name.toLowerCase().includes("blue cross") ? "bcbs.com"
    : name.toLowerCase().includes("medicare") ? "medicare.gov"
    : null;
  const [imgFailed, setImgFailed] = useState(false);
  const logoUrl = domain ? `https://img.logo.dev/${domain}?token=pk_a8CO3SJdRhOFUZlNgTmVcQ&size=80&format=png` : null;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }} title={name}>
      {logoUrl && !imgFailed ? (
        <img
          src={logoUrl}
          alt={name}
          style={{ width: 28, height: 28, borderRadius: 6, objectFit: "contain", background: "#fff", padding: 2 }}
          onError={() => setImgFailed(true)}
        />
      ) : (
        <span style={{ display: "flex", width: 28, height: 28, borderRadius: 6, background: brand.bg, color: brand.color, alignItems: "center", justifyContent: "center", fontSize: "0.6rem", fontWeight: 800, flexShrink: 0 }}>{brand.initial}</span>
      )}
    </div>
  );
}

function PatientInitials({ name }: { name: string }) {
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2);
  const colors = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#14b8a6"];
  const idx = name.charCodeAt(0) % colors.length;
  return (
    <div style={{
      width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
      background: `${colors[idx]}18`, color: colors[idx],
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "0.7rem", fontWeight: 700,
    }}>{initials}</div>
  );
}

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
  const navigate = useNavigate();

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
        </header>

        {/* Search + view toggle in one row */}
        <div className="dz-toolbar-row">
          <input
            type="text"
            placeholder="Search patients..."
            className="dz-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 260 }}
          />
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

        {view === "table" ? (
          <div className="dz-table-wrap">
            <table className="dz-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Age</th>
                  <th>Condition</th>
                  <th className="dz-col-hide-lg" style={{ textAlign: "center" }}>Insurance</th>
                  <th className="dz-col-hide-lg">Phone</th>
                  <th className="dz-col-hide-xl">Email</th>
                  <th style={{ textAlign: "center" }}>Visits</th>
                  <th>Next Appt</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="dz-row-clickable" onClick={() => navigate(`/doczoc/patients/${p.id}`)}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <PatientInitials name={p.name} />
                        <div className="dz-table-name" style={{ fontSize: "0.78rem" }}>{p.name}</div>
                      </div>
                    </td>
                    <td style={{ fontSize: "0.75rem", textAlign: "center" }}>{p.age}</td>
                    <td style={{ fontSize: "0.75rem" }}>{p.condition}</td>
                    <td className="dz-col-hide-lg"><InsuranceLogo name={p.insurance} /></td>
                    <td className="dz-col-hide-lg" style={{ fontSize: "0.75rem" }}>{p.phone}</td>
                    <td className="dz-col-hide-xl" style={{ fontSize: "0.75rem" }}>{p.email}</td>
                    <td style={{ textAlign: "center" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 24, padding: "2px 6px", borderRadius: 6, fontSize: "0.68rem", fontWeight: 700, background: "rgba(99,102,241,0.1)", color: "#818cf8" }}>{p.visits.length}</span>
                    </td>
                    <td style={{ fontSize: "0.75rem" }}>{p.nextAppt}</td>
                    <td><span className={`dz-status-badge dz-status-${p.status.toLowerCase()}`}>{p.status}</span></td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={9} style={{ textAlign: "center", padding: 32, color: "#64748b" }}>No patients found</td></tr>
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
