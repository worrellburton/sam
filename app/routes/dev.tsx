import { useState } from "react";
import { Link } from "react-router";

export function meta() {
  return [
    { title: "Components | Dev Tools" },
    { name: "robots", content: "noindex, nofollow" },
  ];
}

interface ComponentProp {
  name: string;
  type: string;
  default: string;
  desc: string;
}

interface DevComponent {
  name: string;
  file: string;
  category: string;
  description: string;
  usedBy: string[];
  usageCount: number;
  props: ComponentProp[];
  code: string;
  preview: string;
}

const COMPONENTS: DevComponent[] = [
  {
    name: "Navigation",
    file: "app/components/Navigation.tsx",
    category: "Navigation",
    description: "Full site navigation with mega menu, theme toggle, mobile responsive. Integrated into root layout.",
    usedBy: ["root.tsx", "All pages via layout"],
    usageCount: 12,
    props: [{ name: "N/A", type: "—", default: "—", desc: "No props — uses hooks internally" }],
    code: 'import { Navigation } from "~/components/Navigation";\n\n<Navigation />',
    preview: "Renders full navigation bar with mega menu",
  },
  {
    name: "Sticky Bottom Bar",
    file: "app/components/StickyBar.tsx",
    category: "Navigation",
    description: "Fixed bottom bar with Google rating (4.8/5), credentials marquee, and Book Now button. Shows on scroll.",
    usedBy: ["root.tsx"],
    usageCount: 1,
    props: [],
    code: 'import { StickyBar } from "~/components/StickyBar";\n\n<StickyBar />',
    preview: "Fixed bar at bottom with rating + marquee",
  },
  {
    name: "Get Started CTA",
    file: "app/components/GetStarted.tsx",
    category: "CTA",
    description: '"Ready to Move Without Pain?" call-to-action section with benefits list and Zocdoc booking card.',
    usedBy: ["home.tsx", "about.tsx", "contact.tsx", "reviews.tsx", "faq.tsx", "service.tsx"],
    usageCount: 6,
    props: [],
    code: 'import { GetStarted } from "~/components/GetStarted";\n\n<GetStarted />',
    preview: "CTA section with Book Online card",
  },
  {
    name: "Locations",
    file: "app/components/Locations.tsx",
    category: "Data Display",
    description: "3 office locations with interactive Google Maps (dark/light theme), lazy-loaded via IntersectionObserver.",
    usedBy: ["home.tsx", "contact.tsx", "service.tsx"],
    usageCount: 3,
    props: [],
    code: 'import { Locations } from "~/components/Locations";\n\n<Locations />',
    preview: "3 map cards with Google Maps integration",
  },
  {
    name: "Footer",
    file: "app/components/Footer.tsx",
    category: "Layout",
    description: "Site footer with column layout, social links, service links, and copyright. Rendered in root layout.",
    usedBy: ["root.tsx"],
    usageCount: 1,
    props: [],
    code: 'import { Footer } from "~/components/Footer";\n\n<Footer />',
    preview: "Footer with column links + copyright",
  },
  {
    name: "Google Reviews Carousel",
    file: "app/routes/home.tsx (inline)",
    category: "Data Display",
    description: "Fetches and displays Google reviews from Places API. Shows cards with avatars, ratings, and review text.",
    usedBy: ["home.tsx"],
    usageCount: 1,
    props: [{ name: "PLACES_API_KEY", type: "string", default: "embedded", desc: "Google Places API key" }],
    code: "// Uses useGoogleReviews() hook\n// Fetches from 3 Place IDs (UES, West Village, Brooklyn)",
    preview: "Review cards with Google API integration",
  },
  {
    name: "Insurance Grid",
    file: "app/routes/home.tsx (inline)",
    category: "Data Display",
    description: "Grid of insurance provider cards with real logos via Clearbit. Shows 6 providers + '200+ more' card.",
    usedBy: ["home.tsx"],
    usageCount: 1,
    props: [],
    code: '<div className="insurance-grid">...</div>',
    preview: '6 insurance logos + "200+ more" card',
  },
  {
    name: "Booking Calendar",
    file: "app/routes/book.tsx",
    category: "Interactive",
    description: "Full booking calendar with date/time selection, patient type toggle, visit type dropdown, location picker.",
    usedBy: ["book.tsx"],
    usageCount: 1,
    props: [],
    code: "// Two-stage animated booking flow\n// Centered form -> Sidebar + Calendar layout",
    preview: "Calendar with time slots + appointment booking",
  },
];

