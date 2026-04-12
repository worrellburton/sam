import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const MODEL = "gemini-3.1-flash-image-preview";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

export async function POST(request: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY not configured. Add it to your environment variables." },
      { status: 500 }
    );
  }

  const { prompt, aspectRatio = "16:9", imageSize = "2K" } = await request.json();
  if (!prompt) {
    return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
  }

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseModalities: ["TEXT", "IMAGE"],
      imageConfig: {
        aspectRatio,
        imageSize,
      },
    },
  };

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "x-goog-api-key": GEMINI_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json(
      { error: `Gemini API error: ${res.status} ${err}` },
      { status: res.status }
    );
  }

  const data = await res.json();

  // Extract the image from the response parts
  const candidates = data.candidates || [];
  const parts = candidates[0]?.content?.parts || [];

  let imageBase64 = "";
  let mimeType = "image/png";
  let textResponse = "";

  for (const part of parts) {
    if (part.inlineData) {
      imageBase64 = part.inlineData.data;
      mimeType = part.inlineData.mimeType || "image/png";
    }
    if (part.text) {
      textResponse = part.text;
    }
  }

  if (!imageBase64) {
    return NextResponse.json(
      { error: "No image returned from Gemini", text: textResponse },
      { status: 500 }
    );
  }

  return NextResponse.json({
    image: imageBase64,
    mimeType,
    text: textResponse,
  });
}
