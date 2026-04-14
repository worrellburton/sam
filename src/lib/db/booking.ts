import { supabase } from "@/lib/supabase";
import type { Tables, TablesInsert } from "@/lib/database.types";

export type BookingRequestRow = Tables<"booking_requests">;
export type BookingRequestInsert = TablesInsert<"booking_requests">;

export async function createBookingRequest(
  payload: BookingRequestInsert,
): Promise<BookingRequestRow | null> {
  const { data, error } = await supabase
    .from("booking_requests")
    .insert(payload)
    .select()
    .single();
  if (error) {
    console.error("[db.booking.createBookingRequest]", error);
    return null;
  }
  return data;
}
