import { useState, useCallback } from "react";

const STEDI_BASE_URL =
  "https://healthcare.us.stedi.com/2024-04-01/change/medicalnetwork/professionalclaims/v3";

function getApiKey(): string {
  return (
    (typeof import.meta !== "undefined" &&
      (import.meta as any).env?.VITE_STEDI_API_KEY) ||
    ""
  );
}

// ── Types ───────────────────────────────────────────────────────────
export interface StediClaimPayload {
  billing: {
    npi: string;
    firstName: string;
    lastName: string;
    address: {
      address1: string;
      address2?: string;
      city: string;
      state: string;
      postalCode: string;
    };
    taxId: string;
    taxonomyCode: string;
    contactInformation: {
      name: string;
      phoneNumber: string;
    };
  };
  subscriber: {
    memberId: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    genderCode: string;
    address: {
      address1: string;
      city: string;
      state: string;
      postalCode: string;
    };
    paymentResponsibilityLevelCode: string;
    groupNumber?: string;
  };
  claimInformation: {
    claimChargeAmount: string;
    placeOfServiceCode: string;
    benefitsAssignmentCertificationIndicator: string;
    releaseOfInformationCode: string;
    patientSignatureSourceCode: string;
    claimFilingCode: string;
    claimFrequencyCode: string;
    providerAcceptAssignmentCode: string;
    healthCareCodeInformation: {
      diagnosisCode: string;
      diagnosisTypeCode: "ABK" | "ABF";
    }[];
    serviceLines: {
      professionalService: {
        procedureCode: string;
        procedureModifiers?: string[];
        chargeAmount: string;
        unitCount: string;
        measurementUnit: string;
        diagnosisCodePointers: string[];
      };
      serviceDateInformation: {
        serviceDateFrom: string;
        serviceDateTo?: string;
      };
    }[];
    claimSupplementalInformation?: {
      attachmentReportTypeCode: string;
      attachmentTransmissionCode: string;
      attachmentControlNumber?: string;
    };
  };
  rendering?: {
    npi: string;
    firstName: string;
    lastName: string;
    taxonomyCode: string;
  };
  payer: {
    payerId: string;
    name: string;
    address?: {
      address1: string;
      city: string;
      state: string;
      postalCode: string;
    };
  };
}

export interface StediClaimResponse {
  success: boolean;
  claimId?: string;
  status?: string;
  message?: string;
  raw?: any;
  x12?: string;
}

export interface ClaimRecord {
  id: string;
  visitId: string;
  patient: string;
  payer: string;
  totalCharge: number;
  status: "draft" | "submitting" | "accepted" | "rejected" | "error";
  submittedAt?: string;
  stediClaimId?: string;
  response?: StediClaimResponse;
  payload: StediClaimPayload;
}

// ── Payer IDs (common ones) ─────────────────────────────────────────
export const PAYER_IDS: Record<string, string> = {
  UnitedHealthcare: "87726",
  "UnitedHealthcare Choice Plus": "87726",
  Aetna: "60054",
  "Aetna PPO": "60054",
  Cigna: "62308",
  "Cigna Open Access Plus": "62308",
  "Blue Cross Blue Shield": "00060",
  Humana: "61101",
  Medicare: "CMS",
};

