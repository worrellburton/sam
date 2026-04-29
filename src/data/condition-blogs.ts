import type { BlogPost } from "./blog";

// Maps condition text (as it appears verbatim in services.ts → conditions[]) to
// a blog post slug. When a mapping exists, the service-page "Conditions Treated"
// row links to /blog/<slug> instead of /conditions/<slug>. This is how inner
// service content surfaces deep-dive articles.
export const conditionToBlogSlug: Record<string, string> = {
  // Cartilage-focused posts → Cartilage Restoration deep dive
  "Cartilage restoration procedures": "cartilage-restoration-maci-allograft",
  "Cartilage defects and damage": "cartilage-restoration-maci-allograft",
  "Osteochondritis dissecans (OCD)": "cartilage-restoration-maci-allograft",
  "Cartilage injuries from trauma": "cartilage-restoration-maci-allograft",
  "Failed previous cartilage procedures": "cartilage-restoration-maci-allograft",
  "Early arthritis in young patients": "cartilage-restoration-maci-allograft",
  "Focal cartilage defects": "cartilage-restoration-maci-allograft",
  "Osteochondral lesions": "cartilage-restoration-maci-allograft",
  "Knee cartilage injuries": "cartilage-restoration-maci-allograft",
  "Meniscus tears and cartilage injuries": "cartilage-restoration-maci-allograft",

  // Regenerative / PRP → HA vs PRP comparison
  "Mild to moderate osteoarthritis": "hyaluronic-acid-vs-prp-knee",
  "Tendinitis and tendon injuries": "hyaluronic-acid-vs-prp-knee",
  "Ligament sprains": "hyaluronic-acid-vs-prp-knee",
  "Chronic joint pain": "hyaluronic-acid-vs-prp-knee",
  "Cartilage degeneration": "hyaluronic-acid-vs-prp-knee",

  // ACL → ACL warning signs
  "ACL, MCL, and PCL tears": "acl-tear-warning-signs",
  "ACL reconstruction": "acl-tear-warning-signs",
  "ACL tears and reconstruction": "acl-tear-warning-signs",
  "Ligament injuries": "acl-tear-warning-signs",

  // Meniscus → Meniscus guide
  "Meniscus repair or removal": "meniscus-tear-athlete-guide",
  "Meniscus tears": "meniscus-tear-athlete-guide",
  "Meniscal tears": "meniscus-tear-athlete-guide",

  // Sports-medicine catch-alls → Active-adult prevention article
  "Ankle sprains and instability": "protecting-joints-active-adults",
  "Stress fractures": "protecting-joints-active-adults",
  "Muscle strains and tendon injuries": "protecting-joints-active-adults",

  // Rotator cuff → Arthroscopic vs open surgery (rotator cuff repair is arthroscopic)
  "Rotator cuff tears": "arthroscopic-vs-open-surgery",
  "Rotator cuff repair": "arthroscopic-vs-open-surgery",
  "Rotator cuff tears and shoulder instability": "arthroscopic-vs-open-surgery",

  // Shoulder arthritis → Shoulder replacement deep dive
  "Shoulder instability and dislocations": "shoulder-replacement-anatomic-reverse",

  // Patellar instability → Patellar/quad tendon deep dive
  "Patellar instability": "patellar-quad-tendon-tears",

  // Elbow tendinopathy → Tennis elbow deep dive
  "Tennis and golfer's elbow": "tennis-elbow-lateral-epicondylitis",
};

// Maps a condition page slug (from conditions.ts → slug) to a deep-dive blog post.
// Used to surface a "Deep Dive" link on /conditions/<slug> pages.
export const conditionSlugToBlogSlug: Record<string, string> = {
  "acl-tears-and-reconstruction": "acl-tear-warning-signs",
  "meniscus-tears": "meniscus-tear-athlete-guide",
  "knee-cartilage-injuries": "cartilage-restoration-maci-allograft",
  "rotator-cuff-tears": "arthroscopic-vs-open-surgery",
  "patellar-instability": "patellar-quad-tendon-tears",
  "shoulder-instability-and-dislocations": "shoulder-replacement-anatomic-reverse",
};

export const conditionBlogPosts: BlogPost[] = [];
