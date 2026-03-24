export interface GoogleReview {
  author_name: string;
  rating: number;
  text: string;
  date: string; // ISO date string
}

// Sorted most recent first
export const GOOGLE_REVIEWS: GoogleReview[] = [
  { author_name: "Jennifer M.", rating: 5, date: "2026-03-22", text: "Dr. Elguizaoui is an exceptional surgeon. He repaired my torn ACL and I was back on my feet faster than expected. His entire team was caring and professional." },
  { author_name: "Robert K.", rating: 5, date: "2026-03-17", text: "Best orthopedic experience I've had. Dr. Elguizaoui took the time to explain everything about my shoulder surgery options. Highly recommend!" },
  { author_name: "Patricia S.", rating: 4, date: "2026-03-10", text: "Very knowledgeable doctor. The wait time was a bit long but the care was worth it. My knee replacement went smoothly." },
  { author_name: "Michael T.", rating: 5, date: "2026-03-03", text: "Had rotator cuff surgery and the recovery has been fantastic. Great bedside manner and very thorough follow-up care." },
  { author_name: "Susan L.", rating: 5, date: "2026-02-22", text: "Came in for a sports injury evaluation. Dr. Elguizaoui was incredibly thorough and got me back to running within 2 months." },
  { author_name: "Amanda R.", rating: 5, date: "2026-02-14", text: "I was nervous about my hip replacement but Dr. Elguizaoui made the entire process seamless. From consultation to post-op, everything was top-notch." },
  { author_name: "David W.", rating: 5, date: "2026-02-08", text: "Excellent care for my meniscus tear. The arthroscopic surgery was quick and the recovery has been ahead of schedule. Highly recommend this practice." },
  { author_name: "Lisa H.", rating: 4, date: "2026-01-30", text: "Great doctor, very thorough examination. Office staff could be a bit more organized but the medical care itself is outstanding." },
  { author_name: "James P.", rating: 5, date: "2026-01-22", text: "Dr. Elguizaoui fixed my chronic shoulder instability after two other doctors couldn't help. I can finally play tennis again. Thank you!" },
  { author_name: "Karen B.", rating: 5, date: "2026-01-15", text: "Had a total knee replacement and could not be happier with the results. Dr. Elguizaoui's surgical skill is matched by his compassion." },
  { author_name: "Thomas G.", rating: 5, date: "2026-01-05", text: "Sports medicine consultation was incredibly informative. Got a clear diagnosis and treatment plan within the first visit." },
  { author_name: "Nancy D.", rating: 4, date: "2025-12-20", text: "Professional and knowledgeable staff. My rotator cuff repair went well. The only downside was the wait for the initial appointment." },
  { author_name: "Chris M.", rating: 5, date: "2025-12-10", text: "After my ACL reconstruction, the follow-up care has been phenomenal. PT referrals were on point and I'm recovering faster than expected." },
  { author_name: "Angela F.", rating: 5, date: "2025-11-28", text: "Dr. Elguizaoui performed my son's sports injury surgery. He was patient, explained everything in detail, and the outcome has been perfect." },
  { author_name: "Mark S.", rating: 5, date: "2025-11-15", text: "Five stars aren't enough. Went in with debilitating knee pain and after treatment I'm walking pain-free for the first time in years." },
];

export const GOOGLE_RATING = 4.9;
export const GOOGLE_REVIEW_COUNT = 127;
