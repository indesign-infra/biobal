import { component$, useSignal, $, useComputed$ } from "@builder.io/qwik";
import {
  routeAction$,
  zod$,
  z,
  Link,
  type DocumentHead,
} from "@builder.io/qwik-city";
import { getDb, schema } from "~/db";
import { asc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { LuArrowLeft, LuUploadCloud, LuLoader2 } from "@qwikest/icons/lucide";
import { uploadToBlob } from "~/lib/upload";
import { VideoTip } from "~/components/admin/video-tip";

export const useCreateVideo = routeAction$(
  async (data, { env, fail, redirect }) => {
    if (!data.videoUrl) {
      return fail(400, {
        error: "Falta el video (subí un archivo o pegá una URL).",
      });
    }
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
        isActive: data.isActive === "true" ? 1 : 0,
        displayOrder:
          data.displayOrder != null && data.displayOrder !== ""
            ? Number(data.displayOrder)
            : (last?.o ?? -1) + 1,
      });
    } catch (e) {
      console.error("create video error:", e);
      return fail(500, { error: "Error al guardar el video." });
    }
    throw redirect(302, "/admin/videos-verticales");
  },
  zod$({
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
  const create = useCreateVideo();

  const isWorking = useSignal(false);
  const progress = useSignal("");

  const progressPct = useComputed$(() => {
    const match = progress.value.match(/(\d+)%/);
    return match ? Number(match[1]) : null;
  });
  const errorMsg = useSignal<string | null>(null);

  const videoPreview = useSignal("");
  const thumbPreview = useSignal("");
  const isActive = useSignal(true);

  const onVideoFile = $((e: Event) => {
    const f = (e.target as HTMLInputElement).files?.[0];
    videoPreview.value = f ? URL.createObjectURL(f) : "";
  });
  const onThumbFile = $((e: Event) => {
    const f = (e.target as HTMLInputElement).files?.[0];
    thumbPreview.value = f ? URL.createObjectURL(f) : "";
  });

  const handleSubmit = $(async (_ev: Event, form: HTMLFormElement) => {
    errorMsg.value = null;
    isWorking.value = true;
    try {
      const fd = new FormData(form);
      const title = (fd.get("title") as string)?.trim();
      if (!title) throw new Error("Poné un título.");

      let videoUrl = (fd.get("videoUrl") as string)?.trim() || "";
      let thumbnailUrl = (fd.get("thumbnailUrl") as string)?.trim() || "";

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
        videoUrl = await uploadToBlob(videoFile, "reels", (pct) => {
          progress.value = `Subiendo video (${pct}%)...`;
        });
      }
      if (thumbFile) {
        if (thumbFile.size > 25 * 1024 * 1024) {
          throw new Error("La miniatura supera el límite de 25MB.");
        }
        progress.value = "Subiendo miniatura (0%)...";
        thumbnailUrl = await uploadToBlob(thumbFile, "reels", (pct) => {
          progress.value = `Subiendo miniatura (${pct}%)...`;
        });
      }

      if (!videoUrl) throw new Error("Subí un video o pegá una URL.");

      progress.value = "Guardando...";
      await create.submit({
        title,
        videoUrl,
        thumbnailUrl,
        displayOrder: (fd.get("displayOrder") as string) || "",
        isActive: isActive.value ? "true" : "false",
      });
    } catch (e) {
      console.error("upload/create error:", e);
      errorMsg.value =
        (e as Error).message || "Hubo un error al procesar el video.";
    } finally {
      isWorking.value = false;
      progress.value = "";
    }
  });

  return (
    <div class="mx-auto max-w-2xl">
      <Link
        href="/admin/videos-verticales"
        class="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <LuArrowLeft class="h-4 w-4" /> Volver a reels
      </Link>
      <h1 class="font-display text-primary-900 mt-3 text-2xl font-bold">
        Nuevo video vertical
      </h1>
      <p class="mt-1 text-sm text-slate-500">
        Subí un .mp4 desde tu compu (o pegá una URL) y una miniatura de portada.
      </p>

      <div class="mt-5">
        <VideoTip />
      </div>

      {(errorMsg.value || create.value?.failed) && (
        <div class="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          ⚠️ {errorMsg.value || (create.value as { error?: string })?.error}
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
          <input
            name="title"
            required
            class={textInput}
            placeholder="Ej. Recorrido por el consultorio 202"
          />
        </div>

        {/* Video */}
        <div class="border-slate-150 space-y-3 rounded-2xl border bg-slate-50/60 p-5">
          <p class="text-primary-900 border-b border-slate-200 pb-2 text-sm font-bold">
            Video
          </p>
          <div>
            <label class="mb-1.5 block text-xs font-semibold text-slate-600">
              Subir archivo (MP4 / WebM)
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
            onInput$={(e) =>
              (videoPreview.value = (e.target as HTMLInputElement).value)
            }
            class={textInput}
            placeholder="https://...mp4 o /videos/reel.mp4"
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
            Miniatura / portada (opcional)
          </p>
          <div>
            <label class="mb-1.5 block text-xs font-semibold text-slate-600">
              Subir imagen (JPG / PNG / WebP)
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
            onInput$={(e) =>
              (thumbPreview.value = (e.target as HTMLInputElement).value)
            }
            class={textInput}
            placeholder="https://...jpg o /videos/reel.jpg"
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
                  width={360}
                  height={640}
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
              placeholder="0"
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

        {isWorking.value && (
          <div class="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 shadow-inner">
            <div class="flex items-center justify-between text-sm font-medium text-slate-700">
              <span class="flex items-center gap-2">
                <LuLoader2 class="text-accent-600 h-4 w-4 animate-spin" />
                {progress.value || "Procesando..."}
              </span>
              {progressPct.value !== null && (
                <span class="text-xs font-bold text-slate-500">
                  {progressPct.value}%
                </span>
              )}
            </div>
            {progressPct.value !== null && (
              <div class="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  class="bg-accent-500 h-full rounded-full transition-all duration-150"
                  style={{ width: `${progressPct.value}%` }}
                />
              </div>
            )}
          </div>
        )}

        <div class="flex items-center gap-4 border-t border-slate-100 pt-5">
          <button
            type="submit"
            disabled={isWorking.value || create.isRunning}
            class="bg-accent-500 hover:bg-accent-600 font-display inline-flex min-w-[200px] items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-colors disabled:opacity-50"
          >
            {isWorking.value || create.isRunning ? (
              <>
                <LuLoader2 class="h-4 w-4 animate-spin" />
                {progress.value || "Procesando..."}
              </>
            ) : (
              <>
                <LuUploadCloud class="h-4 w-4" />
                Crear video
              </>
            )}
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
  title: "Nuevo reel — BioBal Admin",
  meta: [{ name: "robots", content: "noindex, nofollow" }],
};
