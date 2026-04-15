import { PLACEHOLDER_IMAGE } from "./placeholder-image";

export interface Condition {
  slug: string;
  title: string;
  tagline: string;
  heroImage: string;
  overview: string;
  symptoms: string[];
  treatments: string[];
  recovery: string;
  reassurance: string;
  seoText: string;
  relatedService: string;
}

export const conditions: Condition[] = [
  {
    slug: "rotator-cuff-tears",
    title: "Rotator Cuff Tears",
    tagline: "You don't have to live with shoulder pain",
    heroImage: PLACEHOLDER_IMAGE,
    overview: "A rotator cuff tear happens when one or more of the tendons that stabilize your shoulder become damaged. It's one of the most common shoulder injuries, and the good news is that most people recover fully with the right care. Whether your tear happened from a fall, overuse, or simply over time, Dr. Elguizaoui will work with you to find the gentlest, most effective path to feeling better.",
    symptoms: [
      "Pain when lifting or reaching overhead",
      "Aching at night, especially when lying on the affected side",
      "Weakness when rotating or lifting your arm",
      "A crackling sensation with certain movements",
    ],
    treatments: [
      "Physical therapy and targeted strengthening exercises",
      "Anti-inflammatory medications and cortisone injections",
      "PRP (Platelet-Rich Plasma) therapy for healing support",
      "Arthroscopic rotator cuff repair — minimally invasive, outpatient",
    ],
    recovery: "Many rotator cuff tears respond beautifully to non-surgical treatment. If surgery is needed, arthroscopic repair means tiny incisions, less pain, and most patients are back to their daily routines within a few weeks. Full recovery typically takes 3-6 months with guided rehabilitation.",
    reassurance: "You're in experienced hands. Dr. Elguizaoui has repaired hundreds of rotator cuffs using advanced arthroscopic techniques refined during his fellowship at Lenox Hill Hospital.",
    seoText: "Dr. Sameh Elguizaoui is a board-certified orthopedic surgeon specializing in rotator cuff repair in New York City. With offices in Manhattan, Brooklyn, and Scarsdale, he provides expert rotator cuff tear diagnosis and treatment — from conservative PRP therapy to advanced arthroscopic repair. Fellowship-trained at Lenox Hill Hospital and former team physician for the NY Jets and NY Islanders, Dr. Elguizaoui offers world-class shoulder care for patients across the NYC metropolitan area.",
    relatedService: "shoulder-knee-surgery",
  },
  {
    slug: "shoulder-instability-and-dislocations",
    title: "Shoulder Instability & Dislocations",
    tagline: "Stability and confidence in every movement",
    heroImage: PLACEHOLDER_IMAGE,
    overview: "If your shoulder feels loose, slips out of place, or has dislocated before, you know how unsettling it can be. Shoulder instability means the ball of your shoulder joint doesn't stay properly centered. It's a very treatable condition, and Dr. Elguizaoui specializes in helping patients regain full stability and confidence.",
    symptoms: [
      "Feeling like your shoulder might 'pop out'",
      "Repeated dislocations or subluxations",
      "Pain or apprehension with certain arm positions",
      "Weakness or a sense of looseness in the joint",
    ],
    treatments: [
      "Structured physical therapy to strengthen stabilizing muscles",
      "Activity modification and bracing during recovery",
      "Arthroscopic Bankart repair to restore the labrum",
      "Latarjet procedure for complex or recurrent cases",
    ],
    recovery: "Physical therapy alone helps many patients with first-time instability. When surgery is needed, arthroscopic repair is minimally invasive with excellent success rates. Most patients return to full activity within 4-6 months.",
    reassurance: "Every treatment plan starts with understanding your goals — whether that's getting back to sports or simply reaching for things without worry.",
    seoText: "If you're experiencing shoulder instability or recurrent dislocations in New York City, Dr. Sameh Elguizaoui offers expert evaluation and treatment at his Manhattan, Brooklyn, and Scarsdale offices. As a fellowship-trained orthopedic surgeon, he specializes in arthroscopic Bankart repair and Latarjet procedures for patients throughout the NYC area who need lasting shoulder stability.",
    relatedService: "shoulder-knee-surgery",
  },
  {
    slug: "labral-tears-slap-tears",
    title: "Labral Tears (SLAP Tears)",
    tagline: "Precise diagnosis, gentle repair",
    heroImage: PLACEHOLDER_IMAGE,
    overview: "The labrum is a ring of cartilage that deepens your shoulder socket and helps keep the joint stable. A tear here — sometimes called a SLAP tear — can cause pain, catching, and a feeling of instability. These injuries are common in athletes and active people, but they're very treatable with modern techniques.",
    symptoms: [
      "Deep, aching shoulder pain that's hard to pinpoint",
      "Catching, locking, or popping sensations",
      "Pain with overhead movements or throwing",
      "Decreased shoulder strength or range of motion",
    ],
    treatments: [
      "Physical therapy focused on shoulder mechanics",
      "Anti-inflammatory medications for pain relief",
      "Arthroscopic labral repair using small anchors",
      "Biceps tenodesis for certain tear patterns",
    ],
    recovery: "Many labral tears improve with dedicated physical therapy. When surgery is the best option, arthroscopic repair uses tiny incisions and has you in a sling for a few weeks, with gradual return to full activity over 3-6 months.",
    reassurance: "Dr. Elguizaoui's fellowship training included extensive experience with labral repairs. He'll take the time to explain exactly what's happening and what to expect at every step.",
    seoText: "Dr. Sameh Elguizaoui provides specialized labral tear and SLAP tear treatment in NYC. With locations in Manhattan, Brooklyn, and Scarsdale, he offers comprehensive diagnosis using advanced imaging and arthroscopic labral repair techniques. His Lenox Hill fellowship training ensures patients across New York City receive the highest standard of shoulder care.",
    relatedService: "shoulder-knee-surgery",
  },
  {
    slug: "acl-tears-and-reconstruction",
    title: "ACL Tears & Reconstruction",
    tagline: "Getting you back to what you love",
    heroImage: PLACEHOLDER_IMAGE,
    overview: "An ACL tear can feel like a devastating setback — but it doesn't have to be. The anterior cruciate ligament (ACL) is one of the key stabilizers in your knee, and while tearing it is a significant injury, reconstruction surgery has come a long way. Dr. Elguizaoui has helped countless patients — from professional athletes to weekend warriors — return to the activities they love.",
    symptoms: [
      "A 'pop' sensation at the time of injury",
      "Rapid swelling within hours",
      "Feeling of the knee 'giving way' or being unstable",
      "Difficulty bearing weight or walking normally",
    ],
    treatments: [
      "Prehabilitation to prepare the knee for surgery",
      "ACL reconstruction using your own tissue or donor graft",
      "Arthroscopic technique — small incisions, same-day surgery",
      "Structured rehabilitation protocol for full recovery",
    ],
    recovery: "ACL reconstruction is performed arthroscopically as an outpatient procedure. You'll work closely with a physical therapist on a personalized recovery plan. Most patients return to sports between 6-9 months, with Dr. Elguizaoui guiding you through every milestone.",
    reassurance: "As a former team physician for the NY Jets and NY Islanders, Dr. Elguizaoui brings the same level of care to every patient — not just professional athletes.",
    seoText: "Looking for an ACL surgeon in New York City? Dr. Sameh Elguizaoui is a board-certified orthopedic surgeon performing ACL reconstruction at top NYC hospitals including Lenox Hill and Mount Sinai West. With offices in Manhattan, Brooklyn, and Scarsdale, he brings the same expertise used for professional NFL and NHL athletes to every patient in the New York metropolitan area.",
    relatedService: "shoulder-knee-surgery",
  },
  {
    slug: "meniscus-tears",
    title: "Meniscus Tears",
    tagline: "Protect your knee, preserve your mobility",
    heroImage: PLACEHOLDER_IMAGE,
    overview: "Your meniscus is a C-shaped cushion of cartilage in your knee that absorbs shock and helps the joint move smoothly. Tears can happen during sports, from a twist, or gradually with age. The great news is that many meniscus tears can be treated without surgery, and when surgery is needed, it's minimally invasive with a quick recovery.",
    symptoms: [
      "Pain along the inner or outer edge of the knee",
      "Swelling that develops over a day or two",
      "Catching, locking, or difficulty straightening the knee",
      "A feeling of the knee 'giving way'",
    ],
    treatments: [
      "Rest, ice, and anti-inflammatory medication",
      "Physical therapy to strengthen surrounding muscles",
      "Arthroscopic meniscus repair — preserving the tissue when possible",
      "Partial meniscectomy — trimming only the damaged portion",
    ],
    recovery: "For a simple meniscectomy, many patients walk the same day and return to normal activities in 2-4 weeks. Meniscus repair takes a bit longer — typically 3-4 months — but preserves this important cushion for the long term.",
    reassurance: "Dr. Elguizaoui always prioritizes saving your meniscus whenever possible, because preserving this tissue protects your knee for years to come.",
    seoText: "Dr. Sameh Elguizaoui offers expert meniscus tear treatment in New York City, from conservative therapy to arthroscopic meniscus repair and meniscectomy. Conveniently located in Manhattan, Brooklyn, and Scarsdale, he prioritizes meniscus preservation to protect long-term knee health for patients across the NYC area.",
    relatedService: "shoulder-knee-surgery",
  },
  {
    slug: "patellar-instability",
    title: "Patellar Instability",
    tagline: "A kneecap that stays where it belongs",
    heroImage: PLACEHOLDER_IMAGE,
    overview: "Patellar instability means your kneecap (patella) tends to slide out of its groove, partially or completely. It can happen after a sudden twist or impact, or it may be something you've dealt with repeatedly. It can feel scary, but this is a well-understood condition with very effective treatments.",
    symptoms: [
      "Kneecap sliding or 'popping' out of place",
      "Swelling and pain after a dislocation episode",
      "A feeling of the knee buckling or giving way",
      "Apprehension when bending or twisting the knee",
    ],
    treatments: [
      "Physical therapy to strengthen the VMO and surrounding muscles",
      "Bracing and activity modification during recovery",
      "MPFL reconstruction to restore kneecap stability",
      "Tibial tubercle osteotomy for alignment correction",
    ],
    recovery: "Many first-time dislocations heal well with physical therapy and bracing. For recurrent instability, MPFL reconstruction is highly successful, with most patients returning to full activity in 4-6 months.",
    reassurance: "If your kneecap has come out of place more than once, you're not alone — and there are excellent solutions. Dr. Elguizaoui will help you understand your options clearly.",
    seoText: "For patellar instability and kneecap dislocation treatment in New York City, Dr. Sameh Elguizaoui offers expert care including MPFL reconstruction and physical therapy programs. With offices in Manhattan, Brooklyn, and Scarsdale, he provides comprehensive knee evaluation and treatment for patients throughout the greater NYC area.",
    relatedService: "shoulder-knee-surgery",
  },
  {
    slug: "knee-cartilage-injuries",
    title: "Knee Cartilage Injuries",
    tagline: "Restoring the smooth surface your knee needs",
    heroImage: PLACEHOLDER_IMAGE,
    overview: "Cartilage is the smooth, slippery surface that lets your knee bend and move without friction. When it's damaged — from injury, wear, or a condition like osteochondritis dissecans — it can cause pain, swelling, and stiffness. Dr. Elguizaoui completed an international fellowship across Europe focused specifically on cartilage repair, bringing world-class techniques to your care.",
    symptoms: [
      "Pain with activity that improves with rest",
      "Swelling after exercise or prolonged standing",
      "Catching or locking sensations in the knee",
      "Stiffness, especially after sitting for a while",
    ],
    treatments: [
      "Activity modification and anti-inflammatory therapy",
      "PRP and biologic injections to support healing",
      "Microfracture surgery to stimulate new cartilage growth",
      "Cartilage transplantation (OATS, ACI) for larger defects",
    ],
    recovery: "Recovery depends on the technique used. Smaller repairs may have you back in 6-8 weeks; cartilage transplant procedures take 4-6 months but offer long-lasting results. Dr. Elguizaoui will match the right technique to your specific injury.",
    reassurance: "Cartilage repair has advanced tremendously. Dr. Elguizaoui's European fellowship training means you have access to techniques that are truly at the forefront of orthopedic medicine.",
    seoText: "Dr. Sameh Elguizaoui is one of the leading knee cartilage repair specialists in New York City, with international fellowship training in Switzerland, the Netherlands, and Italy. From microfracture to cartilage transplantation (OATS, ACI), he offers the full spectrum of cartilage restoration at his Manhattan, Brooklyn, and Scarsdale offices for patients across the NYC metro area.",
    relatedService: "cartilage-repair",
  },
  {
    slug: "biceps-tendon-injuries",
    title: "Biceps Tendon Injuries",
    tagline: "Relief is closer than you think",
    heroImage: PLACEHOLDER_IMAGE,
    overview: "The biceps tendon connects your biceps muscle to the shoulder and elbow. Injuries can range from inflammation (tendinitis) to partial or complete tears. These injuries often cause pain in the front of the shoulder and can make everyday tasks uncomfortable. Most biceps tendon issues respond well to conservative treatment.",
    symptoms: [
      "Pain in the front of the shoulder or upper arm",
      "A snapping or popping sensation in the shoulder",
      "Weakness with lifting or twisting motions",
      "Bruising or a visible bulge in the upper arm (with complete tears)",
    ],
    treatments: [
      "Rest, ice, and anti-inflammatory medications",
      "Physical therapy focusing on shoulder and arm mechanics",
      "Cortisone or PRP injections for persistent inflammation",
      "Biceps tenodesis — a reliable surgical option when needed",
    ],
    recovery: "Most biceps tendon injuries improve significantly with physical therapy and time. When surgery (tenodesis) is needed, it's a well-established procedure with excellent outcomes. Most patients return to full strength within 3-4 months.",
    reassurance: "Biceps tendon problems might sound intimidating, but they're among the most successfully treated shoulder conditions. Dr. Elguizaoui will help you understand exactly what's going on and how to fix it.",
    seoText: "For biceps tendon injuries and shoulder pain in New York City, Dr. Sameh Elguizaoui provides expert diagnosis and treatment including PRP therapy, physical therapy, and biceps tenodesis surgery. Board-certified and fellowship-trained, he sees patients at his Manhattan, Brooklyn, and Scarsdale offices throughout the NYC metropolitan area.",
    relatedService: "shoulder-knee-surgery",
  },
];

export function getConditionBySlug(slug: string): Condition | undefined {
  return conditions.find((c) => c.slug === slug);
}
