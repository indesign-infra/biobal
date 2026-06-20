import { component$, useSignal, $, useComputed$ } from "@builder.io/qwik";
import {
  routeLoader$,
  routeAction$,
  zod$,
  z,
  Link,
  type DocumentHead,
} from "@builder.io/qwik-city";
import { getDb, schema } from "~/db";
import { eq } from "drizzle-orm";
import { LuArrowLeft, LuSave } from "@qwikest/icons/lucide";
import { uploadToBlob } from "~/lib/upload";
import { VideoTip } from "~/components/admin/video-tip";

export const useVideoDetail = routeLoader$(async ({ env, params }) => {
  try {
    const db = getDb(env);
    const [v] = await db
      .select()
      .from(schema.verticalVideos)
      .where(eq(schema.verticalVideos.id, params.id))
      .limit(1);
    return v ?? null;
  } catch (error) {
    console.error("video detail loader error:", error);
    return null;
  }
});

export const useUpdateVideo = routeAction$(
  async (data, { env, fail, redirect }) => {
    if (!data.videoUrl) {
      return fail(400, {
        error: "Falta el video (subí un archivo o pegá una URL).",
      });
    }
    try {
      const db = getDb(env);
      await db
        .update(schema.verticalVideos)
        .set({
          title: data.title.trim(),
          videoUrl: data.videoUrl.trim(),
          thumbnailUrl: data.thumbnailUrl?.trim() || null,
          isActive: data.isActive === "true" ? 1 : 0,
          displayOrder:
            data.displayOrder != null && data.displayOrder !== ""
              ? Number(data.displayOrder)
              : 0,
        })
        .where(eq(schema.verticalVideos.id, data.id));
    } catch (e) {
      console.error("update video error:", e);
      return fail(500, { error: "Error al guardar los cambios." });
    }
    throw redirect(302, "/admin/videos-verticales");
  },
  zod$({
    id: z.string().min(1),
    title: z.string().min(1, "Poné un título"),
    videoUrl: z.string().optional(),
    thumbnailUrl: z.string().optional(),
    displayOrder: z.string().optional(),
    isActive: z.string().optional(),
  }),
);

const fileInput =
  "w-full border border-slate-200 bg-white rounded-xl px-4 py-2.5 text-sm outline-none file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-900 file:text-white file:cursor-pointer hover:file:bg-primary-950";
const textInput =
  "w-full bg-white border border-slate-200 focus:border-accent-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors";

