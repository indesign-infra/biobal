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
import { LuPencil, LuEye, LuEyeOff } from "@qwikest/icons/lucide";

export const useSections = routeLoader$(async ({ env }) => {
  try {
    const db = getDb(env);
    return await db
      .select()
      .from(schema.sections)
      .orderBy(asc(schema.sections.displayOrder));
  } catch (error) {
    console.error("sections loader error:", error);
    return [];
  }
});

export const useToggleSection = routeAction$(
  async ({ id, enabled }, { env }) => {
    const db = getDb(env);
    await db
      .update(schema.sections)
      .set({ enabled: enabled !== "1" })
      .where(eq(schema.sections.id, id));
    return { success: true };
  },
  zod$({ id: z.string(), enabled: z.string() }),
);

export default component$(() => {
  const sections = useSections();
  const toggle = useToggleSection();

  return (
    <div class="mx-auto max-w-4xl">
      <h1 class="font-display text-primary-900 text-2xl font-bold">
        Secciones y contenido
      </h1>
      <p class="mt-1 text-sm text-slate-500">
        Activá o desactivá cada sección del sitio, y editá sus textos e
        imágenes. Una sección desactivada se oculta del sitio y de la
        navegación.
      </p>

      <div class="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <ul class="divide-y divide-slate-100">
          {sections.value.map((s) => (
            <li
              key={s.id}
              class="flex items-center justify-between gap-4 px-5 py-4"
            >
              <div class="min-w-0">
                <p class="text-primary-900 flex items-center gap-2 font-semibold">
                  {s.label}
                  {!s.enabled && (
                    <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 uppercase">
                      Oculta
                    </span>
                  )}
                </p>
                {s.title && (
                  <p class="truncate text-xs text-slate-400">{s.title}</p>
                )}
              </div>

              <div class="flex shrink-0 items-center gap-2">
                <Form action={toggle}>
                  <input type="hidden" name="id" value={s.id} />
                  <input
                    type="hidden"
                    name="enabled"
                    value={s.enabled ? "1" : "0"}
                  />
                  <button
                    type="submit"
                    title={s.enabled ? "Desactivar" : "Activar"}
                    class={[
                      "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                      s.enabled
                        ? "bg-accent-50 text-accent-700 hover:bg-accent-100"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200",
                    ]}
                  >
                    {s.enabled ? (
                      <LuEye class="h-3.5 w-3.5" />
                    ) : (
                      <LuEyeOff class="h-3.5 w-3.5" />
                    )}
                    {s.enabled ? "Visible" : "Oculta"}
                  </button>
                </Form>
                <Link
                  href={`/admin/secciones/${s.id}`}
                  class="hover:text-accent-600 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-slate-300"
                >
                  <LuPencil class="h-3.5 w-3.5" />
                  Editar
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Secciones — BioBal Admin",
  meta: [{ name: "robots", content: "noindex, nofollow" }],
};
