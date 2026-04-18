import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireDevAuth } from "@/lib/dev-auth";

// Three image sections, each backed by a bucket + optional prefix:
//   sam   → site-images/sam/*
//   other → site-images/other/*
//   blog  → blog-thumbnails/* (flat; existing bucket)
type Section = "sam" | "other" | "blog";

function resolveSection(section: Section): { bucket: string; prefix: string } {
  if (section === "blog") return { bucket: "blog-thumbnails", prefix: "" };
  if (section === "sam") return { bucket: "site-images", prefix: "sam" };
  return { bucket: "site-images", prefix: "other" };
}

function parseSection(raw: string | null): Section {
  if (raw === "sam" || raw === "blog" || raw === "other") return raw;
  return "other";
}

export async function GET(request: NextRequest) {
  const auth = requireDevAuth(request);
  if (!auth.ok) return auth.response;

  const section = parseSection(request.nextUrl.searchParams.get("section"));
  const { bucket, prefix } = resolveSection(section);

  const { data, error } = await supabase.storage.from(bucket).list(prefix, {
    limit: 1000,
    sortBy: { column: "created_at", order: "desc" },
  });

  if (error) {
    return NextResponse.json(
      { error: `Failed to list images: ${error.message}` },
      { status: 500 },
    );
  }

  const files = (data || [])
    .filter((f) => f.name && !f.name.endsWith("/"))
    .map((f) => {
      const key = prefix ? `${prefix}/${f.name}` : f.name;
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(key);
      return {
        name: f.name,
        key,
        path: urlData.publicUrl,
        size: f.metadata?.size ?? 0,
        mtime: f.created_at ? new Date(f.created_at).getTime() : Date.now(),
      };
    });

  return NextResponse.json({ files, section });
}

export async function POST(request: NextRequest) {
  const auth = requireDevAuth(request);
  if (!auth.ok) return auth.response;

  const { fileName, content, mimeType, section: rawSection } =
    await request.json();
  if (!fileName || !content) {
    return NextResponse.json(
      { error: "Missing fileName or content" },
      { status: 400 },
    );
  }

  const section = parseSection(rawSection || null);
  const { bucket, prefix } = resolveSection(section);
  const key = prefix ? `${prefix}/${fileName}` : fileName;

  let bytes: Uint8Array;
  try {
    const binary = atob(content);
    bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  } catch {
    return NextResponse.json(
      { error: "Invalid base64 content" },
      { status: 400 },
    );
  }

  const contentType =
    typeof mimeType === "string" && mimeType.length > 0
      ? mimeType
      : "image/webp";

  const { error } = await supabase.storage.from(bucket).upload(key, bytes, {
    contentType,
    upsert: true,
    cacheControl: "31536000",
  });

  if (error) {
    return NextResponse.json(
      { error: `Upload failed: ${error.message}` },
      { status: 500 },
    );
  }

  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(key);

  return NextResponse.json({
    success: true,
    path: publicUrlData.publicUrl,
    key,
    section,
  });
}

export async function DELETE(request: NextRequest) {
  const auth = requireDevAuth(request);
  if (!auth.ok) return auth.response;

  const { key, section: rawSection } = await request.json();
  if (!key) {
    return NextResponse.json({ error: "Missing key" }, { status: 400 });
  }

  const section = parseSection(rawSection || null);
  const { bucket } = resolveSection(section);

  const { error } = await supabase.storage.from(bucket).remove([key]);
  if (error) {
    return NextResponse.json(
      { error: `Delete failed: ${error.message}` },
      { status: 500 },
    );
  }
  return NextResponse.json({ success: true });
}
