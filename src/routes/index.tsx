import { component$ } from "@builder.io/qwik";
import {
  routeAction$,
  zod$,
  z,
  type DocumentHead,
} from "@builder.io/qwik-city";
import { nanoid } from "nanoid";
import { getDb, schema } from "~/db";
import { site } from "~/lib/site";

import { Hero } from "~/components/sections/hero";
import { SobreBioBal } from "~/components/sections/sobre-biobal";
import { BioBanco } from "~/components/sections/bio-banco";
import { Consultorios } from "~/components/sections/consultorios";
import { Infraestructura } from "~/components/sections/infraestructura";
import { ExperienciaPaciente } from "~/components/sections/experiencia-paciente";
import { PorQue } from "~/components/sections/por-que";
import { Contacto } from "~/components/sections/contacto";

/**
 * Acción server-side que valida con Zod y guarda el lead en Supabase.
 * Si las variables de entorno no están configuradas, `getSupabaseClient()`
 * devuelve null y respondemos con un error controlado (no rompe el build).
 */
export const useCreateLead = routeAction$(
  async (data, { fail, env }) => {
    try {
      const db = getDb(env);
      await db.insert(schema.leads).values({
        id: "lead-" + nanoid(),
        nombre: data.nombre,
        email: data.email,
        telefono: data.telefono,
        especialidad: data.especialidad || null,
        mensaje: data.mensaje || null,
      });
      return { success: true };
    } catch (error) {
      console.error("[leads] insert error:", error);
      return fail(500, {
        message:
          "No pudimos enviar tu consulta. Probá de nuevo en unos minutos o escribinos por Instagram.",
      });
    }
  },
  zod$({
    nombre: z.string().trim().min(2, "Ingresá tu nombre."),
    email: z.string().trim().email("Ingresá un email válido."),
    telefono: z.string().trim().min(6, "Ingresá un teléfono de contacto."),
    especialidad: z.string().optional(),
    mensaje: z.string().max(1000, "El mensaje es demasiado largo.").optional(),
  }),
);

export default component$(() => {
  const createLead = useCreateLead();

  return (
    <>
      <Hero />
      <SobreBioBal />
      <BioBanco />
      <Consultorios />
      <Infraestructura />
      <ExperienciaPaciente />
      <PorQue />
      <Contacto action={createLead} />
    </>
  );
});

const description =
  "Espacio integral de salud y alquiler de consultorios profesionales en Small Center Las Piedras, Buenos Aires. Infraestructura de calidad y servicios pensados para profesionales de la salud.";

export const head: DocumentHead = {
  title:
    "BioBal — Consultorios Profesionales | Espacio Integral de Salud, Las Piedras",
  meta: [
    { name: "description", content: description },
    { property: "og:type", content: "website" },
    {
      property: "og:title",
      content: "BioBal — Espacio Integral de Salud, Las Piedras",
    },
    { property: "og:description", content: description },
    // TODO: imagen real — subir /og-image.jpg (1200×630) a /public
    { property: "og:image", content: `${site.url}/og-image.jpg` },
    { property: "og:url", content: site.url },
    { property: "og:locale", content: "es_AR" },
    { property: "og:site_name", content: site.name },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "theme-color", content: "#0e2a47" },
  ],
  links: [{ rel: "canonical", href: site.url }],
};
