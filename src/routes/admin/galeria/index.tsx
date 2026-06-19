import { component$ } from "@builder.io/qwik";
import {
  routeLoader$,
  server$,
  type DocumentHead,
} from "@builder.io/qwik-city";
import { getDb, schema } from "~/db";
import { asc, eq } from "drizzle-orm";
import { GalleryUploader } from "~/components/admin/gallery-uploader";
import { getSessionUserId } from "~/lib/auth";

/** Las server$ no pasan por el onRequest del admin: validamos sesión acá. */
async function assertAdmin(ev: {
  cookie: { get: (n: string) => { value: string } | null | undefined };
  env: { get: (k: string) => string | undefined };
}) {
  const uid = await getSessionUserId(ev);
  if (uid === null) throw new Error("No autorizado");
}

export const useGalleryAdmin = routeLoader$(async ({ env }) => {
  try {
    const db = getDb(env);
    return await db
      .select()
      .from(schema.galeria)
      .orderBy(asc(schema.galeria.displayOrder));
  } catch (error) {
    console.error("gallery admin loader error:", error);
    return [];
  }
});

export const addGalleryImage = server$(async function (
  imageUrl: string,
  displayOrder: number,
) {
  await assertAdmin(this);
  // Sólo aceptamos URLs http(s) (las imágenes viven en Vercel Blob), no data-URIs.
  if (!/^https?:\/\//.test(imageUrl)) {
    throw new Error("URL de imagen inválida");
  }
  const db = getDb(this.env);
  const [row] = await db
    .insert(schema.galeria)
    .values({ imageUrl, displayOrder })
    .returning();
  return row;
});

export const deleteGalleryImage = server$(async function (id: number) {
  await assertAdmin(this);
  const db = getDb(this.env);
  await db.delete(schema.galeria).where(eq(schema.galeria.id, id));
});

export const reorderGalleryImages = server$(async function (ids: number[]) {
  await assertAdmin(this);
  const db = getDb(this.env);
  for (let i = 0; i < ids.length; i++) {
    await db
      .update(schema.galeria)
      .set({ displayOrder: i })
      .where(eq(schema.galeria.id, ids[i]));
  }
});

export default component$(() => {
  const images = useGalleryAdmin();

  return (
    <div class="mx-auto max-w-5xl">
      <h1 class="font-display text-primary-900 text-2xl font-bold">
        Galería de fotos
      </h1>
      <p class="mt-1 text-sm text-slate-500">
        Subí, ordená y gestioná las fotos que se muestran en la sección Galería
        de la home.
      </p>

      <div class="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <GalleryUploader images={images.value} />
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Galería — BioBal Admin",
  meta: [{ name: "robots", content: "noindex, nofollow" }],
};
