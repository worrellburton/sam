// Shared schema.org helpers for service + condition pages. Keeping
// these here means we emit the same Physician / MedicalBusiness
// entity everywhere, which Google treats as one record rather than
// noisy duplicates.
//
// JSON-LD docs: https://schema.org/docs/gs.html
// Medical types: https://schema.org/MedicalCondition, MedicalProcedure, MedicalTherapy

import type { Condition } from "@/data/conditions";
import type { Service } from "@/data/services";
import { PLACEHOLDER_IMAGE } from "@/data/placeholder-image";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.sportsorthomd.com";

// Single shared physician identity — re-referenced across pages via
// `@id` so search engines treat them as the same entity.
const PHYSICIAN_ID = `${SITE_URL}/#physician`;

export const physicianSchema = {
  "@type": "Physician",
  "@id": PHYSICIAN_ID,
  name: "Dr. Sameh Elguizaoui, M.D.",
  url: SITE_URL,
  medicalSpecialty: ["OrthopedicSurgery", "SportsMedicine"],
  memberOf: {
    "@type": "MedicalOrganization",
    name: "American Board of Orthopaedic Surgery",
  },
  alumniOf: [
    { "@type": "EducationalOrganization", name: "Cleveland Clinic" },
    { "@type": "EducationalOrganization", name: "Lenox Hill Hospital" },
    { "@type": "EducationalOrganization", name: "Ohio State University" },
  ],
  telephone: "+1-212-540-2265",
};

export const physicianRef = { "@type": "Physician", "@id": PHYSICIAN_ID };

export interface Crumb {
  name: string;
  url: string;
}

export function breadcrumbList(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: c.url,
    })),
  };
}

function abs(path: string): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

// Build the JSON-LD payload emitted on a /services/[slug] page.
// Returns an array of top-level objects (page, procedure, breadcrumb,
// optional FAQ) so a single `<script>` tag can render them all.
export function serviceJsonLd(
  service: Service,
  slug: string,
  faqs?: Array<{ question: string; answer: string }>,
): unknown[] {
  const url = `${SITE_URL}/services/${slug}`;
  const pageId = `${url}#webpage`;
  const procedureId = `${url}#procedure`;

  const medicalPage = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    "@id": pageId,
    url,
    name: service.title,
    description: service.description,
    mainContentOfPage: {
      "@type": "WebPageElement",
      cssSelector: ".svc-hero-content",
    },
    about: {
      "@type": "MedicalProcedure",
      "@id": procedureId,
      name: service.title,
      description: service.description,
      bodyLocation: deriveBodyLocation(slug),
    },
    mainEntity: { "@id": procedureId },
    isPartOf: { "@type": "WebSite", url: SITE_URL },
    specialty: {
      "@type": "MedicalSpecialty",
      name: "OrthopedicSurgery",
    },
    author: physicianRef,
    provider: physicianRef,
    lastReviewed: new Date().toISOString().slice(0, 10),
  };

  const procedure = {
    "@context": "https://schema.org",
    "@type": "MedicalProcedure",
    "@id": procedureId,
    name: service.title,
    alternateName: service.subtitle,
    description: service.detail || service.description,
    howPerformed: service.approach?.join(" ") || undefined,
    // `procedureType` helps Google bucket minimally-invasive vs open.
    procedureType:
      slug === "arthroscopic-surgery"
        ? "https://schema.org/NoninvasiveProcedure"
        : slug === "regenerative-medicine"
          ? "https://schema.org/NoninvasiveProcedure"
          : undefined,
    preparation: undefined,
    // Each condition becomes a MedicalCondition node with a reference
    // to the body area. `followup` covers recovery.
    relevantSpecialty: { "@type": "MedicalSpecialty", name: "OrthopedicSurgery" },
    performer: physicianRef,
    mainEntityOfPage: { "@id": pageId },
  };

  const crumbs = breadcrumbList([
    { name: "Home", url: SITE_URL },
    { name: "Services", url: `${SITE_URL}/#specialties` },
    { name: service.title, url },
  ]);

  const out: unknown[] = [medicalPage, procedure, crumbs];

  if (faqs && faqs.length > 0) {
    out.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    });
  }

  return out;
}

// Build the JSON-LD payload emitted on a /conditions/[slug] page.
export function conditionJsonLd(
  condition: Condition,
  slug: string,
  faqs?: Array<{ question: string; answer: string }>,
): unknown[] {
  const url = `${SITE_URL}/conditions/${slug}`;
  const pageId = `${url}#webpage`;
  const conditionId = `${url}#condition`;
  const hasRealImage =
    condition.heroImage && condition.heroImage !== PLACEHOLDER_IMAGE;

  const medicalCondition = {
    "@context": "https://schema.org",
    "@type": "MedicalCondition",
    "@id": conditionId,
    name: condition.title,
    description: condition.overview,
    signOrSymptom: condition.symptoms.map((s) => ({
      "@type": "MedicalSignOrSymptom",
      name: s,
    })),
    possibleTreatment: condition.treatments.map((t) => ({
      "@type": "MedicalTherapy",
      name: t,
    })),
    expectedPrognosis: condition.recovery,
    associatedAnatomy: deriveAnatomy(condition.relatedService),
    relevantSpecialty: { "@type": "MedicalSpecialty", name: "OrthopedicSurgery" },
  };

  const medicalPage = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    "@id": pageId,
    url,
    name: condition.title,
    description: condition.overview,
    about: { "@id": conditionId },
    mainEntity: { "@id": conditionId },
    primaryImageOfPage: hasRealImage
      ? { "@type": "ImageObject", url: abs(condition.heroImage) }
      : undefined,
    isPartOf: { "@type": "WebSite", url: SITE_URL },
    specialty: { "@type": "MedicalSpecialty", name: "OrthopedicSurgery" },
    author: physicianRef,
    provider: physicianRef,
    lastReviewed: new Date().toISOString().slice(0, 10),
  };

  const crumbs = breadcrumbList([
    { name: "Home", url: SITE_URL },
    { name: "Conditions", url: `${SITE_URL}/#specialties` },
    {
      name: formatServiceName(condition.relatedService),
      url: `${SITE_URL}/services/${condition.relatedService}`,
    },
    { name: condition.title, url },
  ]);

  const out: unknown[] = [medicalCondition, medicalPage, crumbs];

  if (faqs && faqs.length > 0) {
    out.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    });
  }

  return out;
}

function formatServiceName(slug: string): string {
  return slug
    .split("-")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

// Rough service-slug → AnatomicalStructure mapping. Good enough for
// Google to link the procedure to a body part; full taxonomic
// coverage lives in /data/service-content if we want to expand.
function deriveBodyLocation(slug: string): unknown {
  const map: Record<string, string> = {
    "sports-medicine": "Musculoskeletal system",
    "arthroscopic-surgery": "Joint",
    "regenerative-medicine": "Musculoskeletal system",
    "joint-preservation": "Joint",
    "cartilage-repair": "Cartilage",
    "shoulder-knee-surgery": "Shoulder and knee",
  };
  const name = map[slug];
  if (!name) return undefined;
  return { "@type": "AnatomicalStructure", name };
}

function deriveAnatomy(serviceSlug: string): unknown {
  return deriveBodyLocation(serviceSlug);
}
