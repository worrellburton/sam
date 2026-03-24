import { useState, useRef, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { Sidebar, useDzPrefs } from "./doczoc-dashboard";
import { PlatformBg } from "~/components/PlatformBg";
import { PATIENTS, type Patient } from "~/data/patients";
import { useCrosshairFocusByKey, CrosshairToggle } from "~/hooks/useCrosshairFocus";

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
  const logoUrl = domain ? `https://cdn.brandfetch.io/${domain}/w/120/h/40/fallback/lettermark/theme/dark/format/svg?c=1id3n10pdBTarCHI0db` : null;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }} title={name}>
      {logoUrl && !imgFailed ? (
        <img
          src={logoUrl}
          alt={name}
          style={{ width: 50, height: 20, borderRadius: 3, objectFit: "contain" }}
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
      width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
      background: `${colors[idx]}18`, color: colors[idx],
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "0.6rem", fontWeight: 700,
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
  const [tableFocusMode, setTableFocusMode] = useState(false);
  const [subPage, setSubPage] = useState<"all" | "new">("all");
  const { bgId } = useDzPrefs();
  const navigate = useNavigate();

  const newCount = PATIENTS.filter(p => p.status.toLowerCase() === "new").length;

  const filtered = PATIENTS.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch = !q || p.name.toLowerCase().includes(q) ||
      p.condition.toLowerCase().includes(q) ||
      p.phone.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.insurance.toLowerCase().includes(q) ||
      p.status.toLowerCase().includes(q) ||
      String(p.age).includes(q) ||
      p.nextAppt.toLowerCase().includes(q);
    if (!matchesSearch) return false;
    if (subPage === "all") return true;
    return p.status.toLowerCase() === subPage;
  });

  return (
    <div className="dz-platform">
      <PlatformBg bgId={bgId} />
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className={`dz-platform-main${collapsed ? " dz-main-expanded" : ""}`}>
        <header className="dz-platform-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1>Patients</h1>
            <p>{PATIENTS.length} total patients</p>
          </div>
        </header>

        {/* Tab Navigation */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 20, borderBottom: "1px solid rgba(148,163,184,0.08)", paddingBottom: 0 }}>
          {([
            { key: "all" as const, label: "All", count: PATIENTS.length, color: "#6366f1", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
            { key: "new" as const, label: "New", count: newCount, color: "#22c55e", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg> },
          ]).map(tab => (
            <button key={tab.key} onClick={() => setSubPage(tab.key)} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "10px 18px", border: "none", cursor: "pointer",
              fontSize: "0.8rem", fontWeight: 600, background: "transparent",
              color: subPage === tab.key ? tab.color : "var(--dz-text-muted, #64748b)",
              borderBottom: subPage === tab.key ? `2px solid ${tab.color}` : "2px solid transparent",
              transition: "all 0.15s", marginBottom: -1,
            }}>
              {tab.icon}
              {tab.label}
              <span style={{
                fontSize: "0.65rem", fontWeight: 700, padding: "1px 6px", borderRadius: 10,
                background: subPage === tab.key ? `${tab.color}1e` : "rgba(148,163,184,0.08)",
                color: subPage === tab.key ? tab.color : "var(--dz-text-dim, #475569)",
              }}>{tab.count}</span>
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8,
            background: "var(--dz-input-bg)", border: "1px solid var(--dz-input-border)", flex: 1,
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--dz-text-dim)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search" style={{
              background: "transparent", border: "none", outline: "none", width: "100%",
              fontSize: "0.78rem", color: "var(--dz-text-secondary)",
            }} />
          </div>
          <CrosshairToggle active={tableFocusMode} onClick={() => setTableFocusMode(f => !f)} />
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
          <DraggablePatientTable patients={filtered} onRowClick={(id) => navigate(`/doczoc/patients/${id}`)} externalFocusMode={tableFocusMode} />
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

// ── Draggable Patient Table ──────────────────────────────────────────
type ColKey = "patient" | "nextAppt" | "condition" | "age" | "phone" | "email" | "insurance" | "visits";

const COL_HEADERS: Record<ColKey, { label: string; className?: string; style?: React.CSSProperties }> = {
  patient: { label: "Patient" },
  nextAppt: { label: "Next Appt" },
  condition: { label: "Procedure" },
  age: { label: "Age" },
  phone: { label: "Phone", className: "dz-col-hide-lg" },
  email: { label: "Email", className: "dz-col-hide-xl" },
  insurance: { label: "Insurance", className: "dz-col-hide-lg", style: { textAlign: "center" } },
  visits: { label: "Visits", style: { textAlign: "center" } },
};

