import { component$ } from "@builder.io/qwik";
import { routeAction$, zod$, z, Link, Form } from "@builder.io/qwik-city";
import type { DocumentHead } from "@builder.io/qwik-city";
import { getDb } from "~/db";
import { users } from "~/db/schema";
import { eq } from "drizzle-orm";

export const useLoginAction = routeAction$(
  async ({ username, password }, { cookie, redirect, env }) => {
    const db = getDb(env);

    // Auto-seed del admin por defecto si no hay usuarios.
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length === 0) {
      await db
        .insert(users)
        .values({ username: "admin", password: "biobal2026" });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username.trim().toLowerCase()))
      .limit(1);

    if (!user || user.password !== password) {
      return { success: false, error: "Usuario o contraseña incorrectos." };
    }

    const isProd =
      import.meta.env.PROD || process.env.NODE_ENV === "production";
    cookie.set("auth_session", user.id.toString(), {
      path: "/",
      httpOnly: true,
      secure: !!isProd,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
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
