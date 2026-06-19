import { component$, $, useStore } from "@builder.io/qwik";
import { LuImagePlus, LuX, LuGripVertical } from "@qwikest/icons/lucide";
import {
  addGalleryImage,
  deleteGalleryImage,
  reorderGalleryImages,
} from "~/routes/admin/galeria/index";

interface GalleryImage {
  id: number;
  imageUrl: string;
  displayOrder: number;
}

interface Props {
  images: GalleryImage[];
}

export const GalleryUploader = component$<Props>(({ images }) => {
  const state = useStore<{
    images: GalleryImage[];
    isUploading: boolean;
    progress: string;
    error: string | null;
    draggingIdx: number | null;
    dragOverIdx: number | null;
  }>(() => ({
    images: images.map((i) => ({ ...i })),
    isUploading: false,
    progress: "",
    error: null,
    draggingIdx: null,
    dragOverIdx: null,
  }));

  const handleUpload$ = $(async (_e: Event, el: HTMLInputElement) => {
    const files = el.files;
    if (!files || files.length === 0) return;

    state.isUploading = true;
    state.error = null;

    const { upload } = await import("@vercel/blob/client");

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        // Límite razonable del lado del cliente (el servidor también valida tipo/tamaño).
        if (file.size > 15 * 1024 * 1024) {
          state.error = `El archivo "${file.name}" supera el límite de 15MB.`;
          continue;
        }

        state.progress = `Subiendo ${i + 1} de ${files.length}...`;

        // Subimos a Vercel Blob (no a la DB): la imagen se sirve por CDN y el
        // HTML de la home queda liviano. Guardamos sólo la URL.
        const blob = await upload(`galeria/${file.name}`, file, {
          access: "public",
          handleUploadUrl: "/api/blob/upload",
        });

        const newImage = await addGalleryImage(blob.url, state.images.length);
        if (newImage) state.images.push(newImage);
      } catch (err) {
        console.error("gallery upload failed:", err);
        state.error =
          (err as Error).message || `No se pudo subir "${file.name}".`;
      }
    }

    state.isUploading = false;
    state.progress = "";
    el.value = "";
  });

  const handleDelete$ = $(async (id: number) => {
    if (!confirm("¿Eliminar esta foto de la galería?")) return;
    const idx = state.images.findIndex((i) => i.id === id);
    if (idx !== -1) state.images.splice(idx, 1);
    try {
      await deleteGalleryImage(id);
    } catch (err) {
      console.error("delete image error:", err);
    }
  });

  const handleDrop$ = $(async (targetIdx: number) => {
    const fromIdx = state.draggingIdx;
    state.draggingIdx = null;
    state.dragOverIdx = null;
    if (fromIdx === null || fromIdx === targetIdx) return;
    const [moved] = state.images.splice(fromIdx, 1);
    state.images.splice(targetIdx, 0, moved);
    try {
      await reorderGalleryImages(state.images.map((i) => i.id));
    } catch (err) {
      console.error("reorder error:", err);
    }
  });

  return (
    <div class="space-y-6">
      {state.images.length > 0 && (
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {state.images.map((img, idx) => (
            <div
              key={img.id}
              draggable
              onDragStart$={() => (state.draggingIdx = idx)}
              onDragOver$={(e) => {
                e.preventDefault();
                if (state.draggingIdx !== null && state.draggingIdx !== idx)
                  state.dragOverIdx = idx;
              }}
              onDrop$={() => handleDrop$(idx)}
              onDragEnd$={() => {
                state.draggingIdx = null;
                state.dragOverIdx = null;
              }}
              class={[
                "group relative aspect-square cursor-grab overflow-hidden rounded-2xl border bg-slate-50 shadow-sm transition-all select-none active:cursor-grabbing",
                state.dragOverIdx === idx && state.draggingIdx !== idx
                  ? "border-accent-500 scale-95 opacity-80"
                  : "border-slate-200",
                state.draggingIdx === idx
                  ? "scale-90 border-dashed opacity-30"
                  : "",
              ]}
            >
              <img
                src={img.imageUrl}
                alt=""
                loading="lazy"
                class="pointer-events-none h-full w-full object-cover"
              />
              <div class="absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-lg bg-black/55 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                <LuGripVertical class="h-3.5 w-3.5 text-white" />
              </div>
              <button
                type="button"
                onClick$={() => handleDelete$(img.id)}
                class="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hover:bg-red-600"
                title="Eliminar"
              >
                <LuX class="h-3.5 w-3.5 text-white" />
              </button>
              <div class="bg-primary-900/85 absolute bottom-2 left-2 flex h-5 min-w-[20px] items-center justify-center rounded px-1 text-[10px] font-bold text-white">
                {idx + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {state.images.length === 0 && !state.isUploading && (
        <div class="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-16 text-center text-slate-400">
          <LuImagePlus class="mb-3 h-9 w-9 text-slate-300" />
          <p class="font-display text-primary-900 text-sm font-bold">
            La galería está vacía
          </p>
          <p class="mt-1 max-w-xs text-xs text-slate-500">
            Subí fotos de los consultorios, las instalaciones y los espacios
            para mostrarlas en la home.
          </p>
        </div>
      )}

      <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
        {state.isUploading && (
          <div class="text-accent-600 flex animate-pulse items-center gap-2 text-sm font-semibold">
            {state.progress || "Procesando..."}
          </div>
        )}
        <label
          class={[
            "font-display inline-flex cursor-pointer items-center gap-2.5 rounded-xl border-2 border-dashed px-6 py-3.5 text-sm font-semibold shadow-sm transition-all",
            state.isUploading
              ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
              : "border-accent-500 text-accent-600 hover:bg-accent-50 hover:border-solid",
          ]}
        >
          <LuImagePlus class="h-5 w-5 shrink-0" />
          {state.images.length === 0 ? "Subir fotos..." : "Subir más fotos..."}
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            disabled={state.isUploading}
            onChange$={handleUpload$}
            class="sr-only"
          />
        </label>
      </div>

      {state.error && (
        <div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          ⚠️ {state.error}
        </div>
      )}

      <p class="text-xs text-slate-400">
        * Podés seleccionar varias fotos a la vez. Arrastralas para
        reordenarlas; el número indica el orden de izquierda a derecha.
      </p>
    </div>
  );
});
