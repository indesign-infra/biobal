import { vercelEdgeAdapter } from "@builder.io/qwik-city/adapters/vercel-edge/vite";
import { extendConfig } from "@builder.io/qwik-city/vite";
import baseConfig from "../../vite.config";

export default extendConfig(baseConfig, () => {
  return {
    build: {
      ssr: true,
      rollupOptions: {
        input: ["src/entry.vercel-edge.tsx", "@qwik-city-plan"],
      },
      outDir: ".vercel/output/functions/_qwik-city.func",
    },
    // SSG con `include: []` no genera ninguna página estática (el sitio es 100%
    // SSR) y `sitemapOutFile: null` desactiva el sitemap.xml vacío que el adapter
    // creaba por defecto. Importante: usamos un OBJETO (no `null`) para que la
    // fase de generate del adapter siga corriendo y escriba el `.vc-config.json`
    // de la edge function (con `null` quedaba vacío y 404eaba todo el sitio).
    // El sitemap lo sirve la ruta dinámica /sitemap.xml.
    plugins: [vercelEdgeAdapter({ ssg: { include: [], sitemapOutFile: null } })],
  };
});