const DEFAULT_COLS: ColKey[] = ["patient", "visits", "nextAppt", "condition", "age", "phone", "email", "insurance"];
const PATIENT_DATA_KEYS = new Set<ColKey>(["age", "visits"]);

function DraggablePatientTable({ patients, onRowClick, externalFocusMode }: { patients: Patient[]; onRowClick: (id: number) => void; externalFocusMode?: boolean }) {
  const [columns, setColumns] = useState<ColKey[]>(DEFAULT_COLS);
  const dragCol = useRef<number | null>(null);
  const dragOverCol = useRef<number | null>(null);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const crosshair = useCrosshairFocusByKey(columns, PATIENT_DATA_KEYS, externalFocusMode);
  const { focusMode, onCellEnter, onCellLeave, getCellStyle, getRowStyle } = crosshair;

  const handleDragStart = (idx: number) => { dragCol.current = idx; setDraggingIdx(idx); };
  const handleDragEnter = (idx: number) => { dragOverCol.current = idx; };
  const handleDragEnd = () => {
    if (dragCol.current !== null && dragOverCol.current !== null && dragCol.current !== dragOverCol.current) {
      setColumns(prev => {
        const copy = [...prev];
        const dragged = copy.splice(dragCol.current!, 1)[0];
        copy.splice(dragOverCol.current!, 0, dragged);
        return copy;
      });
    }
    dragCol.current = null; dragOverCol.current = null; setDraggingIdx(null);
  };

  const renderCell = (p: Patient, key: ColKey, colIdx: number) => {
    const rowId = String(p.id);
    const cellStyle = getCellStyle(rowId, colIdx);
    const handlers = { onMouseEnter: () => onCellEnter(rowId, colIdx), onMouseLeave: onCellLeave };
    switch (key) {
      case "patient": return (
        <td key={key} {...handlers} style={{ ...cellStyle, transition: "opacity 0.2s ease" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <PatientInitials name={p.name} />
            <div className="dz-table-name" style={{ fontSize: "0.78rem" }}>{p.name}</div>
          </div>
        </td>
      );
      case "age": return <td key={key} {...handlers} style={{ fontSize: "0.75rem", textAlign: "center", ...cellStyle, transition: "opacity 0.2s ease" }}>{p.age}</td>;
      case "condition": return <td key={key} {...handlers} style={{ fontSize: "0.75rem", ...cellStyle, transition: "opacity 0.2s ease" }}>{p.condition}</td>;
      case "insurance": return <td key={key} className="dz-col-hide-lg" {...handlers} style={{ ...cellStyle, transition: "opacity 0.2s ease" }}><InsuranceLogo name={p.insurance} /></td>;
      case "phone": return <td key={key} className="dz-col-hide-lg" {...handlers} style={{ fontSize: "0.75rem", ...cellStyle, transition: "opacity 0.2s ease" }}>{p.phone}</td>;
      case "email": return <td key={key} className="dz-col-hide-xl" {...handlers} style={{ fontSize: "0.75rem", ...cellStyle, transition: "opacity 0.2s ease" }}>{p.email}</td>;
      case "visits": return (
        <td key={key} {...handlers} style={{ textAlign: "center", ...cellStyle, transition: "opacity 0.2s ease" }}>
          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 24, padding: "2px 6px", borderRadius: 6, fontSize: "0.68rem", fontWeight: 700, background: "rgba(99,102,241,0.1)", color: "#818cf8" }}>{p.visits.length}</span>
        </td>
      );
      case "nextAppt": return <td key={key} {...handlers} style={{ fontSize: "0.75rem", ...cellStyle, transition: "opacity 0.2s ease" }}>{p.nextAppt}</td>;
      default: return <td key={key} />;
    }
  };

  return (
    <div>
      <div className="dz-table-wrap">
        <table className="dz-table">
          <thead>
            <tr>
              {columns.map((key, i) => {
                const h = COL_HEADERS[key];
                return (
                  <th
                    key={key}
                    className={h.className}
                    style={{ ...h.style, cursor: "grab", opacity: draggingIdx === i ? 0.4 : 1, transition: "opacity 0.15s", userSelect: "none" }}
                    draggable
                    onDragStart={() => handleDragStart(i)}
                    onDragEnter={() => handleDragEnter(i)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    {h.label}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p.id} className="dz-row-clickable" onClick={() => onRowClick(p.id)} style={getRowStyle(String(p.id))} onMouseEnter={() => onCellEnter(String(p.id), 0)} onMouseLeave={onCellLeave}>
                {columns.map((key, i) => renderCell(p, key, i))}
              </tr>
            ))}
            {patients.length === 0 && (
              <tr><td colSpan={columns.length} style={{ textAlign: "center", padding: 32, color: "#64748b" }}>No patients found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
