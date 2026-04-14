#!/usr/bin/env node
/**
 * Seed Supabase from the TS data files under src/data/.
 *
 * Requires:
 *   - NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL)
 *   - SUPABASE_SERVICE_ROLE_KEY (bypasses RLS for bulk upsert)
 *
 * Run:
 *   node --experimental-strip-types scripts/seed-supabase.mjs
 *   # or: npx tsx scripts/seed-supabase.mjs
 *
 * Idempotent — uses upsert on primary keys / slugs.
 */
import { createClient } from "@supabase/supabase-js";
import { pathToFileURL } from "node:url";
import path from "node:path";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const supa = createClient(url, key, { auth: { persistSession: false } });

// Dynamic import helper that tolerates .ts data files via tsx/strip-types.
async function load(rel) {
  const abs = path.resolve(process.cwd(), "src/data", rel);
  return import(pathToFileURL(abs).href);
}

async function seedLocations() {
  const { locations } = await load("locations.ts");
  const rows = locations.map((l, i) => ({
    id: l.id,
    label: l.label,
    display: l.display,
    address: l.address,
    query: l.query,
    lat: l.lat,
    lng: l.lng,
    maps_url: l.mapsUrl,
    sort_order: i,
  }));
  const { error } = await supa.from("locations").upsert(rows);
  if (error) throw error;
  console.log(`✓ locations: ${rows.length}`);
}

async function seedServices() {
  const { services } = await load("services.ts");
  const rows = services.map((s, i) => ({
    slug: s.slug,
    title: s.title,
    subtitle: s.subtitle,
    description: s.description,
    detail: s.detail,
    conditions: s.conditions,
    benefits: s.benefits,
    approach: s.approach ?? null,
    sort_order: i,
  }));
  const { error } = await supa.from("services").upsert(rows, { onConflict: "slug" });
  if (error) throw error;
  console.log(`✓ services: ${rows.length}`);
}

async function seedConditions() {
  const { conditions } = await load("conditions.ts");
  const rows = conditions.map((c, i) => ({
    slug: c.slug,
    title: c.title,
    tagline: c.tagline,
    hero_image: c.heroImage,
    overview: c.overview,
    symptoms: c.symptoms,
    treatments: c.treatments,
    recovery: c.recovery,
    reassurance: c.reassurance,
    seo_text: c.seoText,
    related_service: c.relatedService,
    sort_order: i,
  }));
  const { error } = await supa.from("conditions").upsert(rows, { onConflict: "slug" });
  if (error) throw error;
  console.log(`✓ conditions: ${rows.length}`);
}

async function seedBlog() {
  const { blogPosts } = await load("blog.ts");
  const rows = blogPosts.map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    tag: p.tag,
    published_date: p.date || null,
    read_time: p.readTime,
    image: p.image,
    image_3x4: p.image3x4 ?? null,
    image_1x1: p.image1x1 ?? null,
    image_alt: p.imageAlt,
    image_prompts: p.imagePrompts ?? null,
    content: p.content ?? null,
    content_html: p.contentHtml ?? null,
    related_service: p.relatedService ?? null,
    episode: p.episode ?? null,
    series_title: p.seriesTitle ?? null,
    coming_soon: p.comingSoon ?? false,
    release_date: p.releaseDate ? new Date(p.releaseDate).toISOString() : null,
  }));
  const { error } = await supa.from("blog_posts").upsert(rows, { onConflict: "slug" });
  if (error) throw error;
  console.log(`✓ blog_posts: ${rows.length}`);
}

async function seedReviews() {
  const { GOOGLE_REVIEWS } = await load("google-reviews.ts");
  // Wipe + insert so edits to the TS file replace old rows.
  await supa.from("google_reviews").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const rows = GOOGLE_REVIEWS.map((r) => ({
    author_name: r.author_name,
    rating: r.rating,
    text: r.text,
    review_date: r.date,
    location: r.location,
  }));
  const { error } = await supa.from("google_reviews").insert(rows);
  if (error) throw error;
  console.log(`✓ google_reviews: ${rows.length}`);
}

async function seedMedicalCodes() {
  const mod = await load("medical-codes.ts");
  // The TS file doesn't export the dict directly, but exposes getCodeDescription.
  // Also exports CODE_DESCRIPTIONS if available:
  const dict =
    mod.CODE_DESCRIPTIONS ||
    // Fallback: probe via getCodeDescription on a seed list. Best to export the dict.
    null;
  if (!dict) {
    console.warn("  ! medical-codes.ts does not export CODE_DESCRIPTIONS; skipping");
    return;
  }
  const rows = Object.entries(dict).map(([code, description]) => ({
    code,
    description,
    code_type: /^\d+$/.test(code) ? "cpt" : "icd10",
  }));
  const { error } = await supa.from("medical_codes").upsert(rows, { onConflict: "code" });
  if (error) throw error;
  console.log(`✓ medical_codes: ${rows.length}`);
}

async function seedTeam() {
  const { TEAM } = await load("team.ts");
  const rows = TEAM.map((m) => ({
    id: String(m.id),
    name: m.name,
    initials: m.initials,
    role: m.role,
    specialty: m.specialty,
    email: m.email,
    phone: m.phone,
    status: m.status,
    schedule: m.schedule,
    location: m.location,
    bio: m.bio,
    certifications: m.certifications,
    education: m.education,
    languages: m.languages,
  }));
  const { error } = await supa.from("providers").upsert(rows);
  if (error) throw error;
  console.log(`✓ providers: ${rows.length}`);
}

