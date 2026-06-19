import { component$ } from "@builder.io/qwik";
import {
  routeLoader$,
  routeAction$,
  Form,
  type DocumentHead,
} from "@builder.io/qwik-city";
import { getDb, schema } from "~/db";
import { eq } from "drizzle-orm";

export const useBusiness = routeLoader$(async ({ env }) => {
  try {
    const db = getDb(env);
    const [s] = await db
      .select()
      .from(schema.siteSettings)
      .where(eq(schema.siteSettings.id, 1))
      .limit(1);
    return s ?? null;
  } catch (error) {
    console.error("business loader error:", error);
    return null;
  }
});

export const useSaveBusiness = routeAction$(async (data, { env }) => {
  try {
    const db = getDb(env);
    const values = {
      id: 1,
      tagline: (data.tagline as string)?.trim() || null,
      phoneDisplay: (data.phoneDisplay as string)?.trim() || null,
      phoneTel: (data.phoneTel as string)?.trim() || null,
      whatsapp: (data.whatsapp as string)?.trim() || null,
      instagramHandle: (data.instagramHandle as string)?.trim() || null,
      instagramUrl: (data.instagramUrl as string)?.trim() || null,
      addressLine1: (data.addressLine1 as string)?.trim() || null,
      addressLine2: (data.addressLine2 as string)?.trim() || null,
      mapsUrl: (data.mapsUrl as string)?.trim() || null,
      email: (data.email as string)?.trim() || null,
      referente: (data.referente as string)?.trim() || null,
      updatedAt: new Date().toISOString(),
    };
    await db
      .insert(schema.siteSettings)
      .values(values)
      .onConflictDoUpdate({ target: schema.siteSettings.id, set: values });
    return { success: true };
  } catch (e) {
    console.error("save business error:", e);
    return { success: false, error: "No se pudieron guardar los datos." };
  }
});

const inputCls =
  "w-full bg-slate-50 border border-slate-200 focus:border-accent-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors text-primary-900";
const lblCls = "block text-xs font-bold text-slate-500 uppercase mb-1.5";

export default component$(() => {
  const biz = useBusiness();
  const save = useSaveBusiness();
  const s = biz.value;

  return (
    <div class="mx-auto max-w-2xl">
      <h1 class="font-display text-primary-900 text-2xl font-bold">
        Datos del negocio
      </h1>
      <p class="mt-1 text-sm text-slate-500">
        Esta información se usa en el header, el footer, la sección de contacto
        y el asistente virtual.
      </p>

      {save.value?.success && (
        <div class="bg-accent-50 text-accent-700 border-accent-200 mt-5 rounded-xl border px-4 py-3 text-sm font-semibold">
          ✅ Datos guardados.
        </div>
      )}
      {save.value?.success === false && (
        <div class="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          ⚠️ {save.value.error}
        </div>
      )}

      <Form
        action={save}
        class="mt-6 space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label class={lblCls}>Tagline</label>
          <input name="tagline" value={s?.tagline ?? ""} class={inputCls} />
        </div>

        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label class={lblCls}>Teléfono (visible)</label>
            <input
              name="phoneDisplay"
              value={s?.phoneDisplay ?? ""}
              class={inputCls}
              placeholder="11 2758-5392"
            />
          </div>
          <div>
            <label class={lblCls}>Teléfono (link tel:)</label>
            <input
              name="phoneTel"
              value={s?.phoneTel ?? ""}
              class={[inputCls, "font-mono"]}
              placeholder="+541127585392"
            />
          </div>
          <div>
            <label class={lblCls}>WhatsApp (para el chat)</label>
            <input
              name="whatsapp"
              value={s?.whatsapp ?? ""}
              class={[inputCls, "font-mono"]}
              placeholder="5491127585392"
            />
          </div>
          <div>
            <label class={lblCls}>Email</label>
            <input
              name="email"
              type="email"
              value={s?.email ?? ""}
              class={inputCls}
              placeholder="contacto@biobal.com.ar"
            />
          </div>
          <div>
            <label class={lblCls}>Instagram (usuario)</label>
            <input
              name="instagramHandle"
              value={s?.instagramHandle ?? ""}
              class={inputCls}
              placeholder="@biobal_consultorios"
            />
          </div>
          <div>
            <label class={lblCls}>Instagram (URL)</label>
            <input
              name="instagramUrl"
              value={s?.instagramUrl ?? ""}
              class={inputCls}
              placeholder="https://instagram.com/..."
            />
          </div>
        </div>

        <div>
          <label class={lblCls}>Dirección (línea 1)</label>
          <input
            name="addressLine1"
            value={s?.addressLine1 ?? ""}
            class={inputCls}
          />
        </div>
        <div>
          <label class={lblCls}>Dirección (línea 2)</label>
          <input
            name="addressLine2"
            value={s?.addressLine2 ?? ""}
            class={inputCls}
          />
        </div>
        <div>
          <label class={lblCls}>Link de Google Maps</label>
          <input name="mapsUrl" value={s?.mapsUrl ?? ""} class={inputCls} />
        </div>
        <div>
          <label class={lblCls}>Referente</label>
          <input
            name="referente"
            value={s?.referente ?? ""}
            class={inputCls}
            placeholder="Lic. Mónica Álvarez — Bióloga"
          />
        </div>

        <div class="border-t border-slate-100 pt-5">
          <button
            type="submit"
            disabled={save.isRunning}
            class="bg-primary-900 hover:bg-primary-950 font-display rounded-xl px-6 py-3 text-sm font-semibold text-white transition-colors disabled:opacity-50"
          >
            {save.isRunning ? "Guardando..." : "Guardar datos"}
          </button>
        </div>
      </Form>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Datos del negocio — BioBal Admin",
  meta: [{ name: "robots", content: "noindex, nofollow" }],
};
