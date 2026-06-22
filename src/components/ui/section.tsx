import { component$, Slot, type PropsOf } from "@builder.io/qwik";

type SectionTone = "white" | "surface" | "primary";

type SectionProps = PropsOf<"section"> & {
  /** Fondo de la sección, para alternar el ritmo visual entre bloques. */
  tone?: SectionTone;
  /** Glows decorativos suaves (recomendado en tono `primary`, como el hero). */
  glow?: boolean;
  /** Funde el borde superior desde el color de la sección anterior (ej. "var(--color-surface)"). */
  fadeTopColor?: string;
  /** Funde el borde inferior hacia el color de la sección siguiente. */
  fadeBottomColor?: string;
};

const toneClass: Record<SectionTone, string> = {
  white: "bg-white",
  surface: "bg-surface",
  primary: "bg-primary-900 text-primary-100",
};

/**
 * Envoltorio de sección con ritmo vertical consistente y fondo configurable.
 * `scroll-mt` evita que el header sticky tape el título al navegar por anclas.
 *
 * Decoración opcional (CSS puro, sin coste de JS):
 *  - `glow`: glows radiales suaves de fondo.
 *  - `fadeTopColor`/`fadeBottomColor`: funden el borde con la sección vecina
 *    para evitar líneas de corte duras entre bloques claros y oscuros.
 */
export const Section = component$<SectionProps>(
  ({
    tone = "white",
    glow = false,
    fadeTopColor,
    fadeBottomColor,
    class: className,
    ...rest
  }) => {
    const decorated = glow || !!fadeTopColor || !!fadeBottomColor;
    return (
      <section
        class={[
          "scroll-mt-20 py-20 sm:py-24 lg:py-28",
          toneClass[tone],
          decorated && "relative overflow-hidden",
          className,
        ]}
        {...rest}
      >
        {glow && (
          <div aria-hidden="true" class="pointer-events-none absolute inset-0">
            <div class="bb-glow bg-accent-500/15 absolute -top-24 -right-16 h-96 w-96 rounded-full blur-3xl" />
            <div class="bb-glow bg-primary-500/25 absolute -bottom-28 left-[12%] h-80 w-80 rounded-full blur-3xl [animation-delay:-4.5s]" />
          </div>
        )}
        {fadeTopColor && (
          <div
            aria-hidden="true"
            class="pointer-events-none absolute inset-x-0 top-0 h-8 sm:h-10"
            style={{
              backgroundImage: `linear-gradient(to bottom, ${fadeTopColor}, transparent)`,
            }}
          />
        )}
        {fadeBottomColor && (
          <div
            aria-hidden="true"
            class="pointer-events-none absolute inset-x-0 bottom-0 h-8 sm:h-10"
            style={{
              backgroundImage: `linear-gradient(to top, ${fadeBottomColor}, transparent)`,
            }}
          />
        )}
        <div class={decorated ? "relative" : undefined}>
          <Slot />
        </div>
      </section>
    );
  },
);
