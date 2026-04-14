import { supabase } from "@/lib/supabase";
import type { Tables } from "@/lib/database.types";

export type PatientRow = Tables<"patients">;
export type PatientVisitRow = Tables<"patient_visits">;
export type PatientInvoiceRow = Tables<"patient_invoices">;
export type BillingEventRow = Tables<"billing_events">;

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
