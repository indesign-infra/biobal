import { component$, useSignal } from "@builder.io/qwik";
import {
  routeLoader$,
  routeAction$,
  Form,
  Link,
  type DocumentHead,
} from "@builder.io/qwik-city";
import { getDb, schema } from "~/db";
import { desc, count, eq } from "drizzle-orm";
import { LuArrowRight, LuTrash2, LuMessageSquare } from "@qwikest/icons/lucide";

export const useChatsLoader = routeLoader$(async ({ env }) => {
  try {
    const db = getDb(env);
    const sessionsList = await db
      .select()
      .from(schema.chatSessions)
      .orderBy(desc(schema.chatSessions.lastActive));

    const sessions = await Promise.all(
      sessionsList.map(async (sess) => {
        const [c] = await db
          .select({ val: count() })
          .from(schema.chatMessages)
          .where(eq(schema.chatMessages.sessionId, sess.id));
        return { ...sess, messageCount: c?.val || 0 };
      }),
    );

    const [settings] = await db
      .select()
      .from(schema.chatbotSettings)
      .where(eq(schema.chatbotSettings.id, 1))
      .limit(1);

    return { sessions, settings: settings ?? null };
  } catch (error) {
    console.error("chats loader error:", error);
    return { sessions: [], settings: null };
  }
});

export const useUpdateSettings = routeAction$(async (data, { env }) => {
  try {
    const db = getDb(env);
    const values = {
      id: 1,
      activo: data.activo === "true",
      nombre: (data.nombre as string)?.trim() || "Asistente BioBal",
      tono: (data.tono as string)?.trim() || null,
      saludo: (data.saludo as string)?.trim() || null,
      cta: (data.cta as string)?.trim() || null,
      whatsapp: (data.whatsapp as string)?.trim() || null,
      instrucciones: (data.instrucciones as string)?.trim() || null,
      conocimiento: (data.conocimiento as string)?.trim() || null,
      updatedAt: new Date().toISOString(),
    };
    await db
      .insert(schema.chatbotSettings)
      .values(values)
      .onConflictDoUpdate({ target: schema.chatbotSettings.id, set: values });
    return { success: true };
  } catch (e) {
    console.error("update settings error:", e);
    return { success: false, error: "No se pudo guardar la configuración." };
  }
});

export const useDeleteChat = routeAction$(async (data, { env }) => {
  const id = data.id as string;
  if (!id) return { success: false };
  try {
    const db = getDb(env);
    await db
      .delete(schema.chatMessages)
      .where(eq(schema.chatMessages.sessionId, id));
    await db.delete(schema.chatSessions).where(eq(schema.chatSessions.id, id));
    return { success: true };
  } catch (e) {
    console.error("delete chat error:", e);
    return { success: false };
  }
});

const input =
  "w-full bg-slate-50 border border-slate-200 focus:border-accent-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors text-primary-900";
const lbl = "block text-xs font-bold text-primary-900 uppercase mb-1.5";

