/**
 * Migración puntual: optimiza las imágenes ya subidas a Vercel Blob.
 *
 * Recorre las tablas con imágenes (sections, galeria, vertical_videos),
 * baja cada imagen del Blob, la convierte a WebP (redimensionada a un máximo
 * razonable), la vuelve a subir y actualiza la URL en la base.
 *
 * Uso (Node ≥ 20.6, carga .env.local con --env-file):
 *   node --env-file=.env.local scripts/optimize-blob-images.mjs          (dry-run)
 *   node --env-file=.env.local scripts/optimize-blob-images.mjs --apply  (aplica)
 *
 * Las imágenes originales NO se borran (quedan como respaldo). Si querés
 * limpiarlas después, se puede agregar un paso de `del()`.
 */
import sharp from "sharp";
import { put } from "@vercel/blob";
import { createClient } from "@libsql/client";

const APPLY = process.argv.includes("--apply");
const MAX_WIDTH = 1600; // ancho máximo: suficiente para cualquier sección/galería
const QUALITY = 80;

const dbUrl = process.env.PRIVATE_TURSO_DATABASE_URL;
const dbToken = process.env.PRIVATE_TURSO_AUTH_TOKEN;
const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

if (!dbUrl || !blobToken) {
  console.error(
    "Faltan credenciales. Corré con: node --env-file=.env.local scripts/optimize-blob-images.mjs",
  );
  process.exit(1);
}

const db = createClient({ url: dbUrl, authToken: dbToken });

const fmt = (n) => (n / 1024).toFixed(0) + " KB";

// Tablas/campos con URLs de imágenes a optimizar.
const targets = [
  { table: "sections", idCol: "id", urlCol: "image_url" },
  { table: "galeria", idCol: "id", urlCol: "image_url" },
  { table: "vertical_videos", idCol: "id", urlCol: "thumbnail_url" },
];

let totalBefore = 0;
let totalAfter = 0;
let optimized = 0;
let skipped = 0;

for (const { table, idCol, urlCol } of targets) {
  const { rows } = await db.execute(
    `SELECT ${idCol} as id, ${urlCol} as url FROM ${table} WHERE ${urlCol} IS NOT NULL AND ${urlCol} != ''`,
  );

  for (const row of rows) {
    const url = String(row.url);
    // Solo imágenes del Blob que no sean ya WebP.
    if (!/^https?:\/\//.test(url) || /\.webp(\?|$)/i.test(url)) {
      continue;
    }

    let inBuf;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      inBuf = Buffer.from(await res.arrayBuffer());
    } catch (e) {
      console.warn(`  ⚠️  ${table}#${row.id}: no se pudo bajar (${e.message})`);
      continue;
    }

    let meta;
    try {
      meta = await sharp(inBuf).metadata();
    } catch {
      console.warn(`  ⚠️  ${table}#${row.id}: no es una imagen procesable, salto.`);
      continue;
    }
    // Si no es un formato raster soportado (ej. SVG), lo dejamos.
    if (!["jpeg", "jpg", "png", "webp", "tiff", "gif", "avif"].includes(meta.format)) {
      continue;
    }

    const outBuf = await sharp(inBuf)
      .rotate() // respeta orientación EXIF
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: QUALITY, effort: 6 })
      .toBuffer();

    // Si no mejora, no tiene sentido reemplazar.
    if (outBuf.length >= inBuf.length) {
      console.log(
        `  =  ${table}#${row.id}: ya está optimizada (${fmt(inBuf.length)}), salto.`,
      );
      skipped++;
      continue;
    }

    totalBefore += inBuf.length;
    totalAfter += outBuf.length;
    optimized++;

    // Nuevo nombre: misma ruta, extensión .webp.
    const path = new URL(url).pathname.replace(/^\/+/, "");
    const newKey = path.replace(/\.[^./]+$/, "") + ".webp";

    console.log(
      `  ✓ ${table}#${row.id}: ${fmt(inBuf.length)} → ${fmt(outBuf.length)}  (${newKey})`,
    );

    if (APPLY) {
      const blob = await put(newKey, outBuf, {
        access: "public",
        token: blobToken,
        contentType: "image/webp",
        addRandomSuffix: true,
        cacheControlMaxAge: 31536000,
      });
      await db.execute({
        sql: `UPDATE ${table} SET ${urlCol} = ? WHERE ${idCol} = ?`,
        args: [blob.url, row.id],
      });
    }
  }
}

console.log("\n──────────────────────────────────────");
console.log(`Imágenes a optimizar: ${optimized} · sin cambios: ${skipped}`);
if (optimized > 0) {
  const pct = (((totalBefore - totalAfter) / totalBefore) * 100).toFixed(0);
  console.log(
    `Peso total: ${fmt(totalBefore)} → ${fmt(totalAfter)}  (−${pct}%)`,
  );
}
console.log(
  APPLY
    ? "✅ Cambios APLICADOS (Blob + base actualizados)."
    : "ℹ️  DRY-RUN. Volvé a correr con --apply para aplicar.",
);
process.exit(0);
