import type { RequestHandler } from "@builder.io/qwik-city";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

/**
 * Genera el token para subir archivos directamente a Vercel Blob desde el
 * navegador (sin pasar por el límite de tamaño de las funciones serverless).
 * Lo usa el formulario de alta de reels (admin/videos-verticales/new).
 */
export const onPost: RequestHandler = async ({ request, json, env }) => {
  const token = env.get("BLOB_READ_WRITE_TOKEN");
  if (!token) {
    json(500, { error: "BLOB_READ_WRITE_TOKEN no está configurado." });
    return;
  }

  try {
    const body = (await request.json()) as HandleUploadBody;
    const result = await handleUpload({
      body,
      request,
      token,
      onBeforeGenerateToken: async () => ({
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
      }),
      onUploadCompleted: async () => {
        // En producción Vercel llama acá cuando termina la subida.
        // No necesitamos hacer nada extra: guardamos la URL al crear el video.
      },
    });
    json(200, result);
  } catch (error) {
    console.error("blob upload error:", error);
    json(400, { error: (error as Error).message });
  }
};
