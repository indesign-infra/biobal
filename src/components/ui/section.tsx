import { component$, Slot, type PropsOf } from "@builder.io/qwik";

type SectionTone = "white" | "surface" | "primary";

type SectionProps = PropsOf<"section"> & {
  /** Fondo de la sección, para alternar el ritmo visual entre bloques. */
  tone?: SectionTone;
};

const toneClass: Record<SectionTone, string> = {
  white: "bg-white",
  surface: "bg-surface",
  primary: "bg-primary-900 text-primary-100",
};

/**
 * Envoltorio de sección con ritmo vertical consistente y fondo configurable.
 * `scroll-mt` evita que el header sticky tape el título al navegar por anclas.
 */
export const Section = component$<SectionProps>(
  ({ tone = "white", class: className, ...rest }) => {
    return (
      <section
        class={[
          "scroll-mt-20 py-20 sm:py-24 lg:py-28",
          toneClass[tone],
          className,
        ]}
        {...rest}
      >
        <Slot />
      </section>
    );
  },
);