// ── Build claim payload from visit data ─────────────────────────────
export function buildClaimPayload(visit: {
  patient: string;
  dob: string;
  sex?: "Male" | "Female";
  memberId: string;
  groupNumber?: string;
  insurance: string;
  patientAddress?: string;
  date: string;
  provider: string;
  npi: string;
  locationAddr: string;
  taxId: string;
  placeOfService?: string;
  codes: { code: string; description: string; type: string; fee?: number; modifiers?: string[] }[];
  hasOperativeReport?: boolean;
}): StediClaimPayload {
  const icdCodes = visit.codes.filter((c) => c.type === "ICD-10");
  const cptCodes = visit.codes.filter(
    (c) => c.type === "CPT" || c.type === "HCPCS"
  );
  const totalCharges = cptCodes.reduce((sum, c) => sum + (c.fee || 0), 0);

  // Parse patient name
  const nameParts = visit.patient.split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  // Parse provider name — "Sameh Elguizaoui, M.D." → first/last
  const providerClean = visit.provider.replace(/,?\s*M\.?D\.?$/i, "").trim();
  const provParts = providerClean.split(" ");
  const provFirst = provParts[0] || "";
  const provLast = provParts.slice(1).join(" ") || "";

  // Parse address — "159 East 74th St, New York, NY 10021"
  const addrParts = visit.locationAddr.split(",").map((s) => s.trim());
  const address1 = addrParts[0] || "";
  const city = addrParts[1] || "";
  const stateZip = (addrParts[2] || "").split(" ");
  const state = stateZip[0] || "NY";
  const postalCode = (stateZip[1] || "").replace(/-/g, "");

  // Parse patient address if available
  const ptAddrParts = (visit.patientAddress || visit.locationAddr).split(",").map((s) => s.trim());
  const ptAddress1 = ptAddrParts[0] || "";
  const ptCity = ptAddrParts[1] || "";
  const ptStateZip = (ptAddrParts[2] || "").split(" ");
  const ptState = ptStateZip[0] || "NY";
  const ptPostalCode = (ptStateZip[1] || "").replace(/-/g, "");

  // Parse DOB — "04/12/1991" → "19910412"
  const dobParts = visit.dob.split("/");
  const dateOfBirth =
    dobParts.length === 3
      ? `${dobParts[2]}${dobParts[0]}${dobParts[1]}`
      : visit.dob;

  // Parse service date — "03/18/2026" → "20260318"
  const sdParts = visit.date.split("/");
  const serviceDate =
    sdParts.length === 3
      ? `${sdParts[2]}${sdParts[0]}${sdParts[1]}`
      : visit.date;

  // Extract member ID (strip prefix like "UHC-")
  const memberId = visit.memberId.replace(/^[A-Z]+-/, "");

  // Map sex to EDI gender code
  const genderCode = visit.sex === "Male" ? "M" : visit.sex === "Female" ? "F" : "U";

  // Find payer ID
  const payerId =
    PAYER_IDS[visit.insurance] ||
    Object.entries(PAYER_IDS).find(([k]) =>
      visit.insurance.toLowerCase().includes(k.toLowerCase())
    )?.[1] ||
    "99999";

  // Build diagnosis code pointers — each service line points to relevant diagnoses
  const diagPointers = icdCodes.map((_, i) => String(i + 1));
  const defaultPointers = diagPointers.length > 0 ? diagPointers.slice(0, 4) : ["1"];

  // Place of service: 11 = Office, 22 = Hospital Outpatient, 24 = ASC
  const pos = visit.placeOfService || "11";

  const payload: StediClaimPayload = {
    billing: {
      npi: visit.npi,
      firstName: provFirst,
      lastName: provLast,
      address: { address1, city, state, postalCode },
      taxId: visit.taxId.replace(/-/g, ""),
      taxonomyCode: "207X00000X", // Orthopedic Surgery
      contactInformation: {
        name: `${provFirst} ${provLast}`,
        phoneNumber: "2125550100",
      },
    },
    subscriber: {
      memberId,
      firstName,
      lastName,
      dateOfBirth,
      genderCode,
      address: {
        address1: ptAddress1,
        city: ptCity,
        state: ptState,
        postalCode: ptPostalCode,
      },
      paymentResponsibilityLevelCode: "P", // Primary
      ...(visit.groupNumber ? { groupNumber: visit.groupNumber } : {}),
    },
    claimInformation: {
      claimChargeAmount: totalCharges.toFixed(2),
      placeOfServiceCode: pos,
      benefitsAssignmentCertificationIndicator: "Y",
      releaseOfInformationCode: "Y",
      patientSignatureSourceCode: "P",
      claimFilingCode: "CI",
      claimFrequencyCode: "1",
      providerAcceptAssignmentCode: "A",
      healthCareCodeInformation: icdCodes.map((c, i) => ({
        diagnosisCode: c.code.replace(/\./g, ""),
        diagnosisTypeCode: (i === 0 ? "ABK" : "ABF") as "ABK" | "ABF",
      })),
      serviceLines: cptCodes
        .filter((c) => (c.fee || 0) > 0)
        .map((c) => ({
          professionalService: {
            procedureCode: c.code,
            ...(c.modifiers && c.modifiers.length > 0
              ? { procedureModifiers: c.modifiers }
              : {}),
            chargeAmount: (c.fee || 0).toFixed(2),
            unitCount: "1",
            measurementUnit: "UN",
            diagnosisCodePointers: defaultPointers,
          },
          serviceDateInformation: { serviceDateFrom: serviceDate },
        })),
    },
    rendering: {
      npi: visit.npi,
      firstName: provFirst,
      lastName: provLast,
      taxonomyCode: "207X00000X",
    },
    payer: {
      payerId,
      name: visit.insurance,
    },
  };

  // PWK segment — flag operative report as attached/coming
  if (visit.hasOperativeReport) {
    payload.claimInformation.claimSupplementalInformation = {
      attachmentReportTypeCode: "OZ", // Support data for claim
      attachmentTransmissionCode: "EL", // Electronic
      attachmentControlNumber: `OP-${serviceDate}-${memberId}`,
    };
  }

  return payload;
}

