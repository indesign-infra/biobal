/**
 * Autenticación del panel admin — pensada para el runtime edge (Web Crypto).
 *
 * - Contraseñas: hash PBKDF2-SHA256 con salt aleatorio (`pbkdf2$iters$salt$hash`).
 * - Sesión: token firmado con HMAC-SHA256 (`v1.<userId>.<exp>.<sig>`), stateless,
 *   sin tabla de sesiones ni consulta a la DB por request.
 *
 * Sólo se usa en handlers de servidor (onRequest, routeAction$, server$, endpoints).
 */

type EnvGetter = { get: (key: string) => string | undefined };

export const SESSION_COOKIE = "auth_session";
const SESSION_TTL_SEC = 60 * 60 * 24 * 7; // 7 días
const PBKDF2_ITERS = 100_000;

const enc = new TextEncoder();

function b64urlFromBytes(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function bytesFromB64url(s: string): Uint8Array {
  let t = s.replace(/-/g, "+").replace(/_/g, "/");
  while (t.length % 4) t += "=";
  const bin = atob(t);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

// ─── Contraseñas ──────────────────────────────────────────────────────────
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: PBKDF2_ITERS, hash: "SHA-256" },
    keyMaterial,
    256,
  );
  return `pbkdf2$${PBKDF2_ITERS}$${b64urlFromBytes(salt)}$${b64urlFromBytes(
    new Uint8Array(bits),
  )}`;
}

export function isHashedPassword(stored: string): boolean {
  return stored.startsWith("pbkdf2$");
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;
  const iters = Number(parts[1]);
  if (!Number.isFinite(iters)) return false;
  const salt = bytesFromB64url(parts[2]);
  const expected = bytesFromB64url(parts[3]);
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: iters, hash: "SHA-256" },
    keyMaterial,
    expected.length * 8,
  );
  return timingSafeEqual(new Uint8Array(bits), expected);
}

// ─── Sesión (cookie firmada) ──────────────────────────────────────────────
function getAuthSecret(env: EnvGetter): string {
  const s = env.get("AUTH_SECRET");
  if (s && s.length >= 16) return s;
  if (import.meta.env.DEV) return "dev-only-insecure-secret-change-me-please";
  throw new Error(
    "AUTH_SECRET no está configurada (mínimo 16 caracteres). Definila en las variables de entorno.",
  );
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function createSessionToken(
  env: EnvGetter,
  userId: number,
): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SEC;
  const payload = `${userId}.${exp}`;
  const key = await importHmacKey(getAuthSecret(env));
  const sig = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, enc.encode(payload)),
  );
  return `v1.${payload}.${b64urlFromBytes(sig)}`;
}

/** Devuelve el userId si el token es válido y no expiró, o null. */
export async function verifySessionToken(
  env: EnvGetter,
  token?: string | null,
): Promise<number | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 4 || parts[0] !== "v1") return null;
  const [, userIdStr, expStr, sigStr] = parts;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp * 1000 < Date.now()) return null;

  try {
    const key = await importHmacKey(getAuthSecret(env));
    const ok = await crypto.subtle.verify(
      "HMAC",
      key,
      bytesFromB64url(sigStr),
      enc.encode(`${userIdStr}.${expStr}`),
    );
    if (!ok) return null;
  } catch {
    return null;
  }

  const userId = Number(userIdStr);
  return Number.isInteger(userId) && userId > 0 ? userId : null;
}

/** Helper para endpoints/server$: lee y valida la sesión desde la cookie. */
export async function getSessionUserId(ev: {
  cookie: { get: (name: string) => { value: string } | undefined | null };
  env: EnvGetter;
}): Promise<number | null> {
  return verifySessionToken(ev.env, ev.cookie.get(SESSION_COOKIE)?.value);
}

export const SESSION_MAX_AGE = SESSION_TTL_SEC;
