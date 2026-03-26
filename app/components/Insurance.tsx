const carriers = [
  { name: "BlueCross BlueShield", slug: "bcbs-com" },
  { name: "UnitedHealthcare", slug: "uhc-com" },
  { name: "Aetna", slug: "aetna-com" },
  { name: "Cigna", slug: "cigna-com" },
  { name: "Humana", slug: "humana-com" },
  { name: "Anthem", slug: "anthem-com" },
  { name: "TRICARE", slug: "tricare-mil" },
  { name: "Kaiser Permanente", slug: "kaiserpermanente-org" },
  { name: "Oscar Health", slug: "hioscar-com" },
  { name: "Elevance Health", slug: "elevancehealth-com" },
];

function CarrierLogo({ slug, name }: { slug: string; name: string }) {
  return (
    <>
      <img
        src={`/sam/logos/dark/${slug}.webp`}
        alt={name}
        className="insurance-logo insurance-logo-dark"
        loading="lazy"
      />
      <img
        src={`/sam/logos/light/${slug}.webp`}
        alt={name}
        className="insurance-logo insurance-logo-light"
        loading="lazy"
      />
    </>
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
        <div className="insurance-logo-grid">
          {carriers.map(({ name, slug }) => (
            <div className="insurance-logo-item" key={name}>
              <CarrierLogo slug={slug} name={name} />
            </div>
          ))}
        </div>
        <p className="insurance-more-text">...and 200+ more in-network plans</p>
      </div>
    </section>
  );
}
