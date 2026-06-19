import type { RequestHandler } from "@builder.io/qwik-city";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getSessionUserId } from "~/lib/auth";

/**
 * Emite el token para subir archivos directo del navegador a Vercel Blob
 * (flujo client-upload del SDK). Permite archivos grandes sin pasar por el
 * límite de body de las funciones. Sólo para admins autenticados.
 */
export const onPost: RequestHandler = async ({ request, json, env, cookie }) => {
  // El flujo del SDK hace dos POST: el primero (generación de token) lleva la
  // cookie de sesión; el segundo (onUploadCompleted, server-to-server) no. Por
  // eso exigimos la sesión sólo en onBeforeGenerateToken.
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
          maximumSizeInBytes: 80 * 1024 * 1024, // 80 MB
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {
        // Vercel llama acá al terminar la subida. La URL la guardamos al crear
        // el video/imagen, así que no hace falta nada extra.
      },
    });
    json(200, result);
  } catch (error) {
    console.error("blob upload error:", error);
    const msg = (error as Error).message;
    const status = msg === "No autorizado" ? 401 : 400;
    json(status, {
      error: status === 401 ? "No autorizado" : "No se pudo procesar la subida.",
    });
  }
};
