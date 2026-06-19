import { component$ } from "@builder.io/qwik";
import { routeAction$, zod$, z, Link, Form } from "@builder.io/qwik-city";
import type { DocumentHead } from "@builder.io/qwik-city";
import { getDb } from "~/db";
import { users } from "~/db/schema";
import { eq } from "drizzle-orm";
import {
  hashPassword,
  verifyPassword,
  isHashedPassword,
  createSessionToken,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
} from "~/lib/auth";
import { rateLimit, clientIp } from "~/lib/rate-limit";

export const useLoginAction = routeAction$(
  async ({ username, password }, { cookie, redirect, env, request, fail }) => {
    // Anti fuerza-bruta: máx. 10 intentos por IP cada 5 minutos.
    if (!rateLimit(`login:${clientIp(request)}`, 10, 5 * 60 * 1000)) {
      return fail(429, {
        error: "Demasiados intentos. Esperá unos minutos y volvé a probar.",
      });
    }

    const db = getDb(env);

    // Auto-seed del admin sólo si no hay usuarios. La contraseña se toma de
    // ADMIN_PASSWORD (recomendado) y SIEMPRE se guarda hasheada.
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length === 0) {
      const seedUser = (env.get("ADMIN_USERNAME") || "admin").toLowerCase();
      const seedPass = env.get("ADMIN_PASSWORD") || "biobal2026";
      if (!env.get("ADMIN_PASSWORD")) {
        console.warn(
          "[auth] Sembrando admin con contraseña por defecto. Configurá ADMIN_PASSWORD y cambiala.",
        );
      }
      await db.insert(users).values({
        username: seedUser,
        password: await hashPassword(seedPass),
        role: "owner",
      });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username.trim().toLowerCase()))
      .limit(1);

    // Verificación. Soporta migración de contraseñas legacy en texto plano:
    // si coinciden, se re-guardan hasheadas en el primer login.
    let ok = false;
    if (user) {
      if (isHashedPassword(user.password)) {
        ok = await verifyPassword(password, user.password);
      } else if (user.password === password) {
        ok = true;
        await db
          .update(users)
          .set({ password: await hashPassword(password) })
          .where(eq(users.id, user.id));
      }
    }

    if (!ok || !user) {
      return { success: false, error: "Usuario o contraseña incorrectos." };
    }

    // Registramos el último acceso (best-effort: si la columna aún no existe
    // por falta de migración, no bloqueamos el login).
    try {
      await db
        .update(users)
        .set({ lastLoginAt: new Date().toISOString() })
        .where(eq(users.id, user.id));
    } catch (e) {
      console.error("[auth] no se pudo registrar lastLoginAt:", e);
    }

    const isProd =
      import.meta.env.PROD || process.env.NODE_ENV === "production";
    cookie.set(SESSION_COOKIE, await createSessionToken(env, user.id), {
      path: "/",
      httpOnly: true,
      secure: !!isProd,
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
    });

    throw redirect(302, "/admin/");
  },
  zod$({
    username: z.string().min(1, "Ingresá tu usuario"),
    password: z.string().min(1, "Ingresá tu contraseña"),
  }),
);

export default component$(() => {
  const loginAction = useLoginAction();

  return (
    <div class="from-primary-950 via-primary-900 to-primary-800 relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-160 p-6 font-sans">
      <div class="bg-accent-500/10 absolute -top-40 -left-40 h-96 w-96 rounded-full blur-3xl" />
      <div class="bg-primary-500/20 absolute -right-40 -bottom-40 h-96 w-96 rounded-full blur-3xl" />

      <div class="relative z-10 w-full max-w-md">
        <div class="mb-8 text-center">
          <Link href="/" class="mb-4 inline-flex">
            <img
              src="/brand/biobal-horizontal.svg"
              alt="BioBal"
              width={310}
              height={102}
              class="h-9 w-auto brightness-0 invert"
            />
          </Link>
          <h1 class="font-display text-primary-100 text-xl font-semibold">
            Acceso administrativo
          </h1>
          <p class="text-primary-300/70 mt-1 text-xs tracking-wider uppercase">
            Ingresá tus credenciales de panel
          </p>
        </div>

        <div class="bg-primary-950/70 rounded-2xl border border-white/10 p-8 shadow-2xl backdrop-blur-md">
          <Form action={loginAction} class="space-y-5">
            <div>
              <label class="mb-1.5 block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                Usuario
              </label>
              <input
                type="text"
                name="username"
                placeholder="admin"
                autoFocus
                class="focus:border-accent-500 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3.5 text-white transition-colors outline-none placeholder:text-slate-500"
              />
            </div>
            <div>
              <label class="mb-1.5 block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                class="focus:border-accent-500 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3.5 text-white transition-colors outline-none placeholder:text-slate-500"
              />
            </div>

            {loginAction.value?.error && (
              <div class="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
                <p class="text-sm text-red-400">{loginAction.value.error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loginAction.isRunning}
              class="bg-accent-500 hover:bg-accent-600 font-display mt-2 w-full rounded-xl py-3.5 font-semibold text-white shadow-lg transition-all duration-200 disabled:opacity-60"
            >
              {loginAction.isRunning ? "Iniciando..." : "Ingresar"}
            </button>
          </Form>
        </div>

        <div class="mt-6 text-center">
          <Link
            href="/"
            class="text-xs font-medium text-slate-400 underline underline-offset-2 transition-colors hover:text-white"
          >
            ← Volver al sitio
          </Link>
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Acceso administrativo — BioBal",
  meta: [{ name: "robots", content: "noindex, nofollow" }],
};
