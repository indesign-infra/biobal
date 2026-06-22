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
    // `ssg: null` desactiva la generación estática (y con ella el sitemap.xml
    // vacío que el adapter creaba por defecto en modo "auto"). El sitio es 100%
    // SSR y el sitemap lo sirve la ruta dinámica /sitemap.xml.
    plugins: [vercelEdgeAdapter({ ssg: null })],
  };
});
