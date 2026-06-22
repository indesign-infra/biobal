import type { RequestHandler, RouteData } from "@builder.io/qwik-city";
import { routes } from "@qwik-city-plan";
import { createSitemap } from "./create-sitemap";

/**
 * Prefijos de rutas privadas que NO deben aparecer en el sitemap ni indexarse
 * (panel de administración y endpoints de API). Configurables.
 */
const EXCLUDED_PREFIXES = ["/admin", "/api"];

/**
 * Sitemap dinámico por SSR: deriva las URLs de `routes` (@qwik-city-plan),
 * excluyendo rutas privadas y dinámicas (con parámetros `[...]`).
 * Disponible en /sitemap.xml.
 */
export const onGet: RequestHandler = (requestEvent) => {
  const publicRoutes = (routes as RouteData[])
    .map(([routeName]) => routeName)
    // Las rutas de @qwik-city-plan vienen sin "/" inicial (ej. "admin/leads/"),
    // salvo la home ("/"). Normalizamos para filtrar y construir URLs bien.
    .map((route) => (route.startsWith("/") ? route : `/${route}`))
    .filter(
      (route) =>
        !route.includes("[") && // rutas dinámicas con parámetros
        !route.includes("sitemap") && // el propio sitemap
        !EXCLUDED_PREFIXES.some((prefix) => route.startsWith(prefix)),
    );

  const sitemap = createSitemap(
    publicRoutes.map((route) => ({
      loc: route,
      changefreq: "weekly",
      priority: route === "/" ? 1 : 0.8,
    })),
  );

  requestEvent.send(
    new Response(sitemap, {
      status: 200,
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        // Cacheado en el CDN: el sitemap cambia poco. Se revalida cada día.
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    }),
  );
};
