import { component$, Slot, type PropsOf } from "@builder.io/qwik";

type ContainerProps = PropsOf<"div"> & {
  /** Ancho máximo del contenido. */
  size?: "default" | "narrow" | "wide";
};

/**
 * Contenedor central con ancho máximo y padding horizontal responsivo.
 * Unifica el ancho de lectura en todas las secciones.
 */
export const Container = component$<ContainerProps>(
  ({ size = "default", class: className, ...rest }) => {
    const max =
      size === "narrow"
        ? "max-w-3xl"
        : size === "wide"
          ? "max-w-[88rem]"
          : "max-w-7xl";

    return (
      <div
        class={["mx-auto w-full px-5 sm:px-8 lg:px-10", max, className]}
        {...rest}
      >
        <Slot />
      </div>
    );
  },
);
