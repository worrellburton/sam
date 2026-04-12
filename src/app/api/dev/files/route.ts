import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function walkDir(dir: string, base: string): { path: string; mtime: number }[] {
  const results: { path: string; mtime: number }[] = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDir(full, base));
    } else {
      const stat = fs.statSync(full);
      results.push({ path: "/" + path.relative(base, full), mtime: stat.mtimeMs });
    }
  }
  return results;
}

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type") || "images";
  const publicDir = path.join(process.cwd(), "public");
  const targetDir = type === "videos"
    ? path.join(publicDir, "videos")
    : path.join(publicDir, "images");

  const files = walkDir(targetDir, publicDir);
  // Sort by most recently modified first
  files.sort((a, b) => b.mtime - a.mtime);
  return NextResponse.json({ files: files.map(f => f.path) });
}
