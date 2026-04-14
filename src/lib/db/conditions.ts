import { supabase } from "@/lib/supabase";
import type { Tables } from "@/lib/database.types";
import type { Condition } from "@/data/conditions";

export type ConditionRow = Tables<"conditions">;

export function rowToCondition(row: ConditionRow): Condition {
  return {
    slug: row.slug,
    title: row.title,
    tagline: row.tagline ?? "",
    heroImage: row.hero_image ?? "",
    overview: row.overview ?? "",
    symptoms: row.symptoms ?? [],
    treatments: row.treatments ?? [],
    recovery: row.recovery ?? "",
    reassurance: row.reassurance ?? "",
    seoText: row.seo_text ?? "",
    relatedService: row.related_service ?? "",
  };
}

export async function listConditionsAsStatic(): Promise<Condition[]> {
  const { data, error } = await supabase
    .from("conditions")
    .select("*")
    .order("sort_order", { ascending: true, nullsFirst: false });
  if (error) {
    console.error("[db.conditions.listConditionsAsStatic]", error);
    return [];
  }
  return (data ?? []).map(rowToCondition);
}

export async function getConditionBySlug(slug: string): Promise<Condition | null> {
  const { data, error } = await supabase
    .from("conditions")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) {
    console.error("[db.conditions.getConditionBySlug]", slug, error);
    return null;
  }
  return data ? rowToCondition(data) : null;
}