const NAV_CONFIG = [
  {
    section: "Inspect",
    items: [
      { name: "Components", path: "/dev", icon: "grid" },
    ],
  },
  {
    section: "Lab",
    items: [
      { name: "Backgrounds", path: "/webgl", icon: "zap" },
    ],
  },
];

const ICONS: Record<string, string> = {
  grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
  map: '<polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>',
  palette: '<circle cx="13.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="10.5" r="2.5"/><circle cx="8.5" cy="7.5" r="2.5"/><circle cx="6.5" cy="12" r="2.5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>',
  zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>',
  database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>',
  activity: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
  code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
  chevronLeft: '<polyline points="15 18 9 12 15 6"/>',
};

function DevIcon({ name, size = 18 }: { name: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      dangerouslySetInnerHTML={{ __html: ICONS[name] || "" }}
    />
  );
}

export default function DevPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [expandedCode, setExpandedCode] = useState<Set<number>>(new Set());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const categories = ["All", ...Array.from(new Set(COMPONENTS.map((c) => c.category)))];

  const filtered = COMPONENTS.filter((c) => {
    const catMatch = activeCategory === "All" || c.category === activeCategory;
    const searchMatch = !searchQuery || c.name.toLowerCase().includes(searchQuery) || c.description.toLowerCase().includes(searchQuery);
    return catMatch && searchMatch;
  });

  const total = COMPONENTS.length;
  const extracted = COMPONENTS.filter((c) => c.file.startsWith("app/components/")).length;
  const inline = total - extracted;
  const totalUsage = COMPONENTS.reduce((sum, c) => sum + c.usageCount, 0);

  const toggleCode = (i: number) => {
    setExpandedCode((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <div className="dev-layout">
      {/* Sidebar */}
      <aside className={`dev-sidebar${sidebarCollapsed ? " collapsed" : ""}`}>
        <div className="dev-sidebar-header">
          <Link to="/dev" className="dev-logo">
            <span className="dev-logo-icon">&#9670;</span>
            <span className="dev-logo-text">SamMD Dev Tools</span>
          </Link>
          <button className="dev-collapse-btn" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            <DevIcon name="chevronLeft" size={16} />
          </button>
        </div>
        {NAV_CONFIG.map((section) => (
          <div className="dev-nav-section" key={section.section}>
            <div className="dev-nav-section-label">{section.section}</div>
            {section.items.map((item) => (
              <Link to={item.path} key={item.name} className={`dev-nav-item${item.name === "Components" ? " active" : ""}`} title={item.name}>
                <span className="dev-nav-icon"><DevIcon name={item.icon} /></span>
                <span className="dev-nav-label">{item.name}</span>
              </Link>
            ))}
          </div>
        ))}
        <div className="dev-sidebar-footer">
          <span className="dev-badge">DEV</span>
          <span className="dev-version">v1.0.0</span>
        </div>
      </aside>

      {/* Top bar */}
      <div className="dev-topbar">
        <span className="dev-badge">DEV</span>
        <Link to="/" className="dev-back-link">Back to site &rarr;</Link>
      </div>

      {/* Main content */}
      <div className="dev-main">
        <div className="dev-page-header">
          <h1>Components</h1>
          <p>All reusable components in the SamMD codebase</p>
        </div>

        {/* Stats */}
        <div className="dev-stats">
          <div className="dev-stat"><div className="dev-stat-value">{total}</div><div className="dev-stat-label">Total Components</div></div>
          <div className="dev-stat"><div className="dev-stat-value">{extracted}</div><div className="dev-stat-label">Extracted (TSX files)</div></div>
          <div className="dev-stat"><div className="dev-stat-value">{inline}</div><div className="dev-stat-label">Inline (in routes)</div></div>
          <div className="dev-stat"><div className="dev-stat-value">{totalUsage}</div><div className="dev-stat-label">Total Usages</div></div>
        </div>

        {/* Search */}
        <div className="dev-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input type="text" placeholder="Search components..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value.toLowerCase())} />
        </div>

        {/* Filters */}
        <div className="dev-filters">
          {categories.map((cat) => (
            <button key={cat} className={`dev-chip${activeCategory === cat ? " active" : ""}`} onClick={() => setActiveCategory(cat)}>
              {cat}
            </button>
          ))}
        </div>

        {/* View toggle */}
        <div className="dev-view-bar">
          <span className="dev-result-count">{filtered.length} component{filtered.length !== 1 ? "s" : ""}</span>
          <div className="dev-view-toggle">
            <button className={`dev-view-btn${viewMode === "grid" ? " active" : ""}`} onClick={() => setViewMode("grid")}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
              Grid
            </button>
            <button className={`dev-view-btn${viewMode === "list" ? " active" : ""}`} onClick={() => setViewMode("list")}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
              List
            </button>
          </div>
        </div>

        {/* Component grid */}
        <div className={`dev-comp-grid${viewMode === "list" ? " list-view" : ""}`}>
          {filtered.length === 0 ? (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px", color: "var(--dev-text-dim)" }}>No components match your search.</div>
          ) : (
            filtered.map((c, i) => (
              <div className="dev-comp-card" key={c.name}>
                <div className="dev-comp-card-header">
                  <div>
                    <div className="dev-comp-name">{c.name}</div>
                    <div className="dev-comp-path" onClick={() => { navigator.clipboard.writeText(c.file); }}>{c.file}</div>
                  </div>
                  {viewMode === "list" && <div className="dev-comp-desc-inline">{c.description}</div>}
                  <div className="dev-comp-badges">
                    <span className="dev-comp-badge usage">{c.usageCount}x</span>
                    <span className="dev-comp-badge category">{c.category}</span>
                  </div>
                </div>
                <div className="dev-comp-preview">{c.preview}</div>
                <div className="dev-comp-details">
                  <p style={{ fontSize: "0.8rem", color: "var(--dev-text-muted)", marginBottom: "12px" }}>{c.description}</p>
                  {c.props.length > 0 && (
                    <>
                      <div className="dev-comp-section-label">Props</div>
                      <table style={{ width: "100%", fontSize: "0.75rem", borderCollapse: "collapse", marginBottom: "12px" }}>
                        <thead>
                          <tr style={{ color: "var(--dev-text-dim)", textAlign: "left" }}>
                            <th style={{ padding: "4px 8px" }}>Name</th>
                            <th style={{ padding: "4px 8px" }}>Type</th>
                            <th style={{ padding: "4px 8px" }}>Default</th>
                          </tr>
                        </thead>
                        <tbody>
                          {c.props.map((p) => (
                            <tr key={p.name} style={{ borderTop: "1px solid var(--dev-border)" }}>
                              <td style={{ padding: "4px 8px" }}><code style={{ color: "var(--dev-primary)" }}>{p.name}</code></td>
                              <td style={{ padding: "4px 8px", color: "var(--dev-text-dim)" }}>{p.type}</td>
                              <td style={{ padding: "4px 8px", color: "var(--dev-text-dim)" }}>{p.default}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  )}
                  <div className="dev-comp-section-label">Used By</div>
                  <div className="dev-comp-used-by">
                    {c.usedBy.slice(0, 6).map((f) => <code key={f}>{f}</code>)}
                    {c.usedBy.length > 6 && <span style={{ color: "var(--dev-text-dim)" }}>+{c.usedBy.length - 6} more</span>}
                  </div>
                  <div style={{ marginTop: "12px" }}>
                    <button className="dev-toggle-btn" onClick={() => toggleCode(i)}>
                      <DevIcon name="code" size={12} /> {expandedCode.has(i) ? "Hide Code" : "View Code"}
                    </button>
                  </div>
                  <div className={`dev-code-block${expandedCode.has(i) ? " visible" : ""}`}>{c.code}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
