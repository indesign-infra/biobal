import { component$, useSignal, $ } from "@builder.io/qwik";
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
import { eq } from "drizzle-orm";
import { LuArrowLeft, LuUploadCloud } from "@qwikest/icons/lucide";

export const useSection = routeLoader$(async ({ params, env, status }) => {
  try {
    const db = getDb(env);
    const [row] = await db
      .select()
      .from(schema.sections)
      .where(eq(schema.sections.id, params.id))
      .limit(1);
    if (!row) {
      status(404);
      return null;
    }
    return row;
  } catch (error) {
    console.error("section loader error:", error);
    return null;
  }
});

export const useSaveSection = routeAction$(
  async (data, { env, redirect }) => {
    const db = getDb(env);
    await db
      .update(schema.sections)
      .set({
        eyebrow: data.eyebrow?.trim() || null,
        title: data.title?.trim() || null,
        subtitle: data.subtitle?.trim() || null,
        body: data.body?.trim() || null,
        imageUrl: data.imageUrl?.trim() || null,
        navLabel: data.navLabel?.trim() || null,
        enabled: data.enabled === "true",
        inNav: data.inNav === "true",
      })
      .where(eq(schema.sections.id, data.id));
    throw redirect(302, "/admin/secciones");
  },
  zod$({
    id: z.string(),
    eyebrow: z.string().optional(),
    title: z.string().optional(),
    subtitle: z.string().optional(),
    body: z.string().optional(),
    imageUrl: z.string().optional(),
    navLabel: z.string().optional(),
    enabled: z.string().optional(),
    inNav: z.string().optional(),
  }),
);

const inputCls =
  "w-full bg-slate-50 border border-slate-200 focus:border-accent-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors text-primary-900";
const lblCls = "block text-xs font-bold text-slate-500 uppercase mb-1.5";

