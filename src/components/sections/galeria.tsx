import { component$ } from "@builder.io/qwik";
import { Section } from "../ui/section";
import { Container } from "../ui/container";
import { SectionTitle } from "../ui/section-title";
import { type SectionContent, orDefault } from "~/lib/content";

export type GalleryPhoto = {
  id: number;
  imageUrl: string;
  title: string | null;
};

type GaleriaProps = { photos: GalleryPhoto[]; content?: SectionContent };

export const Galeria = component$<GaleriaProps>(({ photos, content }) => {
  if (!photos || photos.length === 0) return null;

  return (
    <Section id="galeria" tone="white">
      <Container>
        <SectionTitle
          align="center"
          eyebrow={orDefault(content?.eyebrow, "Galería")}
          title={orDefault(content?.title, "Conocé nuestras instalaciones")}
          subtitle={orDefault(
            content?.subtitle,
            "Espacios modernos, luminosos y pensados para una atención profesional de excelencia.",
          )}
        />

        <div class="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo, i) => (
            <figure
              key={photo.id}
              class={[
                "group ring-line relative overflow-hidden rounded-2xl bg-slate-100 ring-1",
                // primera foto más grande en desktop
                i === 0 && "sm:col-span-2 sm:row-span-2",
              ]}
              style={{ aspectRatio: i === 0 ? "1 / 1" : "4 / 5" }}
            >
              <img
                src={photo.imageUrl}
                alt={photo.title || "Instalaciones de BioBal"}
                loading="lazy"
                decoding="async"
                class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {photo.title && (
                <figcaption class="from-primary-950/80 absolute inset-x-0 bottom-0 bg-linear-to-t to-transparent p-4 text-sm font-medium text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {photo.title}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      </Container>
    </Section>
  );
});