export default component$(() => {
  const data = useChatsLoader();
  const update = useUpdateSettings();
  const del = useDeleteChat();
  const tab = useSignal<"config" | "audit">("config");
  const s = data.value.settings;
  const activo = useSignal(s?.activo !== false);

  return (
    <div class="mx-auto max-w-5xl">
      <h1 class="font-display text-primary-900 text-2xl font-bold">
        Chatbot de IA
      </h1>
      <p class="mt-1 text-sm text-slate-500">
        Personalizá el asistente y revisá las conversaciones.
      </p>

      <div class="mt-6 flex border-b border-slate-200">
        <button
          onClick$={() => (tab.value = "config")}
          class={[
            "border-b-2 px-5 py-3 text-sm font-bold transition-all",
            tab.value === "config"
              ? "border-accent-500 text-accent-600"
              : "border-transparent text-slate-400 hover:text-slate-600",
          ]}
        >
          Configurar
        </button>
        <button
          onClick$={() => (tab.value = "audit")}
          class={[
            "border-b-2 px-5 py-3 text-sm font-bold transition-all",
            tab.value === "audit"
              ? "border-accent-500 text-accent-600"
              : "border-transparent text-slate-400 hover:text-slate-600",
          ]}
        >
          Conversaciones ({data.value.sessions.length})
        </button>
      </div>

      {update.value?.success && tab.value === "config" && (
        <div class="bg-accent-50 text-accent-700 border-accent-200 mt-6 rounded-xl border px-4 py-3 text-sm font-semibold">
          ✅ Configuración guardada.
        </div>
      )}

      {tab.value === "config" && (
        <Form action={update} class="mt-6 space-y-6">
          <input
            type="hidden"
            name="activo"
            value={activo.value ? "true" : "false"}
          />
          <div class="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div class="flex items-center justify-between border-b border-slate-100 pb-5">
              <div>
                <p class="text-primary-900 text-sm font-bold">
                  Estado del asistente
                </p>
                <p class="text-xs text-slate-400">
                  {activo.value
                    ? "Visible en el sitio"
                    : "Oculto temporalmente"}
                </p>
              </div>
              <button
                type="button"
                onClick$={() => (activo.value = !activo.value)}
                class={[
                  "h-6 w-11 shrink-0 rounded-full p-0.5 transition-colors",
                  activo.value ? "bg-accent-500" : "bg-slate-300",
                ]}
              >
                <div
                  class={[
                    "h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200",
                    activo.value ? "translate-x-5" : "translate-x-0",
                  ]}
                />
              </button>
            </div>

            <div class="grid grid-cols-1 gap-5 md:grid-cols-3">
              <div>
                <label class={lbl}>Nombre</label>
                <input
                  name="nombre"
                  value={s?.nombre ?? "Asistente BioBal"}
                  class={input}
                />
              </div>
              <div class="md:col-span-2">
                <label class={lbl}>Tono y personalidad</label>
                <input
                  name="tono"
                  value={s?.tono ?? ""}
                  placeholder="Amigable, profesional y servicial"
                  class={input}
                />
              </div>
            </div>

            <div class="max-w-xs">
              <label class={lbl}>WhatsApp de derivación</label>
              <input
                name="whatsapp"
                value={s?.whatsapp ?? ""}
                placeholder="5491127585392"
                class={[input, "font-mono"]}
              />
            </div>

            <div>
              <label class={lbl}>Saludo inicial</label>
              <textarea
                name="saludo"
                rows={2}
                value={s?.saludo ?? ""}
                class={[input, "resize-none leading-relaxed"]}
              />
            </div>
            <div>
              <label class={lbl}>Llamado a la acción (CTA)</label>
              <textarea
                name="cta"
                rows={2}
                value={s?.cta ?? ""}
                class={[input, "resize-none leading-relaxed"]}
              />
            </div>
            <div>
              <label class={lbl}>Instrucciones (system prompt)</label>
              <textarea
                name="instrucciones"
                rows={4}
                value={s?.instrucciones ?? ""}
                class={[input, "font-mono text-xs leading-relaxed"]}
              />
            </div>
            <div>
              <label class={lbl}>Base de conocimiento</label>
              <textarea
                name="conocimiento"
                rows={6}
                value={s?.conocimiento ?? ""}
                placeholder="Información clave de BioBal que la IA siempre debe saber..."
                class={[input, "font-mono text-xs leading-relaxed"]}
              />
            </div>
          </div>

          <div class="flex justify-end">
            <button
              type="submit"
              disabled={update.isRunning}
              class="bg-primary-900 hover:bg-primary-950 font-display rounded-xl px-6 py-3 text-sm font-semibold text-white transition-colors disabled:opacity-50"
            >
              {update.isRunning ? "Guardando..." : "Guardar configuración"}
            </button>
          </div>
        </Form>
      )}

      {tab.value === "audit" && (
        <div class="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {data.value.sessions.length === 0 ? (
            <div class="p-16 text-center text-slate-400">
              <LuMessageSquare class="mx-auto mb-3 h-10 w-10 text-slate-300" />
              Todavía no hay conversaciones.
            </div>
          ) : (
            <table class="w-full text-left text-sm">
              <thead class="border-b border-slate-200 bg-slate-50 text-xs tracking-wider text-slate-400 uppercase">
                <tr>
                  <th class="px-5 py-3">Sesión</th>
                  <th class="px-5 py-3 text-center">Mensajes</th>
                  <th class="px-5 py-3">Última actividad</th>
                  <th class="px-5 py-3 text-right"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                {data.value.sessions.map((sess) => (
                  <tr key={sess.id} class="hover:bg-slate-50/60">
                    <td class="text-primary-900 px-5 py-4 font-mono text-xs">
                      {sess.id}
                    </td>
                    <td class="px-5 py-4 text-center">
                      <span class="bg-accent-50 text-accent-700 rounded-full px-2.5 py-0.5 text-xs font-semibold">
                        {sess.messageCount}
                      </span>
                    </td>
                    <td class="px-5 py-4 text-xs text-slate-500">
                      {new Date(sess.lastActive).toLocaleString("es-AR")}
                    </td>
                    <td class="px-5 py-4">
                      <div class="flex items-center justify-end gap-4">
                        <Link
                          href={`/admin/chats/${sess.id}/`}
                          class="text-accent-600 hover:text-accent-700 inline-flex items-center gap-1 text-xs font-bold uppercase"
                        >
                          Ver <LuArrowRight class="h-3.5 w-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick$={async () => {
                            if (
                              window.confirm(
                                "¿Estás seguro de que querés eliminar esta conversación?",
                              )
                            ) {
                              await del.submit({ id: sess.id });
                            }
                          }}
                          class="text-slate-400 transition-colors hover:text-red-500"
                          title="Eliminar"
                        >
                          <LuTrash2 class="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
});

export const head: DocumentHead = {
  title: "Chatbot — BioBal Admin",
  meta: [{ name: "robots", content: "noindex, nofollow" }],
};