// ── Submit claim to Stedi ───────────────────────────────────────────
export function useStediClaims() {
  const [claims, setClaims] = useState<ClaimRecord[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const submitClaim = useCallback(
    async (
      visitId: string,
      patient: string,
      payer: string,
      totalCharge: number,
      payload: StediClaimPayload
    ): Promise<ClaimRecord> => {
      const claimId = `CLM-${Date.now()}`;
      const record: ClaimRecord = {
        id: claimId,
        visitId,
        patient,
        payer,
        totalCharge,
        status: "submitting",
        payload,
      };

      setClaims((prev) => [record, ...prev]);
      setSubmitting(true);
      setLastError(null);

      const apiKey = getApiKey();
      if (!apiKey) {
        const errorRecord: ClaimRecord = {
          ...record,
          status: "error",
          response: {
            success: false,
            message:
              "No Stedi API key configured. Set VITE_STEDI_API_KEY in .env",
          },
        };
        setClaims((prev) =>
          prev.map((c) => (c.id === claimId ? errorRecord : c))
        );
        setSubmitting(false);
        setLastError("No API key configured");
        return errorRecord;
      }

      try {
        const res = await fetch(`${STEDI_BASE_URL}/submission`, {
          method: "POST",
          headers: {
            Authorization: `Key ${apiKey}`,
            "Content-Type": "application/json",
            "Idempotency-Key": claimId,
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        const updatedRecord: ClaimRecord = {
          ...record,
          submittedAt: new Date().toISOString(),
          status: res.ok ? "accepted" : "rejected",
          stediClaimId: data.claimId || data.editId || undefined,
          response: {
            success: res.ok,
            claimId: data.claimId || data.editId,
            status: res.ok ? "accepted" : "rejected",
            message: res.ok
              ? "Claim submitted successfully"
              : data.message || data.errors?.[0]?.description || `HTTP ${res.status}`,
            raw: data,
            x12: data.x12,
          },
        };

        setClaims((prev) =>
          prev.map((c) => (c.id === claimId ? updatedRecord : c))
        );
        setSubmitting(false);
        return updatedRecord;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Network error submitting claim";
        const errorRecord: ClaimRecord = {
          ...record,
          status: "error",
          response: { success: false, message },
        };
        setClaims((prev) =>
          prev.map((c) => (c.id === claimId ? errorRecord : c))
        );
        setSubmitting(false);
        setLastError(message);
        return errorRecord;
      }
    },
    []
  );

  return { claims, submitting, lastError, submitClaim };
}

// ── Stedi health check ──────────────────────────────────────────────
export async function checkStediApi(): Promise<{
  status: "connected" | "degraded" | "offline" | "no_key";
  latency?: number;
}> {
  const apiKey = getApiKey();
  if (!apiKey) return { status: "no_key" };

  const start = performance.now();
  try {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 8000);
    // Use a lightweight endpoint — checking if the API responds
    const res = await fetch(`${STEDI_BASE_URL}/submission`, {
      method: "POST",
      headers: {
        Authorization: `Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
      signal: controller.signal,
    });
    clearTimeout(tid);
    const latency = Math.round(performance.now() - start);
    // Even a 400 means the API is reachable
    if (res.status < 500) {
      return { status: latency > 3000 ? "degraded" : "connected", latency };
    }
    return { status: "degraded", latency };
  } catch {
    return { status: "offline" };
  }
}
