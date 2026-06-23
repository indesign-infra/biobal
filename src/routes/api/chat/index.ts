import type { RequestHandler } from "@builder.io/qwik-city";
import { getDb, schema } from "~/db";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import OpenAI from "openai";
import { rateLimit, clientIp } from "~/lib/rate-limit";

const MAX_MESSAGES = 16;
const MAX_CONTENT_LEN = 2000;

// Respuestas por palabras clave (fallback si no hay OPENAI_API_KEY).
function getFallback(userMessage: string): string {
  const t = userMessage.toLowerCase().trim();

  if (
    t.includes("precio") ||
    t.includes("costo") ||
    t.includes("cuanto") ||
    t.includes("cuánto") ||
    t.includes("tarifa") ||
    t.includes("valor") ||
    t.includes("alquiler") ||
    t.includes("modulo") ||
    t.includes("módulo")
  ) {
    return "💼 El alquiler de consultorios en BioBal es flexible: por módulo de 4 hs, por día o por mes, según tu necesidad. Para pasarte valores actualizados y disponibilidad, dejanos tus datos en el formulario de contacto o escribinos por WhatsApp al 11 2758-5392.";
  }
  if (
    t.includes("consultorio") ||
    t.includes("espacio") ||
    t.includes("oficina") ||
    t.includes("disponib")
  ) {
    return "🏢 Ofrecemos consultorios modernos, climatizados y luminosos en Small Center Las Piedras (Piso 2, Of. 202), adaptables a cada especialidad, con sala de espera, Wi-Fi y estacionamiento. ¿Querés coordinar una visita? Te esperamos.";
  }
  if (
    t.includes("especialidad") ||
    t.includes("medico") ||
    t.includes("médico") ||
    t.includes("psicolog") ||
    t.includes("kinesiolog") ||
    t.includes("odontolog") ||
    t.includes("nutricion") ||
    t.includes("nutrición")
  ) {
    return "🩺 Los consultorios de BioBal son ideales para múltiples especialidades: odontología, psicología, kinesiología, ginecología, clínica médica, nutrición, cardiología, pediatría, fonoaudiología y más. Cada espacio se adapta a tu actividad.";
  }
  if (
    t.includes("ubicac") ||
    t.includes("direccion") ||
    t.includes("dirección") ||
    t.includes("donde") ||
    t.includes("dónde") ||
    t.includes("como llego") ||
    t.includes("mapa")
  ) {
    return "📍 Estamos en Small Center Las Piedras — Piso 2, Oficina 202 (Golfers G. C. 2972), Las Piedras, Buenos Aires. Excelente accesibilidad y estacionamiento gratuito.";
  }
  if (
    t.includes("contacto") ||
    t.includes("telefono") ||
    t.includes("teléfono") ||
    t.includes("whatsapp") ||
    t.includes("turno") ||
    t.includes("visita") ||
    t.includes("hablar")
  ) {
    return "📞 Podés escribirnos por WhatsApp al 11 2758-5392, seguirnos en Instagram @biobal_consultorios, o completar el formulario de contacto del sitio. ¡Coordinamos tu visita enseguida!";
  }
  if (
    t.includes("hola") ||
    t.includes("buen") ||
    t.includes("que tal") ||
    t.includes("qué tal")
  ) {
    return "👋 ¡Hola! Soy el asistente de BioBal. Puedo ayudarte con el alquiler de consultorios, las especialidades, la ubicación o cómo coordinar una visita. ¿Qué te gustaría saber?";
  }

  return (
    "🤖 Puedo ayudarte con información sobre BioBal. Contame si te interesa:\n\n" +
    "• 🏢 Alquiler de *consultorios* (módulos, día o mes)\n" +
    "• 🩺 *Especialidades* que pueden atender\n" +
    "• 📍 *Ubicación* y accesos\n" +
    "• 📞 Cómo *coordinar una visita*"
  );
}

