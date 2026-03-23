import { useState } from "react";
import { Link, useParams } from "react-router";
import { Sidebar, useDzPrefs } from "./doczoc-dashboard";
import { PlatformBg } from "~/components/PlatformBg";
import { TEAM, roleColor, statusColor } from "~/data/team";

export function meta() {
  return [{ title: "Team Member | DocZoc" }];
}

export default function TeamMemberPage() {
  const [collapsed, setCollapsed] = useState(false);
  const { bgId } = useDzPrefs();
  const { id } = useParams();
  const member = TEAM.find(m => m.id === Number(id));

  if (!member) {
    return (
      <div className="dz-platform">
        <PlatformBg bgId={bgId} />
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        <main className={`dz-platform-main${collapsed ? " dz-main-expanded" : ""}`}>
          <p style={{ color: "#94a3b8", textAlign: "center", paddingTop: 80 }}>Team member not found.</p>
        </main>
      </div>
    );
  }

  const rc = roleColor(member.role);
  const sc = statusColor(member.status);

  return (
    <div className="dz-platform">
      <PlatformBg bgId={bgId} />
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className={`dz-platform-main${collapsed ? " dz-main-expanded" : ""}`}>
        {/* Breadcrumb */}
        <div style={{ marginBottom: 20 }}>
          <Link to="/doczoc/team" style={{ color: "#818cf8", textDecoration: "none", fontSize: "0.82rem", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Back to Team
          </Link>
        </div>

        {/* Profile Header */}
        <div className="dz-tm-header">
          <div className="dz-tm-avatar" style={{ background: `${rc}20`, color: rc }}>
            {member.initials}
          </div>
          <div className="dz-tm-header-info">
            <h1 className="dz-tm-name">{member.name}</h1>
            <div className="dz-tm-role" style={{ color: rc }}>{member.role}</div>
            <div className="dz-tm-specialty">{member.specialty}</div>
          </div>
          <div className="dz-tm-status-area">
            <span className="dz-tm-status-badge" style={{ background: `${sc}18`, color: sc }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: sc, display: "inline-block" }} />
              {member.status}
            </span>
          </div>
        </div>

        <div className="dz-tm-grid">
          {/* Left Column */}
          <div className="dz-tm-col">
            {/* Bio */}
            <div className="dz-tm-card">
              <h3 className="dz-tm-card-title">About</h3>
              <p style={{ fontSize: "0.9rem", color: "#cbd5e1", lineHeight: 1.8, margin: 0 }}>{member.bio}</p>
            </div>

            {/* Education */}
            <div className="dz-tm-card">
              <h3 className="dz-tm-card-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 4 3 6 3s6-1 6-3v-5"/></svg>
                Education
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {member.education.map((e, i) => (
                  <div key={i} className="dz-tm-list-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    <span>{e}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className="dz-tm-card">
              <h3 className="dz-tm-card-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Certifications
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {member.certifications.map((c, i) => (
                  <div key={i} className="dz-tm-list-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="dz-tm-col">
            {/* Contact Info */}
            <div className="dz-tm-card">
              <h3 className="dz-tm-card-title">Contact Information</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div className="dz-tm-contact-row">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/></svg>
                  <div>
                    <div className="dz-tm-contact-label">Email</div>
                    <a href={`mailto:${member.email}`} className="dz-tm-contact-value">{member.email}</a>
                  </div>
                </div>
                <div className="dz-tm-contact-row">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  <div>
                    <div className="dz-tm-contact-label">Phone</div>
                    <a href={`tel:${member.phone}`} className="dz-tm-contact-value">{member.phone}</a>
                  </div>
                </div>
                <div className="dz-tm-contact-row">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <div>
                    <div className="dz-tm-contact-label">Location</div>
                    <div className="dz-tm-contact-value">{member.location}</div>
                  </div>
                </div>
                <div className="dz-tm-contact-row">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  <div>
                    <div className="dz-tm-contact-label">Schedule</div>
                    <div className="dz-tm-contact-value">{member.schedule}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Languages */}
            <div className="dz-tm-card">
              <h3 className="dz-tm-card-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                Languages
              </h3>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {member.languages.map((l, i) => (
                  <span key={i} style={{ padding: "5px 14px", borderRadius: 8, background: "rgba(99,102,241,0.1)", color: "#a5b4fc", fontSize: "0.82rem", fontWeight: 600 }}>{l}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
