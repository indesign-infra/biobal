import { component$ } from "@builder.io/qwik";
import {
  routeLoader$,
  routeAction$,
  zod$,
  z,
  Form,
  type DocumentHead,
} from "@builder.io/qwik-city";
import { getDb, schema } from "~/db";
import { asc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { LuTrash2, LuPlus } from "@qwikest/icons/lucide";

export const useVideos = routeLoader$(async ({ env }) => {
  try {
    const db = getDb(env);
    return await db
      .select()
      .from(schema.verticalVideos)
      .orderBy(asc(schema.verticalVideos.displayOrder));
  } catch (error) {
    console.error("videos loader error:", error);
    return [];
  }
});

export const useAddVideo = routeAction$(
  async (data, { env }) => {
    try {
      const db = getDb(env);
      const [last] = await db
        .select({ o: schema.verticalVideos.displayOrder })
        .from(schema.verticalVideos)
        .orderBy(asc(schema.verticalVideos.displayOrder));
      await db.insert(schema.verticalVideos).values({
        id: "reel-" + nanoid(8),
        title: data.title.trim(),
        videoUrl: data.videoUrl.trim(),
        thumbnailUrl: data.thumbnailUrl?.trim() || null,
        isActive: 1,
        displayOrder: (last?.o ?? -1) + 1,
      });
      return { success: true };
    } catch (e) {
      console.error("add video error:", e);
      return { success: false, error: "No se pudo agregar el video." };
    }
  },
  zod$({
    title: z.string().min(1, "Poné un título"),
    videoUrl: z.string().min(1, "Poné la URL del video (.mp4)"),
    thumbnailUrl: z.string().optional(),
  }),
);

export const useToggleVideo = routeAction$(
  async ({ id, isActive }, { env }) => {
    const db = getDb(env);
    await db
      .update(schema.verticalVideos)
      .set({ isActive: isActive === "1" ? 0 : 1 })
      .where(eq(schema.verticalVideos.id, id));
    return { success: true };
  },
  zod$({ id: z.string(), isActive: z.string() }),
);

export const useDeleteVideo = routeAction$(
  async ({ id }, { env }) => {
    const db = getDb(env);
    await db
      .delete(schema.verticalVideos)
      .where(eq(schema.verticalVideos.id, id));
    return { success: true };
  },
  zod$({ id: z.string() }),
);

const input =
  "w-full bg-slate-50 border border-slate-200 focus:border-accent-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors";

export default component$(() => {
  const videos = useVideos();
  const add = useAddVideo();
  const toggle = useToggleVideo();
  const del = useDeleteVideo();

  return (
    <div class="mx-auto max-w-5xl">
      <h1 class="font-display text-primary-900 text-2xl font-bold">
        Reels / videos verticales
      </h1>
      <p class="mt-1 text-sm text-slate-500">
        Los videos activos se muestran en la home. Subí el .mp4 a{" "}
        <code class="rounded bg-slate-100 px-1">public/videos/</code> y pegá la
        ruta, o usá una URL externa.
      </p>

      {/* Alta */}
      <Form
        action={add}
        class="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <p class="text-primary-900 mb-4 text-sm font-bold">Agregar video</p>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <label class="mb-1 block text-xs font-semibold text-slate-500">
              Título
            </label>
            <input
              name="title"
              class={input}
              placeholder="Ej. Recorrido por el consultorio 202"
            />
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-500">
              URL del video (.mp4)
            </label>
            <input
              name="videoUrl"
              class={input}
              placeholder="/videos/reel-1.mp4"
            />
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-500">
              Miniatura (opcional)
            </label>
            <input
              name="thumbnailUrl"
              class={input}
              placeholder="/videos/reel-1.jpg"
            />
          </div>
        </div>
        {add.value?.failed && (
          <p class="mt-3 text-xs text-red-500">
            {add.value.fieldErrors?.title || add.value.fieldErrors?.videoUrl}
          </p>
        )}
        <div class="mt-4 flex justify-end">
          <button
            type="submit"
            disabled={add.isRunning}
            class="bg-primary-900 hover:bg-primary-950 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-50"
          >
            <LuPlus class="h-4 w-4" />
            {add.isRunning ? "Agregando..." : "Agregar"}
          </button>
        </div>
      </Form>

      {/* Listado */}
      <div class="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {videos.value.length === 0 ? (
          <p class="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-400">
            Todavía no hay videos.
          </p>
        ) : (
          videos.value.map((v) => (
            <div
              key={v.id}
              class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div class="relative bg-black" style={{ aspectRatio: "9/16" }}>
                <video
                  src={v.videoUrl}
                  poster={v.thumbnailUrl || undefined}
                  preload="metadata"
                  muted
                  class="h-full w-full object-cover"
                />
                {!v.isActive && (
                  <span class="absolute top-2 left-2 rounded-full bg-slate-900/80 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                    Oculto
                  </span>
                )}
              </div>
              <div class="p-3">
                <p class="text-primary-900 line-clamp-2 text-xs font-semibold">
                  {v.title}
                </p>
                <div class="mt-2 flex items-center justify-between">
                  <Form action={toggle}>
                    <input type="hidden" name="id" value={v.id} />
                    <input
                      type="hidden"
                      name="isActive"
                      value={String(v.isActive)}
                    />
                    <button
                      type="submit"
                      class={[
                        "rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors",
                        v.isActive
                          ? "bg-accent-50 text-accent-700 hover:bg-accent-100"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200",
                      ]}
                    >
                      {v.isActive ? "Activo" : "Inactivo"}
                    </button>
                  </Form>
                  <Form action={del}>
                    <input type="hidden" name="id" value={v.id} />
                    <button
                      type="submit"
                      class="text-slate-400 transition-colors hover:text-red-500"
                      title="Eliminar"
                    >
                      <LuTrash2 class="h-4 w-4" />
                    </button>
                  </Form>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Reels — BioBal Admin",
  meta: [{ name: "robots", content: "noindex, nofollow" }],
};
