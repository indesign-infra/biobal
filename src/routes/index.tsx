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
import { rateLimit, clientIp } from "~/lib/rate-limit";

import { Hero } from "~/components/sections/hero";
import { SobreBioBal } from "~/components/sections/sobre-biobal";
import { BioBanco } from "~/components/sections/bio-banco";
import { Consultorios } from "~/components/sections/consultorios";
import { Infraestructura } from "~/components/sections/infraestructura";
import { ExperienciaPaciente } from "~/components/sections/experiencia-paciente";
import { Reels } from "~/components/sections/reels";
import { Galeria } from "~/components/sections/galeria";
import { InstagramFeed } from "~/components/sections/instagram-feed";
import { PorQue } from "~/components/sections/por-que";
import { Contacto } from "~/components/sections/contacto";

/** Carga el contenido dinámico de la home (secciones, reels, galería, Instagram). */
export const useHomeContent = routeLoader$(async ({ env, cacheControl }) => {
  // Cacheamos el HTML en el CDN de Vercel: el contenido es global (no por usuario),
  // así casi no se toca Turso y baja muchísimo el TTFB. Los cambios del admin se
  // reflejan en ~60s (o vía stale-while-revalidate mientras se revalida).
  cacheControl({
    public: true,
    maxAge: 30,
    sMaxAge: 60,
    staleWhileRevalidate: 60 * 60 * 24,
  });
  try {
    const db = getDb(env);
    const [sectionRows, videos, photos, instagramPosts] = await Promise.all([
      db.select().from(schema.sections),
      db
        .select()
        .from(schema.verticalVideos)
        .where(eq(schema.verticalVideos.isActive, 1))
        .orderBy(asc(schema.verticalVideos.displayOrder)),
      db
        .select()
        .from(schema.galeria)
        .orderBy(asc(schema.galeria.displayOrder)),
      db
        .select()
        .from(schema.instagramPosts)
        .orderBy(desc(schema.instagramPosts.timestamp))
        .limit(12),
    ]);
    const sections: Record<string, schema.Section> = {};
    for (const s of sectionRows) sections[s.id] = s;
    return { sections, videos, photos, instagramPosts };
  } catch (error) {
    console.error("home content loader error:", error);
    return {
      sections: {} as Record<string, schema.Section>,
      videos: [],
      photos: [],
      instagramPosts: [],
    };
  }
});

/**
 * Acción server-side que valida con Zod y guarda el lead en la base.
 * Incluye honeypot anti-bots y rate limit por IP.
 */
export const useCreateLead = routeAction$(
  async (data, { fail, env, request }) => {
    // Honeypot: si el campo oculto vino completo, es un bot. Respondemos "ok"
    // sin guardar nada para no darle pistas.
    if (data.website && data.website.trim() !== "") {
      return { success: true };
    }

    // Rate limit: máx. 5 envíos por IP cada minuto.
    if (!rateLimit(`lead:${clientIp(request)}`, 5, 60 * 1000)) {
      return fail(429, {
        message:
          "Recibimos varios envíos. Esperá un momento e intentá de nuevo.",
      });
    }

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
    // Honeypot: debe quedar vacío (los humanos no lo ven).
    website: z.string().optional(),
  }),
);

export default component$(() => {
  const createLead = useCreateLead();
  const home = useHomeContent();
  const s = home.value.sections;
  // Una sección se muestra salvo que esté explícitamente desactivada.
  // (enabled puede venir como boolean o como 0/1 según el driver.)
  const on = (id: string) => {
    const e = s[id]?.enabled;
    return e === undefined || e === null ? true : Boolean(e);
  };

  return (
    <>
      {on("hero") && <Hero content={s["hero"]} />}
      {on("sobre") && <SobreBioBal content={s["sobre"]} />}
      {on("bio-banco") && <BioBanco content={s["bio-banco"]} />}
      {on("consultorios") && <Consultorios content={s["consultorios"]} />}
      {on("infraestructura") && (
        <Infraestructura content={s["infraestructura"]} />
      )}
      {on("experiencia") && <ExperienciaPaciente content={s["experiencia"]} />}
      {on("reels") && <Reels videos={home.value.videos} content={s["reels"]} />}
      {on("galeria") && (
        <Galeria photos={home.value.photos} content={s["galeria"]} />
      )}
      {on("por-que") && <PorQue content={s["por-que"]} />}
      {on("instagram") && (
        <InstagramFeed
          posts={home.value.instagramPosts}
          content={s["instagram"]}
        />
      )}
      {on("contacto") && (
        <Contacto action={createLead} content={s["contacto"]} />
      )}
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
