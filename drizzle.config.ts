import { defineConfig } from "drizzle-kit";

// drizzle-kit (CLI) no carga .env.local por sí solo. Lo hacemos con la API
// nativa de Node (process.loadEnvFile), sin dependencias extra. .env.local
// se carga al final para que tenga prioridad.
const loadEnvFile = (
  process as unknown as { loadEnvFile?: (path?: string) => void }
).loadEnvFile;
for (const file of [".env", ".env.local"]) {
  try {
    loadEnvFile?.(file);
  } catch {
    /* el archivo puede no existir: seguimos */
  }
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: {
    url: process.env.PRIVATE_TURSO_DATABASE_URL!,
    authToken: process.env.PRIVATE_TURSO_AUTH_TOKEN,
  },
});
