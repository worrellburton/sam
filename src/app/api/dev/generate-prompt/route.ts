import { NextRequest, NextResponse } from "next/server";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";

export async function POST(request: NextRequest) {
  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured. Add it to your environment variables." },
      { status: 500 }
    );
  }

  const { title, excerpt, content, style = "photorealistic" } = await request.json();
  if (!title) {
    return NextResponse.json({ error: "Missing title" }, { status: 400 });
  }

  const styleGuide: Record<string, string> = {
    photorealistic:
      "Create a photorealistic, professional medical/clinical photography style image. Clean, well-lit, modern clinical or hospital setting. Focus on human emotion, expertise, and care. No text overlays.",
    editorial:
      "Create a modern editorial illustration in the style of The New York Times or The Atlantic. Stylized, minimal, muted tones with one accent color. Conceptual and evocative, not literal. No text overlays.",
    abstract:
      "Create an abstract, artistic medical visualization. Think microscopic biology meets modern art. Rich colors, organic shapes, scientific beauty. No text overlays.",
  };

  const systemPrompt = `You are an expert at writing image generation prompts for Nano Banana 2 (Gemini 3.1 Flash Image). Your job is to read a medical blog article and create a vivid, detailed image prompt that would make the perfect hero image for that article.

Rules:
- Output ONLY the image prompt, nothing else
- Keep it under 200 words
- Be specific about composition, lighting, colors, mood
- Never include text or words in the image
- The image should be 16:9 landscape format
- Make it feel premium and editorial quality
- ${styleGuide[style] || styleGuide.photorealistic}`;

  // Truncate content to avoid huge payloads — first 2000 chars is enough context
  const trimmedContent = content
    ? content.replace(/<[^>]*>/g, "").slice(0, 2000)
    : "";

  const userMessage = `Write an image generation prompt for this medical blog article:

Title: ${title}
Excerpt: ${excerpt || ""}
${trimmedContent ? `\nArticle content (excerpt):\n${trimmedContent}` : ""}

Style: ${style}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json(
      { error: `Claude API error: ${res.status} ${err}` },
      { status: res.status }
    );
  }

  const data = await res.json();
  const prompt = data.content?.[0]?.text?.trim() || "";

  if (!prompt) {
    return NextResponse.json(
      { error: "No prompt generated" },
      { status: 500 }
    );
  }

  return NextResponse.json({ prompt });
}
