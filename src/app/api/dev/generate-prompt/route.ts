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

  const {
    title,
    excerpt,
    content,
    tag,
    seriesTitle,
    episode,
    readTime,
    imageAlt,
    relatedService,
    style = "photorealistic",
    globalPrompt,
    nyc = true,
    surgery = false,
  } = await request.json();
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

  const rawGlobal = (typeof globalPrompt === "string" && globalPrompt.trim().length > 0)
    ? globalPrompt.trim()
    : DEFAULT_GLOBAL_PROMPT;

  // When `nyc` is false, strip the NYC setting paragraph out of the global
  // direction and replace it with a setting-neutral brief. The first paragraph
  // of the global prompt is always the SETTING block — swap it rather than
  // delete it so Claude still has a setting directive.
  const NON_NYC_SETTING = `SETTING: No fixed location. Choose settings that fit the article's subject matter naturally — clinical or training environments, outdoor scenes, or context-appropriate backdrops. Do not force NYC-specific landmarks or signals when they don't serve the article.`;
  const globalDirection = nyc
    ? rawGlobal
    : rawGlobal.replace(/^SETTING:[\s\S]*?(?=\n\n[A-Z]+:|$)/, NON_NYC_SETTING);
  const brandSummary = nyc
    ? "NYC setting, 20s–40s subjects, Nike/Equinox visual style"
    : "20s–40s subjects, Nike/Equinox visual style, setting dictated by article context";

  // Surgery mode overrides the usual scene variety — all 4 prompts should be
  // intraoperative scenes with the surgeon as the subject.
  const surgeryDirective = surgery
    ? `\n\n=== SURGERY OVERRIDE ===
All 4 prompts MUST depict surgeons at work in an operating room. Think: masked, gowned, loupes, sterile field, arthroscopic tower / monitors, focused hand work, bright task light on a blue drape. Subjects are the surgeon and surgical team (20s–40s) in scrubs, caps, masks — not patients, not athletes. Each of the 4 prompts should still explore a different moment within the OR (wide establishing shot, tight hand/instrument detail, monitor/arthroscopic view over the shoulder, team choreography), but the setting, wardrobe, and action stay inside the operating room. Environment is a high-end modern OR — clean, cinematic, editorial — not a fluorescent ER. Ignore earlier instructions that would place subjects outdoors, in parks, or in athletic settings.
=== END SURGERY OVERRIDE ===`
    : "";

  const systemPrompt = `You are an expert at writing image generation prompts for Nano Banana Pro 2 (Gemini 3 Pro Image). Your job is to deeply read a medical blog article — title, series context, tag/angle, excerpt, and full body — and use EVERY bit of that information to create FOUR distinct, vivid image prompts that together tell the story of the article.

=== GLOBAL BRAND DIRECTION (applies to every prompt) ===
${globalDirection}
=== END GLOBAL BRAND DIRECTION ===${surgeryDirective}

Your process before writing prompts:
1. Identify the central argument of the article (what is it really about, beyond the title?)
2. Pick out 3–5 concrete scenes, objects, people, or moments the author describes — these are your imagery anchors, NOT generic stock concepts.
3. Match the tag/angle (e.g. "The Inquiry" = investigative, "Myth Busting" = confronting a misconception, "The Investigation" = clinical forensic) to the emotional register of each image.
4. If the article mentions a specific body part, procedure, sport, demographic, or setting, BAKE that into the imagery — don't default to generic "athlete running."

Rules:
- Output ONLY a JSON array of 4 strings — nothing else, no prose, no code fences
- Each prompt must be under 200 words and must bake in the global brand direction above (${brandSummary})
- The 4 prompts must explore DIFFERENT angles/moments drawn directly from the article's content:
  (1) Hero / emotional opener that captures the article's central tension
  (2) The specific clinical moment, procedure, or expert-at-work scene described in the piece
  (3) The human / recovery / return-to-motion chapter — who is this article FOR
  (4) A conceptual or abstract frame that echoes the article's thesis
- Be specific about composition, lighting, colors, mood, and the concrete details from the article
- Never include text or words in the image
- 16:9 landscape format
- All 4 should feel like the same campaign — consistent lighting and color DNA, different subject matter
- Style lane for this set: ${styleGuide[style] || styleGuide.photorealistic}`;

  // Give Claude the full article (HTML stripped). Opus handles long context well, so
  // don't truncate aggressively — the prompts are only as good as the context.
  const fullContent = content ? content.replace(/<[^>]*>/g, "").replace(/\s+\n/g, "\n").trim() : "";
  const contentForPrompt = fullContent.length > 12000 ? fullContent.slice(0, 12000) + "\n[…truncated]" : fullContent;

  const metaLines = [
    `Title: ${title}`,
    excerpt ? `Excerpt / dek: ${excerpt}` : "",
    tag ? `Tag / angle: ${tag}` : "",
    seriesTitle ? `Series: ${seriesTitle}${episode ? ` · Episode ${episode}` : ""}` : "",
    readTime ? `Read time: ${readTime}` : "",
    imageAlt ? `Previous image alt-text (for reference, NOT to reuse): ${imageAlt}` : "",
    relatedService ? `Related service / specialty: ${relatedService}` : "",
  ].filter(Boolean).join("\n");

  const userMessage = `Write FOUR image generation prompts for this medical blog article. Use ALL of the metadata AND the article body below — do not rely only on the title. Return ONLY a JSON array of 4 strings.

=== ARTICLE METADATA ===
${metaLines}

=== ARTICLE BODY ===
${contentForPrompt || "(no body provided — lean harder on title, excerpt, and tag)"}

Style lane: ${style}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-opus-4-6",
      max_tokens: 2400,
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
