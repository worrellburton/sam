import { locations } from "@/data/locations";

// Static map tiles load orders of magnitude faster than the Google Maps
// Embed iframe — ~50 KB JPG per card vs ~500 KB of iframe JS — and
// we don't lose any functionality since clicking the card opens the
// native Maps app. loading="lazy" + decoding="async" keeps the third
// card from blocking first paint on mobile.
export function Locations() {
  return (
    <section className="section locations reveal" id="locations">
      <div className="container">
        <div className="locations-header">
          <div>
            <h2>Dr. Elguizaoui sees patients at these New York Orthopedics locations</h2>
          </div>
          <a href="https://www.zocdoc.com/doctor/sam-elguizaoui-md-236423" target="_blank" rel="noopener" className="locations-book-btn">
            Book Appointment{" "}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M7 17L17 7M17 7H7M17 7v10" />
            </svg>
          </a>
        </div>
        <div className="locations-grid">
          {locations.map((loc) => {
            // 2x scale so it stays sharp on retina; small 300x180
            // footprint (600x360 actual) keeps each map well under 100 KB.
            const mapSrc = `/api/maps?type=static&center=${encodeURIComponent(
              loc.query,
            )}&zoom=14&size=300x180&scale=2&markers=${encodeURIComponent(
              `color:red|${loc.query}`,
            )}`;
            return (
              <a
                href={loc.mapsUrl}
                target="_blank"
                rel="noopener"
                className="location-card"
                key={loc.id}
                aria-label={`Open ${loc.display} in Google Maps`}
              >
                <div className="location-map-placeholder">
                  <img
                    src={mapSrc}
                    alt={`Map of ${loc.display}`}
                    loading="lazy"
                    decoding="async"
                    width={600}
                    height={360}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: 12,
                      display: "block",
                    }}
                  />
                </div>
                <span className="location-label">
                  <span>{loc.display}</span>
                  <svg className="location-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <path d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
