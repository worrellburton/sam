import { NextRequest, NextResponse } from "next/server";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || "";
const API_BASE = "https://api.elevenlabs.io/v1";
const VOICE_ID = "UgBBYS2sOqTuMpoF3BR0"; // Mark - Natural Conversations
const MODEL_ID = "eleven_multilingual_v2";

export async function POST(request: NextRequest) {
  if (!ELEVENLABS_API_KEY) {
    return NextResponse.json(
      { error: "ElevenLabs API key not configured" },
      { status: 500 }
    );
  }

  let body: { text: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.text || typeof body.text !== "string") {
    return NextResponse.json({ error: "text field required" }, { status: 400 });
  }

  // Strip HTML and clean up text for speech
  const cleanText = body.text
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Truncate to ~5000 chars to stay within limits
  const truncated = cleanText.length > 5000 ? cleanText.slice(0, 5000) + "..." : cleanText;

  const res = await fetch(`${API_BASE}/text-to-speech/${VOICE_ID}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": ELEVENLABS_API_KEY,
    },
    body: JSON.stringify({
      text: truncated,
      model_id: MODEL_ID,
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.3,
        speed: 0.95,
      },
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    return NextResponse.json(
      { error: errData?.detail?.message || errData?.message || `API error: ${res.status}` },
      { status: res.status }
    );
  }

  const audioBuffer = await res.arrayBuffer();
  return new NextResponse(audioBuffer, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
