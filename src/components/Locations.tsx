import Link from "next/link";
import { locations } from "@/data/locations";

export function Locations() {
  return (
    <section className="section locations reveal" id="locations">
      <div className="container">
        <div className="locations-header">
          <div>
            <h2>Dr. Elguizaoui sees patients at these New York Orthopedics locations</h2>
          </div>
          <Link href="/book" className="locations-book-btn">
            Book Appointment{" "}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M7 17L17 7M17 7H7M17 7v10" />
            </svg>
          </Link>
        </div>
        <div className="locations-grid">
          {locations.map((loc) => (
            <div className="location-card" key={loc.id}>
              <div className="location-map-placeholder">
                <iframe
                  title={loc.label}
                  width="100%"
                  height="100%"
                  style={{ border: 0, borderRadius: "12px" }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`/api/maps?type=embed&q=${encodeURIComponent(loc.query)}&zoom=14`}
                ></iframe>
              </div>
              <a href={loc.mapsUrl} target="_blank" rel="noopener" className="location-label">
                <span>{loc.display}</span>
                <svg className="location-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M7 17L17 7M17 7H7M17 7v10" />
                </svg>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
