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

  // Regenerative / PRP → PRP deep dive
  "Mild to moderate osteoarthritis": "prp-therapy-deep-dive",
  "Tendinitis and tendon injuries": "prp-therapy-deep-dive",
  "Ligament sprains": "prp-therapy-deep-dive",
  "Chronic joint pain": "prp-therapy-deep-dive",
  "Cartilage degeneration": "prp-therapy-deep-dive",

  // ACL → ACL warning signs
  "ACL, MCL, and PCL tears": "acl-tear-warning-signs",
  "ACL reconstruction": "acl-tear-warning-signs",
  "ACL tears and reconstruction": "acl-tear-warning-signs",
  "Ligament injuries": "acl-tear-warning-signs",

  // Meniscus → Meniscus guide
  "Meniscus repair or removal": "meniscus-tear-athlete-guide",
  "Meniscus tears": "meniscus-tear-athlete-guide",
  "Meniscal tears": "meniscus-tear-athlete-guide",

  // Sports-medicine catch-alls → Basketball report
  "Ankle sprains and instability": "basketball-injuries-nyc-courts",
  "Stress fractures": "basketball-injuries-nyc-courts",
  "Muscle strains and tendon injuries": "basketball-injuries-nyc-courts",

  // Rotator cuff → Rotator cuff repair deep dive
  "Rotator cuff tears": "rotator-cuff-repair-options",
  "Rotator cuff repair": "rotator-cuff-repair-options",
  "Rotator cuff tears and shoulder instability": "rotator-cuff-repair-options",

  // Shoulder arthritis → Shoulder replacement deep dive
  "Shoulder instability and dislocations": "shoulder-replacement-anatomic-reverse",

  // Patellar instability → Patellar dislocation deep dive
  "Patellar instability": "patellar-dislocation-treatment-guide",

  // Elbow tendinopathy → Tennis elbow deep dive
  "Tennis and golfer's elbow": "tennis-elbow-lateral-epicondylitis",
};

// Maps a condition page slug (from conditions.ts → slug) to a deep-dive blog post.
// Used to surface a "Deep Dive" link on /conditions/<slug> pages.
export const conditionSlugToBlogSlug: Record<string, string> = {
  "acl-tears-and-reconstruction": "acl-tear-warning-signs",
  "meniscus-tears": "meniscus-tear-athlete-guide",
  "knee-cartilage-injuries": "cartilage-restoration-maci-allograft",
  "rotator-cuff-tears": "rotator-cuff-repair-options",
  "patellar-instability": "patellar-dislocation-treatment-guide",
  "shoulder-instability-and-dislocations": "shoulder-replacement-anatomic-reverse",
};

export const conditionBlogPosts: BlogPost[] = [];
