import { component$ } from "@builder.io/qwik";
import {
  routeLoader$,
  routeAction$,
  zod$,
  z,
  Form,
  Link,
  type DocumentHead,
} from "@builder.io/qwik-city";
import { getDb, schema } from "~/db";
import { asc, eq } from "drizzle-orm";
import { LuTrash2, LuPlus, LuPencil } from "@qwikest/icons/lucide";

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

export default component$(() => {
  const videos = useVideos();
  const toggle = useToggleVideo();
  const del = useDeleteVideo();

  return (
    <div class="mx-auto max-w-5xl">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="font-display text-primary-900 text-2xl font-bold">
            Reels / videos verticales
          </h1>
          <p class="mt-1 text-sm text-slate-500">
            Los videos activos se muestran en la home.
          </p>
        </div>
        <Link
          href="/admin/videos-verticales/new"
          class="bg-primary-900 hover:bg-primary-950 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-colors"
        >
          <LuPlus class="h-4 w-4" />
          Nuevo video
        </Link>
      </div>

      <div class="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {videos.value.length === 0 ? (
          <p class="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-400">
            Todavía no hay videos. Tocá “Nuevo video” para subir el primero.
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
                  <div class="flex items-center gap-1">
                    <Link
                      href={`/admin/videos-verticales/${v.id}`}
                      class="hover:text-primary-700 p-1 text-slate-400 transition-colors"
                      title="Editar"
                    >
                      <LuPencil class="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      onClick$={async () => {
                        if (
                          window.confirm(
                            "¿Estás seguro de que querés eliminar este video?",
                          )
                        ) {
                          await del.submit({ id: v.id });
                        }
                      }}
                      class="p-1 text-slate-400 transition-colors hover:text-red-500"
                      title="Eliminar"
                    >
                      <LuTrash2 class="h-4 w-4" />
                    </button>
                  </div>
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
