/**
 * Optimización de imágenes locales del sitio (defaults de las secciones).
 * Genera WebP de alta calidad + variantes responsive para el hero (LCP) y
 * una og-image.jpg para previsualización en redes.
 *
 * Uso: node scripts/optimize-images.mjs
 * Requiere `sharp` (disponible como dependencia transitiva).
 */
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const imgDir = join(root, "public", "images");
const pubDir = join(root, "public");

const fmt = (n) => (n / 1024).toFixed(0) + " KB";
const { statSync } = await import("node:fs");
const size = (p) => {
  try {
    return statSync(p).size;
  } catch {
    return 0;
  }
};

async function toWebp(srcName, outName, { width, quality = 78 } = {}) {
  const src = join(imgDir, srcName);
  const out = join(imgDir, outName);
  let pipe = sharp(src);
  if (width) pipe = pipe.resize({ width, withoutEnlargement: true });
  await pipe.webp({ quality, effort: 6 }).toFile(out);
  console.log(`  ${srcName} (${fmt(size(src))}) → ${outName} (${fmt(size(out))})`);
}

console.log("WebP del hero (consultorio) — full + responsive:");
await toWebp("consultorio.jpg", "consultorio.webp", { quality: 80 });
await toWebp("consultorio.jpg", "consultorio-960.webp", { width: 960, quality: 78 });
await toWebp("consultorio.jpg", "consultorio-640.webp", { width: 640, quality: 76 });

console.log("WebP del resto:");
await toWebp("laboratorio.jpg", "laboratorio.webp", { width: 1600, quality: 72 });
await toWebp("sala-biobal.png", "sala-biobal.webp", { quality: 80 });

console.log("og-image.jpg (1200×630) para redes:");
const ogOut = join(pubDir, "og-image.jpg");
await sharp(join(imgDir, "consultorio.jpg"))
  .resize({ width: 1200, height: 630, fit: "cover", position: "centre" })
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(ogOut);
console.log(`  → og-image.jpg (${fmt(size(ogOut))})`);

console.log("\n✅ Listo.");
