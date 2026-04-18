import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireDevAuth } from "@/lib/dev-auth";

const BUCKET = "site-images";

export async function GET(request: NextRequest) {
  const auth = requireDevAuth(request);
  if (!auth.ok) return auth.response;

  const { data, error } = await supabase.storage.from(BUCKET).list("", {
    limit: 500,
    sortBy: { column: "created_at", order: "desc" },
  });

  if (error) {
    return NextResponse.json(
      { error: `Failed to list images: ${error.message}` },
      { status: 500 },
    );
  }

  const files = (data || [])
    .filter((f) => !f.id?.endsWith("/"))
    .map((f) => {
      const { data: urlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(f.name);
      return {
        name: f.name,
        path: urlData.publicUrl,
        size: f.metadata?.size ?? 0,
        mtime: f.created_at ? new Date(f.created_at).getTime() : Date.now(),
      };
    });

  return NextResponse.json({ files });
}

export async function POST(request: NextRequest) {
  const auth = requireDevAuth(request);
  if (!auth.ok) return auth.response;

  const { fileName, content, mimeType } = await request.json();
  if (!fileName || !content) {
    return NextResponse.json(
      { error: "Missing fileName or content" },
      { status: 400 },
    );
  }

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

  const { error } = await supabase.storage.from(BUCKET).upload(fileName, bytes, {
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

  const { data: publicUrlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(fileName);

  return NextResponse.json({
    success: true,
    path: publicUrlData.publicUrl,
    fileName,
  });
}

export async function DELETE(request: NextRequest) {
  const auth = requireDevAuth(request);
  if (!auth.ok) return auth.response;

  const { fileName } = await request.json();
  if (!fileName) {
    return NextResponse.json({ error: "Missing fileName" }, { status: 400 });
  }

  const { error } = await supabase.storage.from(BUCKET).remove([fileName]);
  if (error) {
    return NextResponse.json(
      { error: `Delete failed: ${error.message}` },
      { status: 500 },
    );
  }
  return NextResponse.json({ success: true });
}
