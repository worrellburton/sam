import { supabase } from "@/lib/supabase";
import type { Tables } from "@/lib/database.types";

export type LocationRow = Tables<"locations">;

export async function listLocations(): Promise<LocationRow[]> {
  const { data, error } = await supabase
    .from("locations")
    .select("*")
    .order("sort_order", { ascending: true, nullsFirst: false });
  if (error) {
    console.error("[db.locations.listLocations]", error);
    return [];
  }
  return data ?? [];
}
