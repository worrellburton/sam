import { Link, useParams } from "react-router";
import { getServiceBySlug, services } from "~/data/services";
import { GetStarted } from "~/components/GetStarted";
import { Locations } from "~/components/Locations";

export function meta({ params }: { params: { slug: string } }) {
  const service = getServiceBySlug(params.slug);
  return [
    { title: service ? `${service.title} | Dr. Sam Elguizaoui, M.D.` : "Service Not Found" },
    { name: "description", content: service?.description || "" },
  ];
}

export default function ServicePage() {
  const { slug } = useParams();
  const service = getServiceBySlug(slug || "");

  if (!service) {
    return (
      <main style={{ padding: "4rem 2rem", textAlign: "center" }}>
        <h1>Service Not Found</h1>
        <Link to="/">Return Home</Link>
      </main>
    );
  }

  return (
    <>
      <section className="service-hero">
        <div className="container">
          <Link to="/#specialties" className="service-back-link">
            &larr; Back to Services
          </Link>
          <h1>{service.title}</h1>
          <p>{service.subtitle}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="service-content">
            <div className="service-main">
              <h2>Overview</h2>
              <p>{service.description}</p>

              <h3>Conditions Treated</h3>
              <ul className="service-list service-list--clickable">
                {service.conditions.map((c, i) => (
                  <li key={i}>
                    <Link to={`/book?condition=${encodeURIComponent(c)}&service=${encodeURIComponent(service.title)}`}>
                      {c}
                    </Link>
                  </li>
                ))}
              </ul>

              {service.approach && (
                <>
                  <h3>Our Approach</h3>
                  <ul className="service-list">
                    {service.approach.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </>
              )}

              <h3>Why Choose Dr. Elguizaoui</h3>
              <ul className="service-list">
                {service.benefits.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>

            <aside className="service-sidebar">
              <div className="sidebar-card">
                <h4>Schedule a Consultation</h4>
                <p>Discuss your condition with Dr. Elguizaoui and explore treatment options.</p>
                <Link to="/book" className="btn btn-primary btn-block">
                  Book Now
                </Link>
                <a href="tel:+19179059370" style={{ display: "block", textAlign: "center", marginTop: "12px", color: "var(--text-light)" }}>
                  +1-917-905-9370
                </a>
              </div>
              <div className="sidebar-card">
                <h4>Other Services</h4>
                {services
                  .filter((s) => s.slug !== service.slug)
                  .map((s) => (
                    <Link key={s.slug} to={`/services/${s.slug}`} style={{ display: "block", padding: "6px 0", color: "var(--primary)" }}>
                      {s.title}
                    </Link>
                  ))}
              </div>
            </aside>
          </div>
        </div>
      </section>

      <GetStarted />
      <Locations />
    </>
  );
}
