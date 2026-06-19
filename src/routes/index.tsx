import { component$ } from "@builder.io/qwik";
import {
  routeAction$,
  zod$,
  z,
  type DocumentHead,
} from "@builder.io/qwik-city";
import { routeLoader$ } from "@builder.io/qwik-city";
import { nanoid } from "nanoid";
import { asc, desc, eq } from "drizzle-orm";
import { getDb, schema } from "~/db";
import { site } from "~/lib/site";

import { Hero } from "~/components/sections/hero";
import { SobreBioBal } from "~/components/sections/sobre-biobal";
import { BioBanco } from "~/components/sections/bio-banco";
import { Consultorios } from "~/components/sections/consultorios";
import { Infraestructura } from "~/components/sections/infraestructura";
import { ExperienciaPaciente } from "~/components/sections/experiencia-paciente";
import { Reels } from "~/components/sections/reels";
import { InstagramFeed } from "~/components/sections/instagram-feed";
import { PorQue } from "~/components/sections/por-que";
import { Contacto } from "~/components/sections/contacto";

/** Carga el contenido dinámico de la home (reels activos, posts de Instagram). */
export const useHomeContent = routeLoader$(async ({ env }) => {
  try {
    const db = getDb(env);
    const [videos, instagramPosts] = await Promise.all([
      db
        .select()
        .from(schema.verticalVideos)
        .where(eq(schema.verticalVideos.isActive, 1))
        .orderBy(asc(schema.verticalVideos.displayOrder)),
      db
        .select()
        .from(schema.instagramPosts)
        .orderBy(desc(schema.instagramPosts.timestamp))
        .limit(12),
    ]);
    return { videos, instagramPosts };
  } catch (error) {
    console.error("home content loader error:", error);
    return { videos: [], instagramPosts: [] };
  }
});

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
  const home = useHomeContent();

  return (
    <>
      <Hero />
      <SobreBioBal />
      <BioBanco />
      <Consultorios />
      <Infraestructura />
      <ExperienciaPaciente />
      <Reels videos={home.value.videos} />
      <PorQue />
      <InstagramFeed posts={home.value.instagramPosts} />
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
