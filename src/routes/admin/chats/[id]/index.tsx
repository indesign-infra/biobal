import { component$ } from "@builder.io/qwik";
import { routeLoader$, Link, type DocumentHead } from "@builder.io/qwik-city";
import { getDb, schema } from "~/db";
import { asc, eq } from "drizzle-orm";
import { LuArrowLeft } from "@qwikest/icons/lucide";

export const useConversation = routeLoader$(async ({ params, env }) => {
  try {
    const db = getDb(env);
    const messages = await db
      .select()
      .from(schema.chatMessages)
      .where(eq(schema.chatMessages.sessionId, params.id))
      .orderBy(asc(schema.chatMessages.createdAt));
    return { id: params.id, messages };
  } catch (error) {
    console.error("conversation loader error:", error);
    return { id: params.id, messages: [] };
  }
});

export default component$(() => {
  const data = useConversation();

  return (
    <div class="mx-auto max-w-3xl">
      <Link
        href="/admin/chats"
        class="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <LuArrowLeft class="h-4 w-4" /> Volver a conversaciones
      </Link>

      <h1 class="font-display text-primary-900 mt-3 text-xl font-bold">
        Conversación
      </h1>
      <p class="font-mono text-xs text-slate-400">{data.value.id}</p>

      <div class="mt-6 space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
        {data.value.messages.length === 0 ? (
          <p class="py-10 text-center text-sm text-slate-400">
            Esta conversación no tiene mensajes.
          </p>
        ) : (
          data.value.messages.map((m) => (
            <div
              key={m.id}
              class={[
                "flex w-full",
                m.role === "user" ? "justify-end" : "justify-start",
              ]}
            >
              <div
                class={[
                  "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line shadow-sm",
                  m.role === "user"
                    ? "bg-primary-900 rounded-br-none text-white"
                    : "rounded-bl-none border border-slate-200 bg-white text-slate-700",
                ]}
              >
                {m.content}
                <div
                  class={[
                    "mt-1 text-[10px]",
                    m.role === "user" ? "text-white/50" : "text-slate-400",
                  ]}
                >
                  {new Date(m.createdAt).toLocaleString("es-AR")}
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
  title: "Conversación — BioBal Admin",
  meta: [{ name: "robots", content: "noindex, nofollow" }],
};
