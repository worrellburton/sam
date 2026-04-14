import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const BUCKET = "blog-thumbnails";

// Uploads a single blog thumbnail to Supabase Storage.
// Body: { fileName, content (base64), mimeType? }
//   - fileName is the object key inside the bucket (e.g. "acl-tear-recovery.webp")
//   - content is base64 without the `data:` prefix
//   - mimeType defaults to image/webp; client can pass image/jpeg / image/png
//
// Returns: { publicUrl, path }
export async function POST(request: NextRequest) {
  const { fileName, content, mimeType } = await request.json();
  if (!fileName || !content) {
    return NextResponse.json({ error: "Missing fileName or content" }, { status: 400 });
  }

  // Decode base64 → Uint8Array. We avoid Buffer so this works on the edge
  // runtime too if the route is ever migrated.
  let bytes: Uint8Array;
  try {
    const binary = atob(content);
    bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  } catch (err) {
    return NextResponse.json(
      { error: `Invalid base64 content: ${err instanceof Error ? err.message : "unknown"}` },
      { status: 400 }
    );
  }

  const contentType = typeof mimeType === "string" && mimeType.length > 0
    ? mimeType
    : "image/webp";

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, bytes, {
      contentType,
      upsert: true, // overwrite when the dev panel re-saves the same slug
      cacheControl: "31536000", // 1y; cache-bust via ?v= query when rotating
    });

  if (error) {
    return NextResponse.json(
      { error: `Supabase Storage upload failed: ${error.message}` },
      { status: 500 }
    );
  }

  const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
  return NextResponse.json({
    publicUrl: publicUrlData.publicUrl,
    path: fileName,
    bucket: BUCKET,
  });
}

export async function DELETE(request: NextRequest) {
  const { fileName } = await request.json();
  if (!fileName) {
    return NextResponse.json({ error: "Missing fileName" }, { status: 400 });
  }

  const { error } = await supabase.storage.from(BUCKET).remove([fileName]);
  if (error) {
    return NextResponse.json(
      { error: `Supabase Storage delete failed: ${error.message}` },
      { status: 500 }
    );
  }
  return NextResponse.json({ success: true });
}
