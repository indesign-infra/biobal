import { component$ } from "@builder.io/qwik";
import { routeLoader$, Link } from "@builder.io/qwik-city";
import type { DocumentHead } from "@builder.io/qwik-city";
import { getDb, schema } from "~/db";
import { desc, eq } from "drizzle-orm";
import {
  LuInbox,
  LuClapperboard,
  LuInstagram,
  LuMessageSquare,
  LuArrowRight,
} from "@qwikest/icons/lucide";

export const useDashboard = routeLoader$(async ({ env }) => {
  try {
    const db = getDb(env);
    const [leadsRows, nuevos, videos, igPosts, sessions] = await Promise.all([
      db.select({ id: schema.leads.id }).from(schema.leads),
      db
        .select({ id: schema.leads.id })
        .from(schema.leads)
        .where(eq(schema.leads.estado, "nuevo")),
      db.select({ id: schema.verticalVideos.id }).from(schema.verticalVideos),
      db.select({ id: schema.instagramPosts.id }).from(schema.instagramPosts),
      db.select({ id: schema.chatSessions.id }).from(schema.chatSessions),
    ]);

    const ultimosLeads = await db
      .select()
      .from(schema.leads)
      .orderBy(desc(schema.leads.createdAt))
      .limit(5);

    return {
      totalLeads: leadsRows.length,
      leadsNuevos: nuevos.length,
      totalVideos: videos.length,
      totalIg: igPosts.length,
      totalSesiones: sessions.length,
      ultimosLeads,
    };
  } catch (error) {
    console.error("dashboard loader error:", error);
    return {
      totalLeads: 0,
      leadsNuevos: 0,
      totalVideos: 0,
      totalIg: 0,
      totalSesiones: 0,
      ultimosLeads: [],
    };
  }
});

export default component$(() => {
  const data = useDashboard();
  const d = data.value;

  const cards = [
    {
      label: "Leads totales",
      value: d.totalLeads,
      sub: `${d.leadsNuevos} sin contactar`,
      Icon: LuInbox,
      href: "/admin/leads",
    },
    {
      label: "Conversaciones IA",
      value: d.totalSesiones,
      sub: "sesiones de chat",
      Icon: LuMessageSquare,
      href: "/admin/chats",
    },
    {
      label: "Reels",
      value: d.totalVideos,
      sub: "videos cargados",
      Icon: LuClapperboard,
      href: "/admin/videos-verticales",
    },
    {
      label: "Posts de Instagram",
      value: d.totalIg,
      sub: "en caché",
      Icon: LuInstagram,
      href: "/admin/instagram",
    },
  ];

  return (
    <div>
      <h1 class="font-display text-primary-900 text-2xl font-bold">Dashboard</h1>
      <p class="mt-1 text-sm text-slate-500">
        Resumen de la actividad de BioBal.
      </p>

      <div class="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            class="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div class="flex items-center justify-between">
              <span class="bg-accent-50 text-accent-600 inline-flex h-11 w-11 items-center justify-center rounded-xl">
                <c.Icon class="h-5 w-5" />
              </span>
              <LuArrowRight class="h-4 w-4 text-slate-300 transition-colors group-hover:text-slate-500" />
            </div>
            <p class="text-primary-900 mt-4 text-3xl font-bold">{c.value}</p>
            <p class="text-primary-900 mt-1 text-sm font-semibold">{c.label}</p>
            <p class="text-xs text-slate-400">{c.sub}</p>
          </Link>
        ))}
      </div>

      <div class="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <h2 class="font-display text-primary-900 text-lg font-semibold">
            Últimos leads
          </h2>
          <Link
            href="/admin/leads"
            class="text-accent-600 hover:text-accent-700 text-sm font-medium"
          >
            Ver todos
          </Link>
        </div>
        {d.ultimosLeads.length === 0 ? (
          <p class="mt-4 text-sm text-slate-400">Todavía no hay leads.</p>
        ) : (
          <ul class="mt-4 divide-y divide-slate-100">
            {d.ultimosLeads.map((l) => (
              <li key={l.id} class="flex items-center justify-between py-3">
                <div>
                  <p class="text-primary-900 text-sm font-medium">{l.nombre}</p>
                  <p class="text-xs text-slate-400">
                    {l.especialidad || "Sin especialidad"} · {l.email}
                  </p>
                </div>
                <span class="text-xs text-slate-400">{l.createdAt}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Dashboard — BioBal Admin",
  meta: [{ name: "robots", content: "noindex, nofollow" }],
};
