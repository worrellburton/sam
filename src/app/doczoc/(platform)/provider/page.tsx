"use client";

const PROVIDER = {
  name: "Sameh Elguizaoui, M.D.",
  specialty: "Orthopedic Surgery & Sports Medicine",
  npiType1: "1234567890",
  npiType2: "9876543210",
  taxId: "83-1234567",
  taxonomy: "207X00000X — Orthopedic Surgery",
  licenseNY: "NY-298451",
  deaNumber: "BE1234567",
  medicareId: "G1234567",
  medicaidId: "NY-0987654",
};

const BILLING_ENTITY = {
  name: "Elguizaoui Orthopedics PLLC",
  npiType2: "9876543210",
  taxId: "83-1234567",
  address: "535 East 70th St, Suite 4N, New York, NY 10021",
  phone: "(212) 555-0100",
  contactPerson: "Billing Dept.",
};

const REFERRING_PROVIDERS = [
  { name: "Dr. Alan Kessler", specialty: "Primary Care", npi: "1122334455", phone: "(212) 555-0210" },
  { name: "Dr. Rosa Mendez", specialty: "Sports Medicine", npi: "2233445566", phone: "(718) 555-0322" },
  { name: "Dr. Thomas Park", specialty: "Rheumatology", npi: "3344556677", phone: "(917) 555-0445" },
  { name: "Dr. Lisa Freedman", specialty: "Primary Care", npi: "4455667788", phone: "(718) 555-0512" },
  { name: "Dr. William Hart", specialty: "Rheumatology", npi: "5566778899", phone: "(914) 555-0630" },
];

const FACILITIES = [
  { name: "Manhattan Surgical Center", type: "ASC", pos: "24", npi: "1111222233", address: "535 East 70th St, New York, NY 10021", phone: "(212) 555-0100" },
  { name: "NYP/Weill Cornell — OR Suite", type: "Hospital Outpatient", pos: "22", npi: "2222333344", address: "525 East 68th St, New York, NY 10065", phone: "(212) 555-0200" },
  { name: "Brooklyn Orthopedic Surgery Center", type: "ASC", pos: "24", npi: "3333444455", address: "250 Livingston St, Brooklyn, NY 11201", phone: "(718) 555-0300" },
  { name: "Office — Manhattan", type: "Office", pos: "11", npi: "—", address: "535 East 70th St, Suite 4N, New York, NY 10021", phone: "(212) 555-0100" },
  { name: "Office — Brooklyn", type: "Office", pos: "11", npi: "—", address: "250 Livingston St, Suite 2A, Brooklyn, NY 11201", phone: "(718) 555-0300" },
  { name: "Office — Scarsdale", type: "Office", pos: "11", npi: "—", address: "77 Park Ave, Scarsdale, NY 10583", phone: "(914) 555-0400" },
];

function InfoField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "6px 0", borderBottom: "1px solid rgba(148,163,184,0.06)" }}>
      <span style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 600 }}>{label}</span>
      <span style={{
        fontSize: "0.88rem", fontWeight: 600, color: "#f1f5f9", textAlign: "right", maxWidth: "60%",
        fontFamily: mono ? "'SF Mono', Consolas, monospace" : "inherit",
      }}>
        {value}
      </span>
    </>
  );
}

export default function ProviderInfoPage() {
  return (
    <>
                  <main className="dz-platform-main">
        <header className="dz-platform-header">
          <div>
            <h1>Provider Information</h1>
            <p>NPI, Tax ID, facilities, and referring provider details</p>
          </div>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 18 }}>
          {/* Rendering Provider */}
          <div className="dz-card">
            <div className="dz-card-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              Rendering Provider
            </div>
            <InfoField label="Name" value={PROVIDER.name} />
            <InfoField label="Specialty" value={PROVIDER.specialty} />
            <InfoField label="NPI (Type 1 — Individual)" value={PROVIDER.npiType1} mono />
            <InfoField label="Taxonomy Code" value={PROVIDER.taxonomy} mono />
            <InfoField label="NY License" value={PROVIDER.licenseNY} mono />
            <InfoField label="DEA Number" value={PROVIDER.deaNumber} mono />
            <InfoField label="Medicare PTAN" value={PROVIDER.medicareId} mono />
            <InfoField label="Medicaid ID" value={PROVIDER.medicaidId} mono />
          </div>

          {/* Billing Entity */}
          <div className="dz-card">
            <div className="dz-card-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
              Billing Entity
            </div>
            <InfoField label="Organization" value={BILLING_ENTITY.name} />
            <InfoField label="NPI (Type 2 — Org)" value={BILLING_ENTITY.npiType2} mono />
            <InfoField label="Tax ID (EIN)" value={BILLING_ENTITY.taxId} mono />
            <InfoField label="Address" value={BILLING_ENTITY.address} />
            <InfoField label="Phone" value={BILLING_ENTITY.phone} />
            <InfoField label="Contact" value={BILLING_ENTITY.contactPerson} />
          </div>
        </div>

        {/* Facilities */}
        <div style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--dz-text-primary)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Facilities & Place of Service
          </h2>
          <div className="dz-table-wrap">
            <table className="dz-table">
              <thead>
                <tr>
                  <th>Facility</th>
                  <th>Type</th>
                  <th>POS Code</th>
                  <th>NPI</th>
                  <th>Address</th>
                  <th>Phone</th>
                </tr>
              </thead>
              <tbody>
                {FACILITIES.map((f, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600, color: "var(--dz-text-secondary)" }}>{f.name}</td>
                      <td>
                        <span style={{
                          display: "inline-block", padding: "3px 10px", borderRadius: 6,
                          fontSize: "0.72rem", fontWeight: 700,
                          background: f.type === "ASC" ? "rgba(168,85,247,0.12)" : f.type === "Hospital Outpatient" ? "rgba(59,130,246,0.12)" : "rgba(34,197,94,0.12)",
                          color: f.type === "ASC" ? "#a855f7" : f.type === "Hospital Outpatient" ? "#60a5fa" : "#22c55e",
                        }}>
                          {f.type}
                        </span>
                      </td>
                      <td style={{ fontFamily: "'SF Mono', Consolas, monospace", fontWeight: 700, color: "#818cf8" }}>{f.pos}</td>
                      <td style={{ fontFamily: "'SF Mono', Consolas, monospace", fontSize: "0.82rem" }}>{f.npi}</td>
                      <td style={{ fontSize: "0.82rem", maxWidth: 220 }}>{f.address}</td>
                      <td style={{ fontSize: "0.82rem" }}>{f.phone}</td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Referring Providers */}
        <div style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--dz-text-primary)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
            Referring Providers
          </h2>
          <div className="dz-table-wrap">
            <table className="dz-table">
              <thead>
                <tr>
                  <th>Provider</th>
                  <th>Specialty</th>
                  <th>NPI</th>
                  <th>Phone</th>
                </tr>
              </thead>
              <tbody>
                {REFERRING_PROVIDERS.map((r, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600, color: "var(--dz-text-secondary)" }}>{r.name}</td>
                      <td>{r.specialty}</td>
                      <td style={{ fontFamily: "'SF Mono', Consolas, monospace", fontSize: "0.82rem", color: "#818cf8" }}>{r.npi}</td>
                      <td>{r.phone}</td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
