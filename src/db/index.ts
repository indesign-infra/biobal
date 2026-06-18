import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

type EnvGetter = { get: (key: string) => string | undefined };

// Singleton del cliente de Turso/libSQL.
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

/**
 * Devuelve la instancia de Drizzle. En los handlers de Qwik conviene pasar
 * `requestEvent.env` para resolver las variables en cualquier entorno
 * (dev local, Vercel edge, etc.).
 */
export function getDb(env?: EnvGetter) {
  if (_db) return _db;

  const url =
    env?.get("PRIVATE_TURSO_DATABASE_URL") ||
    import.meta.env.PRIVATE_TURSO_DATABASE_URL ||
    (process as { env?: Record<string, string | undefined> }).env
      ?.PRIVATE_TURSO_DATABASE_URL;

  const authToken =
    env?.get("PRIVATE_TURSO_AUTH_TOKEN") ||
    import.meta.env.PRIVATE_TURSO_AUTH_TOKEN ||
    (process as { env?: Record<string, string | undefined> }).env
      ?.PRIVATE_TURSO_AUTH_TOKEN;

  if (!url) {
    throw new Error(
      "PRIVATE_TURSO_DATABASE_URL no está configurada (revisá .env.local).",
    );
  }

  const client = createClient({ url, authToken });
  _db = drizzle(client, { schema });
  return _db;
}

export { schema };
