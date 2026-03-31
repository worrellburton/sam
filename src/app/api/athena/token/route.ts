import { NextResponse } from "next/server";

const ATHENA_ENV = process.env.ATHENA_ENV || "preview";

const BASE_URLS: Record<string, string> = {
  production: "https://api.platform.athenahealth.com",
  preview: "https://api.preview.platform.athenahealth.com",
};

const BASE_URL = BASE_URLS[ATHENA_ENV] || BASE_URLS.preview;
const TOKEN_URL = `${BASE_URL}/oauth2/v1/token`;

function getClientId(): string {
  return process.env.ATHENA_CLIENT_ID || "";
}
function getClientSecret(): string {
  return process.env.ATHENA_CLIENT_SECRET || "";
}

export async function POST() {
  const clientId = getClientId();
  const clientSecret = getClientSecret();

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "Athena API credentials not configured" },
      { status: 500 }
    );
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

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
    return NextResponse.json(
      { error: `Athena OAuth failed: ${res.status} ${text}` },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json({
    access_token: data.access_token,
    expires_in: data.expires_in || 3600,
  });
}
