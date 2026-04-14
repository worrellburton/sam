import { supabase } from "@/lib/supabase";
import type { Tables } from "@/lib/database.types";
import type { Location } from "@/data/locations";

export type LocationRow = Tables<"locations">;

export function rowToLocation(row: LocationRow): Location {
  return {
    id: row.id,
    label: row.label ?? "",
    display: row.display ?? "",
    address: row.address ?? "",
    query: row.query ?? "",
    lat: row.lat ?? 0,
    lng: row.lng ?? 0,
    mapsUrl: row.maps_url ?? "",
  };
}

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

export async function listLocationsAsStatic(): Promise<Location[]> {
  const rows = await listLocations();
  return rows.map(rowToLocation);
}
