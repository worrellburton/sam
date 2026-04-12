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
      "Photorealistic, professional medical/clinical photography. Clean, well-lit, modern clinical or hospital setting. Focus on human emotion, expertise, and care. No text overlays.",
    editorial:
      "Modern editorial illustration in the style of The New York Times or The Atlantic. Stylized, minimal, muted tones with one accent color. Conceptual and evocative, not literal. No text overlays.",
    abstract:
      "Abstract, artistic medical visualization. Microscopic biology meets modern art. Rich colors, organic shapes, scientific beauty. No text overlays.",
  };

  const systemPrompt = `You are an expert at writing image generation prompts for Nano Banana Pro 2 (Gemini 3 Pro Image). Your job is to read a medical blog article and create FOUR distinct, vivid image prompts that together tell the story of the article.

Rules:
- Output ONLY a JSON array of 4 strings — nothing else, no prose, no code fences
- Each prompt must be under 180 words
- The 4 prompts must explore different angles/moments of the article: e.g., (1) hero / emotional opener, (2) the clinical moment or expert at work, (3) the recovery / transformation / second chapter, (4) an abstract or conceptual closing frame
- Be specific about composition, lighting, colors, mood
- Never include text or words in the image
- 16:9 landscape format
- All 4 should feel like they belong in the same article — consistent stylistic DNA, different subject matter
- Style direction for all 4: ${styleGuide[style] || styleGuide.photorealistic}`;

  const trimmedContent = content
    ? content.replace(/<[^>]*>/g, "").slice(0, 2000)
    : "";

  const userMessage = `Write FOUR image generation prompts for this medical blog article. Return ONLY a JSON array of 4 strings.

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
      model: "claude-opus-4-6",
      max_tokens: 1600,
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
  const raw: string = data.content?.[0]?.text?.trim() || "";

  // Parse a JSON array from Claude's response. Be lenient with code fences.
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

  let prompts: string[] = [];
  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed) && parsed.every((p) => typeof p === "string")) {
      prompts = parsed;
    }
  } catch {
    // Fallback: try to pull out quoted strings
    const matches = [...cleaned.matchAll(/"([\s\S]+?)"/g)].map((m) => m[1]);
    if (matches.length >= 4) prompts = matches.slice(0, 4);
  }

  if (prompts.length < 4) {
    return NextResponse.json(
      { error: "Claude did not return 4 prompts", raw },
      { status: 500 }
    );
  }

  return NextResponse.json({ prompts: prompts.slice(0, 4) });
}
