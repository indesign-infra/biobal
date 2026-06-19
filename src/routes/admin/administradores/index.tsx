import { component$ } from "@builder.io/qwik";
import {
  routeLoader$,
  routeAction$,
  zod$,
  z,
  Form,
  type DocumentHead,
} from "@builder.io/qwik-city";
import { asc, eq } from "drizzle-orm";
import { getDb } from "~/db";
import { users } from "~/db/schema";
import {
  verifySessionToken,
  verifyPassword,
  isHashedPassword,
  hashPassword,
  SESSION_COOKIE,
} from "~/lib/auth";
import {
  LuShieldCheck,
  LuKeyRound,
  LuCheckCircle2,
  LuUserCircle,
} from "@qwikest/icons/lucide";

type AdminRow = {
  id: number;
  username: string;
  role: string | null;
  lastLoginAt: string | null;
  createdAt: string;
};

export const useAdmins = routeLoader$(async ({ env, cookie }) => {
  const currentUserId = await verifySessionToken(
    env,
    cookie.get(SESSION_COOKIE)?.value,
  );
  try {
    const db = getDb(env);
    const rows = (await db
      .select({
        id: users.id,
        username: users.username,
        role: users.role,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(asc(users.id))) as AdminRow[];
    return { currentUserId, users: rows, migrated: true };
  } catch (error) {
    // Probablemente faltan las columnas nuevas (role/last_login_at): correr `pnpm db.push`.
    console.error("admins loader error:", error);
    return { currentUserId, users: [] as AdminRow[], migrated: false };
  }
});

export const useChangePassword = routeAction$(
  async (data, { env, cookie, fail }) => {
    const userId = await verifySessionToken(
      env,
      cookie.get(SESSION_COOKIE)?.value,
    );
    if (userId === null) {
      return fail(401, { message: "Sesión inválida. Volvé a iniciar sesión." });
    }
    if (data.newPassword !== data.confirmPassword) {
      return fail(400, { message: "Las contraseñas nuevas no coinciden." });
    }
    if (data.newPassword === data.currentPassword) {
      return fail(400, {
        message: "La nueva contraseña debe ser distinta a la actual.",
      });
    }

    const db = getDb(env);
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (!user) return fail(404, { message: "Usuario no encontrado." });

    // Verificar la contraseña actual (soporta legacy en texto plano).
    const ok = isHashedPassword(user.password)
      ? await verifyPassword(data.currentPassword, user.password)
      : user.password === data.currentPassword;
    if (!ok) {
      return fail(400, { message: "La contraseña actual es incorrecta." });
    }

    await db
      .update(users)
      .set({ password: await hashPassword(data.newPassword) })
      .where(eq(users.id, userId));

    return { success: true };
  },
  zod$({
    currentPassword: z.string().min(1, "Ingresá tu contraseña actual."),
    newPassword: z
      .string()
      .min(8, "La nueva contraseña debe tener al menos 8 caracteres."),
    confirmPassword: z.string().min(1, "Repetí la nueva contraseña."),
  }),
);

function formatDate(value: string | null): string {
  if (!value) return "Nunca";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-accent-500";

export default component$(() => {
  const data = useAdmins();
  const change = useChangePassword();
  const errors = change.value?.fieldErrors;
  const currentUserId = data.value.currentUserId;

  return (
    <div class="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 class="font-display text-primary-900 flex items-center gap-2.5 text-2xl font-bold">
          <LuShieldCheck class="text-accent-500 h-6 w-6" />
          Administradores
        </h1>
        <p class="mt-1 text-sm text-slate-500">
          Usuarios con acceso al panel y gestión de tu contraseña.
        </p>
      </div>

      {!data.value.migrated && (
        <div class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          ⚠️ Faltan columnas nuevas en la base. Ejecutá{" "}
          <code class="rounded bg-amber-100 px-1.5 py-0.5 font-mono">
            pnpm db.push
          </code>{" "}
          para ver roles y últimos accesos.
        </div>
      )}

      {/* Cambiar contraseña propia */}
      <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="font-display text-primary-900 flex items-center gap-2 text-lg font-bold">
          <LuKeyRound class="text-accent-500 h-5 w-5" />
          Cambiar mi contraseña
        </h2>
        <p class="mt-1 text-sm text-slate-500">
          Actualizás la contraseña de tu propia cuenta.
        </p>

        {change.value?.success ? (
          <div class="mt-5 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            <LuCheckCircle2 class="h-5 w-5 shrink-0" />
            Contraseña actualizada correctamente.
          </div>
        ) : (
          <Form action={change} class="mt-5 max-w-md space-y-4">
            {change.value?.failed && change.value?.message && (
              <p
                role="alert"
                class="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600"
              >
                {change.value.message}
              </p>
            )}

            <div>
              <label
                for="currentPassword"
                class="mb-1.5 block text-xs font-bold tracking-wider text-slate-500 uppercase"
              >
                Contraseña actual
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                class={inputClass}
              />
              {errors?.currentPassword && (
                <p class="mt-1 text-xs text-red-600">
                  {errors.currentPassword[0]}
                </p>
              )}
            </div>

            <div>
              <label
                for="newPassword"
                class="mb-1.5 block text-xs font-bold tracking-wider text-slate-500 uppercase"
              >
                Nueva contraseña
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                class={inputClass}
              />
              {errors?.newPassword && (
                <p class="mt-1 text-xs text-red-600">{errors.newPassword[0]}</p>
              )}
            </div>

            <div>
              <label
                for="confirmPassword"
                class="mb-1.5 block text-xs font-bold tracking-wider text-slate-500 uppercase"
              >
                Repetir nueva contraseña
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                class={inputClass}
              />
              {errors?.confirmPassword && (
                <p class="mt-1 text-xs text-red-600">
                  {errors.confirmPassword[0]}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={change.isRunning}
              class="bg-accent-500 hover:bg-accent-600 font-display rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors disabled:opacity-60"
            >
              {change.isRunning ? "Guardando..." : "Actualizar contraseña"}
            </button>
          </Form>
        )}
      </section>

      {/* Listado de administradores */}
      <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="border-b border-slate-100 px-6 py-4">
          <h2 class="font-display text-primary-900 text-lg font-bold">
            Usuarios con acceso ({data.value.users.length})
          </h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead>
              <tr class="border-b border-slate-100 text-xs tracking-wider text-slate-400 uppercase">
                <th class="px-6 py-3 font-semibold">Usuario</th>
                <th class="px-6 py-3 font-semibold">Rol</th>
                <th class="px-6 py-3 font-semibold">Último acceso</th>
                <th class="px-6 py-3 font-semibold">Creado</th>
              </tr>
            </thead>
            <tbody>
              {data.value.users.map((u) => {
                const isCurrent = u.id === currentUserId;
                return (
                  <tr
                    key={u.id}
                    class={[
                      "border-b border-slate-50 last:border-0",
                      isCurrent && "bg-accent-50/40",
                    ]}
                  >
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-3">
                        <span class="bg-primary-900 text-accent-300 flex h-9 w-9 items-center justify-center rounded-full">
                          <LuUserCircle class="h-5 w-5" />
                        </span>
                        <div>
                          <span class="text-primary-900 font-semibold capitalize">
                            {u.username}
                          </span>
                          {isCurrent && (
                            <span class="bg-accent-500/15 text-accent-700 ml-2 rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                              Vos
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <span
                        class={[
                          "rounded-md px-2 py-0.5 text-xs font-semibold capitalize",
                          u.role === "owner"
                            ? "bg-primary-900 text-white"
                            : "bg-slate-100 text-slate-600",
                        ]}
                      >
                        {u.role === "owner" ? "Propietario" : u.role || "admin"}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-slate-600">
                      {formatDate(u.lastLoginAt)}
                    </td>
                    <td class="px-6 py-4 text-slate-600">
                      {formatDate(u.createdAt)}
                    </td>
                  </tr>
                );
              })}
              {data.value.users.length === 0 && (
                <tr>
                  <td colSpan={4} class="px-6 py-10 text-center text-slate-400">
                    No hay usuarios para mostrar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Administradores — BioBal Admin",
  meta: [{ name: "robots", content: "noindex, nofollow" }],
};
