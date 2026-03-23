import type { Config } from "@react-router/dev/config";

export default {
  ssr: false,
  basename: "/sam/",
  prerender: [
    "/",
    "/about",
    "/contact",
    "/reviews",
    "/faq",
    "/blog",
    "/book",
    // Blog posts
    "/blog/5-signs-orthopedic-surgeon",
    "/blog/acl-tear-recovery",
    "/blog/prp-therapy-sports-medicine",
    "/blog/arthroscopic-vs-open-surgery",
    "/blog/cartilage-damage-treatment",
    "/blog/protecting-joints-active-adults",
    "/blog/acl-mcl-pcl-tears-guide",
    "/blog/meniscus-tears-cartilage-injuries",
    "/blog/rotator-cuff-tears-shoulder-instability",
    "/blog/tennis-elbow-golfers-elbow-guide",
    "/blog/stress-fractures-guide",
    "/blog/chronic-joint-pain-guide",
    // Service pages
    "/services/sports-medicine",
    "/services/arthroscopic-surgery",
    "/services/regenerative-medicine",
    "/services/joint-preservation",
    "/services/cartilage-repair",
    "/services/shoulder-knee-surgery",
    // Condition pages
    "/conditions/rotator-cuff-tears",
    "/conditions/shoulder-instability-and-dislocations",
    "/conditions/labral-tears-slap-tears",
    "/conditions/acl-tears-and-reconstruction",
    "/conditions/meniscus-tears",
    "/conditions/patellar-instability",
    "/conditions/knee-cartilage-injuries",
    "/conditions/biceps-tendon-injuries",
  ],
} satisfies Config;
