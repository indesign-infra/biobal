/* eslint-disable qwik/jsx-img -- logo SVG de marca desde public/, compartido con brand.tsx */
import { component$, Slot } from "@builder.io/qwik";
import { Link, useLocation, routeLoader$ } from "@builder.io/qwik-city";
import type { RequestHandler } from "@builder.io/qwik-city";
import { getDb } from "~/db";
import { users } from "~/db/schema";
import { eq } from "drizzle-orm";
import { verifySessionToken, SESSION_COOKIE } from "~/lib/auth";
import {
  LuLayoutDashboard,
  LuInbox,
  LuMessageSquare,
  LuClapperboard,
  LuImage,
  LuInstagram,
  LuLayoutPanelTop,
  LuBuilding2,
  LuShieldCheck,
  LuLogOut,
} from "@qwikest/icons/lucide";

// Barrera de seguridad: corre en el servidor antes de renderizar.
// Valida la firma HMAC de la cookie (no se puede falsificar sin AUTH_SECRET).
export const onRequest: RequestHandler = async ({
  cookie,
  url,
  redirect,
  env,
}) => {
  const currentPath = url.pathname.replace(/\/$/, "");
  const isLoginPage = currentPath === "/admin/login";
  const userId = await verifySessionToken(
    env,
    cookie.get(SESSION_COOKIE)?.value,
  );
  const hasValidSession = userId !== null;

  if (!hasValidSession && !isLoginPage) {
    throw redirect(302, "/admin/login/");
  }
  if (hasValidSession && isLoginPage) {
    throw redirect(302, "/admin/");
  }
};

export const useAdminUser = routeLoader$(async ({ cookie, env }) => {
  const userId = await verifySessionToken(
    env,
    cookie.get(SESSION_COOKIE)?.value,
  );
  if (userId === null) return null;
  try {
    const db = getDb(env);
    const [user] = await db
      .select({ username: users.username })
      .from(users)
      .where(eq(users.id, userId));
    return user ? user.username : null;
  } catch (error) {
    console.error("Error in useAdminUser:", error);
    return null;
  }
});

const navLinks = [
  { href: "/admin", label: "Dashboard", Icon: LuLayoutDashboard },
  {
    href: "/admin/secciones",
    label: "Secciones y contenido",
    Icon: LuLayoutPanelTop,
  },
  { href: "/admin/negocio", label: "Datos del negocio", Icon: LuBuilding2 },
  { href: "/admin/leads", label: "Leads recibidos", Icon: LuInbox },
  { href: "/admin/chats", label: "Chatbot IA", Icon: LuMessageSquare },
  { href: "/admin/videos-verticales", label: "Reels", Icon: LuClapperboard },
  { href: "/admin/galeria", label: "Galería", Icon: LuImage },
  { href: "/admin/instagram", label: "Instagram", Icon: LuInstagram },
  {
    href: "/admin/administradores",
    label: "Administradores",
    Icon: LuShieldCheck,
  },
];

export default component$(() => {
  const location = useLocation();
  const adminUser = useAdminUser();

  const isLoginPage = location.url.pathname.startsWith("/admin/login");
  if (isLoginPage) {
    return <Slot />;
  }

  return (
    <div class="flex min-h-screen bg-slate-100 font-sans">
      {/* Sidebar */}
      <aside class="bg-primary-950 fixed top-0 left-0 z-40 flex min-h-screen w-64 flex-col text-white shadow-2xl">
        <div class="flex items-center gap-3 border-b border-white/10 px-6 py-5">
          <img
            src="/brand/biobal-horizontal.svg"
            alt="BioBal"
            width={310}
            height={102}
            class="h-7 w-auto brightness-0 invert"
          />
          <span class="bg-accent-500/20 text-accent-300 rounded-md px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase">
            Admin
          </span>
        </div>

        <nav class="flex-1 space-y-1.5 overflow-y-auto px-3 py-6">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/admin"
                ? location.url.pathname === "/admin" ||
                  location.url.pathname === "/admin/"
                : location.url.pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                class={[
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-accent-500 font-semibold text-white shadow-md"
                    : "text-primary-200/80 hover:bg-white/5 hover:text-white",
                ]}
              >
                <link.Icon class="h-5 w-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div class="bg-primary-900/40 border-t border-white/10 px-6 py-4">
          <Link
            href="/admin/logout"
            prefetch={false}
            class="text-primary-200/70 flex items-center gap-2 text-xs font-medium transition-colors hover:text-red-400"
          >
            <LuLogOut class="h-4 w-4" />
            Cerrar sesión
          </Link>
          <p class="mt-2 text-[10px] text-white/30">BioBal · Panel v1.0</p>
        </div>
      </aside>

      {/* Contenido */}
      <main class="ml-64 min-h-screen flex-1">
        <header class="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-8 py-4 shadow-sm">
          <nav class="flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-400 uppercase">
            <span>BioBal</span>
            <span class="text-slate-300">/</span>
            <span class="text-primary-900">
              {location.url.pathname.replace("/admin", "").replace(/\//g, "") ||
                "Dashboard"}
            </span>
          </nav>
          <div class="flex items-center gap-3">
            <div class="bg-primary-900 text-accent-300 flex h-9 w-9 items-center justify-center rounded-full">
              <span class="text-xs font-bold uppercase">
                {adminUser.value ? adminUser.value.charAt(0) : "A"}
              </span>
            </div>
            <div class="leading-none">
              <p class="text-xs font-semibold tracking-widest text-slate-400 uppercase">
                Usuario
              </p>
              <p class="text-primary-900 mt-0.5 text-sm font-bold capitalize">
                {adminUser.value || "Administrador"}
              </p>
            </div>
          </div>
        </header>

        <div class="p-8">
          <Slot />
        </div>
      </main>
    </div>
  );
});
