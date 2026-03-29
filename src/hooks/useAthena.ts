"use client";
import { useState, useCallback, useRef } from "react";

// ── Config ───────────────────────────────────────────────────────────
const ATHENA_ENV = process.env.NEXT_PUBLIC_ATHENA_ENV || "preview";

const BASE_URLS: Record<string, string> = {
  production: "https://api.platform.athenahealth.com",
  preview: "https://api.preview.platform.athenahealth.com",
};

const BASE_URL = BASE_URLS[ATHENA_ENV] || BASE_URLS.preview;
const TOKEN_URL = `${BASE_URL}/oauth2/v1/token`;

function getClientId(): string {
  return process.env.NEXT_PUBLIC_ATHENA_CLIENT_ID || "";
}
function getClientSecret(): string {
  return process.env.NEXT_PUBLIC_ATHENA_CLIENT_SECRET || "";
}
function getPracticeId(): string {
  return process.env.NEXT_PUBLIC_ATHENA_PRACTICE_ID || "";
}

// ── Types ────────────────────────────────────────────────────────────
export interface AthenaPatient {
  patientid: string;
  firstname: string;
  lastname: string;
  dob: string;
  sex: string;
  email?: string;
  mobilephone?: string;
  homephone?: string;
  address1?: string;
  city?: string;
  state?: string;
  zip?: string;
  insurances?: AthenaInsurance[];
}

export interface AthenaInsurance {
  insuranceid: string;
  insurancepackageid: string;
  insuranceplanname: string;
  insurancepolicynumber: string;
  sequencenumber: number;
}

export interface AthenaAppointment {
  appointmentid: string;
  date: string;
  starttime: string;
  duration: number;
  appointmenttype: string;
  appointmenttypeid: string;
  patientid: string;
  providerid: string;
  departmentid: string;
  appointmentstatus: string;
  patient?: { firstname: string; lastname: string };
}

export interface AthenaProvider {
  providerid: string;
  firstname: string;
  lastname: string;
  npi: string;
  specialty: string;
  entitytype: string;
  displayname: string;
}

export interface AthenaDepartment {
  departmentid: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  timezone: string;
}

export interface AthenaAppointmentType {
  appointmenttypeid: string;
  name: string;
  duration: number;
  generic: boolean;
  patient: boolean;
  templatetypeonly: boolean;
}

export interface AthenaOpenSlot {
  date: string;
  starttime: string;
  departmentid: string;
  providerid: string;
  appointmenttypeid: string;
  duration: number;
  frozen: boolean;
}

export interface AthenaEligibility {
  eligibilitystatus: string;
  planname: string;
  coinsurancepercent?: string;
  copayamount?: string;
  deductible?: string;
  deductiblemet?: string;
  effectivedate?: string;
  terminationdate?: string;
  message?: string;
}

// ── Token cache ──────────────────────────────────────────────────────
let cachedToken: string | null = null;
let tokenExpiry = 0;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry - 30_000) return cachedToken;

  const clientId = getClientId();
  const clientSecret = getClientSecret();
  if (!clientId || !clientSecret) throw new Error("Athena API credentials not configured");

  const basic = btoa(`${clientId}:${clientSecret}`);
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials&scope=athena/service/Athenanet.MDP.*",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Athena OAuth failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in || 3600) * 1000;
  return cachedToken!;
}

