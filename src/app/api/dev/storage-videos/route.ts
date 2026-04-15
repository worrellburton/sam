import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireDevAuth } from "@/lib/dev-auth";

const BUCKET = "blog-videos";

// GET — list every object in the blog-videos bucket with its public CDN URL.
// The dev panel polls this right after an upload finishes so the new file
// shows up without requiring a manual refresh.
export async function GET() {
  const { data, error } = await supabase.storage.from(BUCKET).list("", {
    limit: 1000,
    sortBy: { column: "updated_at", order: "desc" },
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const files = (data || [])
    // Supabase occasionally returns a placeholder "empty" row when the bucket
    // is truly empty; filter those + any nested folders (we don't use them).
    .filter((f) => f.name && f.name !== ".emptyFolderPlaceholder")
    .map((f) => {
      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(f.name);
      return {
        name: f.name,
        url: pub.publicUrl,
        size: (f.metadata as { size?: number } | null)?.size ?? 0,
        updatedAt: f.updated_at,
      };
    });
  return NextResponse.json({ bucket: BUCKET, files });
}

// DELETE — remove a video from the bucket. Body: { name }
export async function DELETE(request: NextRequest) {
  const auth = requireDevAuth(request);
  if (!auth.ok) return auth.response;

  const { name } = await request.json();
  if (!name) {
    return NextResponse.json({ error: "Missing name" }, { status: 400 });
  }
  const { error } = await supabase.storage.from(BUCKET).remove([name]);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
