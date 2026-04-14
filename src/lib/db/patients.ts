import { supabase } from "@/lib/supabase";
import type { Tables } from "@/lib/database.types";
import type { Patient } from "@/data/patients";

export type PatientRow = Tables<"patients">;
export type PatientVisitRow = Tables<"patient_visits">;
export type PatientInvoiceRow = Tables<"patient_invoices">;
export type BillingEventRow = Tables<"billing_events">;

/** Map a Supabase patients row into the app's `Patient` shape. */
export function rowToPatient(
  row: PatientRow,
  visits: PatientVisitRow[] = [],
  invoices: PatientInvoiceRow[] = [],
  events: BillingEventRow[] = [],
): Patient {
  const status = (row.status as Patient["status"]) || "Active";
  const sex = (row.sex as Patient["sex"]) || "Male";
  return {
    id: row.id,
    name: row.name,
    age: row.age ?? 0,
    dob: row.dob ?? "",
    sex,
    phone: row.phone ?? "",
    email: row.email ?? "",
    address: row.address ?? "",
    insurance: row.insurance ?? "",
    memberId: row.member_id ?? "",
    groupNumber: row.group_number ?? "",
    priorAuth: row.prior_auth ?? undefined,
    subscriberName: row.subscriber_name ?? undefined,
    subscriberDob: row.subscriber_dob ?? undefined,
    subscriberRelationship: row.subscriber_relationship ?? undefined,
    emergencyContact: row.emergency_contact ?? undefined,
    emergencyPhone: row.emergency_phone ?? undefined,
    primaryLanguage: row.primary_language ?? undefined,
    copayAmount: row.copay_amount != null ? `$${row.copay_amount}` : undefined,
    deductible: row.deductible != null ? `$${row.deductible}` : undefined,
    priorAuthExpiration: row.prior_auth_expiration ?? undefined,
    smokingStatus: row.smoking_status ?? undefined,
    bmi: row.bmi != null ? String(row.bmi) : undefined,
    bloodType: row.blood_type ?? undefined,
    implantedDevices: Array.isArray(row.implanted_devices)
      ? row.implanted_devices.join(", ")
      : undefined,
    aobSigned: Boolean(row.aob_signed),
    aobDate: row.aob_date ?? undefined,
    roiSigned: Boolean(row.roi_signed),
    roiDate: row.roi_date ?? undefined,
    hipaaSigned: row.hipaa_signed ?? undefined,
    hipaaDate: row.hipaa_date ?? undefined,
    financialSigned: row.financial_signed ?? undefined,
    financialDate: row.financial_date ?? undefined,
    surgicalConsentSigned: row.surgical_consent_signed ?? undefined,
    surgicalConsentDate: row.surgical_consent_date ?? undefined,
    lastVisit: row.last_visit ?? "",
    nextAppt: row.next_appt ?? "",
    condition: row.condition ?? "",
    status,
    provider: row.provider ?? "",
    referredBy: row.referred_by ?? "",
    allergies: row.allergies ?? [],
    medications: row.medications ?? [],
    signedUpDate: row.signed_up_date ?? "",
    introMessage: row.intro_message ?? "",
    visits: visits.map((v) => ({
      date: v.visit_date,
      type: v.visit_type ?? "",
      notes: v.notes ?? "",
      codes: v.codes ?? [],
    })),
    invoices: invoices.map((inv) => ({
      id: inv.id,
      date: inv.invoice_date ?? "",
      description: inv.description ?? "",
      totalCharged: inv.total_charged ?? 0,
      insurancePaid: inv.insurance_paid ?? 0,
      deductibleApplied: inv.deductible_applied ?? 0,
      copay: inv.copay ?? 0,
      patientOwes: inv.patient_owes ?? 0,
      status: (inv.status as Patient["invoices"][number]["status"]) || "Pending",
      claimId: inv.claim_id ?? undefined,
    })),
    billingEvents: events.map((ev) => ({
      date: ev.event_date ?? "",
      type: (ev.event_type as Patient["billingEvents"][number]["type"]) || "claim_filed",
      description: ev.description ?? "",
      amount: ev.amount ?? undefined,
      claimId: ev.claim_id ?? undefined,
    })),
  };
}

/** List all patients mapped to the app's `Patient` shape. */
export async function listPatientsAsStatic(): Promise<Patient[]> {
  const rows = await listPatients();
  return rows.map((r) => rowToPatient(r));
}

/** Get a single patient (with nested history) in the app's `Patient` shape. */
export async function getPatientAsStatic(id: string): Promise<Patient | null> {
  const full = await getPatientById(id);
  if (!full) return null;
  return rowToPatient(full, full.visits, full.invoices, full.billing_events);
}

export interface PatientWithHistory extends PatientRow {
  visits: PatientVisitRow[];
  invoices: PatientInvoiceRow[];
  billing_events: BillingEventRow[];
}

export async function listPatients(): Promise<PatientRow[]> {
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .order("name", { ascending: true });
  if (error) {
    console.error("[db.patients.listPatients]", error);
    return [];
  }
  return data ?? [];
}

export async function getPatientById(id: string): Promise<PatientWithHistory | null> {
  const [patient, visits, invoices, events] = await Promise.all([
    supabase.from("patients").select("*").eq("id", id).maybeSingle(),
    supabase.from("patient_visits").select("*").eq("patient_id", id).order("visit_date", { ascending: false }),
    supabase.from("patient_invoices").select("*").eq("patient_id", id).order("invoice_date", { ascending: false }),
    supabase.from("billing_events").select("*").eq("patient_id", id).order("event_date", { ascending: false }),
  ]);
  if (patient.error || !patient.data) {
    if (patient.error) console.error("[db.patients.getPatientById]", id, patient.error);
    return null;
  }
  return {
    ...patient.data,
    visits: visits.data ?? [],
    invoices: invoices.data ?? [],
    billing_events: events.data ?? [],
  };
}
