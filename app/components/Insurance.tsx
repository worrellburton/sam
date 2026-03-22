import { useTheme } from "~/hooks/useTheme";

const BF_ID = "1id3n10pdBTarCHI0db";
const bfLogo = (domain: string, theme: string) =>
  `https://cdn.brandfetch.io/${domain}/w/400/h/100/theme/${theme}/fallback/lettermark/type/logo?c=${BF_ID}`;

const carriers = [
  { name: "Aetna", domain: "aetna.com" },
  { name: "BlueCross BlueShield", domain: "bcbs.com" },
  { name: "UnitedHealthcare", domain: "uhc.com" },
  { name: "Oxford", domain: "oxhp.com" },
  { name: "Cigna", domain: "cigna.com" },
  { name: "Empire BCBS", domain: "empireblue.com" },
  { name: "Humana", domain: "humana.com" },
  { name: "Medicare", domain: "medicare.gov" },
  { name: "1199SEIU", domain: "1199seiubenefits.org" },
  { name: "Oscar", domain: "hioscar.com" },
  { name: "Emblem Health", domain: "emblemhealth.com" },
  { name: "Multiplan", domain: "multiplan.com" },
];

export function Insurance() {
  const { theme } = useTheme();

  return (
    <section className="section insurance reveal" id="insurance">
      <div className="container">
        <div className="section-header">
          <p className="section-label">Insurance</p>
          <h2>In-Network <span className="text-accent">Insurance Plans</span></h2>
          <p className="section-desc">Dr. Elguizaoui accepts most major insurance plans. <strong style={{ color: "var(--accent)" }}>99% of patients</strong> have successfully booked with their insurance.</p>
        </div>
        <div className="insurance-grid">
          {carriers.map((ins) => (
            <div className="insurance-card" key={ins.name}>
              <div className="insurance-logo">
                <img
                  src={bfLogo(ins.domain, theme)}
                  alt={`${ins.name} logo`}
                  loading="lazy"
                  referrerPolicy="origin"
                  onError={(e) => {
                    const el = e.target as HTMLImageElement;
                    el.style.display = 'none';
                    const span = el.parentElement?.querySelector('.insurance-fallback');
                    if (span) (span as HTMLElement).style.display = 'block';
                  }}
                />
                <span className="insurance-fallback" style={{ display: 'none' }}>{ins.name}</span>
              </div>
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