export default component$(() => {
  const detail = useVideoDetail();
  const update = useUpdateVideo();

  const v = detail.value;

  // Estado prefilled con los valores actuales.
  const videoUrl = useSignal(v?.videoUrl ?? "");
  const thumbnailUrl = useSignal(v?.thumbnailUrl ?? "");
  const videoPreview = useSignal(v?.videoUrl ?? "");
  const thumbPreview = useSignal(v?.thumbnailUrl ?? "");
  const isActive = useSignal(v ? v.isActive === 1 : true);

  const isWorking = useSignal(false);
  const progress = useSignal("");
  const errorMsg = useSignal<string | null>(null);

  const progressPct = useComputed$(() => {
    const m = progress.value.match(/(\d+)%/);
    return m ? Number(m[1]) : null;
  });

  const onVideoFile = $((e: Event) => {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (f) videoPreview.value = URL.createObjectURL(f);
  });
  const onThumbFile = $((e: Event) => {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (f) thumbPreview.value = URL.createObjectURL(f);
  });

  const handleSubmit = $(async (_ev: Event, form: HTMLFormElement) => {
    errorMsg.value = null;
    isWorking.value = true;
    try {
      const fd = new FormData(form);
      const title = (fd.get("title") as string)?.trim();
      if (!title) throw new Error("Poné un título.");

      // Por defecto mantenemos lo actual; sólo reemplazamos si hay archivo o URL nueva.
      let nextVideoUrl =
        (fd.get("videoUrl") as string)?.trim() || videoUrl.value;
      let nextThumbUrl =
        (fd.get("thumbnailUrl") as string)?.trim() || thumbnailUrl.value;

      const videoFile = (form.querySelector("#videoFile") as HTMLInputElement)
        ?.files?.[0];
      const thumbFile = (form.querySelector("#thumbFile") as HTMLInputElement)
        ?.files?.[0];

      if (videoFile) {
        if (videoFile.size > 80 * 1024 * 1024) {
          throw new Error(
            "El video supera el límite de 80MB. Para archivos más grandes, pegá una URL externa.",
          );
        }
        progress.value = "Subiendo video (0%)...";
        nextVideoUrl = await uploadToBlob(videoFile, "reels", (pct) => {
          progress.value = `Subiendo video (${pct}%)...`;
        });
      }
      if (thumbFile) {
        if (thumbFile.size > 25 * 1024 * 1024) {
          throw new Error("La miniatura supera el límite de 25MB.");
        }
        progress.value = "Subiendo miniatura (0%)...";
        nextThumbUrl = await uploadToBlob(thumbFile, "reels", (pct) => {
          progress.value = `Subiendo miniatura (${pct}%)...`;
        });
      }

      if (!nextVideoUrl) throw new Error("Subí un video o pegá una URL.");

      progress.value = "Guardando...";
      await update.submit({
        id: v!.id,
        title,
        videoUrl: nextVideoUrl,
        thumbnailUrl: nextThumbUrl,
        displayOrder: (fd.get("displayOrder") as string) || "0",
        isActive: isActive.value ? "true" : "false",
      });
    } catch (e) {
      console.error("update error:", e);
      errorMsg.value = (e as Error).message || "Hubo un error al guardar.";
    } finally {
      isWorking.value = false;
      progress.value = "";
    }
  });

  if (!v) {
    return (
      <div class="mx-auto max-w-2xl">
        <Link
          href="/admin/videos-verticales"
          class="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          <LuArrowLeft class="h-4 w-4" /> Volver a reels
        </Link>
        <p class="mt-6 rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          No se encontró este video. Puede que haya sido eliminado.
        </p>
      </div>
    );
  }

  return (
    <div class="mx-auto max-w-2xl">
      <Link
        href="/admin/videos-verticales"
        class="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <LuArrowLeft class="h-4 w-4" /> Volver a reels
      </Link>
      <h1 class="font-display text-primary-900 mt-3 text-2xl font-bold">
        Editar video
      </h1>
      <p class="mt-1 text-sm text-slate-500">
        Cambiá el título, la portada, el orden o reemplazá el video.
      </p>

      <div class="mt-5">
        <VideoTip />
      </div>

      {(errorMsg.value || update.value?.failed) && (
        <div class="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          ⚠️ {errorMsg.value || (update.value as { error?: string })?.error}
        </div>
      )}

      <form
        preventdefault:submit
        onSubmit$={handleSubmit}
        class="mt-6 space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label class="mb-1.5 block text-xs font-bold text-slate-500 uppercase">
            Título
          </label>
          <input name="title" required class={textInput} value={v.title} />
        </div>

        {/* Video */}
        <div class="border-slate-150 space-y-3 rounded-2xl border bg-slate-50/60 p-5">
          <p class="text-primary-900 border-b border-slate-200 pb-2 text-sm font-bold">
            Video
          </p>
          <div>
            <label class="mb-1.5 block text-xs font-semibold text-slate-600">
              Reemplazar archivo (opcional)
            </label>
            <input
              type="file"
              id="videoFile"
              accept="video/mp4,video/webm,video/quicktime"
              onChange$={onVideoFile}
              class={fileInput}
            />
          </div>
          <div class="flex items-center gap-3 text-xs font-bold tracking-wider text-slate-400 uppercase">
            <span class="h-px flex-grow bg-slate-200" /> o URL{" "}
            <span class="h-px flex-grow bg-slate-200" />
          </div>
          <input
            name="videoUrl"
            value={v.videoUrl}
            onInput$={(e) =>
              (videoPreview.value = (e.target as HTMLInputElement).value)
            }
            class={textInput}
            placeholder="https://...mp4"
          />
          {videoPreview.value && (
            <div class="flex justify-center pt-2">
              <div
                class="relative max-w-[160px] overflow-hidden rounded-2xl border border-slate-200 bg-black"
                style={{ aspectRatio: "9/16" }}
              >
                <video
                  src={videoPreview.value}
                  controls
                  preload="metadata"
                  class="h-full w-full object-cover"
                />
              </div>
            </div>
          )}
        </div>

        {/* Miniatura */}
        <div class="border-slate-150 space-y-3 rounded-2xl border bg-slate-50/60 p-5">
          <p class="text-primary-900 border-b border-slate-200 pb-2 text-sm font-bold">
            Miniatura / portada
          </p>
          <div>
            <label class="mb-1.5 block text-xs font-semibold text-slate-600">
              Reemplazar imagen (opcional)
            </label>
            <input
              type="file"
              id="thumbFile"
              accept="image/jpeg,image/png,image/webp"
              onChange$={onThumbFile}
              class={fileInput}
            />
          </div>
          <div class="flex items-center gap-3 text-xs font-bold tracking-wider text-slate-400 uppercase">
            <span class="h-px flex-grow bg-slate-200" /> o URL{" "}
            <span class="h-px flex-grow bg-slate-200" />
          </div>
          <input
            name="thumbnailUrl"
            value={v.thumbnailUrl || ""}
            onInput$={(e) =>
              (thumbPreview.value = (e.target as HTMLInputElement).value)
            }
            class={textInput}
            placeholder="https://...jpg"
          />
          {thumbPreview.value && (
            <div class="flex justify-center pt-2">
              <div
                class="relative max-w-[160px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"
                style={{ aspectRatio: "9/16" }}
              >
                <img
                  src={thumbPreview.value}
                  alt="Vista previa"
                  class="h-full w-full object-cover"
                />
              </div>
            </div>
          )}
        </div>

        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label class="mb-1.5 block text-xs font-bold text-slate-500 uppercase">
              Orden
            </label>
            <input
              type="number"
              name="displayOrder"
              value={v.displayOrder}
              class={textInput}
            />
            <p class="mt-1 text-[10px] text-slate-400">
              Menor número = se muestra primero.
            </p>
          </div>
          <label class="flex cursor-pointer items-center gap-3 self-end pb-2">
            <button
              type="button"
              onClick$={() => (isActive.value = !isActive.value)}
              class={[
                "h-6 w-11 shrink-0 rounded-full p-0.5 transition-colors",
                isActive.value ? "bg-accent-500" : "bg-slate-300",
              ]}
            >
              <div
                class={[
                  "h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200",
                  isActive.value ? "translate-x-5" : "translate-x-0",
                ]}
              />
            </button>
            <span class="text-primary-900 text-sm font-semibold">
              {isActive.value ? "Activo" : "Inactivo"}
            </span>
          </label>
        </div>

        {isWorking.value && progressPct.value !== null && (
          <div class="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              class="bg-accent-500 h-full rounded-full transition-all"
              style={{ width: `${progressPct.value}%` }}
            />
          </div>
        )}

        <div class="flex items-center gap-4 border-t border-slate-100 pt-5">
          <button
            type="submit"
            disabled={isWorking.value || update.isRunning}
            class="bg-accent-500 hover:bg-accent-600 font-display inline-flex min-w-[170px] items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-colors disabled:opacity-50"
          >
            <LuSave class="h-4 w-4" />
            {isWorking.value || update.isRunning
              ? progress.value || "Guardando..."
              : "Guardar cambios"}
          </button>
          <Link
            href="/admin/videos-verticales"
            class="text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Editar reel — BioBal Admin",
  meta: [{ name: "robots", content: "noindex, nofollow" }],
};
