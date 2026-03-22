import { useState } from "react";
import { Sidebar, useDzPrefs } from "./doczoc-dashboard";
import { PlatformBg } from "~/components/PlatformBg";
import { useApiStatus } from "~/hooks/useApiStatus";
import type { ApiStatus } from "~/hooks/useApiStatus";

export function meta() {
  return [{ title: "Clients | DocZoc" }];
}

// Map client names to Brandfetch domains for logo resolution
const CLIENT_LOGOS: Record<string, string> = {
  "NY Jets": "newyorkjets.com",
  "NY Islanders": "newyorkislanders.com",
  "Greenwich Village Clinic": "",
  "Upper East Side Ortho": "",
  "Brooklyn Heights PT": "",
  "Metro Insurance Group": "",
  "Aetna PPO Network": "aetna.com",
  "Scarsdale Sports Med": "",
};

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

function ClientLogo({ name }: { name: string }) {
  const domain = CLIENT_LOGOS[name];
  if (!domain) {
    return <div className="dz-client-avatar">{name.charAt(0)}</div>;
  }
  return (
    <div className="dz-client-avatar" style={{ overflow: "hidden", padding: 0, background: "#1e1e2e" }}>
      <img
        src={`https://cdn.brandfetch.io/${domain}/w/80/h/80/fallback/lettermark/type/icon?c=1id3n10pdBTarCHI0db`}
        alt={name}
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
        loading="lazy"
        onError={(e) => {
          const el = e.target as HTMLImageElement;
          el.style.display = "none";
          if (el.parentElement) {
            el.parentElement.textContent = name.charAt(0);
            el.parentElement.style.display = "flex";
            el.parentElement.style.alignItems = "center";
            el.parentElement.style.justifyContent = "center";
          }
        }}
      />
    </div>
  );
}

// ── API Status Dot (compact version for clients page) ──────────────
function ApiDot({ api }: { api: ApiStatus }) {
  const colorMap: Record<string, string> = {
    checking: "#fbbf24",
    connected: "#22c55e",
    degraded: "#f59e0b",
    offline: "#ef4444",
  };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }} title={`${api.name}: ${api.status}${api.latency ? ` (${api.latency}ms)` : ""}`}>
      <span style={{
        width: 7, height: 7, borderRadius: "50%",
        background: colorMap[api.status],
        boxShadow: api.status === "connected" ? `0 0 5px ${colorMap[api.status]}` : "none",
        display: "inline-block",
        animation: api.status === "checking" ? "pulse 1.5s ease-in-out infinite" : "none",
      }} />
      <span style={{ fontSize: "0.68rem", color: "#8a8a9a" }}>{api.name}</span>
    </div>
  );
}

export default function ClientsPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const { bgId } = useDzPrefs();
  const { statuses } = useApiStatus();

  // Just show Brandfetch status on clients page
  const brandfetchStatus = statuses.find((s) => s.name === "Brandfetch");

  const filtered = CLIENTS.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dz-platform">
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
      <PlatformBg bgId={bgId} />
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className={`dz-platform-main${collapsed ? " dz-main-expanded" : ""}`}>
        <header className="dz-platform-header">
          <div>
            <h1>Clients</h1>
            <p>{CLIENTS.length} organizations</p>
          </div>
          <div className="dz-platform-header-right" style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {brandfetchStatus && <ApiDot api={brandfetchStatus} />}
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
                <ClientLogo name={c.name} />
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
