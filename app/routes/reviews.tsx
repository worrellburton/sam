import { useState, useEffect } from "react";
import { GetStarted } from "~/components/GetStarted";
import { Locations } from "~/components/Locations";

export function meta() {
  return [
    { title: "Patient Reviews | Dr. Sam Elguizaoui, M.D." },
    { name: "description", content: "Read patient reviews for Dr. Sameh Elguizaoui. 4.8/5 stars with 1,400+ reviews." },
  ];
}

const platforms = [
  { name: "DocZoc", rating: "4.78", reviews: "1,400+", url: "https://www.zocdoc.com/doctor/sam-elguizaoui-md-236423", color: "#FF7043", icon: "Z" },
  { name: "Google", rating: "4.8", reviews: "150+", url: "https://www.google.com/search?q=Dr+Sam+Elguizaoui+orthopedic+surgeon+NYC", color: "#4285F4", icon: "G" },
  { name: "Healthgrades", rating: "5.0", reviews: "50+", url: "https://www.healthgrades.com/physician/dr-sam-elguizaoui", color: "#1976D2", icon: "H" },
  { name: "Vitals", rating: "4.9", reviews: "200+", url: "https://www.vitals.com/doctors/Dr_Sam_Elguizaoui.html", color: "#00BFA5", icon: "V" },
  { name: "U.S. News", rating: "Top", reviews: "Doctor Rankings", url: "https://health.usnews.com/doctors", color: "#1B3A5C", icon: "U" },
];

const PLACES_API_KEY = 'AIzaSyCDYVX9sM-Tkoun755-ZLP4KpjZGufBJbM';
const PLACE_IDS = [
  { id: 'ChIJmQNsqXpZwokRoKDGBL8w9LM', label: 'Upper East Side' },
  { id: 'ChIJFTfVAb5ZwokRuFvoKEMtQag', label: 'West Village' },
  { id: 'ChIJzeD6h0VawokRCfzPOz9Oi7E', label: 'Brooklyn' },
];
const FIELDS = 'id,rating,userRatingCount,reviews.rating,reviews.text,reviews.authorAttribution,reviews.relativePublishTimeDescription';

interface GoogleReview {
  rating: number;
  text?: { text?: string };
  authorAttribution?: { displayName?: string; photoUri?: string };
  relativePublishTimeDescription?: string;
  locationLabel: string;
}

function starsHTML(rating: number) {
  return '\u2605'.repeat(Math.round(rating)) + '\u2606'.repeat(5 - Math.round(rating));
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const results = await Promise.all(PLACE_IDS.map(async (place) => {
          const resp = await fetch(`https://places.googleapis.com/v1/places/${place.id}?fields=${FIELDS}&key=${PLACES_API_KEY}`);
          if (!resp.ok) return [];
          const data = await resp.json();
          return (data.reviews || []).map((r: GoogleReview) => ({ ...r, locationLabel: place.label }));
        }));
        setReviews(results.flat());
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, []);

  return (
    <>
      <section className="service-hero has-bg" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1600&h=600&fit=crop&q=80')" }}>
        <div className="container">
          <p className="hero-label">Patient Feedback</p>
          <h1>Patient <span className="text-accent">Reviews</span></h1>
          <p className="service-hero-desc">See what patients are saying about Dr. Elguizaoui across every major review platform.</p>
        </div>
      </section>

      {/* Platform Summary Cards */}
      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="container">
          <div className="section-header">
            <p className="section-label">Review Platforms</p>
            <h2>Rated Among NYC's <span className="text-accent">Top Orthopedic Surgeons</span></h2>
          </div>
          <div className="platform-cards-grid">
            {platforms.map((p) => (
              <a key={p.name} href={p.url} target="_blank" rel="noopener" className="platform-card">
                <div className="platform-icon" style={{ background: p.color }}>{p.icon}</div>
                <div className="platform-info">
                  <div className="platform-name">{p.name}</div>
                  <div className="platform-rating">
                    <span className="platform-score">{p.rating}</span>
                    {p.rating !== "Top" && <span className="platform-stars">{starsHTML(5)}</span>}
                  </div>
                  <div className="platform-count">{p.reviews}</div>
                </div>
              </a>
            ))}
          </div>

          {/* Patient Choice Badge */}
          <div className="patient-choice-badge">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <div>
              <strong>Patient Choice Award</strong>
              <p>Providers with this badge are highly rated, reliable, and recommended by other patients.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Google Reviews Grid */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <p className="section-label">Google Reviews</p>
            <h2>What Patients <span className="text-accent">Are Saying</span></h2>
            <p className="section-desc">Real reviews from verified Google patients across our Manhattan and Brooklyn locations.</p>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
              Loading reviews...
            </div>
          ) : reviews.length > 0 ? (
            <div className="reviews-grid">
              {reviews.map((review, i) => (
                <div className="google-review-card" key={i}>
                  <div className="google-review-header">
                    <img
                      className="google-review-avatar"
                      src={review.authorAttribution?.photoUri || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.authorAttribution?.displayName || 'P')}&background=1a3a5c&color=fff&size=36`}
                      alt={review.authorAttribution?.displayName || "Patient"}
                      loading="lazy"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <div>
                      <div className="google-review-author">{review.authorAttribution?.displayName || "Patient"}</div>
                      <div className="google-review-meta">{review.relativePublishTimeDescription || ""}</div>
                    </div>
                    <div className="google-review-google-icon">
                      <svg viewBox="0 0 24 24" width="18" height="18"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    </div>
                  </div>
                  <div className="google-review-stars">{starsHTML(review.rating)}</div>
                  <div className="google-review-text">{review.text?.text || ""}</div>
                  <div className="google-review-location">{review.locationLabel}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
              Reviews are loading from Google. Please check back shortly.
            </div>
          )}

          <div style={{ textAlign: "center", marginTop: "40px" }}>
            <a href="https://www.zocdoc.com/doctor/sam-elguizaoui-md-236423" target="_blank" rel="noopener" className="btn btn-primary btn-lg">
              View All 1,400+ Reviews
            </a>
          </div>
        </div>
      </section>

      <GetStarted />
      <Locations />
    </>
  );
}
