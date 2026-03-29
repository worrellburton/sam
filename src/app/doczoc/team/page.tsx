"use client";
import { useState } from "react";
import Link from "next/link";
import { Sidebar, useDzPrefs } from "../dashboard/page";
import { PlatformBg } from "@/components/PlatformBg";
import { TEAM, roleColor, statusColor } from "@/data/team";


const ROLES = ["All", "Physician", "Nurse"];

export default function TeamPage() {
  const [collapsed, setCollapsed] = useState(false);
  const { bgId } = useDzPrefs();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [roleFilter, setRoleFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = TEAM.filter(m => {
    if (roleFilter !== "All" && m.role !== roleFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!m.name.toLowerCase().includes(q) && !m.role.toLowerCase().includes(q) && !m.specialty.toLowerCase().includes(q) && !m.email.toLowerCase().includes(q) && !m.phone.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="dz-platform">
      <PlatformBg bgId={bgId} />
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className={`dz-platform-main${collapsed ? " dz-main-expanded" : ""}`}>
        <header className="dz-platform-header">
          <div>
            <h1>Team</h1>
            <p>{TEAM.length} team members</p>
          </div>
          <div className="dz-platform-header-right" style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button className="dz-add-btn" onClick={() => {}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Team Member
            </button>
          </div>
        </header>

        <div className="dz-toolbar-row">
          <div className="dz-toolbar-left" style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <div className="dz-reports-filters" style={{ marginBottom: 0 }}>
              {ROLES.map(r => (
                <button
                  key={r}
                  className={`dz-report-filter-btn${roleFilter === r ? " dz-report-filter-active" : ""}`}
                  onClick={() => setRoleFilter(r)}
                >{r}</button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Search"
              className="dz-search-input"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ maxWidth: 220 }}
            />
          </div>
          <div className="dz-view-toggle">
            <button className={`dz-view-btn${view === "list" ? " dz-view-active" : ""}`} onClick={() => setView("list")} title="List view">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={view === "list" ? "#818cf8" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <button className={`dz-view-btn${view === "grid" ? " dz-view-active" : ""}`} onClick={() => setView("grid")} title="Grid view">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={view === "grid" ? "#818cf8" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
              </svg>
            </button>
          </div>
        </div>

        {view === "grid" ? (
          <div className="dz-team-grid">
            {filtered.map(m => (
              <Link href={`/doczoc/team/${m.id}`} key={m.id} className="dz-team-card" style={{ textDecoration: "none", color: "inherit" }}>
                <div className="dz-team-card-top">
                  <div className="dz-team-avatar" style={{ background: `${roleColor(m.role)}20`, color: roleColor(m.role) }}>
                    {m.initials}
                  </div>
                  <span className="dz-status-dot" style={{ background: statusColor(m.status) }} title={m.status} />
                </div>
                <div className="dz-team-card-name">{m.name}</div>
                <div className="dz-team-card-role" style={{ color: roleColor(m.role) }}>{m.role}</div>
                <div className="dz-team-card-specialty">{m.specialty}</div>
                <div className="dz-team-card-details">
                  <div>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    <span>{m.location}</span>
                  </div>
                  <div>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    <span>{m.schedule}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="dz-table-wrap">
            <table className="dz-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Specialty</th>
                  <th>Location</th>
                  <th>Schedule</th>
                  <th>Contact</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(m => (
                  <tr key={m.id}>
                    <td>
                      <Link href={`/doczoc/team/${m.id}`} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "inherit" }}>
                        <div className="dz-team-avatar-sm" style={{ background: `${roleColor(m.role)}20`, color: roleColor(m.role) }}>
                          {m.initials}
                        </div>
                        <span className="dz-table-name">{m.name}</span>
                      </Link>
                    </td>
                    <td><span style={{ color: roleColor(m.role), fontWeight: 600, fontSize: "0.82rem" }}>{m.role}</span></td>
                    <td style={{ color: "#94a3b8", fontSize: "0.82rem" }}>{m.specialty}</td>
                    <td style={{ color: "#94a3b8" }}>{m.location}</td>
                    <td style={{ color: "#94a3b8" }}>{m.schedule}</td>
                    <td>
                      <div className="dz-table-sub">{m.phone}</div>
                      <div className="dz-table-sub">{m.email}</div>
                    </td>
                    <td>
                      <span style={{ display: "inline-block", padding: "4px 12px", borderRadius: 8, fontSize: "0.75rem", fontWeight: 700, background: `${statusColor(m.status)}18`, color: statusColor(m.status) }}>
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
