import type { RequestHandler } from "@builder.io/qwik-city";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getSessionUserId } from "~/lib/auth";

/**
 * Genera el token para subir archivos directamente a Vercel Blob desde el
 * navegador (sin pasar por el límite de tamaño de las funciones serverless).
 * Lo usan el alta de reels y la galería del admin: SÓLO con sesión admin válida.
 */
export const onPost: RequestHandler = async ({ request, json, env, cookie }) => {
  // El flujo de @vercel/blob/client hace dos POST: el segundo (onUploadCompleted,
  // server-to-server) no lleva la cookie. handleUpload distingue ambos por el body;
  // exigimos sesión sólo en el primero (generación de token), que sí va con cookie.
  const userId = await getSessionUserId({ cookie, env });

  const token = env.get("BLOB_READ_WRITE_TOKEN");
  if (!token) {
    json(500, { error: "Almacenamiento no configurado." });
    return;
  }

  try {
    const body = (await request.json()) as HandleUploadBody;
    const result = await handleUpload({
      body,
      request,
      token,
      onBeforeGenerateToken: async () => {
        // Sólo un admin autenticado puede obtener un token de subida.
        if (userId === null) {
          throw new Error("No autorizado");
        }
        return {
          allowedContentTypes: [
            "video/mp4",
            "video/webm",
            "video/quicktime",
            "image/jpeg",
            "image/png",
            "image/webp",
          ],
          maximumSizeInBytes: 200 * 1024 * 1024, // 200 MB
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {
        // En producción Vercel llama acá cuando termina la subida.
        // No necesitamos hacer nada extra: guardamos la URL al crear el video.
      },
    });
    json(200, result);
  } catch (error) {
    console.error("blob upload error:", error);
    const msg = (error as Error).message;
    const status = msg === "No autorizado" ? 401 : 400;
    json(status, { error: status === 401 ? "No autorizado" : "No se pudo procesar la subida." });
  }
};
