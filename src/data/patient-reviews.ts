// Local patient testimonials used as fallback content on the homepage and
// reviews page when live Google reviews are unavailable. Each entry is
// rendered as a 5-star review by default.

export interface PatientReview {
  name: string;
  time: string;
  text: string;
  location: string;
}

export const patientReviews: PatientReview[] = [
  {
    name: "Sarah M.",
    time: "2 weeks ago",
    text: "Dr. Elguizaoui is an incredible surgeon. He repaired my torn rotator cuff and I'm back to playing tennis in record time. He took the time to explain every step of the process and made me feel completely at ease.",
    location: "Upper East Side office",
  },
  {
    name: "James K.",
    time: "1 month ago",
    text: "After tearing my ACL playing basketball, I was devastated. Dr. Elguizaoui reconstructed my knee arthroscopically and his rehab plan got me back on the court. Truly the best orthopedic surgeon in NYC.",
    location: "Brooklyn Heights office",
  },
  {
    name: "Maria L.",
    time: "3 weeks ago",
    text: "I saw several doctors before finding Dr. Elguizaoui. He was the only one who took the time to really understand my knee pain. Recommended PRP therapy instead of surgery and I'm pain-free for the first time in years.",
    location: "Greenwich Village office",
  },
  {
    name: "David R.",
    time: "2 months ago",
    text: "Outstanding care from start to finish. Dr. Elguizaoui performed my meniscus repair and I was walking the same day. His staff is professional, friendly, and the office is state-of-the-art.",
    location: "Upper East Side office",
  },
  {
    name: "Amanda T.",
    time: "1 month ago",
    text: "Dr. Elguizaoui fixed my shoulder labral tear with arthroscopic surgery. Minimal scarring, fast recovery, and he was available to answer all my questions throughout rehab. Highly recommend!",
    location: "Brooklyn Heights office",
  },
  {
    name: "Robert P.",
    time: "3 months ago",
    text: "I came to Dr. Elguizaoui for chronic knee pain that other doctors said needed a replacement. He used a joint preservation approach instead and saved my natural knee. Forever grateful.",
    location: "Greenwich Village office",
  },
];
