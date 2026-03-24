import { useState } from "react";

const carriers = [
  { name: "BlueCross BlueShield", domain: "bcbs.com" },
  { name: "UnitedHealthcare", domain: "uhc.com" },
  { name: "Aetna", domain: "aetna.com" },
  { name: "Cigna", domain: "cigna.com" },
  { name: "Humana", domain: "humana.com" },
  { name: "Anthem", domain: "anthem.com" },
  { name: "TRICARE", domain: "tricare.mil" },
  { name: "Kaiser Permanente", domain: "kaiserpermanente.org" },
  { name: "Oscar Health", domain: "hioscar.com" },
  { name: "Oxford", domain: "oxhp.com" },
  { name: "Empire BCBS", domain: "empireblue.com" },
  { name: "Elevance Health", domain: "elevancehealth.com" },
];

function CarrierLogo({ domain, name }: { domain: string; name: string }) {
  const [srcIdx, setSrcIdx] = useState(0);

  // Try multiple Brandfetch variants for transparent logos
  const srcs = [
    `https://cdn.brandfetch.io/${domain}/w/400/h/150/theme/dark/type/logo?c=1id3n10pdBTarCHI0db`,
    `https://cdn.brandfetch.io/${domain}/w/400/h/150/theme/dark/type/symbol?c=1id3n10pdBTarCHI0db`,
    `https://cdn.brandfetch.io/${domain}/w/400/h/150/fallback/lettermark/theme/dark?c=1id3n10pdBTarCHI0db`,
  ];

  // Light mode uses different theme
  const lightSrcs = [
    `https://cdn.brandfetch.io/${domain}/w/400/h/150/theme/light/type/logo?c=1id3n10pdBTarCHI0db`,
    `https://cdn.brandfetch.io/${domain}/w/400/h/150/theme/light/type/symbol?c=1id3n10pdBTarCHI0db`,
    `https://cdn.brandfetch.io/${domain}/w/400/h/150/fallback/lettermark/theme/light?c=1id3n10pdBTarCHI0db`,
  ];

  if (srcIdx >= srcs.length) {
    return <span className="insurance-fallback">{name}</span>;
  }

  return (
    <>
      {/* Dark mode: light/white logos */}
      <img
        src={srcs[srcIdx]}
        alt={name}
        className="insurance-logo insurance-logo-dark"
        loading="lazy"
        referrerPolicy="origin"
        onError={() => setSrcIdx(i => i + 1)}
      />
      {/* Light mode: dark logos */}
      <img
        src={lightSrcs[srcIdx]}
        alt={name}
        className="insurance-logo insurance-logo-light"
        loading="lazy"
        referrerPolicy="origin"
        onError={() => {}}
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
          {carriers.map(({ name, domain }) => (
            <div className="insurance-logo-item" key={name}>
              <CarrierLogo domain={domain} name={name} />
            </div>
          ))}
        </div>
        <p className="insurance-more-text">...and 200+ more in-network plans</p>
      </div>
    </section>
  );
}