export default component$(() => {
  const section = useSection();
  const save = useSaveSection();

  const sec = section.value;
  const enabled = useSignal(sec?.enabled ?? true);
  const inNav = useSignal(sec?.inNav ?? false);
  const imageUrl = useSignal(sec?.imageUrl ?? "");
  const isWorking = useSignal(false);
  const errorMsg = useSignal<string | null>(null);

  if (!sec) {
    return (
      <div class="mx-auto max-w-2xl">
        <Link href="/admin/secciones" class="text-sm text-slate-500">
          ← Volver
        </Link>
        <p class="mt-4 text-slate-500">Sección no encontrada.</p>
      </div>
    );
  }

  const onImageFile = $(async (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    isWorking.value = true;
    errorMsg.value = null;
    try {
      const { upload } = await import("@vercel/blob/client");
      const blob = await upload(`secciones/${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/blob/upload",
      });
      imageUrl.value = blob.url;
    } catch (err) {
      console.error("section image upload error:", err);
      errorMsg.value = "No se pudo subir la imagen.";
    } finally {
      isWorking.value = false;
    }
  });

  return (
    <div class="mx-auto max-w-2xl">
      <Link
        href="/admin/secciones"
        class="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <LuArrowLeft class="h-4 w-4" /> Volver a secciones
      </Link>
      <h1 class="font-display text-primary-900 mt-3 text-2xl font-bold">
        {sec.label}
      </h1>
      <p class="mt-1 text-sm text-slate-500">
        Editá el contenido de esta sección. Los campos vacíos usan el texto por
        defecto del sitio.
      </p>

      {errorMsg.value && (
        <div class="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          ⚠️ {errorMsg.value}
        </div>
      )}

      <Form
        action={save}
        class="mt-6 space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <input type="hidden" name="id" value={sec.id} />
        <input
          type="hidden"
          name="enabled"
          value={enabled.value ? "true" : "false"}
        />
        <input
          type="hidden"
          name="inNav"
          value={inNav.value ? "true" : "false"}
        />
        <input type="hidden" name="imageUrl" value={imageUrl.value} />

        {/* Visibilidad */}
        <div class="flex flex-wrap items-center gap-6 border-b border-slate-100 pb-5">
          <label class="flex cursor-pointer items-center gap-3">
            <button
              type="button"
              onClick$={() => (enabled.value = !enabled.value)}
              class={[
                "h-6 w-11 shrink-0 rounded-full p-0.5 transition-colors",
                enabled.value ? "bg-accent-500" : "bg-slate-300",
              ]}
            >
              <div
                class={[
                  "h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200",
                  enabled.value ? "translate-x-5" : "translate-x-0",
                ]}
              />
            </button>
            <span class="text-primary-900 text-sm font-semibold">
              {enabled.value ? "Sección visible" : "Sección oculta"}
            </span>
          </label>

          <label class="flex cursor-pointer items-center gap-3">
            <button
              type="button"
              onClick$={() => (inNav.value = !inNav.value)}
              class={[
                "h-6 w-11 shrink-0 rounded-full p-0.5 transition-colors",
                inNav.value ? "bg-accent-500" : "bg-slate-300",
              ]}
            >
              <div
                class={[
                  "h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200",
                  inNav.value ? "translate-x-5" : "translate-x-0",
                ]}
              />
            </button>
            <span class="text-primary-900 text-sm font-semibold">
              En el menú
            </span>
          </label>
        </div>

        {inNav.value && (
          <div>
            <label class={lblCls}>Texto en el menú</label>
            <input
              name="navLabel"
              value={sec.navLabel ?? ""}
              class={inputCls}
              placeholder="Ej. Consultorios"
            />
          </div>
        )}

        <div>
          <label class={lblCls}>Eyebrow (texto pequeño)</label>
          <input name="eyebrow" value={sec.eyebrow ?? ""} class={inputCls} />
        </div>
        <div>
          <label class={lblCls}>Título</label>
          <input name="title" value={sec.title ?? ""} class={inputCls} />
        </div>
        <div>
          <label class={lblCls}>Subtítulo</label>
          <textarea
            name="subtitle"
            rows={2}
            value={sec.subtitle ?? ""}
            class={[inputCls, "resize-none leading-relaxed"]}
          />
        </div>
        <div>
          <label class={lblCls}>Texto</label>
          <textarea
            name="body"
            rows={5}
            value={sec.body ?? ""}
            class={[inputCls, "leading-relaxed"]}
          />
        </div>

        {/* Imagen */}
        <div class="border-slate-150 space-y-3 rounded-2xl border bg-slate-50/60 p-5">
          <p class="text-primary-900 text-sm font-bold">Imagen de la sección</p>
          <div class="flex items-start gap-4">
            {imageUrl.value ? (
              <img
                src={imageUrl.value}
                alt="Vista previa"
                width={96}
                height={96}
                class="h-24 w-24 rounded-xl border border-slate-200 object-cover"
              />
            ) : (
              <div class="flex h-24 w-24 items-center justify-center rounded-xl border border-dashed border-slate-300 text-[10px] text-slate-400">
                Sin imagen
              </div>
            )}
            <div class="flex-1 space-y-2">
              <label
                class={[
                  "inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50",
                  isWorking.value && "opacity-50",
                ]}
              >
                <LuUploadCloud class="h-4 w-4" />
                {isWorking.value ? "Subiendo..." : "Subir imagen"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange$={onImageFile}
                  disabled={isWorking.value}
                  class="hidden"
                />
              </label>
              <input
                value={imageUrl.value}
                onInput$={(e) =>
                  (imageUrl.value = (e.target as HTMLInputElement).value)
                }
                class={inputCls}
                placeholder="o pegá una URL / ruta (/images/...)"
              />
              {imageUrl.value && (
                <button
                  type="button"
                  onClick$={() => (imageUrl.value = "")}
                  class="text-xs font-medium text-red-500 hover:text-red-600"
                >
                  Quitar imagen
                </button>
              )}
            </div>
          </div>
        </div>

        <div class="flex items-center gap-4 border-t border-slate-100 pt-5">
          <button
            type="submit"
            disabled={save.isRunning || isWorking.value}
            class="bg-primary-900 hover:bg-primary-950 font-display rounded-xl px-6 py-3 text-sm font-semibold text-white transition-colors disabled:opacity-50"
          >
            {save.isRunning ? "Guardando..." : "Guardar cambios"}
          </button>
          <Link
            href="/admin/secciones"
            class="text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            Cancelar
          </Link>
        </div>
      </Form>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Editar sección — BioBal Admin",
  meta: [{ name: "robots", content: "noindex, nofollow" }],
};