export const onPost: RequestHandler = async ({ request, json, env }) => {
  try {
    // Rate limit: 12 mensajes/min por IP (anti-abuso de costo de OpenAI y DB).
    if (!rateLimit(`chat:${clientIp(request)}`, 12, 60 * 1000)) {
      json(429, {
        error: "Estás enviando mensajes muy rápido. Esperá unos segundos.",
      });
      return;
    }

    const body = await request.json();
    const { messages, sessionId } = body;

    if (!messages || !Array.isArray(messages) || !sessionId) {
      json(400, { error: "Faltan campos requeridos: messages y sessionId" });
      return;
    }
    // Validación de entrada: tamaños acotados y sessionId con forma esperada.
    if (
      typeof sessionId !== "string" ||
      sessionId.length > 80 ||
      !/^sess-[A-Za-z0-9]+$/.test(sessionId)
    ) {
      json(400, { error: "sessionId inválido" });
      return;
    }
    if (messages.length === 0 || messages.length > MAX_MESSAGES) {
      json(400, { error: "Cantidad de mensajes fuera de rango" });
      return;
    }
    // Normalizamos: descartamos roles 'system' entrantes y recortamos contenido.
    const safeMessages = messages
      .filter(
        (m: { role?: string; content?: string }) =>
          (m?.role === "user" || m?.role === "assistant") &&
          typeof m.content === "string",
      )
      .map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content.slice(0, MAX_CONTENT_LEN),
      }));

    const lastUserMessage = safeMessages[safeMessages.length - 1];
    if (!lastUserMessage || lastUserMessage.role !== "user") {
      json(400, { error: "El último mensaje debe ser del usuario" });
      return;
    }

    const db = getDb(env);
    const now = new Date().toISOString();

    const [settings] = await db
      .select()
      .from(schema.chatbotSettings)
      .where(eq(schema.chatbotSettings.id, 1))
      .limit(1);

    if (settings && settings.activo === false) {
      json(403, { error: "El asistente está deshabilitado temporalmente." });
      return;
    }

    // Sesión de chat
    const [existing] = await db
      .select()
      .from(schema.chatSessions)
      .where(eq(schema.chatSessions.id, sessionId))
      .limit(1);
    if (!existing) {
      await db
        .insert(schema.chatSessions)
        .values({ id: sessionId, createdAt: now, lastActive: now });
    } else {
      await db
        .update(schema.chatSessions)
        .set({ lastActive: now })
        .where(eq(schema.chatSessions.id, sessionId));
    }

    // Guardar mensaje del usuario
    await db.insert(schema.chatMessages).values({
      id: "msg-" + nanoid(),
      sessionId,
      role: "user",
      content: lastUserMessage.content,
      createdAt: now,
    });

    // Respuesta: OpenAI o fallback
    let botReply = "";
    const openaiApiKey =
      env.get("OPENAI_API_KEY") || import.meta.env.OPENAI_API_KEY;

    if (openaiApiKey) {
      const openai = new OpenAI({ apiKey: openaiApiKey });
      const systemPrompt = `Eres ${settings?.nombre || "el Asistente BioBal"}, el asistente virtual oficial de BioBal — Espacio Integral de Salud.

TONO: ${settings?.tono || "Amigable, profesional y servicial"}.
${settings?.instrucciones || "1. Trato neutro e inclusivo: nunca asumas el género del usuario.\n2. Cero invención: si te preguntan algo que no sabés, decilo con honestidad e invitá a dejar una consulta."}

CONOCIMIENTO DE BIOBAL:
${
  settings?.conocimiento ||
  `- BioBal es un espacio integral de salud en el complejo Small Center Las Piedras (Piso 2, Oficina 202), Golfers G. C. 2972, Las Piedras, Buenos Aires.
- Alquila consultorios profesionales modernos, climatizados y luminosos, por módulo de 4 hs, por día o por mes, adaptables a cada especialidad.
- Servicios: sala de espera, Wi-Fi, luz natural, aire acondicionado central, estacionamiento gratuito, seguridad y limpieza.
- Especialidades: odontología, psicología, kinesiología, ginecología, clínica médica, nutrición, cardiología, pediatría, fonoaudiología y más.
- Referente: Lic. Mónica Álvarez (Bióloga).`
}

LLAMADO A LA ACCIÓN:
${settings?.cta || "Para coordinar una visita o más información, escribinos por WhatsApp:"} ${settings?.whatsapp || "5491127585392"} · Instagram: @biobal_consultorios`;

      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            ...safeMessages.map((m) => ({
              role: m.role,
              content: m.content || "",
            })),
          ],
          max_tokens: 350,
          temperature: 0.5,
        });
        botReply =
          completion.choices[0]?.message?.content ||
          getFallback(lastUserMessage.content);
      } catch (e) {
        console.error("OpenAI error, usando fallback:", e);
        botReply = getFallback(lastUserMessage.content);
      }
    } else {
      botReply = getFallback(lastUserMessage.content);
    }

    // Guardar respuesta del bot
    await db.insert(schema.chatMessages).values({
      id: "msg-" + nanoid(),
      sessionId,
      role: "assistant",
      content: botReply,
      createdAt: new Date().toISOString(),
    });

    json(200, { reply: { role: "assistant", content: botReply } });
  } catch (error) {
    console.error("Error en /api/chat:", error);
    json(500, { error: "Error interno del servidor. Reintentá más tarde." });
  }
};
