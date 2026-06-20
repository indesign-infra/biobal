/**
 * Comprime una imagen en el navegador antes de subirla: la redimensiona a un
 * ancho máximo razonable y la convierte a WebP. Así las imágenes que se suben
 * desde el admin quedan livianas (clave para el rendimiento de la home) sin
 * depender de optimización en el servidor (que no corre en el runtime Edge).
 *
 * No toca videos ni formatos no rasterizables (gif/svg): devuelve el original.
 * Si el resultado no mejora o algo falla, también devuelve el archivo original.
 */
async function compressImage(
  file: File,
  maxWidth = 1600,
  quality = 0.8
): Promise<File> {
  const type = file.type;
  if (
    !type.startsWith("image/") ||
    type === "image/gif" ||
    type === "image/svg+xml"
  ) {
    return file;
  }
  try {
    // `from-image` respeta la orientación EXIF (fotos de celular rotadas).
    const bitmap = await createImageBitmap(file, {
      imageOrientation: "from-image",
    });
    const scale = Math.min(1, maxWidth / bitmap.width);
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", quality)
    );
    // Si no se generó o no achicó, subimos el original.
    if (!blob || blob.size >= file.size) return file;

    const name = file.name.replace(/\.[^.]+$/, "") + ".webp";
    return new File([blob], name, { type: "image/webp" });
  } catch {
    return file;
  }
}

/**
 * Sube un archivo directo del navegador a Vercel Blob usando el SDK de cliente.
 * Esto evita el límite de ~4MB del body de las funciones (sube directo a Blob),
 * por eso soporta archivos grandes (videos). El token lo emite /api/blob/upload.
 *
 * Las imágenes se comprimen a WebP antes de subir (ver `compressImage`); los
 * videos se suben tal cual.
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
  file = await compressImage(file);
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
