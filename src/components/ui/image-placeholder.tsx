import { component$ } from "@builder.io/qwik";
import { LuImage } from "@qwikest/icons/lucide";
import { Image } from "qwik-image";

type ImagePlaceholderProps = {
  /** Texto alternativo real de la imagen final (importante para accesibilidad/SEO). */
  alt: string;
  /** Ruta de la imagen real, ej. "/images/consultorio.jpg". Si se omite, se muestra el placeholder. */
  src?: string;
  /** Pista visible de qué imagen va acá (solo en modo placeholder). */
  label?: string;
  /** Relación de aspecto CSS, ej. "4 / 3", "16 / 10". */
  ratio?: string;
  width?: number;
  height?: number;
  /** El hero usa eager; el resto, lazy. */
  eager?: boolean;
  /** Marca la imagen como LCP: prioriza su descarga (fetchpriority="high"). */
  priority?: boolean;
  /** `srcset` responsive (ej. variantes WebP). Solo aplica con `src` real. */
  srcSet?: string;
  /** `sizes` que acompaña al `srcSet`. */
  sizes?: string;
  class?: string;
};

/**
 * Marcador de posición de imagen. Renderiza un <img> real (con un data-URI SVG
 * liviano, sin pedidos externos) más una etiqueta de la foto prevista.
 *
 * TODO: imagen real — reemplazar el `src` del data-URI por la imagen definitiva,
 * por ejemplo: src="/images/recepcion.webp" (mantener alt, width, height y loading).
 */
export const ImagePlaceholder = component$<ImagePlaceholderProps>(
  ({
    alt,
    src,
    label,
    ratio = "4 / 3",
    width = 1200,
    height = 900,
    eager = false,
    priority = false,
    sizes,
    class: className,
  }) => {
    const placeholderSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#dbe8f2'/><stop offset='0.55' stop-color='#eef2f7'/><stop offset='1' stop-color='#c6f2ee'/></linearGradient></defs><rect width='${width}' height='${height}' fill='url(#g)'/></svg>`;
    const imgSrc =
      src ?? `data:image/svg+xml,${encodeURIComponent(placeholderSvg)}`;

    if (src) {
      return (
        <figure
          class={[
            "bg-surface-2 ring-line relative overflow-hidden rounded-3xl ring-1",
            className,
          ]}
          style={{ aspectRatio: ratio }}
        >
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            layout="constrained"
            sizes={sizes || "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 650px"}
            loading={priority ? "eager" : "lazy"}
            fetchpriority={priority ? "high" : undefined}
            class="h-full w-full object-cover"
          />
        </figure>
      );
    }

    return (
      <figure
        class={[
          "bg-surface-2 ring-line relative overflow-hidden rounded-3xl ring-1",
          className,
        ]}
        style={{ aspectRatio: ratio }}
      >
        <img
          src={imgSrc}
          alt={alt}
          width={width}
          height={height}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          class="h-full w-full object-cover"
        />
        <figcaption class="text-primary-400 absolute inset-0 flex flex-col items-center justify-center gap-2">
          <LuImage class="h-9 w-9" />
          {label && (
            <span class="text-primary-500/80 max-w-[80%] text-center text-sm font-medium">
              {label}
            </span>
          )}
        </figcaption>
      </figure>
    );
  },
);
