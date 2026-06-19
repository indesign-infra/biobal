/**
 * Sube un archivo directo del navegador a Vercel Blob usando el SDK de cliente.
 * Esto evita el límite de ~4MB del body de las funciones (sube directo a Blob),
 * por eso soporta archivos grandes (videos). El token lo emite /api/blob/upload.
 *
 * El SDK importa crypto/undici de Node: en el build de cliente esos módulos se
 * reemplazan por los shims del propio paquete (ver alias en vite.config.ts), así
 * no rompe en el navegador con `util.promisify`.
 *
 * Devuelve la URL pública del archivo subido.
 */
export async function uploadToBlob(
  file: File,
  folder: string,
  onProgress?: (percentage: number) => void
): Promise<string> {
  const { upload } = await import("@vercel/blob/client");
  const blob = await upload(`${folder}/${file.name}`, file, {
    access: "public",
    handleUploadUrl: "/api/blob/upload",
    multipart: true, // sube en partes: más robusto para archivos grandes
    onUploadProgress: (p) => {
      if (onProgress) {
        onProgress(Math.round(p.percentage));
      }
    },
  });
  return blob.url;
}
