/**
 * Static image diet (v4 Phase 2, Task 3).
 *
 * Resizes + re-encodes the oversized bundled WebP assets to their real display
 * size. Idempotent and safe to re-run: files already at/below the target width
 * are skipped, and a file is only overwritten when the re-encoded result is
 * actually smaller.
 *
 * Targets (see docs/superpowers/plans/2026-07-07-v4-phase2-performance.md):
 *  - expedition-1/2/3.webp + helderberg-dome.webp → max 1280px wide, q75.
 *    These double as RouteDetail hero fallbacks (routeImageFallbacks.ts) which
 *    render full-width at h-[40vh]/[52vh], so 800px would be too small on
 *    desktop — 1280px covers the common desktop width (and ~2× DPR of the
 *    ~430px homepage cards). The expedition files are 900px-wide portraits
 *    (already ≤ 1280), so they only get the q75 re-encode, not a resize —
 *    narrowing them would soften the already-upscaled route-detail hero.
 *  - meet-ernest.webp → no resize, re-encode q75 only if it saves >20%.
 *  - logo.webp → NEW derivative logo-small.webp at 96px wide (navbar & co.
 *    render it at 36–48px, so 96px covers 2× DPR). Original kept untouched.
 *
 * Usage: node scripts/optimize-images.mjs
 */
import sharp from "sharp";
import { readFile, writeFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ASSETS = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "assets");
const QUALITY = 75;
// Re-encoding an already-q75 file yields ~0–2% "savings" per run; requiring a
// real win keeps the script idempotent (no generational quality erosion).
const DEFAULT_MIN_SAVINGS = 0.05;

/** @type {Array<{file: string, width?: number, minSavings?: number, derive?: {file: string, width: number}}>} */
const TASKS = [
  { file: "expedition-1.webp", width: 1280 },
  { file: "expedition-2.webp", width: 1280 },
  { file: "expedition-3.webp", width: 1280 },
  { file: "helderberg-dome.webp", width: 1280 },
  // Re-encode only; keep result only if it saves >20%.
  { file: "meet-ernest.webp", minSavings: 0.2 },
  // Derivative: never touches the source file.
  { file: "logo.webp", derive: { file: "logo-small.webp", width: 96 } },
];

const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
const rows = [];

for (const task of TASKS) {
  const srcPath = path.join(ASSETS, task.file);
  const input = await readFile(srcPath);
  const before = input.length;
  const meta = await sharp(input).metadata();

  if (task.derive) {
    const outPath = path.join(ASSETS, task.derive.file);
    const out = await sharp(input)
      .resize({ width: task.derive.width, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toBuffer();
    // Idempotent: skip if an equal-or-smaller derivative already exists.
    if (existsSync(outPath) && (await stat(outPath)).size <= out.length) {
      rows.push({ file: task.derive.file, before: (await stat(outPath)).size, after: (await stat(outPath)).size, action: "kept (already optimized)" });
    } else {
      await writeFile(outPath, out);
      rows.push({ file: task.derive.file, before, after: out.length, action: `derived ${task.derive.width}px from ${task.file}` });
    }
    continue;
  }

  const needsResize = task.width != null && meta.width > task.width;
  let pipeline = sharp(input);
  if (needsResize) pipeline = pipeline.resize({ width: task.width, withoutEnlargement: true });
  const out = await pipeline.webp({ quality: QUALITY }).toBuffer();

  const minSavings = task.minSavings ?? DEFAULT_MIN_SAVINGS;
  const savings = (before - out.length) / before;
  if (savings < minSavings) {
    rows.push({ file: task.file, before, after: before, action: `kept (savings ${(Math.max(savings, 0) * 100).toFixed(0)}% < ${minSavings * 100}%)` });
  } else {
    await writeFile(srcPath, out);
    const action = needsResize ? `resized ${meta.width}px → ${task.width}px, q${QUALITY}` : `re-encoded q${QUALITY} (width ${meta.width}px ≤ ${task.width ?? "n/a"}px target)`;
    rows.push({ file: task.file, before, after: out.length, action });
  }
}

console.log("\nfile                    before      after       delta   action");
console.log("-".repeat(100));
let tBefore = 0, tAfter = 0;
for (const r of rows) {
  tBefore += r.before;
  tAfter += r.after;
  const delta = r.after - r.before;
  const deltaStr = delta === 0 ? "—" : `${delta > 0 ? "+" : "-"}${kb(Math.abs(delta))}`;
  console.log(`${r.file.padEnd(22)} ${kb(r.before).padStart(10)} ${kb(r.after).padStart(10)} ${deltaStr.padStart(11)}   ${r.action}`);
}
console.log("-".repeat(100));
console.log(`${"TOTAL".padEnd(22)} ${kb(tBefore).padStart(10)} ${kb(tAfter).padStart(10)} ${`-${kb(tBefore - tAfter)}`.padStart(11)}`);
