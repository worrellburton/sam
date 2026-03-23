export interface Patient {
  id: number;
  name: string;
  age: number;
  dob: string;
  sex: "Male" | "Female";
  phone: string;
  email: string;
  address: string;
  insurance: string;
  memberId: string;
  groupNumber: string;
  priorAuth?: string;
  subscriberName?: string;
  subscriberDob?: string;
  subscriberRelationship?: string;
  aobSigned: boolean;
  aobDate?: string;
  roiSigned: boolean;
  roiDate?: string;
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
  signedUpDate: string;
  introMessage: string;
  invoices: {
    id: string;
    date: string;
    description: string;
    totalCharged: number;
    insurancePaid: number;
    deductibleApplied: number;
    copay: number;
    patientOwes: number;
    status: "Paid" | "Pending" | "Overdue" | "Insurance Processing";
    claimId?: string;
  }[];
  billingEvents: {
    date: string;
    type: "claim_filed" | "claim_paid" | "payment_received" | "invoice_sent" | "prior_auth_approved";
    description: string;
    amount?: number;
    claimId?: string;
  }[];
}

export const PATIENTS: Patient[] = [
  {
    id: 1,
    name: "Sarah Mitchell",
    age: 34,
    dob: "08/23/1991",
    sex: "Female",
    phone: "(917) 555-0142",
    email: "sarah.m@email.com",
    address: "445 East 68th St, Apt 12B, New York, NY 10065",
    insurance: "Aetna PPO",
    memberId: "AET-551298437",
    groupNumber: "GRP-88421",
    priorAuth: "AUTH-2026-00447",
    subscriberName: "Sarah Mitchell",
    subscriberRelationship: "Self",
    aobSigned: true,
    aobDate: "Dec 18, 2025",
    roiSigned: true,
    roiDate: "Dec 18, 2025",
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
    signedUpDate: "Dec 18, 2025",
    introMessage: "Hi, I'm Sarah Mitchell. I've been dealing with right shoulder pain for the past 3 months — especially with overhead movements. My PCP Dr. Kessler referred me for an orthopedic evaluation.",
    invoices: [
      { id: "INV-2026-0041", date: "Mar 20, 2026", description: "Post-Op Follow-up (99214)", totalCharged: 275.00, insurancePaid: 192.50, deductibleApplied: 0, copay: 40.00, patientOwes: 42.50, status: "Paid", claimId: "CLM-2026-1187" },
      { id: "INV-2026-0028", date: "Feb 6, 2026", description: "Arthroscopic Rotator Cuff Repair (29827, 29826)", totalCharged: 14850.00, insurancePaid: 11880.00, deductibleApplied: 1500.00, copay: 0, patientOwes: 1470.00, status: "Paid", claimId: "CLM-2026-0892" },
      { id: "INV-2026-0015", date: "Jan 17, 2026", description: "Pre-Op Evaluation (99213)", totalCharged: 195.00, insurancePaid: 136.50, deductibleApplied: 18.50, copay: 40.00, patientOwes: 0, status: "Paid", claimId: "CLM-2026-0541" },
      { id: "INV-2025-0412", date: "Dec 22, 2025", description: "Initial Consultation + MRI (99203, 73221)", totalCharged: 2450.00, insurancePaid: 1715.00, deductibleApplied: 495.00, copay: 40.00, patientOwes: 200.00, status: "Paid", claimId: "CLM-2025-4891" },
    ],
    billingEvents: [
      { date: "Mar 20, 2026", type: "invoice_sent", description: "Invoice INV-2026-0041 sent for post-op follow-up", amount: 275.00 },
      { date: "Mar 18, 2026", type: "claim_filed", description: "Claim CLM-2026-1187 filed to Aetna for post-op visit", claimId: "CLM-2026-1187" },
      { date: "Mar 5, 2026", type: "payment_received", description: "Aetna paid $11,880.00 for surgery claim CLM-2026-0892", amount: 11880.00, claimId: "CLM-2026-0892" },
      { date: "Feb 8, 2026", type: "claim_filed", description: "Claim CLM-2026-0892 filed to Aetna for arthroscopic repair", claimId: "CLM-2026-0892" },
      { date: "Jan 22, 2026", type: "payment_received", description: "Aetna paid $136.50 for pre-op eval CLM-2026-0541", amount: 136.50, claimId: "CLM-2026-0541" },
      { date: "Jan 17, 2026", type: "claim_filed", description: "Claim CLM-2026-0541 filed to Aetna for pre-op evaluation", claimId: "CLM-2026-0541" },
      { date: "Jan 10, 2026", type: "prior_auth_approved", description: "Prior Auth AUTH-2026-00447 approved for arthroscopic rotator cuff repair" },
      { date: "Dec 24, 2025", type: "claim_filed", description: "Claim CLM-2025-4891 filed to Aetna for initial consult + MRI", claimId: "CLM-2025-4891" },
    ],
  },
  {
    id: 2,
    name: "James Kim",
    age: 28,
    dob: "04/12/1997",
    sex: "Male",
    phone: "(212) 555-0198",
    email: "j.kim@email.com",
    address: "220 West 42nd St, Apt 8F, New York, NY 10036",
    insurance: "UnitedHealthcare Choice Plus",
    memberId: "UHC-884721350",
    groupNumber: "GRP-56290",
    priorAuth: "AUTH-2026-00512",
    subscriberName: "James Kim",
    subscriberRelationship: "Self",
    aobSigned: true,
    aobDate: "Mar 14, 2026",
    roiSigned: true,
    roiDate: "Mar 14, 2026",
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
    signedUpDate: "Mar 14, 2026",
    introMessage: "I injured my knee playing basketball last week — landed wrong on a pivot and felt a pop. The ER at NYP said it might be an ACL tear and told me to see an orthopedic surgeon.",
    invoices: [
      { id: "INV-2026-0038", date: "Mar 22, 2026", description: "Pre-Op Planning (99214)", totalCharged: 275.00, insurancePaid: 0, deductibleApplied: 0, copay: 45.00, patientOwes: 275.00, status: "Insurance Processing", claimId: "CLM-2026-1145" },
      { id: "INV-2026-0035", date: "Mar 16, 2026", description: "Initial Consultation + MRI (99203, 73721)", totalCharged: 2650.00, insurancePaid: 0, deductibleApplied: 0, copay: 45.00, patientOwes: 2650.00, status: "Insurance Processing", claimId: "CLM-2026-1098" },
    ],
    billingEvents: [
      { date: "Mar 22, 2026", type: "claim_filed", description: "Claim CLM-2026-1145 filed to UHC for pre-op planning", claimId: "CLM-2026-1145" },
      { date: "Mar 20, 2026", type: "prior_auth_approved", description: "Prior Auth AUTH-2026-00512 approved for ACL reconstruction" },
      { date: "Mar 16, 2026", type: "claim_filed", description: "Claim CLM-2026-1098 filed to UHC for initial consult + MRI", claimId: "CLM-2026-1098" },
      { date: "Mar 16, 2026", type: "invoice_sent", description: "Invoice INV-2026-0035 sent for initial visit", amount: 2650.00 },
    ],
  },
  {
    id: 3,
    name: "Maria Lopez",
    age: 45,
    dob: "07/03/1980",
    sex: "Female",
    phone: "(718) 555-0167",
    email: "m.lopez@email.com",
    address: "89-12 Roosevelt Ave, Jackson Heights, NY 11372",
    insurance: "Cigna Open Access Plus",
    memberId: "CIG-662193847",
    groupNumber: "GRP-41783",
    subscriberName: "Carlos Lopez",
    subscriberDob: "03/15/1978",
    subscriberRelationship: "Spouse",
    aobSigned: true,
    aobDate: "Jan 25, 2026",
    roiSigned: true,
    roiDate: "Jan 25, 2026",
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
    signedUpDate: "Jan 25, 2026",
    introMessage: "Hello, I'm Maria Lopez. Dr. Rosa Mendez referred me — I tore my ACL during a hiking trip. I'm hoping to get back to full activity.",
    invoices: [
      { id: "INV-2026-0032", date: "Mar 17, 2026", description: "Post-Op Follow-up 4wk (99214)", totalCharged: 275.00, insurancePaid: 220.00, deductibleApplied: 0, copay: 35.00, patientOwes: 20.00, status: "Paid", claimId: "CLM-2026-1056" },
      { id: "INV-2026-0021", date: "Feb 17, 2026", description: "ACL Reconstruction (29888, 29881)", totalCharged: 16200.00, insurancePaid: 12960.00, deductibleApplied: 2000.00, copay: 0, patientOwes: 1240.00, status: "Paid", claimId: "CLM-2026-0774" },
      { id: "INV-2026-0012", date: "Jan 30, 2026", description: "Pre-Op Evaluation (99213)", totalCharged: 195.00, insurancePaid: 156.00, deductibleApplied: 0, copay: 35.00, patientOwes: 4.00, status: "Paid", claimId: "CLM-2026-0498" },
    ],
    billingEvents: [
      { date: "Mar 17, 2026", type: "claim_filed", description: "Claim CLM-2026-1056 filed to Cigna for post-op follow-up", claimId: "CLM-2026-1056" },
      { date: "Mar 10, 2026", type: "payment_received", description: "Cigna paid $12,960.00 for ACL surgery claim", amount: 12960.00, claimId: "CLM-2026-0774" },
      { date: "Feb 19, 2026", type: "claim_filed", description: "Claim CLM-2026-0774 filed to Cigna for ACL reconstruction", claimId: "CLM-2026-0774" },
      { date: "Feb 5, 2026", type: "payment_received", description: "Cigna paid $156.00 for pre-op eval", amount: 156.00, claimId: "CLM-2026-0498" },
      { date: "Jan 30, 2026", type: "claim_filed", description: "Claim CLM-2026-0498 filed to Cigna for pre-op evaluation", claimId: "CLM-2026-0498" },
    ],
  },
  {
    id: 4,
    name: "David Ross",
    age: 52,
    dob: "11/05/1973",
    sex: "Male",
    phone: "(917) 555-0203",
    email: "d.ross@email.com",
    address: "15 Central Park West, Apt 22A, New York, NY 10023",
    insurance: "Cigna Open Access Plus",
    memberId: "CIG-773845219",
    groupNumber: "GRP-60214",
    subscriberName: "David Ross",
    subscriberRelationship: "Self",
    aobSigned: true,
    aobDate: "Mar 8, 2026",
    roiSigned: true,
    roiDate: "Mar 8, 2026",
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
    signedUpDate: "Mar 8, 2026",
    introMessage: "I'm David Ross. I've had worsening hip pain for about a year and a half. Dr. Park from rheumatology suggested I see a surgeon to discuss my options.",
    invoices: [
      { id: "INV-2026-0030", date: "Mar 12, 2026", description: "New Patient Consultation + X-ray (99203, 73502)", totalCharged: 485.00, insurancePaid: 0, deductibleApplied: 0, copay: 35.00, patientOwes: 485.00, status: "Insurance Processing", claimId: "CLM-2026-1023" },
    ],
    billingEvents: [
      { date: "Mar 12, 2026", type: "claim_filed", description: "Claim CLM-2026-1023 filed to Cigna for new patient consult", claimId: "CLM-2026-1023" },
      { date: "Mar 12, 2026", type: "invoice_sent", description: "Invoice INV-2026-0030 sent for initial consultation", amount: 485.00 },
    ],
  },
  {
    id: 5,
    name: "Emily Chen",
    age: 31,
    dob: "09/14/1994",
    sex: "Female",
    phone: "(646) 555-0119",
    email: "e.chen@email.com",
    address: "330 East 38th St, Apt 5C, New York, NY 10016",
    insurance: "Blue Cross Blue Shield PPO",
    memberId: "BCBS-443876512",
    groupNumber: "GRP-33198",
    subscriberName: "Emily Chen",
    subscriberRelationship: "Self",
    aobSigned: true,
    aobDate: "Jan 28, 2026",
    roiSigned: true,
    roiDate: "Jan 28, 2026",
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
    signedUpDate: "Jan 28, 2026",
    introMessage: "Hi, I'm Emily Chen. I fell and hurt my wrist two days ago — the urgent care at CityMD said it's fractured and told me to see an orthopedic specialist.",
    invoices: [
      { id: "INV-2026-0029", date: "Mar 14, 2026", description: "Follow-up — Cast Removal + X-ray (99214, 73100)", totalCharged: 425.00, insurancePaid: 340.00, deductibleApplied: 0, copay: 30.00, patientOwes: 55.00, status: "Paid", claimId: "CLM-2026-1034" },
      { id: "INV-2026-0010", date: "Feb 1, 2026", description: "Fracture Management + Cast (99203, 73100, 25600)", totalCharged: 1850.00, insurancePaid: 1480.00, deductibleApplied: 250.00, copay: 30.00, patientOwes: 90.00, status: "Paid", claimId: "CLM-2026-0412" },
    ],
    billingEvents: [
      { date: "Mar 22, 2026", type: "payment_received", description: "BCBS paid $340.00 for cast removal visit", amount: 340.00, claimId: "CLM-2026-1034" },
      { date: "Mar 14, 2026", type: "claim_filed", description: "Claim CLM-2026-1034 filed to BCBS for follow-up", claimId: "CLM-2026-1034" },
      { date: "Feb 15, 2026", type: "payment_received", description: "BCBS paid $1,480.00 for fracture management", amount: 1480.00, claimId: "CLM-2026-0412" },
      { date: "Feb 1, 2026", type: "claim_filed", description: "Claim CLM-2026-0412 filed to BCBS for fracture management", claimId: "CLM-2026-0412" },
    ],
  },
  {
    id: 6,
    name: "Michael Brown",
    age: 22,
    dob: "01/28/2004",
    sex: "Male",
    phone: "(917) 555-0187",
    email: "m.brown@email.com",
    address: "182 Livingston St, Brooklyn, NY 11201",
    insurance: "UnitedHealthcare Student Plan",
    memberId: "UHC-992341876",
    groupNumber: "GRP-NYU-2026",
    subscriberName: "Patricia Brown",
    subscriberDob: "05/19/1975",
    subscriberRelationship: "Parent",
    aobSigned: true,
    aobDate: "Mar 19, 2026",
    roiSigned: false,
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
    signedUpDate: "Mar 19, 2026",
    introMessage: "Hey, I'm Michael Brown. I play soccer at NYU and sprained my ankle pretty badly during practice. The athletic trainer sent me here.",
    invoices: [
      { id: "INV-2026-0037", date: "Mar 21, 2026", description: "Initial Consultation + X-ray (99203, 73600)", totalCharged: 385.00, insurancePaid: 0, deductibleApplied: 0, copay: 40.00, patientOwes: 385.00, status: "Insurance Processing", claimId: "CLM-2026-1132" },
    ],
    billingEvents: [
      { date: "Mar 21, 2026", type: "claim_filed", description: "Claim CLM-2026-1132 filed to UHC for initial consultation", claimId: "CLM-2026-1132" },
      { date: "Mar 21, 2026", type: "invoice_sent", description: "Invoice INV-2026-0037 sent for initial visit", amount: 385.00 },
    ],
  },
  {
    id: 7,
    name: "Lisa Strassberg",
    age: 41,
    dob: "06/17/1984",
    sex: "Female",
    phone: "(718) 555-0234",
    email: "l.strassberg@email.com",
    address: "450 Pacific St, Brooklyn, NY 11217",
    insurance: "Aetna HMO",
    memberId: "AET-887231456",
    groupNumber: "GRP-72510",
    subscriberName: "Lisa Strassberg",
    subscriberRelationship: "Self",
    aobSigned: true,
    aobDate: "Dec 5, 2025",
    roiSigned: true,
    roiDate: "Dec 5, 2025",
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
    signedUpDate: "Dec 5, 2025",
    introMessage: "Hi, I'm Lisa Strassberg. I've been having knee pain and a catching sensation for a couple months. My PCP Dr. Freedman recommended I see you.",
    invoices: [
      { id: "INV-2026-0024", date: "Mar 2, 2026", description: "Post-Op Follow-up 8wk (99214)", totalCharged: 275.00, insurancePaid: 220.00, deductibleApplied: 0, copay: 40.00, patientOwes: 15.00, status: "Paid", claimId: "CLM-2026-0845" },
      { id: "INV-2026-0014", date: "Jan 22, 2026", description: "Post-Op Follow-up 2wk (99213)", totalCharged: 195.00, insurancePaid: 156.00, deductibleApplied: 0, copay: 40.00, patientOwes: 0, status: "Paid", claimId: "CLM-2026-0523" },
      { id: "INV-2026-0008", date: "Jan 5, 2026", description: "Knee Arthroscopy — Meniscectomy (29881)", totalCharged: 8950.00, insurancePaid: 7160.00, deductibleApplied: 1000.00, copay: 0, patientOwes: 790.00, status: "Paid", claimId: "CLM-2026-0287" },
      { id: "INV-2025-0398", date: "Dec 12, 2025", description: "Initial Consultation + MRI (99203, 73721)", totalCharged: 2450.00, insurancePaid: 1960.00, deductibleApplied: 250.00, copay: 40.00, patientOwes: 200.00, status: "Paid", claimId: "CLM-2025-4723" },
    ],
    billingEvents: [
      { date: "Mar 15, 2026", type: "payment_received", description: "Aetna paid $220.00 for 8-week follow-up", amount: 220.00, claimId: "CLM-2026-0845" },
      { date: "Mar 2, 2026", type: "claim_filed", description: "Claim CLM-2026-0845 filed to Aetna for 8-week post-op", claimId: "CLM-2026-0845" },
      { date: "Feb 10, 2026", type: "payment_received", description: "Aetna paid $7,160.00 for arthroscopy surgery", amount: 7160.00, claimId: "CLM-2026-0287" },
      { date: "Jan 22, 2026", type: "claim_filed", description: "Claim CLM-2026-0523 filed to Aetna for 2-week post-op", claimId: "CLM-2026-0523" },
      { date: "Jan 7, 2026", type: "claim_filed", description: "Claim CLM-2026-0287 filed to Aetna for knee arthroscopy", claimId: "CLM-2026-0287" },
      { date: "Dec 14, 2025", type: "claim_filed", description: "Claim CLM-2025-4723 filed to Aetna for initial consult + MRI", claimId: "CLM-2025-4723" },
    ],
  },
  {
    id: 8,
    name: "Robert Taylor",
    age: 67,
    dob: "05/30/1958",
    sex: "Male",
    phone: "(212) 555-0156",
    email: "r.taylor@email.com",
    address: "77 Park Ave, Scarsdale, NY 10583",
    insurance: "Medicare + Medigap Plan F",
    memberId: "MBI-1EG4TE5MK72",
    groupNumber: "N/A",
    subscriberName: "Robert Taylor",
    subscriberRelationship: "Self",
    aobSigned: true,
    aobDate: "Nov 15, 2025",
    roiSigned: true,
    roiDate: "Nov 15, 2025",
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
    signedUpDate: "Nov 15, 2025",
    introMessage: "I'm Robert Taylor. I have severe shoulder arthritis and Dr. Hart from rheumatology said I should consider a total shoulder replacement. I'd like to discuss my options.",
    invoices: [
      { id: "INV-2026-0025", date: "Mar 7, 2026", description: "Final Post-Op 12wk (99214)", totalCharged: 275.00, insurancePaid: 220.00, deductibleApplied: 0, copay: 0, patientOwes: 55.00, status: "Paid", claimId: "CLM-2026-0867" },
      { id: "INV-2026-0018", date: "Feb 7, 2026", description: "Post-Op 8wk + X-ray (99214, 73060)", totalCharged: 425.00, insurancePaid: 340.00, deductibleApplied: 0, copay: 0, patientOwes: 85.00, status: "Paid", claimId: "CLM-2026-0698" },
      { id: "INV-2026-0009", date: "Jan 10, 2026", description: "Post-Op 4wk (99213)", totalCharged: 195.00, insurancePaid: 156.00, deductibleApplied: 0, copay: 0, patientOwes: 39.00, status: "Paid", claimId: "CLM-2026-0312" },
      { id: "INV-2025-0405", date: "Dec 13, 2025", description: "Total Shoulder Arthroplasty (23472)", totalCharged: 28500.00, insurancePaid: 22800.00, deductibleApplied: 0, copay: 0, patientOwes: 5700.00, status: "Paid", claimId: "CLM-2025-4812" },
      { id: "INV-2025-0392", date: "Nov 22, 2025", description: "Pre-Op Evaluation (99214)", totalCharged: 275.00, insurancePaid: 220.00, deductibleApplied: 183.00, copay: 0, patientOwes: 0, status: "Paid", claimId: "CLM-2025-4598" },
    ],
    billingEvents: [
      { date: "Mar 20, 2026", type: "payment_received", description: "Medicare paid $220.00 for final follow-up", amount: 220.00, claimId: "CLM-2026-0867" },
      { date: "Mar 7, 2026", type: "claim_filed", description: "Claim CLM-2026-0867 filed to Medicare for final post-op", claimId: "CLM-2026-0867" },
      { date: "Feb 25, 2026", type: "payment_received", description: "Medicare paid $340.00 for 8-week follow-up", amount: 340.00, claimId: "CLM-2026-0698" },
      { date: "Feb 7, 2026", type: "claim_filed", description: "Claim CLM-2026-0698 filed to Medicare for 8-week post-op", claimId: "CLM-2026-0698" },
      { date: "Jan 28, 2026", type: "payment_received", description: "Medicare paid $22,800.00 for shoulder arthroplasty", amount: 22800.00, claimId: "CLM-2025-4812" },
      { date: "Jan 10, 2026", type: "claim_filed", description: "Claim CLM-2026-0312 filed to Medicare for 4-week post-op", claimId: "CLM-2026-0312" },
      { date: "Dec 15, 2025", type: "claim_filed", description: "Claim CLM-2025-4812 filed to Medicare for total shoulder arthroplasty", claimId: "CLM-2025-4812" },
      { date: "Nov 24, 2025", type: "claim_filed", description: "Claim CLM-2025-4598 filed to Medicare for pre-op eval", claimId: "CLM-2025-4598" },
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
