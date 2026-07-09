// Generate the favicon set from the SummitFit logo master art.
//
// Google's favicon guidelines: the icon must be a square whose size is a
// multiple of 48px, and /favicon.ico should be reachable. We emit:
//   - favicon.png    192x192 (multiple of 48 — the size Google's crawler wants)
//   - favicon.ico    multi-size 16/32/48 (the 48 layer is what Google reads)
//   - apple-touch-icon.png  180x180 per Apple's spec
// Sourced from the full-res master (not from a previously-shrunk favicon.png)
// so repeat runs never compound lossy resizing. Re-runnable; overwrites the
// public/ assets.
//
// Run: node scripts/generate-favicons.mjs

import sharp from "sharp";
import pngToIco from "png-to-ico";
import { writeFile } from "node:fs/promises";

const SRC = "src/assets/logo.webp"; // full-res (1024x1024) master logo art
const OUT_ICO = "public/favicon.ico";
const OUT_APPLE = "public/apple-touch-icon.png";
const OUT_PNG = "public/favicon.png";

const FAVICON_PNG_SIZE = 192; // multiple of 48
const ICO_SIZES = [16, 32, 48]; // multi-size .ico — MUST include 48x48 for Google
const APPLE_SIZE = 180;

const square = (size) =>
  sharp(SRC).resize(size, size, { fit: "cover" }).png().toBuffer();

await sharp(SRC)
  .resize(FAVICON_PNG_SIZE, FAVICON_PNG_SIZE, { fit: "cover" })
  .png()
  .toFile(OUT_PNG);

const buffers = await Promise.all(ICO_SIZES.map(square));
await writeFile(OUT_ICO, await pngToIco(buffers));

await sharp(SRC).resize(APPLE_SIZE, APPLE_SIZE, { fit: "cover" }).png().toFile(OUT_APPLE);

console.log(
  `favicon.png (${FAVICON_PNG_SIZE}) + favicon.ico (${ICO_SIZES.join("/")}) + apple-touch-icon.png (${APPLE_SIZE}) generated from ${SRC}`
);
