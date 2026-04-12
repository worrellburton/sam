import { NextRequest, NextResponse } from "next/server";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";

// Default brand direction — can be overridden per-request via `globalPrompt`.
const DEFAULT_GLOBAL_PROMPT = `SETTING: New York City. All images should feel unmistakably NYC — the city is Dr. Elguizaoui's home. Lean on NYC signals: Manhattan skyline / East River light, brownstone stoops, Central Park at golden hour, the Williamsburg or Brooklyn Bridge, rooftop tracks, Chelsea lofts, subway station staircases, sun cutting between buildings. Not every image needs a landmark, but the light, architecture, and energy should read as New York.

PEOPLE: Subjects are 20s–40s only. Athletic, active, contemporary New Yorkers — runners, climbers, yogis, cyclists, lifters, dancers, weekend warriors. Absolutely no elderly subjects. No clinical "old patient with cane" stock photo tropes.

BRAND VISUAL STYLE: Nike x Equinox. Premium, aspirational, athletic editorial. Cinematic natural light, high contrast, crisp shadows, shallow depth of field. Muted, confident color palette with one bold accent (deep blue, burnt orange, or black). Modeled bodies in motion or in composed stillness. Wardrobe is modern athletic or quiet-luxury minimalism — never hospital gowns, never generic stock-photo scrubs. When clinical moments are depicted, make the environment look like a high-end private practice or performance lab, not a fluorescent-lit hospital.

CONSISTENCY: All 4 prompts in a set must share the same lighting palette and color DNA so they read as one campaign.`;

export async function POST(request: NextRequest) {
  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured. Add it to your environment variables." },
      { status: 500 }
    );
  }

  const { title, excerpt, content, style = "photorealistic", globalPrompt } = await request.json();
  if (!title) {
    return NextResponse.json({ error: "Missing title" }, { status: 400 });
  }

  const styleGuide: Record<string, string> = {
    photorealistic:
      "Photorealistic, premium editorial photography. Cinematic, not clinical. Think Nike campaign, not stock hospital photo.",
    editorial:
      "Modern editorial illustration in the style of The New York Times or The Atlantic. Stylized, minimal, muted tones with one accent color. Conceptual and evocative, not literal. No text overlays.",
    abstract:
      "Abstract, artistic medical visualization. Microscopic biology meets modern art. Rich colors, organic shapes, scientific beauty. No text overlays.",
  };

  const globalDirection = (typeof globalPrompt === "string" && globalPrompt.trim().length > 0)
    ? globalPrompt.trim()
    : DEFAULT_GLOBAL_PROMPT;

  const systemPrompt = `You are an expert at writing image generation prompts for Nano Banana Pro 2 (Gemini 3 Pro Image). Your job is to read a medical blog article and create FOUR distinct, vivid image prompts that together tell the story of the article.

=== GLOBAL BRAND DIRECTION (applies to every prompt) ===
${globalDirection}
=== END GLOBAL BRAND DIRECTION ===

Rules:
- Output ONLY a JSON array of 4 strings — nothing else, no prose, no code fences
- Each prompt must be under 180 words and must bake in the global brand direction above (NYC setting, 20s–40s subjects, Nike/Equinox visual style)
- The 4 prompts must explore different angles/moments of the article: e.g., (1) hero / emotional opener, (2) the clinical moment or expert at work, (3) the recovery / return-to-motion chapter, (4) an abstract or conceptual closing frame
- Be specific about composition, lighting, colors, mood
- Never include text or words in the image
- 16:9 landscape format
- All 4 should feel like the same campaign — consistent lighting and color DNA, different subject matter
- Style lane for this set: ${styleGuide[style] || styleGuide.photorealistic}`;

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

// Expose the default global prompt so the dev UI can show it and let the
// user reset back to it.
export async function GET() {
  return NextResponse.json({ defaultGlobalPrompt: DEFAULT_GLOBAL_PROMPT });
}
