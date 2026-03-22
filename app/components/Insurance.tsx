const carriers = [
  { name: "BlueCross BlueShield", domain: "bcbs.com" },
  { name: "Kaiser Permanente", domain: "kaiserpermanente.org" },
  { name: "UnitedHealthcare", domain: "uhc.com" },
  { name: "Aetna", domain: "aetna.com" },
  { name: "Cigna", domain: "cigna.com" },
  { name: "Humana", domain: "humana.com" },
  { name: "Anthem", domain: "anthem.com" },
  { name: "Elevance Health", domain: "elevancehealth.com" },
  { name: "Centene (Ambetter)", domain: "centene.com" },
  { name: "Oscar Health", domain: "hioscar.com" },
  { name: "Oxford", domain: "oxhp.com" },
  { name: "Empire BCBS", domain: "empireblue.com" },
];

function BrandfetchLogo({ domain, name }: { domain: string; name: string }) {
  return (
    <img
      src={`https://cdn.brandfetch.io/${domain}/w/128/h/128/fallback/lettermark/type/icon?c=1id3n10pdBTarCHI0db`}
      alt={name}
      className="insurance-logo"
      loading="lazy"
      referrerPolicy="origin"
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = "none";
      }}
    />
  );
}

export function Insurance() {
  return (
    <section className="section insurance reveal" id="insurance">
      <div className="container">
        <div className="section-header">
          <p className="section-label">Insurance</p>
          <h2>In-Network <span className="text-accent">Insurance Plans</span></h2>
          <p className="section-desc">Dr. Elguizaoui accepts most major insurance plans. <strong style={{ color: "var(--accent)" }}>99% of patients</strong> have successfully booked with their insurance.</p>
        </div>
        <div className="insurance-grid">
          {carriers.map(({ name, domain }) => (
            <div className="insurance-card" key={name}>
              <BrandfetchLogo domain={domain} name={name} />
              <span>{name}</span>
            </div>
          ))}
          <div className="insurance-card insurance-more">
            <span>200+ more in-network plans</span>
          </div>
        </div>
      </div>
    </section>
  );
}
