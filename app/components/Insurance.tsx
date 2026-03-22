const carriers = [
  "BlueCross BlueShield",
  "Kaiser Permanente",
  "UnitedHealthcare",
  "Aetna",
  "Cigna",
  "Humana",
  "Anthem",
  "Elevance Health",
  "Centene (Ambetter)",
  "Oscar Health",
  "Oxford",
  "Empire BCBS",
];

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
          {carriers.map((name) => (
            <div className="insurance-card" key={name}>
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
