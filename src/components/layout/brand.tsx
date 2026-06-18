import { component$ } from "@builder.io/qwik";

type BrandProps = {
  /** "dark" = sobre fondo claro (logo color). "light" = sobre fondo oscuro (logo blanco). */
  tone?: "dark" | "light";
  class?: string;
};

/**
 * Logotipo oficial de BioBal. Sobre fondo claro usa la versión color
 * (`/images/Logo.png`); sobre fondo oscuro, la misma marca en blanco.
 */
export const Brand = component$<BrandProps>(
  ({ tone = "dark", class: className }) => {
    const isLight = tone === "light";
    return (
      <img
        // fondo claro: logo color (con fondo blanco). fondo oscuro: versión vectorial transparente, en blanco.
        src={isLight ? "/brand/biobal-horizontal.svg" : "/images/Logo.png"}
        alt="BioBal — Espacio Integral de Salud"
        width={310}
        height={102}
        class={[
          "w-auto select-none",
          className || "h-8 lg:h-9",
          isLight && "brightness-0 invert",
        ]}
        loading="eager"
        decoding="async"
      />
    );
  },
);