// ── API helper ───────────────────────────────────────────────────────
async function athenaFetch<T>(
  path: string,
  options: { method?: string; body?: Record<string, string>; params?: Record<string, string> } = {},
): Promise<T> {
  const token = await getAccessToken();
  const practiceId = getPracticeId();
  if (!practiceId) throw new Error("Athena Practice ID not configured");

  let url = `${BASE_URL}/v1/${practiceId}${path}`;
  if (options.params) {
    const qs = new URLSearchParams(options.params).toString();
    url += `?${qs}`;
  }

  const init: RequestInit = {
    method: options.method || "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
  };

  if (options.body && (options.method === "POST" || options.method === "PUT")) {
    init.body = new URLSearchParams(options.body).toString();
  }

  const res = await fetch(url, init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Athena API ${res.status}: ${text}`);
  }
  return res.json();
}

// ── Health check (exported for useApiStatus) ─────────────────────────
export async function checkAthenaApi(): Promise<{
  status: "connected" | "degraded" | "offline" | "no_key";
  latency?: number;
}> {
  if (!getClientId() || !getClientSecret()) return { status: "no_key" };
  const start = performance.now();
  try {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 8000);

    const token = await getAccessToken();
    const practiceId = getPracticeId();
    const res = await fetch(`${BASE_URL}/v1/${practiceId}/ping`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      signal: controller.signal,
    });
    clearTimeout(tid);
    const latency = Math.round(performance.now() - start);
    if (res.ok || res.status === 404) {
      // 404 on /ping is fine — means auth worked, endpoint just may not exist
      return { status: latency > 3000 ? "degraded" : "connected", latency };
    }
    return { status: "degraded", latency };
  } catch {
    return { status: "offline" };
  }
}

// ── React hooks ──────────────────────────────────────────────────────

/** Search patients by name, DOB, or ID */
export function useAthenaPatients() {
  const [patients, setPatients] = useState<AthenaPatient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const search = useCallback(async (query: string) => {
    if (!query || query.length < 2) { setPatients([]); return; }
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    setError(null);
    try {
      const data = await athenaFetch<{ patients: AthenaPatient[] }>("/patients/enhancedbestmatch", {
        params: { name: query, show2015edfields: "true" },
      });
      setPatients(data.patients || []);
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setError((e as Error).message);
        setPatients([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const getPatient = useCallback(async (patientId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await athenaFetch<AthenaPatient[]>(`/patients/${patientId}`);
      return data[0] || null;
    } catch (e) {
      setError((e as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { patients, loading, error, search, getPatient };
}

/** Book and manage appointments */
export function useAthenaAppointments() {
  const [appointments, setAppointments] = useState<AthenaAppointment[]>([]);
  const [openSlots, setOpenSlots] = useState<AthenaOpenSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAppointments = useCallback(async (params: {
    patientid?: string;
    providerid?: string;
    departmentid?: string;
    startdate?: string;
    enddate?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const qs: Record<string, string> = {};
      if (params.patientid) qs.patientid = params.patientid;
      if (params.providerid) qs.providerid = params.providerid;
      if (params.departmentid) qs.departmentid = params.departmentid;
      if (params.startdate) qs.startdate = params.startdate;
      if (params.enddate) qs.enddate = params.enddate;
      qs.showinsurance = "true";

      const data = await athenaFetch<{ appointments: AthenaAppointment[] }>("/appointments/booked", { params: qs });
      setAppointments(data.appointments || []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const findOpenSlots = useCallback(async (params: {
    providerid: string;
    departmentid: string;
    appointmenttypeid?: string;
    startdate: string;
    enddate: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const qs: Record<string, string> = {
        providerid: params.providerid,
        departmentid: params.departmentid,
        startdate: params.startdate,
        enddate: params.enddate,
      };
      if (params.appointmenttypeid) qs.appointmenttypeid = params.appointmenttypeid;

      const data = await athenaFetch<{ appointments: AthenaOpenSlot[] }>("/appointments/open", { params: qs });
      setOpenSlots(data.appointments || []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const bookAppointment = useCallback(async (appointmentId: string, patientId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await athenaFetch<AthenaAppointment[]>(`/appointments/${appointmentId}`, {
        method: "PUT",
        body: { patientid: patientId },
      });
      return data[0] || null;
    } catch (e) {
      setError((e as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelAppointment = useCallback(async (appointmentId: string) => {
    setLoading(true);
    setError(null);
    try {
      await athenaFetch<any>(`/appointments/${appointmentId}/cancel`, { method: "PUT" });
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { appointments, openSlots, loading, error, getAppointments, findOpenSlots, bookAppointment, cancelAppointment };
}

/** Provider & department lookup */
export function useAthenaProviders() {
  const [providers, setProviders] = useState<AthenaProvider[]>([]);
  const [departments, setDepartments] = useState<AthenaDepartment[]>([]);
  const [appointmentTypes, setAppointmentTypes] = useState<AthenaAppointmentType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getProviders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await athenaFetch<{ providers: AthenaProvider[] }>("/providers", {
        params: { providertype: "MD", showusualdepartmentguessthreshold: "true" },
      });
      setProviders(data.providers || []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const getDepartments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await athenaFetch<AthenaDepartment[]>("/departments");
      setDepartments(Array.isArray(data) ? data : []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const getAppointmentTypes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await athenaFetch<{ appointmenttypes: AthenaAppointmentType[] }>("/appointmenttypes");
      setAppointmentTypes(data.appointmenttypes || []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { providers, departments, appointmentTypes, loading, error, getProviders, getDepartments, getAppointmentTypes };
}

/** Insurance eligibility check */
export function useAthenaEligibility() {
  const [result, setResult] = useState<AthenaEligibility | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkEligibility = useCallback(async (patientId: string, insuranceId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await athenaFetch<AthenaEligibility[]>(
        `/patients/${patientId}/insurances/${insuranceId}/eligibility`,
      );
      const eligibility = data[0] || null;
      setResult(eligibility);
      return eligibility;
    } catch (e) {
      setError((e as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { result, loading, error, checkEligibility };
}
