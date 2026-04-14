#!/usr/bin/env node
/**
 * Generate SQL INSERT statements from src/data/*.ts.
 * Outputs to stdout. Pipe to psql or supabase execute_sql.
 *
 *   npx tsx scripts/gen-seed-sql.mjs > /tmp/seed.sql
 */
import { pathToFileURL } from "node:url";
import path from "node:path";

function q(v) {
  if (v === null || v === undefined) return "null";
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "number") return String(v);
  if (v instanceof Date) return `'${v.toISOString()}'`;
  if (Array.isArray(v)) {
    // text[] literal
    return `ARRAY[${v.map((x) => q(x)).join(",")}]::text[]`;
  }
  if (typeof v === "object") return `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
  return `'${String(v).replace(/'/g, "''")}'`;
}

function insert(table, cols, rows, onConflict = null) {
  if (!rows.length) return "";
  const vals = rows
    .map((r) => `(${cols.map((c) => q(r[c])).join(",")})`)
    .join(",\n  ");
  let sql = `INSERT INTO public.${table} (${cols.join(",")}) VALUES\n  ${vals}`;
  if (onConflict) {
    sql += `\nON CONFLICT (${onConflict}) DO UPDATE SET ${cols
      .filter((c) => c !== onConflict)
      .map((c) => `${c} = EXCLUDED.${c}`)
      .join(", ")}`;
  }
  return sql + ";\n";
}

async function load(rel) {
  const abs = path.resolve(process.cwd(), "src/data", rel);
  return import(pathToFileURL(abs).href);
}

function dateOnly(s) {
  if (!s || s === "—") return null;
  const d = new Date(s);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}
function dateTime(s) {
  if (!s) return null;
  const d = new Date(s);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}
function money(s) {
  if (s == null) return null;
  const n = Number(String(s).replace(/[^0-9.]/g, ""));
  return isNaN(n) ? null : n;
}

