"use client";
import { useState, useEffect, useCallback } from "react";
import { checkStediApi } from "./useStedi";
import { checkAthenaApi } from "./useAthena";

export interface ApiStatus {
  name: string;
  url: string;
  status: "checking" | "connected" | "degraded" | "offline";
  latency?: number;
  lastChecked?: Date;
}

// ── Health checks ──────────────────────────────────────────────────
// NLM Clinical Tables supports CORS, so we can fetch directly.
// Brandfetch CDN does NOT allow CORS on fetch — but <img> loads work.
// We use Image() for Brandfetch and fetch() for NLM.

async function checkNlmApi(): Promise<ApiStatus> {
  const name = "ICD-10 API";
  const url = "https://clinicaltables.nlm.nih.gov";
  const start = performance.now();
  try {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(
      url + "/api/icd10cm/v3/search?sf=code,name&terms=ACL&maxList=1",
      { signal: controller.signal }
    );
    clearTimeout(tid);
    const latency = Math.round(performance.now() - start);
    if (res.ok) {
      return { name, url, status: latency > 3000 ? "degraded" : "connected", latency, lastChecked: new Date() };
    }
    return { name, url, status: "degraded", latency, lastChecked: new Date() };
  } catch {
    return { name, url, status: "offline", lastChecked: new Date() };
  }
}

function checkBrandfetch(): Promise<ApiStatus> {
  const name = "Brandfetch";
  const url = "https://cdn.brandfetch.io";
  return new Promise((resolve) => {
    const start = performance.now();
    const img = new Image();
    const tid = setTimeout(() => {
      img.src = "";
      resolve({ name, url, status: "offline", lastChecked: new Date() });
    }, 8000);
    img.onload = () => {
      clearTimeout(tid);
      const latency = Math.round(performance.now() - start);
      resolve({ name, url, status: latency > 3000 ? "degraded" : "connected", latency, lastChecked: new Date() });
    };
    img.onerror = () => {
      clearTimeout(tid);
      resolve({ name, url, status: "offline", lastChecked: new Date() });
    };
    img.src = url + "/aetna.com/w/32/h/32/fallback/lettermark/type/icon?c=1id3n10pdBTarCHI0db";
  });
}

async function checkCmsMpfsApi(): Promise<ApiStatus> {
  const name = "CMS MPFS";
  const url = "https://data.cms.gov";
  const start = performance.now();
  try {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(
      url + "/data-api/v1/dataset/fee-for-service-physician/data?size=1",
      { signal: controller.signal }
    );
    clearTimeout(tid);
    const latency = Math.round(performance.now() - start);
    if (res.ok) {
      return { name, url, status: latency > 3000 ? "degraded" : "connected", latency, lastChecked: new Date() };
    }
    return { name, url, status: "degraded", latency, lastChecked: new Date() };
  } catch {
    return { name, url, status: "offline", lastChecked: new Date() };
  }
}

export function useApiStatus(pollInterval = 60000) {
  const [statuses, setStatuses] = useState<ApiStatus[]>([
    { name: "athenahealth", url: "https://api.platform.athenahealth.com", status: "checking" },
    { name: "ICD-10 API", url: "https://clinicaltables.nlm.nih.gov", status: "checking" },
    { name: "Brandfetch", url: "https://cdn.brandfetch.io", status: "checking" },
    { name: "Stedi", url: "https://healthcare.us.stedi.com", status: "checking" },
    { name: "CMS MPFS", url: "https://data.cms.gov", status: "checking" },
  ]);

  const checkAll = useCallback(async () => {
    const [athena, nlm, brandfetch, stedi, cms] = await Promise.all([
      checkAthenaApi().then((r): ApiStatus => ({
        name: "athenahealth",
        url: "https://api.platform.athenahealth.com",
        status: r.status === "no_key" ? "offline" : r.status,
        latency: r.latency,
        lastChecked: new Date(),
      })),
      checkNlmApi(),
      checkBrandfetch(),
      checkStediApi().then((r): ApiStatus => ({
        name: "Stedi",
        url: "https://healthcare.us.stedi.com",
        status: r.status === "no_key" ? "offline" : r.status,
        latency: r.latency,
        lastChecked: new Date(),
      })),
      checkCmsMpfsApi(),
    ]);
    setStatuses([athena, nlm, brandfetch, stedi, cms]);
  }, []);

  useEffect(() => {
    checkAll();
    const id = setInterval(checkAll, pollInterval);
    return () => clearInterval(id);
  }, [checkAll, pollInterval]);

  return { statuses, refresh: checkAll };
}

// ── ICD-10 Search ──────────────────────────────────────────────────
export interface ICD10Result {
  code: string;
  description: string;
}

export function useICD10Search() {
  const [results, setResults] = useState<ICD10Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(
        `https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search?sf=code,name&terms=${encodeURIComponent(query)}&maxList=10`,
        { signal: controller.signal }
      );
      clearTimeout(tid);
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      // NLM returns [total, codes, extra, [code, name] pairs]
      const codes: string[] = data[1] || [];
      const details: string[][] = data[3] || [];
      setResults(
        codes.map((code, i) => ({
          code,
          description: details[i]?.[1] || details[i]?.[0] || code,
        }))
      );
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setError("Failed to search ICD-10 codes");
        setResults([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, error, search };
}
