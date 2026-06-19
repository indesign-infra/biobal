import {
  component$,
  useStore,
  $,
  useVisibleTask$,
  useSignal,
} from "@builder.io/qwik";
import { LuMessageCircle, LuX, LuSend } from "@qwikest/icons/lucide";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

type ChatbotProps = {
  initialGreeting?: string;
};

export const Chatbot = component$<ChatbotProps>(({ initialGreeting }) => {
  const state = useStore({
    isOpen: false,
    isLoading: false,
    messages: [
      {
        role: "assistant",
        content:
          initialGreeting ||
          "¡Hola! Soy el asistente virtual de BioBal. Puedo contarte sobre el alquiler de consultorios, las especialidades y los servicios. ¿En qué te ayudo?",
      },
    ] as Message[],
    sessionId: "",
  });

  const inputValue = useSignal("");
  const messagesRef = useSignal<HTMLDivElement>();

  // El sessionId se resuelve recién en la primera interacción (no en carga),
  // así el chatbot no fuerza hidratación temprana y se mantiene la resumability.
  const ensureSessionId = $(() => {
    if (state.sessionId) return state.sessionId;
    let sId = sessionStorage.getItem("biobal_chat_session");
    if (!sId) {
      sId =
        "sess-" +
        Date.now().toString() +
        Math.random().toString(36).substring(2, 9);
      sessionStorage.setItem("biobal_chat_session", sId);
    }
    state.sessionId = sId;
    return sId;
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    track(() => state.messages.length);
    track(() => state.isLoading);
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight;
    }
  });

  const sendMessage = $(async () => {
    if (!inputValue.value.trim() || state.isLoading) return;
    const userMsg = inputValue.value.trim();
    inputValue.value = "";
    state.messages.push({ role: "user", content: userMsg });
    state.isLoading = true;

    try {
      const sessionId = await ensureSessionId();
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: state.messages.slice(-6),
          sessionId,
        }),
      });
      if (!response.ok) throw new Error("conexión");
      const data = await response.json();
      state.messages.push(
        data.reply || {
          role: "assistant",
          content: "Ocurrió un error, probá de nuevo en un momento.",
        },
      );
    } catch (error) {
      console.error("chat error:", error);
      state.messages.push({
        role: "assistant",
        content:
          "No pude conectarme al servidor. Probá de nuevo o escribinos por WhatsApp.",
      });
    } finally {
      state.isLoading = false;
    }
  });

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick$={() => (state.isOpen = !state.isOpen)}
        class={[
          "fixed right-5 bottom-5 z-50 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl transition-all duration-300 hover:scale-105 active:scale-95",
          state.isOpen
            ? "bg-primary-800"
            : "from-primary-800 to-accent-500 bg-linear-to-tr",
        ]}
        aria-label="Abrir asistente virtual"
      >
        {state.isOpen ? (
          <LuX class="h-6 w-6" />
        ) : (
          <LuMessageCircle class="h-7 w-7" />
        )}
      </button>

      {/* Ventana */}
      {state.isOpen && (
        <div class="fixed right-4 bottom-24 z-50 flex h-[32rem] max-h-[75vh] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:right-6 sm:w-96">
          {/* Header */}
          <div class="bg-primary-900 flex items-center justify-between p-4 text-white">
            <div class="flex items-center gap-3">
              <div class="relative">
                <div class="bg-accent-500 flex h-9 w-9 items-center justify-center rounded-full">
                  <LuMessageCircle class="h-5 w-5" />
                </div>
                <span class="border-primary-900 absolute right-0 bottom-0 h-3 w-3 animate-pulse rounded-full border-2 bg-green-500" />
              </div>
              <div>
                <h3 class="font-display text-accent-300 text-sm font-bold tracking-wide uppercase">
                  Asistente BioBal
                </h3>
                <p class="text-[10px] tracking-wider text-slate-300 uppercase">
                  En línea
                </p>
              </div>
            </div>
            <button
              onClick$={() => (state.isOpen = false)}
              class="text-slate-300 transition-colors hover:text-white"
              aria-label="Cerrar"
            >
              <LuX class="h-5 w-5" />
            </button>
          </div>

          {/* Mensajes */}
          <div
            ref={messagesRef}
            class="flex flex-1 flex-col space-y-3 overflow-y-auto bg-slate-50/60 p-4"
          >
            {state.messages.map((msg, i) => (
              <div
                key={i}
                class={[
                  "flex w-full",
                  msg.role === "user" ? "justify-end" : "justify-start",
                ]}
              >
                <div
                  class={[
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line shadow-sm",
                    msg.role === "user"
                      ? "bg-primary-900 rounded-br-none text-white"
                      : "rounded-bl-none border border-slate-200 bg-white text-slate-700",
                  ]}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {state.isLoading && (
              <div class="flex justify-start">
                <div class="flex items-center gap-1.5 rounded-2xl rounded-bl-none border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <span class="bg-accent-500 h-1.5 w-1.5 animate-bounce rounded-full" />
                  <span class="bg-accent-500 h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:-0.15s]" />
                  <span class="bg-accent-500 h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:-0.3s]" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div class="border-t border-slate-100 bg-white p-3">
            <form
              preventdefault:submit
              onSubmit$={sendMessage}
              class="flex gap-2"
            >
              <input
                type="text"
                bind:value={inputValue}
                placeholder="Escribí tu consulta..."
                disabled={state.isLoading}
                class="focus:border-accent-400 flex-1 rounded-xl border border-transparent bg-slate-100 px-4 py-2.5 text-sm transition-all outline-none focus:bg-white"
              />
              <button
                type="submit"
                disabled={!inputValue.value.trim() || state.isLoading}
                class="bg-primary-900 text-accent-300 flex items-center justify-center rounded-xl p-2.5 transition-all active:scale-95 disabled:bg-slate-200 disabled:text-slate-400"
                aria-label="Enviar"
              >
                <LuSend class="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
});
