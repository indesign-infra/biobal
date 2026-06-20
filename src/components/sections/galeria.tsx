import {
  component$,
  useSignal,
  $,
  useOnDocument,
  useTask$,
} from "@builder.io/qwik";
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

  const lightboxIdx = useSignal<number | null>(null);

  const openLightbox = $((idx: number) => {
    lightboxIdx.value = idx;
  });

  const closeLightbox = $(() => {
    lightboxIdx.value = null;
  });

  const lightboxNext = $(() => {
    if (lightboxIdx.value === null) return;
    lightboxIdx.value = (lightboxIdx.value + 1) % photos.length;
  });

  const lightboxPrev = $(() => {
    if (lightboxIdx.value === null) return;
    lightboxIdx.value = (lightboxIdx.value - 1 + photos.length) % photos.length;
  });

  useOnDocument(
    "keydown",
    $((event) => {
      if (lightboxIdx.value === null) return;
      const keyboardEvent = event as KeyboardEvent;
      if (keyboardEvent.key === "ArrowRight") {
        lightboxNext();
      } else if (keyboardEvent.key === "ArrowLeft") {
        lightboxPrev();
      } else if (keyboardEvent.key === "Escape") {
        closeLightbox();
      }
    }),
  );

  useTask$(({ track }) => {
    track(() => lightboxIdx.value);
    if (typeof document !== "undefined") {
      if (lightboxIdx.value !== null) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    }
  });

  const currentImage =
    lightboxIdx.value !== null ? photos[lightboxIdx.value] : null;

  return (
    <Section id="galeria" tone="white">
      <Container>
        <div data-reveal>
          <SectionTitle
            align="center"
            eyebrow={orDefault(content?.eyebrow, "Galería")}
            title={orDefault(content?.title, "Conocé nuestras instalaciones")}
            subtitle={orDefault(
              content?.subtitle,
              "Espacios modernos, luminosos y pensados para una atención profesional de excelencia.",
            )}
          />
        </div>

        <div class="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo, i) => (
            <button
              key={photo.id}
              type="button"
              data-reveal="scale"
              style={{
                aspectRatio: i === 0 ? "1 / 1" : "4 / 5",
                "--reveal-delay": `${Math.min(i, 8) * 55}ms`,
              }}
              onClick$={() => openLightbox(i)}
              class={[
                "group ring-line focus:ring-primary-500 relative w-full cursor-pointer overflow-hidden rounded-2xl bg-slate-100 text-left ring-1 focus:ring-2 focus:outline-none",
                // primera foto más grande en desktop
                i === 0 && "sm:col-span-2 sm:row-span-2",
              ]}
            >
              <img
                src={photo.imageUrl}
                alt={photo.title || "Instalaciones de BioBal"}
                loading="lazy"
                decoding="async"
                class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Expand icon on hover */}
              <div class="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 opacity-0 shadow-md backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width={2.5}
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                  />
                </svg>
              </div>

              {photo.title && (
                <div class="from-primary-950/80 absolute inset-x-0 bottom-0 bg-linear-to-t to-transparent p-4 text-sm font-medium text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {photo.title}
                </div>
              )}
            </button>
          ))}
        </div>
      </Container>

      {/* Lightbox Modal */}
      {lightboxIdx.value !== null && currentImage && (
        <div
          class="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 transition-all duration-300"
          onClick$={closeLightbox}
        >
          {/* Close Button */}
          <button
            type="button"
            class="absolute top-4 right-4 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20 focus:ring-2 focus:ring-white/50 focus:outline-none"
            onClick$={closeLightbox}
            aria-label="Cerrar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width={2}
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Previous Button */}
          {photos.length > 1 && (
            <button
              type="button"
              class="absolute left-3 z-10 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/25 focus:ring-2 focus:ring-white/50 focus:outline-none md:left-6"
              onClick$={(e) => {
                e.stopPropagation();
                lightboxPrev();
              }}
              aria-label="Imagen anterior"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width={2.5}
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}

          {/* Image & Title Container */}
          <div
            class="animate-fade-in flex w-full max-w-5xl flex-col items-center gap-4"
            onClick$={(e) => e.stopPropagation()}
          >
            <img
              src={currentImage.imageUrl}
              alt={currentImage.title || "Instalaciones de BioBal"}
              class="max-h-[80vh] max-w-full rounded-lg object-contain shadow-2xl transition-all duration-300"
            />
            {currentImage.title && (
              <p class="px-4 text-center text-base font-semibold text-white md:text-lg">
                {currentImage.title}
              </p>
            )}
            {photos.length > 1 && (
              <p class="text-xs text-slate-400">
                {(lightboxIdx.value ?? 0) + 1} / {photos.length}
              </p>
            )}
          </div>

          {/* Next Button */}
          {photos.length > 1 && (
            <button
              type="button"
              class="absolute right-3 z-10 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/25 focus:ring-2 focus:ring-white/50 focus:outline-none md:right-6"
              onClick$={(e) => {
                e.stopPropagation();
                lightboxNext();
              }}
              aria-label="Imagen siguiente"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width={2.5}
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}
        </div>
      )}
    </Section>
  );
});
