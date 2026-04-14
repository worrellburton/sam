import { supabase } from "@/lib/supabase";
import type { Tables, TablesInsert } from "@/lib/database.types";

export type AppointmentRow = Tables<"appointments">;

export async function listAppointments(opts?: {
  from?: string;
  to?: string;
  patientId?: string;
  providerId?: string;
}): Promise<AppointmentRow[]> {
  let q = supabase
    .from("appointments")
    .select("*")
    .order("appt_date", { ascending: true })
    .order("appt_time", { ascending: true });
  if (opts?.from) q = q.gte("appt_date", opts.from);
  if (opts?.to) q = q.lte("appt_date", opts.to);
  if (opts?.patientId) q = q.eq("patient_id", opts.patientId);
  if (opts?.providerId) q = q.eq("provider_id", opts.providerId);
  const { data, error } = await q;
  if (error) {
    console.error("[db.appointments.listAppointments]", error);
    return [];
  }
  return data ?? [];
}

export async function createAppointment(appt: TablesInsert<"appointments">): Promise<AppointmentRow | null> {
  const { data, error } = await supabase.from("appointments").insert(appt).select().single();
  if (error) {
    console.error("[db.appointments.createAppointment]", error);
    return null;
  }
  return data;
}
