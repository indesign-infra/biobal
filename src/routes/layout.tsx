import { component$, Slot } from "@builder.io/qwik";
import { routeLoader$, useLocation } from "@builder.io/qwik-city";
import { and, asc, eq } from "drizzle-orm";
import { getDb, schema } from "~/db";
import { site } from "~/lib/site";
import { Header } from "~/components/layout/header";
import { Footer } from "~/components/layout/footer";
import { Chatbot } from "~/components/chatbot/chatbot";

/** Datos del negocio (DB sobre defaults de site.ts). Lo usan header, footer y contacto. */
export const useSiteSettings = routeLoader$(async ({ env }) => {
  const defaults: Record<string, string> = {
    tagline: site.tagline,
    phoneDisplay: site.phone.display,
    phoneTel: site.phone.tel,
    whatsapp: "5491127585392",
    instagramHandle: site.instagram.handle,
    instagramUrl: site.instagram.url,
    addressLine1: site.address.line1,
    addressLine2: site.address.line2,
    mapsUrl: site.address.maps,
    email: "",
    referente: site.referente,
  };
  try {
    const db = getDb(env);
    const [s] = await db
      .select()
      .from(schema.siteSettings)
      .where(eq(schema.siteSettings.id, 1))
      .limit(1);
    const merged = { ...defaults };
    if (s) {
      for (const k of Object.keys(defaults)) {
        const v = (s as Record<string, unknown>)[k];
        if (v != null && v !== "") merged[k] = String(v);
      }
    }
    return merged;
  } catch (error) {
    console.error("site settings loader error:", error);
    return defaults;
  }
});

/** Secciones que van en la navegación del header (habilitadas + inNav). */
export const useNavSections = routeLoader$(async ({ env }) => {
  try {
    const db = getDb(env);
    const rows = await db
      .select({
        id: schema.sections.id,
        navLabel: schema.sections.navLabel,
      })
      .from(schema.sections)
      .where(
        and(eq(schema.sections.enabled, true), eq(schema.sections.inNav, true)),
      )
      .orderBy(asc(schema.sections.displayOrder));
    return rows.map((r) => ({ href: `#${r.id}`, label: r.navLabel ?? r.id }));
  } catch (error) {
    console.error("nav sections loader error:", error);
    return [];
  }
});

export default component$(() => {
  const location = useLocation();
  const isAdmin = location.url.pathname.startsWith("/admin");

  if (isAdmin) {
    return <Slot />;
  }

  return (
    <>
      <Header />
      <main id="inicio">
        <Slot />
      </main>
      <Footer />
      <Chatbot />
    </>
  );
});
