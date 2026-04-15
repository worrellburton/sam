import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { requireDevAuth } from "@/lib/dev-auth";

function walkDir(dir: string, base: string): { path: string; mtime: number; size: number }[] {
  const results: { path: string; mtime: number; size: number }[] = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDir(full, base));
    } else {
      const stat = fs.statSync(full);
      results.push({ path: "/" + path.relative(base, full), mtime: stat.mtimeMs, size: stat.size });
    }
  }
  return results;
}

export async function GET(request: NextRequest) {
  const auth = requireDevAuth(request);
  if (!auth.ok) return auth.response;

  const type = request.nextUrl.searchParams.get("type") || "images";
  const publicDir = path.join(process.cwd(), "public");
  const targetDir = type === "videos"
    ? path.join(publicDir, "videos")
    : path.join(publicDir, "images");

  const files = walkDir(targetDir, publicDir);
  // Sort by most recently modified first
  files.sort((a, b) => b.mtime - a.mtime);
  return NextResponse.json({ files: files.map(f => ({ path: f.path, mtime: f.mtime, size: f.size })) });
}