async function main() {
  const out = [];
  const { locations } = await load("locations.ts");
  out.push(
    insert(
      "locations",
      ["id", "label", "display", "address", "query", "lat", "lng", "maps_url", "sort_order"],
      locations.map((l, i) => ({ ...l, maps_url: l.mapsUrl, sort_order: i })),
      "id",
    ),
  );

  const { services } = await load("services.ts");
  out.push(
    insert(
      "services",
      ["slug", "title", "subtitle", "description", "detail", "conditions", "benefits", "approach", "sort_order"],
      services.map((s, i) => ({ ...s, approach: s.approach ?? null, sort_order: i })),
      "slug",
    ),
  );

  const { conditions } = await load("conditions.ts");
  out.push(
    insert(
      "conditions",
      [
        "slug", "title", "tagline", "hero_image", "overview", "symptoms",
        "treatments", "recovery", "reassurance", "seo_text", "related_service", "sort_order",
      ],
      conditions.map((c, i) => ({
        ...c,
        hero_image: c.heroImage,
        seo_text: c.seoText,
        related_service: c.relatedService,
        sort_order: i,
      })),
      "slug",
    ),
  );

  const { TEAM } = await load("team.ts");
  out.push(
    insert(
      "providers",
      ["id", "name", "initials", "role", "specialty", "email", "phone", "status", "schedule", "location", "bio", "certifications", "education", "languages"],
      TEAM.map((m) => ({ ...m, id: String(m.id) })),
      "id",
    ),
  );

  const { GOOGLE_REVIEWS } = await load("google-reviews.ts");
  out.push("DELETE FROM public.google_reviews;\n");
  out.push(
    insert(
      "google_reviews",
      ["author_name", "rating", "text", "review_date", "location"],
      GOOGLE_REVIEWS.map((r) => ({ ...r, review_date: r.date })),
    ),
  );

  const { CODE_DESCRIPTIONS } = await load("medical-codes.ts");
  out.push(
    insert(
      "medical_codes",
      ["code", "description", "code_type"],
      Object.entries(CODE_DESCRIPTIONS).map(([code, description]) => ({
        code,
        description,
        code_type: /^\d+$/.test(code) ? "cpt" : "icd10",
      })),
      "code",
    ),
  );

  const { blogPosts } = await load("blog.ts");
  out.push(
    insert(
      "blog_posts",
      [
        "slug", "title", "excerpt", "tag", "published_date", "read_time",
        "image", "image_3x4", "image_1x1", "image_alt", "image_prompts",
        "content", "content_html", "related_service",
        "episode", "series_title", "coming_soon", "release_date",
      ],
      blogPosts.map((p) => ({
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        tag: p.tag,
        published_date: dateOnly(p.date),
        read_time: p.readTime,
        image: p.image,
        image_3x4: p.image3x4 ?? null,
        image_1x1: p.image1x1 ?? null,
        image_alt: p.imageAlt,
        image_prompts: p.imagePrompts ?? null,
        // Store content as JSON (accepts string or array)
        content: p.content ?? null,
        content_html: p.contentHtml ?? null,
        related_service: p.relatedService ?? null,
        episode: p.episode ?? null,
        series_title: p.seriesTitle ?? null,
        coming_soon: !!p.comingSoon,
        release_date: dateTime(p.releaseDate),
      })),
      "slug",
    ),
  );

  const { PATIENTS } = await load("patients.ts");
  out.push(
    insert(
      "patients",
      [
        "id", "name", "age", "dob", "sex", "phone", "email", "address",
        "insurance", "member_id", "group_number", "prior_auth",
        "subscriber_name", "subscriber_dob", "subscriber_relationship",
        "emergency_contact", "emergency_phone", "primary_language",
        "copay_amount", "deductible", "prior_auth_expiration",
        "smoking_status", "bmi", "blood_type", "implanted_devices",
        "aob_signed", "aob_date", "roi_signed", "roi_date",
        "hipaa_signed", "hipaa_date", "financial_signed", "financial_date",
        "surgical_consent_signed", "surgical_consent_date",
        "last_visit", "next_appt", "condition", "status", "provider", "referred_by",
        "allergies", "medications", "signed_up_date", "intro_message",
      ],
      PATIENTS.map((p) => ({
        id: String(p.id),
        name: p.name,
        age: p.age,
        dob: dateOnly(p.dob),
        sex: p.sex,
        phone: p.phone,
        email: p.email,
        address: p.address,
        insurance: p.insurance,
        member_id: p.memberId,
        group_number: p.groupNumber,
        prior_auth: p.priorAuth ?? null,
        subscriber_name: p.subscriberName ?? null,
        subscriber_dob: dateOnly(p.subscriberDob),
        subscriber_relationship: p.subscriberRelationship ?? null,
        emergency_contact: p.emergencyContact ?? null,
        emergency_phone: p.emergencyPhone ?? null,
        primary_language: p.primaryLanguage ?? null,
        copay_amount: money(p.copayAmount),
        deductible: money(p.deductible),
        prior_auth_expiration: dateOnly(p.priorAuthExpiration),
        smoking_status: p.smokingStatus ?? null,
        bmi: p.bmi ? Number(p.bmi) : null,
        blood_type: p.bloodType ?? null,
        implanted_devices: Array.isArray(p.implantedDevices)
          ? p.implantedDevices
          : p.implantedDevices
          ? [String(p.implantedDevices)]
          : null,
        aob_signed: !!p.aobSigned,
        aob_date: dateOnly(p.aobDate),
        roi_signed: !!p.roiSigned,
        roi_date: dateOnly(p.roiDate),
        hipaa_signed: !!p.hipaaSigned,
        hipaa_date: dateOnly(p.hipaaDate),
        financial_signed: !!p.financialSigned,
        financial_date: dateOnly(p.financialDate),
        surgical_consent_signed: !!p.surgicalConsentSigned,
        surgical_consent_date: dateOnly(p.surgicalConsentDate),
        last_visit: dateOnly(p.lastVisit),
        next_appt: dateOnly(p.nextAppt),
        condition: p.condition,
        status: p.status,
        provider: p.provider,
        referred_by: p.referredBy,
        allergies: p.allergies,
        medications: p.medications,
        signed_up_date: dateTime(p.signedUpDate),
        intro_message: p.introMessage,
      })),
      "id",
    ),
  );

  const patientIds = PATIENTS.map((p) => `'${p.id}'`).join(",");
  out.push(`DELETE FROM public.patient_visits WHERE patient_id IN (${patientIds});\n`);
  out.push(`DELETE FROM public.patient_invoices WHERE patient_id IN (${patientIds});\n`);
  out.push(`DELETE FROM public.billing_events WHERE patient_id IN (${patientIds});\n`);

  const visits = [];
  const invoices = [];
  const events = [];
  for (const p of PATIENTS) {
    for (const v of p.visits ?? []) {
      visits.push({
        patient_id: String(p.id),
        visit_date: dateOnly(v.date),
        visit_type: v.type,
        notes: v.notes,
        codes: v.codes ?? [],
      });
    }
    for (const inv of p.invoices ?? []) {
      invoices.push({
        id: inv.id,
        patient_id: String(p.id),
        invoice_date: dateOnly(inv.date),
        description: inv.description,
        total_charged: inv.totalCharged,
        insurance_paid: inv.insurancePaid,
        deductible_applied: inv.deductibleApplied,
        copay: inv.copay,
        patient_owes: inv.patientOwes,
        status: inv.status,
        claim_id: inv.claimId ?? null,
      });
    }
    for (const ev of p.billingEvents ?? []) {
      events.push({
        patient_id: String(p.id),
        event_date: dateOnly(ev.date),
        event_type: ev.type,
        description: ev.description,
        amount: ev.amount ?? null,
        claim_id: ev.claimId ?? null,
      });
    }
  }
  if (visits.length)
    out.push(
      insert(
        "patient_visits",
        ["patient_id", "visit_date", "visit_type", "notes", "codes"],
        visits,
      ),
    );
  if (invoices.length)
    out.push(
      insert(
        "patient_invoices",
        [
          "id", "patient_id", "invoice_date", "description",
          "total_charged", "insurance_paid", "deductible_applied", "copay",
          "patient_owes", "status", "claim_id",
        ],
        invoices,
        "id",
      ),
    );
  if (events.length)
    out.push(
      insert(
        "billing_events",
        ["patient_id", "event_date", "event_type", "description", "amount", "claim_id"],
        events,
      ),
    );

  process.stdout.write(out.join("\n"));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
