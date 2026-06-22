/**
 * Generador de la estructura del sitemap XML (protocolo sitemaps.org 0.9).
 *
 * `baseUrl` se toma de `site.url` (única fuente de verdad del dominio canónico)
 * para que las URLs del sitemap SIEMPRE coincidan con el `<link rel="canonical">`
 * y el `og:url` del sitio. Hoy resuelve a "https://biobal.com.ar".
 */
import { site } from "~/lib/site";

const baseUrl = site.url;

export type ChangeFreq =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

export interface SitemapEntry {
  /** Ruta relativa (ej. "/" o "/servicios/"); se le antepone `baseUrl`. */
  loc: string;
  /** Fecha ISO de última modificación (ej. "2026-06-22"). Opcional. */
  lastmod?: string;
  changefreq?: ChangeFreq;
  /** Prioridad relativa 0.0–1.0. */
  priority?: number;
}

/** Escapa los caracteres reservados de XML para construir URLs válidas. */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Construye el documento XML completo a partir de las entradas. */
export function createSitemap(entries: SitemapEntry[]): string {
  const urls = entries
    .map(({ loc, lastmod, changefreq, priority }) => {
      const tags = [`    <loc>${escapeXml(`${baseUrl}${loc}`)}</loc>`];
      if (lastmod) tags.push(`    <lastmod>${lastmod}</lastmod>`);
      if (changefreq) tags.push(`    <changefreq>${changefreq}</changefreq>`);
      if (priority !== undefined) {
        tags.push(`    <priority>${priority.toFixed(1)}</priority>`);
      }
      return `  <url>\n${tags.join("\n")}\n  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}
