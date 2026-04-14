import { supabase } from "@/lib/supabase";
import type { Tables } from "@/lib/database.types";

export type ProviderRow = Tables<"providers">;

export async function listProviders(): Promise<ProviderRow[]> {
  const { data, error } = await supabase
    .from("providers")
    .select("*")
    .order("name", { ascending: true });
  if (error) {
    console.error("[db.providers.listProviders]", error);
    return [];
  }
  return data ?? [];
}
