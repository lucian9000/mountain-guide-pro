// Generate the favicon set from the SummitFit logo.
//
// Google's favicon guidelines: the icon must be a square whose size is a
// multiple of 48px, and /favicon.ico should be reachable. We emit a multi-size
// .ico (16/32/48 — the 48 layer is the one Google uses) plus a high-res PNG and
// an Apple touch icon. Re-runnable; overwrites the public/ assets.
//
// Run: node scripts/generate-favicons.mjs

import sharp from "sharp";
import pngToIco from "png-to-ico";
import { writeFile } from "node:fs/promises";

const SRC = "public/favicon.png"; // the 512x512 square SummitFit logo badge
const OUT_ICO = "public/favicon.ico";
const OUT_APPLE = "public/apple-touch-icon.png";
const OUT_PNG = "public/favicon.png"; // re-encoded clean 512x512

// Multi-size .ico — MUST include a 48x48 layer for Google.
const ICO_SIZES = [16, 32, 48];

const square = (size) =>
  sharp(SRC).resize(size, size, { fit: "cover" }).png().toBuffer();

const buffers = await Promise.all(ICO_SIZES.map(square));
await writeFile(OUT_ICO, await pngToIco(buffers));

// Apple touch icon (iOS home-screen), 180x180 per Apple's spec.
await sharp(SRC).resize(180, 180, { fit: "cover" }).png().toFile(OUT_APPLE);

console.log(
  `favicon.ico (${ICO_SIZES.join("/")}) + apple-touch-icon.png (180) generated from ${SRC}`
);
