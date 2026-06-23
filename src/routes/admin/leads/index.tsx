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
import { desc, eq } from "drizzle-orm";
import { LuTrash2, LuMail, LuPhone } from "@qwikest/icons/lucide";

const ESTADOS = ["nuevo", "contactado", "en-proceso", "cerrado"] as const;

export const useLeads = routeLoader$(async ({ env }) => {
  try {
    const db = getDb(env);
    return await db
      .select()
      .from(schema.leads)
      .orderBy(desc(schema.leads.createdAt));
  } catch (error) {
    console.error("leads loader error:", error);
    return [];
  }
});

export const useUpdateEstado = routeAction$(
  async ({ id, estado }, { env }) => {
    const db = getDb(env);
    await db
      .update(schema.leads)
      .set({ estado, updatedAt: new Date().toISOString() })
      .where(eq(schema.leads.id, id));
    return { success: true };
  },
  zod$({ id: z.string(), estado: z.enum(ESTADOS) }),
);

export const useDeleteLead = routeAction$(
  async ({ id }, { env }) => {
    const db = getDb(env);
    await db.delete(schema.leads).where(eq(schema.leads.id, id));
    return { success: true };
  },
  zod$({ id: z.string() }),
);

const estadoStyles: Record<string, string> = {
  nuevo: "bg-accent-50 text-accent-700 ring-accent-200",
  contactado: "bg-blue-50 text-blue-700 ring-blue-200",
  "en-proceso": "bg-amber-50 text-amber-700 ring-amber-200",
  cerrado: "bg-slate-100 text-slate-500 ring-slate-200",
};

export default component$(() => {
  const leads = useLeads();
  const updateEstado = useUpdateEstado();
  const deleteLead = useDeleteLead();

  return (
    <div>
      <h1 class="font-display text-primary-900 text-2xl font-bold">
        Leads recibidos
      </h1>
      <p class="mt-1 text-sm text-slate-500">
        {leads.value.length} consulta{leads.value.length === 1 ? "" : "s"} desde
        el formulario del sitio.
      </p>

      {leads.value.length === 0 ? (
        <div class="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-400">
          Todavía no hay leads. Cuando alguien complete el formulario, aparecerá
          acá.
        </div>
      ) : (
        <div class="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table class="w-full text-left text-sm">
            <thead class="border-b border-slate-200 bg-slate-50 text-xs tracking-wider text-slate-400 uppercase">
              <tr>
                <th class="px-5 py-3 font-semibold">Contacto</th>
                <th class="px-5 py-3 font-semibold">Especialidad</th>
                <th class="px-5 py-3 font-semibold">Mensaje</th>
                <th class="px-5 py-3 font-semibold">Estado</th>
                <th class="px-5 py-3 font-semibold">Fecha</th>
                <th class="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              {leads.value.map((l) => (
                <tr key={l.id} class="hover:bg-slate-50/60">
                  <td class="px-5 py-4">
                    <p class="text-primary-900 font-medium">{l.nombre}</p>
                    <a
                      href={`mailto:${l.email}`}
                      class="mt-0.5 flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700"
                    >
                      <LuMail class="h-3 w-3" /> {l.email}
                    </a>
                    <a
                      href={`tel:${l.telefono}`}
                      class="mt-0.5 flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700"
                    >
                      <LuPhone class="h-3 w-3" /> {l.telefono}
                    </a>
                  </td>
                  <td class="px-5 py-4 text-slate-600">
                    {l.especialidad || "—"}
                  </td>
                  <td class="max-w-xs px-5 py-4 text-slate-500">
                    {l.mensaje ? (
                      <span class="line-clamp-2">{l.mensaje}</span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td class="px-5 py-4">
                    <Form action={updateEstado}>
                      <input type="hidden" name="id" value={l.id} />
                      <select
                        name="estado"
                        value={l.estado ?? "nuevo"}
                        onChange$={(e) =>
                          (e.target as HTMLSelectElement).form?.requestSubmit()
                        }
                        class={[
                          "rounded-full px-3 py-1 text-xs font-semibold ring-1 outline-none ring-inset",
                          estadoStyles[l.estado ?? "nuevo"],
                        ]}
                      >
                        {ESTADOS.map((e) => (
                          <option key={e} value={e}>
                            {e}
                          </option>
                        ))}
                      </select>
                    </Form>
                  </td>
                  <td class="px-5 py-4 text-xs whitespace-nowrap text-slate-400">
                    {l.createdAt}
                  </td>
                  <td class="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick$={async () => {
                        if (
                          window.confirm(
                            "¿Estás seguro de que querés eliminar este lead?",
                          )
                        ) {
                          await deleteLead.submit({ id: l.id });
                        }
                      }}
                      title="Eliminar"
                      class="text-slate-400 transition-colors hover:text-red-500"
                    >
                      <LuTrash2 class="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
});

export const head: DocumentHead = {
  title: "Leads — BioBal Admin",
  meta: [{ name: "robots", content: "noindex, nofollow" }],
};
