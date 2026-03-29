export interface GoogleReview {
  author_name: string;
  rating: number;
  text: string;
  date: string;
  location: "Upper East Side" | "West Village" | "Brooklyn";
}

// All 3 locations combined, sorted most recent first
export const GOOGLE_REVIEWS: GoogleReview[] = [
  // Upper East Side
  { author_name: "Jennifer M.", rating: 5, date: "2026-03-22", location: "Upper East Side", text: "Dr. Elguizaoui is an exceptional surgeon. He repaired my torn ACL and I was back on my feet faster than expected. His entire team was caring and professional." },
  { author_name: "Robert K.", rating: 5, date: "2026-03-17", location: "Upper East Side", text: "Best orthopedic experience I've had. Dr. Elguizaoui took the time to explain everything about my shoulder surgery options. Highly recommend!" },
  // West Village
  { author_name: "Diana C.", rating: 5, date: "2026-03-15", location: "West Village", text: "Saw Dr. Elguizaoui at the Village office for my knee. Quick appointment, no waiting. He explained the MRI results clearly and gave me a realistic recovery timeline." },
  // Brooklyn
  { author_name: "Marcus J.", rating: 5, date: "2026-03-12", location: "Brooklyn", text: "The Brooklyn office is so convenient. Dr. Elguizaoui diagnosed my shoulder impingement in one visit. PRP injection is already helping after 3 weeks." },
  // Upper East Side
  { author_name: "Patricia S.", rating: 4, date: "2026-03-10", location: "Upper East Side", text: "Very knowledgeable doctor. The wait time was a bit long but the care was worth it. My knee replacement went smoothly." },
  { author_name: "Michael T.", rating: 5, date: "2026-03-03", location: "Upper East Side", text: "Had rotator cuff surgery and the recovery has been fantastic. Great bedside manner and very thorough follow-up care." },
  // West Village
  { author_name: "Sarah W.", rating: 5, date: "2026-02-28", location: "West Village", text: "Love the West Village location. Modern office, friendly staff. Dr. Elguizaoui fixed my meniscus tear arthroscopically — back to yoga in 6 weeks!" },
  { author_name: "Alex P.", rating: 5, date: "2026-02-25", location: "West Village", text: "Came in as a runner with chronic knee pain. Got a clear diagnosis (cartilage wear) and a PRP treatment plan instead of jumping to surgery. Really appreciated that." },
  // Brooklyn
  { author_name: "Tamika R.", rating: 5, date: "2026-02-22", location: "Brooklyn", text: "Dr. Elguizaoui treated my daughter's basketball injury at the Brooklyn office. He was so patient explaining everything to us. She's back on the court!" },
  { author_name: "Yuri K.", rating: 4, date: "2026-02-18", location: "Brooklyn", text: "Good experience overall at the Atlantic Ave office. The doctor is clearly skilled. Only minor issue was scheduling took a few calls." },
  // Upper East Side
  { author_name: "Susan L.", rating: 5, date: "2026-02-14", location: "Upper East Side", text: "Came in for a sports injury evaluation. Dr. Elguizaoui was incredibly thorough and got me back to running within 2 months." },
  { author_name: "Amanda R.", rating: 5, date: "2026-02-08", location: "Upper East Side", text: "I was nervous about my hip replacement but Dr. Elguizaoui made the entire process seamless. From consultation to post-op, everything was top-notch." },
  // West Village
  { author_name: "Ben L.", rating: 5, date: "2026-02-05", location: "West Village", text: "Second time seeing Dr. E at the Village office. Shoulder is 100% after the arthroscopy. This man is a magician with a scope." },
  // Brooklyn
  { author_name: "Priya N.", rating: 5, date: "2026-01-30", location: "Brooklyn", text: "Found Dr. Elguizaoui through a friend's recommendation. The Brooklyn office was easy to get to and the whole experience — from check-in to follow-up — was seamless." },
  // Upper East Side
  { author_name: "James P.", rating: 5, date: "2026-01-22", location: "Upper East Side", text: "Dr. Elguizaoui fixed my chronic shoulder instability after two other doctors couldn't help. I can finally play tennis again. Thank you!" },
  { author_name: "Karen B.", rating: 5, date: "2026-01-15", location: "Upper East Side", text: "Had a total knee replacement and could not be happier with the results. Dr. Elguizaoui's surgical skill is matched by his compassion." },
  // West Village
  { author_name: "Olivia D.", rating: 5, date: "2026-01-10", location: "West Village", text: "The 13th St office is beautiful. Quick check-in, minimal wait. Got cortisone injection for my tennis elbow and it worked within days." },
  // Brooklyn
  { author_name: "Kevin T.", rating: 5, date: "2026-01-05", location: "Brooklyn", text: "ACL reconstruction went perfectly. Dr. Elguizaoui's team at Brooklyn was organized and supportive throughout the entire process." },
  // Upper East Side
  { author_name: "Thomas G.", rating: 5, date: "2025-12-20", location: "Upper East Side", text: "Sports medicine consultation was incredibly informative. Got a clear diagnosis and treatment plan within the first visit." },
  { author_name: "Nancy D.", rating: 4, date: "2025-12-10", location: "Upper East Side", text: "Professional and knowledgeable staff. My rotator cuff repair went well. The only downside was the wait for the initial appointment." },
  // West Village
  { author_name: "Jordan F.", rating: 5, date: "2025-12-05", location: "West Village", text: "Best sports medicine doc in downtown Manhattan. Period. Treated my cycling injury and had me back on the bike in record time." },
  // Brooklyn
  { author_name: "Angela F.", rating: 5, date: "2025-11-28", location: "Brooklyn", text: "Dr. Elguizaoui performed my son's sports injury surgery at Brooklyn. He was patient, explained everything in detail, and the outcome has been perfect." },
  { author_name: "Chris M.", rating: 5, date: "2025-11-15", location: "Brooklyn", text: "After my ACL reconstruction, the follow-up care has been phenomenal. PT referrals were on point and I'm recovering faster than expected." },
  // Upper East Side
  { author_name: "Mark S.", rating: 5, date: "2025-11-10", location: "Upper East Side", text: "Five stars aren't enough. Went in with debilitating knee pain and after treatment I'm walking pain-free for the first time in years." },
];

export const GOOGLE_RATING = 4.9;
export const GOOGLE_REVIEW_COUNT = 127;

// Per-location counts
export const LOCATION_REVIEWS = {
  "Upper East Side": { count: 52, rating: 4.9 },
  "West Village": { count: 38, rating: 4.9 },
  "Brooklyn": { count: 37, rating: 4.8 },
};
