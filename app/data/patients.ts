export interface Patient {
  id: number;
  name: string;
  age: number;
  dob: string;
  phone: string;
  email: string;
  address: string;
  insurance: string;
  memberId: string;
  lastVisit: string;
  nextAppt: string;
  condition: string;
  status: "Active" | "New" | "Discharged";
  provider: string;
  referredBy: string;
  allergies: string[];
  medications: string[];
  visits: {
    date: string;
    type: string;
    notes: string;
    codes: string[];
  }[];
}

export const PATIENTS: Patient[] = [
  {
    id: 1,
    name: "Sarah Mitchell",
    age: 34,
    dob: "08/23/1991",
    phone: "(917) 555-0142",
    email: "sarah.m@email.com",
    address: "445 East 68th St, Apt 12B, New York, NY 10065",
    insurance: "Aetna PPO",
    memberId: "AET-551298437",
    lastVisit: "Mar 18, 2026",
    nextAppt: "Mar 25, 2026",
    condition: "Rotator Cuff Tear",
    status: "Active",
    provider: "Sameh Elguizaoui, M.D.",
    referredBy: "Dr. Alan Kessler (PCP)",
    allergies: ["Penicillin", "Latex"],
    medications: ["Ibuprofen 600mg PRN", "Acetaminophen 500mg PRN"],
    visits: [
      { date: "Mar 18, 2026", type: "Post-Op Follow-up", notes: "6-week post-op arthroscopic rotator cuff repair. Active forward flexion 140°, external rotation 35°. Incisions well-healed. Continue PT, advance to phase 3 strengthening.", codes: ["M75.111", "99214"] },
      { date: "Feb 4, 2026", type: "Surgery — Arthroscopic Rotator Cuff Repair", notes: "Arthroscopic repair of supraspinatus tendon, right shoulder. Single-row repair with 2 suture anchors. No complications.", codes: ["M75.111", "29827", "29826"] },
      { date: "Jan 15, 2026", type: "Pre-Op Evaluation", notes: "MRI confirmed full-thickness supraspinatus tear. Discussed surgical options. Patient elects arthroscopic repair. Cleared for surgery.", codes: ["M75.111", "99213"] },
      { date: "Dec 20, 2025", type: "Initial Consultation", notes: "Right shoulder pain x 3 months, worse with overhead activities. Positive Neer and Hawkins signs. MRI ordered.", codes: ["M75.111", "99203", "73221"] },
    ],
  },
  {
    id: 2,
    name: "James Kim",
    age: 28,
    dob: "04/12/1997",
    phone: "(212) 555-0198",
    email: "j.kim@email.com",
    address: "220 West 42nd St, Apt 8F, New York, NY 10036",
    insurance: "UnitedHealthcare Choice Plus",
    memberId: "UHC-884721350",
    lastVisit: "Mar 20, 2026",
    nextAppt: "Mar 22, 2026",
    condition: "ACL Injury",
    status: "New",
    provider: "Sameh Elguizaoui, M.D.",
    referredBy: "Self-referred (ER at NYP)",
    allergies: [],
    medications: ["Naproxen 500mg BID", "Tramadol 50mg PRN"],
    visits: [
      { date: "Mar 20, 2026", type: "Pre-Op Planning", notes: "MRI confirmed complete ACL rupture with lateral meniscus tear. Discussed autograft vs allograft. Patient elects BPTB autograft. Surgery scheduled for 3/22.", codes: ["S83.511A", "S83.282A", "99214"] },
      { date: "Mar 14, 2026", type: "Initial Consultation", notes: "34-year-old male with right knee instability following non-contact pivoting injury during recreational basketball. Positive Lachman, anterior drawer, and pivot shift. MRI ordered.", codes: ["S83.511A", "99203", "73721"] },
    ],
  },
  {
    id: 3,
    name: "Maria Lopez",
    age: 45,
    dob: "07/03/1980",
    phone: "(718) 555-0167",
    email: "m.lopez@email.com",
    address: "89-12 Roosevelt Ave, Jackson Heights, NY 11372",
    insurance: "Cigna Open Access Plus",
    memberId: "CIG-662193847",
    lastVisit: "Mar 15, 2026",
    nextAppt: "Apr 1, 2026",
    condition: "Post-Op ACL",
    status: "Active",
    provider: "Sameh Elguizaoui, M.D.",
    referredBy: "Dr. Rosa Mendez (Sports Med)",
    allergies: ["Sulfa drugs"],
    medications: ["Acetaminophen 500mg PRN", "Vitamin D 2000 IU daily"],
    visits: [
      { date: "Mar 15, 2026", type: "Post-Op Follow-up (4 weeks)", notes: "4-week post-op ACL reconstruction. Knee ROM 5–110°. Minimal effusion. Wound healed. Progressing well in PT. Continue current protocol.", codes: ["S83.511A", "Z96.651", "99214"] },
      { date: "Feb 15, 2026", type: "Surgery — ACL Reconstruction", notes: "Arthroscopic ACL reconstruction with hamstring autograft, left knee. Graft secured with suspensory fixation. No complications.", codes: ["S83.512A", "29888", "29881"] },
      { date: "Jan 28, 2026", type: "Pre-Op Evaluation", notes: "Pre-op clearance obtained. Reviewed surgical plan. Patient understands risks and expectations.", codes: ["S83.512A", "99213"] },
    ],
  },
  {
    id: 4,
    name: "David Ross",
    age: 52,
    dob: "11/05/1973",
    phone: "(917) 555-0203",
    email: "d.ross@email.com",
    address: "15 Central Park West, Apt 22A, New York, NY 10023",
    insurance: "Cigna Open Access Plus",
    memberId: "CIG-773845219",
    lastVisit: "Mar 10, 2026",
    nextAppt: "Mar 24, 2026",
    condition: "Hip Replacement Consult",
    status: "Active",
    provider: "Sameh Elguizaoui, M.D.",
    referredBy: "Dr. Thomas Park (Rheumatology)",
    allergies: ["Codeine"],
    medications: ["Meloxicam 15mg daily", "Glucosamine 1500mg daily"],
    visits: [
      { date: "Mar 10, 2026", type: "New Patient Consultation", notes: "47-year-old male with progressive right hip pain x 18 months, worse with activity and prolonged sitting. X-ray shows moderate joint space narrowing with marginal osteophytes. Discussed conservative management: PT, NSAIDs, activity modification.", codes: ["M16.11", "99203", "73502"] },
    ],
  },
  {
    id: 5,
    name: "Emily Chen",
    age: 31,
    dob: "09/14/1994",
    phone: "(646) 555-0119",
    email: "e.chen@email.com",
    address: "330 East 38th St, Apt 5C, New York, NY 10016",
    insurance: "Blue Cross Blue Shield PPO",
    memberId: "BCBS-443876512",
    lastVisit: "Mar 12, 2026",
    nextAppt: "Mar 26, 2026",
    condition: "Wrist Fracture",
    status: "Active",
    provider: "Sameh Elguizaoui, M.D.",
    referredBy: "Urgent Care — CityMD East Side",
    allergies: [],
    medications: ["Ibuprofen 400mg PRN"],
    visits: [
      { date: "Mar 12, 2026", type: "Follow-up — Cast Removal", notes: "6-week follow-up. X-ray shows union of distal radius fracture. Cast removed. Mild stiffness, good ROM returning. Begin OT for wrist rehabilitation. Return 4 weeks.", codes: ["S52.501A", "Z87.39", "99214", "73100"] },
      { date: "Jan 30, 2026", type: "Initial Visit — Fracture Management", notes: "Distal radius fracture, non-displaced, right wrist from fall. Short-arm cast applied. Follow-up in 6 weeks with repeat X-ray.", codes: ["S52.501A", "99203", "73100", "25600"] },
    ],
  },
  {
    id: 6,
    name: "Michael Brown",
    age: 22,
    dob: "01/28/2004",
    phone: "(917) 555-0187",
    email: "m.brown@email.com",
    address: "182 Livingston St, Brooklyn, NY 11201",
    insurance: "UnitedHealthcare Student Plan",
    memberId: "UHC-992341876",
    lastVisit: "Mar 19, 2026",
    nextAppt: "Apr 2, 2026",
    condition: "Ankle Sprain",
    status: "New",
    provider: "Sameh Elguizaoui, M.D.",
    referredBy: "NYU Athletics",
    allergies: ["Aspirin"],
    medications: ["Naproxen 250mg BID"],
    visits: [
      { date: "Mar 19, 2026", type: "Initial Consultation", notes: "22-year-old male, inversion ankle injury during soccer 5 days ago. Grade II lateral ankle sprain — anterior talofibular and calcaneofibular ligaments involved. X-ray negative for fracture. RICE protocol, air-stirrup brace, and PT referral.", codes: ["S93.401A", "99203", "73600"] },
    ],
  },
  {
    id: 7,
    name: "Lisa Strassberg",
    age: 41,
    dob: "06/17/1984",
    phone: "(718) 555-0234",
    email: "l.strassberg@email.com",
    address: "450 Pacific St, Brooklyn, NY 11217",
    insurance: "Aetna HMO",
    memberId: "AET-887231456",
    lastVisit: "Feb 28, 2026",
    nextAppt: "Mar 28, 2026",
    condition: "Knee Arthroscopy Follow-up",
    status: "Active",
    provider: "Sameh Elguizaoui, M.D.",
    referredBy: "Dr. Lisa Freedman (PCP)",
    allergies: [],
    medications: ["Acetaminophen 500mg PRN", "Calcium 600mg + D3 daily"],
    visits: [
      { date: "Feb 28, 2026", type: "Post-Op Follow-up (8 weeks)", notes: "8-week post-op knee arthroscopy for medial meniscus tear. Good ROM, no effusion. Returning to normal activities. Final follow-up unless issues arise.", codes: ["M23.211", "Z96.651", "99214"] },
      { date: "Jan 20, 2026", type: "Post-Op Follow-up (2 weeks)", notes: "2-week post-op check. Incisions healing well. Minimal swelling. Begin physical therapy. Progress weight bearing as tolerated.", codes: ["M23.211", "99213"] },
      { date: "Jan 3, 2026", type: "Surgery — Knee Arthroscopy", notes: "Arthroscopic partial medial meniscectomy, right knee. Torn posterior horn debrided. Articular cartilage intact. No complications.", codes: ["M23.211", "29881"] },
      { date: "Dec 10, 2025", type: "Initial Consultation", notes: "Right knee pain and catching x 2 months. MRI confirms medial meniscus tear. Discussed surgical vs conservative. Patient elects arthroscopy.", codes: ["M23.211", "99203", "73721"] },
    ],
  },
  {
    id: 8,
    name: "Robert Taylor",
    age: 67,
    dob: "05/30/1958",
    phone: "(212) 555-0156",
    email: "r.taylor@email.com",
    address: "77 Park Ave, Scarsdale, NY 10583",
    insurance: "Medicare + Medigap Plan F",
    memberId: "MBI-1EG4TE5MK72",
    lastVisit: "Mar 5, 2026",
    nextAppt: "-",
    condition: "Shoulder Replacement",
    status: "Discharged",
    provider: "Sameh Elguizaoui, M.D.",
    referredBy: "Dr. William Hart (Rheumatology)",
    allergies: ["Morphine", "NSAIDs (GI bleed history)"],
    medications: ["Acetaminophen 1000mg TID", "Omeprazole 20mg daily", "Amlodipine 5mg daily"],
    visits: [
      { date: "Mar 5, 2026", type: "Final Post-Op (12 weeks)", notes: "12-week post-op total shoulder arthroplasty. Excellent ROM: forward flexion 155°, external rotation 50°. Patient very satisfied. Discharged from surgical care. Continue home exercise program.", codes: ["M19.011", "Z96.611", "99214"] },
      { date: "Feb 5, 2026", type: "Post-Op Follow-up (8 weeks)", notes: "8-week follow-up. X-ray shows well-positioned prosthesis. PT progressing well. Active ROM improving steadily.", codes: ["M19.011", "Z96.611", "99214", "73060"] },
      { date: "Jan 8, 2026", type: "Post-Op Follow-up (4 weeks)", notes: "4-week post-op. Wound healed. Sling discontinued. Beginning active assisted ROM exercises. Continue PT 3x/week.", codes: ["M19.011", "Z96.611", "99213"] },
      { date: "Dec 11, 2025", type: "Surgery — Total Shoulder Arthroplasty", notes: "Total shoulder arthroplasty, right shoulder. Deltopectoral approach. Cemented humeral stem, press-fit glenoid. Subscapularis repaired. No complications.", codes: ["M19.011", "23472"] },
      { date: "Nov 20, 2025", type: "Pre-Op Evaluation", notes: "Pre-op clearance obtained. Cardiac clearance from Dr. Shah. Reviewed surgical plan, risks, and rehabilitation timeline.", codes: ["M19.011", "99214"] },
    ],
  },
];

export function getPatientById(id: number): Patient | undefined {
  return PATIENTS.find((p) => p.id === id);
}

export function getPatientBySlug(slug: string): Patient | undefined {
  const id = parseInt(slug, 10);
  if (isNaN(id)) return undefined;
  return getPatientById(id);
}
