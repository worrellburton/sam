import { supabase } from "@/lib/supabase";
import type { Tables } from "@/lib/database.types";
import type { Service } from "@/data/services";

export type ServiceRow = Tables<"services">;

export function rowToService(row: ServiceRow): Service {
  return {
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle ?? "",
    description: row.description ?? "",
    detail: row.detail ?? "",
    conditions: row.conditions ?? [],
    benefits: row.benefits ?? [],
    approach: row.approach ?? undefined,
  };
}

export async function listServicesAsStatic(): Promise<Service[]> {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("sort_order", { ascending: true, nullsFirst: false });
  if (error) {
    console.error("[db.services.listServicesAsStatic]", error);
    return [];
  }
  return (data ?? []).map(rowToService);
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) {
    console.error("[db.services.getServiceBySlug]", slug, error);
    return null;
  }
  return data ? rowToService(data) : null;
}