async function seedPatients() {
  const { PATIENTS } = await load("patients.ts");
  const patientRows = PATIENTS.map((p) => ({
    id: String(p.id),
    name: p.name,
    age: p.age,
    dob: p.dob ? new Date(p.dob).toISOString().slice(0, 10) : null,
    sex: p.sex,
    phone: p.phone,
    email: p.email,
    address: p.address,
    insurance: p.insurance,
    member_id: p.memberId,
    group_number: p.groupNumber,
    prior_auth: p.priorAuth ?? null,
    subscriber_name: p.subscriberName ?? null,
    subscriber_dob: p.subscriberDob ? new Date(p.subscriberDob).toISOString().slice(0, 10) : null,
    subscriber_relationship: p.subscriberRelationship ?? null,
    emergency_contact: p.emergencyContact ?? null,
    emergency_phone: p.emergencyPhone ?? null,
    primary_language: p.primaryLanguage ?? null,
    copay_amount: p.copayAmount ? Number(String(p.copayAmount).replace(/[^0-9.]/g, "")) : null,
    deductible: p.deductible ? Number(String(p.deductible).replace(/[^0-9.]/g, "")) : null,
    prior_auth_expiration: p.priorAuthExpiration
      ? new Date(p.priorAuthExpiration).toISOString().slice(0, 10)
      : null,
    smoking_status: p.smokingStatus ?? null,
    bmi: p.bmi ? Number(p.bmi) : null,
    blood_type: p.bloodType ?? null,
    implanted_devices: Array.isArray(p.implantedDevices)
      ? p.implantedDevices
      : p.implantedDevices
      ? [p.implantedDevices]
      : null,
    aob_signed: !!p.aobSigned,
    aob_date: p.aobDate ? new Date(p.aobDate).toISOString().slice(0, 10) : null,
    roi_signed: !!p.roiSigned,
    roi_date: p.roiDate ? new Date(p.roiDate).toISOString().slice(0, 10) : null,
    hipaa_signed: !!p.hipaaSigned,
    hipaa_date: p.hipaaDate ? new Date(p.hipaaDate).toISOString().slice(0, 10) : null,
    financial_signed: !!p.financialSigned,
    financial_date: p.financialDate ? new Date(p.financialDate).toISOString().slice(0, 10) : null,
    surgical_consent_signed: !!p.surgicalConsentSigned,
    surgical_consent_date: p.surgicalConsentDate
      ? new Date(p.surgicalConsentDate).toISOString().slice(0, 10)
      : null,
    last_visit: p.lastVisit ? new Date(p.lastVisit).toISOString().slice(0, 10) : null,
    next_appt: p.nextAppt && p.nextAppt !== "—" ? new Date(p.nextAppt).toISOString().slice(0, 10) : null,
    condition: p.condition,
    status: p.status,
    provider: p.provider,
    referred_by: p.referredBy,
    allergies: p.allergies,
    medications: p.medications,
    signed_up_date: p.signedUpDate ? new Date(p.signedUpDate).toISOString() : null,
    intro_message: p.introMessage,
  }));
  {
    const { error } = await supa.from("patients").upsert(patientRows);
    if (error) throw error;
  }

  // Nested tables — replace per patient.
  const patientIds = patientRows.map((p) => p.id);
  await supa.from("patient_visits").delete().in("patient_id", patientIds);
  await supa.from("patient_invoices").delete().in("patient_id", patientIds);
  await supa.from("billing_events").delete().in("patient_id", patientIds);

  const visits = [];
  const invoices = [];
  const events = [];
  for (const p of PATIENTS) {
    const pid = String(p.id);
    for (const v of p.visits ?? []) {
      visits.push({
        patient_id: pid,
        visit_date: v.date ? new Date(v.date).toISOString().slice(0, 10) : null,
        visit_type: v.type,
        notes: v.notes,
        codes: v.codes ?? [],
      });
    }
    for (const inv of p.invoices ?? []) {
      invoices.push({
        id: inv.id,
        patient_id: pid,
        invoice_date: inv.date ? new Date(inv.date).toISOString().slice(0, 10) : null,
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
        patient_id: pid,
        event_date: ev.date ? new Date(ev.date).toISOString().slice(0, 10) : null,
        event_type: ev.type,
        description: ev.description,
        amount: ev.amount ?? null,
        claim_id: ev.claimId ?? null,
      });
    }
  }
  if (visits.length) {
    const { error } = await supa.from("patient_visits").insert(visits);
    if (error) throw error;
  }
  if (invoices.length) {
    const { error } = await supa.from("patient_invoices").upsert(invoices);
    if (error) throw error;
  }
  if (events.length) {
    const { error } = await supa.from("billing_events").insert(events);
    if (error) throw error;
  }
  console.log(
    `✓ patients: ${patientRows.length}, visits: ${visits.length}, invoices: ${invoices.length}, events: ${events.length}`,
  );
}

async function main() {
  await seedLocations();
  await seedServices();
  await seedConditions();
  await seedBlog();
  await seedReviews();
  await seedMedicalCodes();
  await seedTeam();
  await seedPatients();
  console.log("\nAll done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
