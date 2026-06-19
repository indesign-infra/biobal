import type { RequestHandler } from "@builder.io/qwik-city";
import { getDb, schema } from "~/db";

/**
 * Trae el feed de Instagram desde Behold.so y lo cachea en la base.
 * Pensado para ejecutarse por Vercel Cron (ver vercel.json) o manualmente
 * desde el admin. Protegido opcionalmente con CRON_SECRET.
 */
export const onGet: RequestHandler = async ({ env, request, json }) => {
  const cronSecret = env.get("CRON_SECRET");
  const authHeader = request.headers.get("authorization");
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    json(401, { error: "Unauthorized" });
    return;
  }

  const feedUrl = env.get("BEHOLD_FEED_URL");
  if (!feedUrl) {
    json(400, {
      error: "BEHOLD_FEED_URL no está configurada en las variables de entorno.",
    });
    return;
  }

  try {
    const res = await fetch(feedUrl, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      json(res.status, { error: "No se pudo traer el feed de Instagram" });
      return;
    }

    const data = (await res.json()) as {
      posts?: Array<{
        id: string;
        mediaUrl?: string;
        permalink?: string;
        caption?: string;
        mediaType?: string;
        thumbnailUrl?: string;
        timestamp?: string;
      }>;
    };

    const posts = data.posts ?? [];
    const toInsert = posts
      .slice(0, 12)
      .map((p) => ({
        id: p.id,
        permalink: p.permalink || "",
        mediaUrl:
          p.mediaType === "VIDEO" && p.thumbnailUrl
            ? p.thumbnailUrl
            : p.mediaUrl || "",
        mediaType: p.mediaType || "IMAGE",
        caption: p.caption || "",
        timestamp: p.timestamp || new Date().toISOString(),
      }))
      .filter((p) => p.id && p.mediaUrl && p.permalink);

    const db = getDb(env);
    await db.delete(schema.instagramPosts);
    if (toInsert.length > 0) {
      await db.insert(schema.instagramPosts).values(toInsert);
    }

    json(200, { success: true, count: toInsert.length });
  } catch (err) {
    console.error("instagram cron error:", err);
    json(500, { error: "Error interno al sincronizar Instagram" });
  }
};
