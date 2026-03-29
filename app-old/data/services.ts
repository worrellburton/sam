export interface Service {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  detail: string;
  conditions: string[];
  benefits: string[];
  approach?: string[];
}

export const services: Service[] = [
  {
    slug: "sports-medicine",
    title: "Sports Medicine",
    subtitle: "Athletic injury care & Return to sport",
    description:
      "Dr. Elguizaoui provides comprehensive sports medicine care for athletes of all levels, from weekend warriors to professional competitors. As a former team physician for the New York Jets (NFL) and New York Islanders (NHL), he brings elite-level expertise to every patient.",
    detail:
      "Comprehensive treatment of athletic injuries with a focus on getting you back in the game. Experience caring for NFL and NHL athletes.",
    conditions: [
      "ACL, MCL, and PCL tears",
      "Meniscus tears and cartilage injuries",
      "Rotator cuff tears and shoulder instability",
      "Tennis and golfer's elbow",
      "Ankle sprains and instability",
      "Stress fractures",
      "Muscle strains and tendon injuries",
      "Concussion management",
    ],
    benefits: [
      "Former NY Jets & NY Islanders team physician",
      "Minimally invasive arthroscopic techniques",
      "Personalized return-to-sport protocols",
      "Same-day injury evaluation available",
    ],
  },
  {
    slug: "arthroscopic-surgery",
    title: "Arthroscopic Surgery",
    subtitle: "Minimally invasive & Faster recovery",
    description:
      "Arthroscopic surgery uses small incisions and a tiny camera to diagnose and treat joint problems. Dr. Elguizaoui is highly experienced in arthroscopic techniques for the shoulder, knee, hip, and other joints.",
    detail:
      "Minimally invasive surgical techniques that mean smaller incisions, less pain, and faster recovery for shoulder and knee conditions.",
    conditions: [
      "Rotator cuff repair",
      "Labral repair (shoulder and hip)",
      "ACL reconstruction",
      "Meniscus repair or removal",
      "Cartilage restoration procedures",
      "Loose body removal",
      "Synovitis treatment",
      "Frozen shoulder release",
    ],
    benefits: [
      "Smaller incisions — less scarring",
      "Less post-operative pain",
      "Faster recovery and rehabilitation",
      "Outpatient — go home same day",
    ],
  },
  {
    slug: "regenerative-medicine",
    title: "Regenerative Medicine",
    subtitle: "PRP therapy & Biologic treatments",
    description:
      "Dr. Elguizaoui is a strong advocate for biologic alternatives to surgery. Regenerative medicine harnesses your body's own healing mechanisms to treat injuries and arthritis without surgical intervention.",
    detail:
      "Biologic alternatives to surgery including PRP therapy and other regenerative treatments for arthritis and soft tissue injuries.",
    conditions: [
      "Mild to moderate osteoarthritis",
      "Tendinitis and tendon injuries",
      "Ligament sprains",
      "Muscle injuries",
      "Cartilage degeneration",
      "Chronic joint pain",
    ],
    benefits: [
      "Non-surgical treatment option",
      "Uses your body's own healing factors",
      "Minimal downtime",
      "Can delay or avoid surgery",
    ],
  },
  {
    slug: "joint-preservation",
    title: "Joint Preservation",
    subtitle: "Save your natural joints",
    description:
      "Joint preservation focuses on protecting and restoring your natural joints through advanced techniques that delay or avoid the need for joint replacement. Dr. Elguizaoui's international fellowship training in Europe provided specialized expertise in these cutting-edge approaches.",
    detail:
      "Advanced techniques to protect and restore your natural joints, delaying or avoiding the need for joint replacement surgery.",
    conditions: [
      "Early-stage arthritis in young, active patients",
      "Cartilage defects and damage",
      "Meniscal tears",
      "Ligament injuries",
      "Joint malalignment",
      "Osteochondral lesions",
    ],
    benefits: [
      "Preserve your natural joint",
      "International fellowship-trained techniques",
      "Delay or avoid joint replacement",
      "Maintain active lifestyle",
    ],
  },
  {
    slug: "cartilage-repair",
    title: "Cartilage Repair",
    subtitle: "Repair & Transplant & Restoration",
    description:
      "Dr. Elguizaoui completed an international traveling fellowship across Switzerland, the Netherlands, and Italy focused on cartilage repair and transplant techniques. He brings these world-class techniques to his patients in New York City.",
    detail:
      "Cutting-edge cartilage repair and transplant techniques learned through international fellowship training across Europe.",
    conditions: [
      "Focal cartilage defects",
      "Osteochondritis dissecans (OCD)",
      "Cartilage injuries from trauma",
      "Failed previous cartilage procedures",
      "Early arthritis in young patients",
    ],
    benefits: [
      "European fellowship-trained expertise",
      "Multiple repair and transplant options",
      "Restore joint function and reduce pain",
      "Cutting-edge techniques",
    ],
  },
  {
    slug: "shoulder-knee-surgery",
    title: "Shoulder & Knee Surgery",
    subtitle: "ACL & Rotator cuff & Meniscus",
    description:
      "Dr. Elguizaoui provides expert surgical care for complex shoulder and knee conditions. His fellowship training at Lenox Hill Hospital — one of the premier sports medicine programs in the country — provided extensive experience in both open and arthroscopic techniques.",
    detail:
      "Expert surgical care for rotator cuff tears, ACL reconstruction, meniscus repair, labral tears, and complex shoulder and knee conditions.",
    conditions: [
      "Rotator cuff tears",
      "Shoulder instability and dislocations",
      "Labral tears (SLAP tears)",
      "ACL tears and reconstruction",
      "Meniscus tears",
      "Patellar instability",
      "Knee cartilage injuries",
      "Biceps tendon injuries",
    ],
    benefits: [
      "Lenox Hill fellowship-trained",
      "Advanced arthroscopic and open techniques",
      "Individualized surgical planning",
      "Comprehensive post-operative rehabilitation",
    ],
  },
];

export function getServiceBySlug(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}
