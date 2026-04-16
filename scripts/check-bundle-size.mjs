#!/usr/bin/env node
/**
 * Bundle-size budget guard.
 *
 * Turbopack (Next 16) flattens client chunks into a single pool
 * under .next/static/chunks/, so per-route attribution isn't
 * straightforward at this layer. The most useful regression guard
 * with this output shape is:
 *
 *   1. Total size of all JS chunks (the whole client payload).
 *   2. Size of each individual chunk (catches a single vendor blob
 *      ballooning — the "someone imported moment.js" tell).
 *
 * Budgets are conservative multiples of current build output so the
 * check doesn't block ordinary feature work but trips on anything
 * unexpected.
 *
 * Run:
 *   npm run build && node scripts/check-bundle-size.mjs
 *
 * Exits 0 when everything is under budget, non-zero otherwise.
 */
import fs from "node:fs";
import path from "node:path";

const CHUNKS_DIR = ".next/static/chunks";

const LIMITS = {
  // Hard ceiling for the entire client JS surface. Current build
  // hovers a few MB below this; we'll tighten once Phase 33-35 land.
  totalBytes: 10 * 1024 * 1024, // 10 MB
  // No single chunk should be fatter than this. 1 MB is a shout —
  // anything over almost always means a heavy dep got bundled into
  // a client route unintentionally.
  singleChunkBytes: 1_200_000,
  // Warn (not fail) above this per-chunk — useful for tracking
  // growth without blocking CI.
  singleChunkWarnBytes: 600_000,
};

if (!fs.existsSync(CHUNKS_DIR)) {
  console.error(
    `check-bundle-size: ${CHUNKS_DIR} missing — run \`next build\` first.`,
  );
  process.exit(1);
}

const chunks = fs
  .readdirSync(CHUNKS_DIR, { withFileTypes: true })
  .filter((e) => e.isFile() && e.name.endsWith(".js"))
  .map((e) => {
    const abs = path.join(CHUNKS_DIR, e.name);
    return { name: e.name, bytes: fs.statSync(abs).size };
  })
  .sort((a, b) => b.bytes - a.bytes);

const totalBytes = chunks.reduce((sum, c) => sum + c.bytes, 0);
const pad = (s, n) => String(s).padEnd(n);
const kb = (b) => `${(b / 1024).toFixed(1)} KB`;
const mb = (b) => `${(b / 1024 / 1024).toFixed(2)} MB`;

console.log("\nBundle size report (Turbopack .next/static/chunks):\n");
console.log(
  `Total chunks : ${chunks.length}`,
);
console.log(
  `Total size   : ${mb(totalBytes)}  (budget ${mb(LIMITS.totalBytes)})`,
);

console.log("\nTop 10 largest chunks:");
console.log(pad("Chunk", 40) + pad("Size", 12) + "Status");
console.log("-".repeat(68));
let over = 0;
let warn = 0;
for (const c of chunks.slice(0, 10)) {
  let status = "✓";
  if (c.bytes > LIMITS.singleChunkBytes) {
    status = `✗ over ${kb(LIMITS.singleChunkBytes)} limit`;
    over++;
  } else if (c.bytes > LIMITS.singleChunkWarnBytes) {
    status = `⚠ over ${kb(LIMITS.singleChunkWarnBytes)} warn`;
    warn++;
  }
  console.log(pad(c.name, 40) + pad(kb(c.bytes), 12) + status);
}

// Count every chunk, not just the top 10, for the hard failure.
const allOver = chunks.filter((c) => c.bytes > LIMITS.singleChunkBytes);
const allWarn = chunks.filter(
  (c) =>
    c.bytes > LIMITS.singleChunkWarnBytes &&
    c.bytes <= LIMITS.singleChunkBytes,
);

console.log();
if (totalBytes > LIMITS.totalBytes) {
  console.error(
    `✗ Total chunks (${mb(totalBytes)}) exceed budget (${mb(LIMITS.totalBytes)}).`,
  );
  process.exit(1);
}
if (allOver.length > 0) {
  console.error(
    `✗ ${allOver.length} chunk(s) exceed the ${kb(
      LIMITS.singleChunkBytes,
    )} per-chunk limit:`,
  );
  for (const c of allOver) console.error(`    ${c.name} — ${kb(c.bytes)}`);
  process.exit(1);
}
if (allWarn.length > 0) {
  console.warn(
    `⚠ ${allWarn.length} chunk(s) over the ${kb(
      LIMITS.singleChunkWarnBytes,
    )} warn threshold (not blocking).`,
  );
}
console.log(
  `✅ Bundle within budget: ${mb(totalBytes)} / ${mb(LIMITS.totalBytes)}, ` +
    `biggest chunk ${kb(chunks[0]?.bytes ?? 0)}.\n`,
);
