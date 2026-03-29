export interface TeamMember {
  id: number;
  name: string;
  initials: string;
  role: string;
  specialty: string;
  email: string;
  phone: string;
  status: "Active" | "On Leave" | "Part-Time";
  schedule: string;
  location: string;
  bio: string;
  certifications: string[];
  education: string[];
  languages: string[];
}

export const TEAM: TeamMember[] = [
  {
    id: 1,
    name: "Dr. Sameh Elguizaoui",
    initials: "SE",
    role: "Physician",
    specialty: "Orthopedic Surgery & Sports Medicine",
    email: "s.elguizaoui@doczoc.com",
    phone: "(212) 555-0100",
    status: "Active",
    schedule: "Mon–Fri",
    location: "Manhattan",
    bio: "Dr. Sameh Elguizaoui is a board-certified orthopedic surgeon specializing in sports medicine, joint preservation, and minimally invasive arthroscopic surgery. With over a decade of experience treating athletes and active individuals, he provides comprehensive care from diagnosis through rehabilitation.",
    certifications: [
      "Board Certified — American Board of Orthopaedic Surgery",
      "Certificate of Added Qualification — Sports Medicine",
      "Fellow — American Academy of Orthopaedic Surgeons (FAAOS)",
    ],
    education: [
      "M.D. — Weill Cornell Medical College",
      "Residency — Hospital for Special Surgery",
      "Fellowship — Sports Medicine, NYU Langone",
    ],
    languages: ["English", "Arabic"],
  },
  {
    id: 2,
    name: "Maddie",
    initials: "MA",
    role: "Nurse",
    specialty: "Orthopedic Nursing",
    email: "maddie@doczoc.com",
    phone: "(212) 555-0102",
    status: "Active",
    schedule: "Mon–Fri",
    location: "Manhattan",
    bio: "Maddie is a registered nurse specializing in orthopedic care, assisting Dr. Elguizaoui with pre-operative assessments, post-operative follow-ups, and patient education. She ensures patients receive comprehensive support throughout their surgical journey.",
    certifications: [
      "Registered Nurse (RN) — New York State",
      "Orthopedic Nurse Certified (ONC)",
      "BLS & ACLS Certified",
    ],
    education: [
      "BSN — NYU Rory Meyers College of Nursing",
    ],
    languages: ["English", "Spanish"],
  },
];

export function roleColor(role: string) {
  switch (role) {
    case "Physician": return "#6366f1";
    case "Nurse": return "#f472b6";
    default: return "#818cf8";
  }
}

export function statusColor(status: string) {
  switch (status) {
    case "Active": return "#22c55e";
    case "On Leave": return "#f59e0b";
    case "Part-Time": return "#818cf8";
    default: return "#64748b";
  }
}
