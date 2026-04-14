import { NextRequest, NextResponse } from "next/server";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";

// Generates an SEO- and GEO-optimized alt text for a blog thumbnail.
// Body: { title, excerpt?, tag?, relatedService?, prompt?, seriesTitle?,
//         episode?, aspectRatio?, geo? }
//   - prompt is the exact image-generation prompt that produced the image
//     (gives the model concrete visual detail to describe).
//   - geo defaults to { city: "New York", areas: ["Manhattan", "Brooklyn"], state: "NY" }
//     and is baked into the alt text so every thumbnail carries local relevance.
//
// Returns: { alt: string }
//   - <= 125 characters (screen-reader + Google image-search friendly)
//   - Describes the image literally first, then carries one subtle GEO anchor
//     and the article's subject (tag / condition / service) for image SEO
//   - Never includes the doctor's name or boilerplate ("photo of", "image of")
export async function POST(request: NextRequest) {
  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured." },
      { status: 500 }
    );
  }

  const {
    title,
    excerpt = "",
    tag = "",
    relatedService = "",
    prompt = "",
    seriesTitle = "",
    episode,
    aspectRatio = "16:9",
    geo,
  } = await request.json();

  if (!title) {
    return NextResponse.json({ error: "Missing title" }, { status: 400 });
  }

  const geoCtx = {
    city: geo?.city || "New York City",
    areas: Array.isArray(geo?.areas) && geo.areas.length > 0
      ? geo.areas
      : ["Manhattan", "Upper East Side", "Greenwich Village", "Brooklyn Heights"],
    state: geo?.state || "NY",
  };

  const systemPrompt = `You write alt text for medical / orthopedic blog thumbnails on a board-certified NYC orthopedic surgeon's website.

Hard rules:
- Output ONLY the alt text, no quotes, no prose, no labels.
- Maximum 125 characters total. Prefer 90-120.
- Never start with "Image of", "Photo of", "Picture of", "A shot of".
- Never mention the doctor's name or brand.
- No clickbait, no emoji, no hashtags.

SEO layer (mandatory):
- Naturally include the article's clinical subject (from the title / tag / relatedService) so Google Image Search can tie the image to the topic — e.g. "ACL tear", "rotator cuff repair", "PRP therapy".

GEO layer (mandatory when the image setting supports it):
- Bake in ONE location anchor from: ${geoCtx.city}, ${geoCtx.areas.join(", ")}, ${geoCtx.state}.
- Prefer neighborhood-level specifics ("${geoCtx.areas[0]}", "${geoCtx.areas[1] || geoCtx.areas[0]}") over generic "NYC" when the scene allows.
- If the image is clearly indoors/clinical with no location cue, use a lighter geo tag like "${geoCtx.city} orthopedic" instead of inventing a neighborhood.

Structure (aim for, not rigid):
  <concrete scene description> — <clinical subject> — <geo anchor>
Example target lengths:
  "Runner rehabbing an ACL tear on a Central Park loop at sunrise — NYC sports medicine"
  "Surgeon performing arthroscopic rotator cuff repair in a Manhattan OR"
  "PRP injection prepared in a modern Upper East Side orthopedic clinic"`;

  const metaLines = [
    `Title: ${title}`,
    excerpt ? `Excerpt: ${excerpt}` : "",
    tag ? `Tag / angle: ${tag}` : "",
    seriesTitle ? `Series: ${seriesTitle}${episode ? ` · Episode ${episode}` : ""}` : "",
    relatedService ? `Related service: ${relatedService}` : "",
    aspectRatio ? `Aspect ratio: ${aspectRatio}` : "",
    prompt ? `Image generation prompt (what is in the image):\n${prompt}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const userMessage = `Write ONE alt text (<=125 chars) for the thumbnail of this article. Follow every rule above.

=== ARTICLE + IMAGE CONTEXT ===
${metaLines}

Return the alt text only, no quotes, no prefix.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-opus-4-6",
      max_tokens: 200,
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
  let alt: string = (data.content?.[0]?.text || "").trim();

  // Strip anything the model wrapped around the alt text (quotes, markdown).
  alt = alt
    .replace(/^["'`\s]+|["'`\s]+$/g, "")
    .replace(/^alt(\s*text)?\s*[:\-]\s*/i, "")
    .trim();

  // Hard cap at 140 chars as a safety net if the model overruns.
  if (alt.length > 140) alt = alt.slice(0, 137).trimEnd() + "…";

  if (!alt) {
    return NextResponse.json(
      { error: "Claude did not return alt text" },
      { status: 500 }
    );
  }

  return NextResponse.json({ alt });
}
