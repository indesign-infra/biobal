import { component$ } from "@builder.io/qwik";
import {
  routeLoader$,
  routeAction$,
  Form,
  type DocumentHead,
} from "@builder.io/qwik-city";
import { getDb, schema } from "~/db";
import { desc } from "drizzle-orm";
import {
  LuRefreshCw,
  LuInstagram,
  LuExternalLink,
} from "@qwikest/icons/lucide";

export const useIgPosts = routeLoader$(async ({ env }) => {
  try {
    const db = getDb(env);
    const posts = await db
      .select()
      .from(schema.instagramPosts)
      .orderBy(desc(schema.instagramPosts.timestamp));
    return { posts, hasFeedUrl: !!env.get("BEHOLD_FEED_URL") };
  } catch (error) {
    console.error("ig posts loader error:", error);
    return { posts: [], hasFeedUrl: false };
  }
});

export const useSyncInstagram = routeAction$(async (_data, { env }) => {
  const feedUrl = env.get("BEHOLD_FEED_URL");
  if (!feedUrl) {
    return {
      success: false,
      error: "Falta configurar BEHOLD_FEED_URL en .env.local",
    };
  }
  try {
    const res = await fetch(feedUrl, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok)
      return { success: false, error: "Behold respondió con error." };

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

    const toInsert = (data.posts ?? [])
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
    return { success: true, count: toInsert.length };
  } catch (e) {
    console.error("sync instagram error:", e);
    return { success: false, error: "Error al sincronizar." };
  }
});

export default component$(() => {
  const data = useIgPosts();
  const sync = useSyncInstagram();

  return (
    <div class="mx-auto max-w-5xl">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="font-display text-primary-900 text-2xl font-bold">
            Instagram
          </h1>
          <p class="mt-1 text-sm text-slate-500">
            Posts cacheados desde Behold.so. Se muestran en la home.
          </p>
        </div>
        <Form action={sync}>
          <button
            type="submit"
            disabled={sync.isRunning || !data.value.hasFeedUrl}
            class="bg-primary-900 hover:bg-primary-950 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-50"
          >
            <LuRefreshCw
              class={["h-4 w-4", sync.isRunning && "animate-spin"]}
            />
            {sync.isRunning ? "Sincronizando..." : "Sincronizar ahora"}
          </button>
        </Form>
      </div>

      {!data.value.hasFeedUrl && (
        <div class="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          ⚠️ Falta configurar <code class="font-mono">BEHOLD_FEED_URL</code> en{" "}
          <code class="font-mono">.env.local</code> para poder traer los posts.
        </div>
      )}
      {sync.value?.success && (
        <div class="bg-accent-50 text-accent-700 border-accent-200 mt-5 rounded-xl border px-4 py-3 text-sm font-semibold">
          ✅ Sincronizado: {sync.value.count} posts.
        </div>
      )}
      {sync.value?.success === false && sync.value.error && (
        <div class="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          ⚠️ {sync.value.error}
        </div>
      )}

      {data.value.posts.length === 0 ? (
        <div class="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-400">
          <LuInstagram class="mx-auto mb-3 h-10 w-10 text-slate-300" />
          Sin posts cacheados todavía. Configurá el feed y tocá “Sincronizar”.
        </div>
      ) : (
        <div class="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {data.value.posts.map((p) => (
            <a
              key={p.id}
              href={p.permalink}
              target="_blank"
              rel="noopener noreferrer"
              class="group relative block aspect-square overflow-hidden rounded-xl bg-slate-200"
              title={p.caption || ""}
            >
              <img
                src={p.mediaUrl}
                alt={p.caption || "Post"}
                loading="lazy"
                class="h-full w-full object-cover"
              />
              <div class="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <LuExternalLink class="h-6 w-6 text-white" />
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
});

export const head: DocumentHead = {
  title: "Instagram — BioBal Admin",
  meta: [{ name: "robots", content: "noindex, nofollow" }],
};
