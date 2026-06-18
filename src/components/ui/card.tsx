import { component$, Slot, type PropsOf } from "@builder.io/qwik";

type CardProps = PropsOf<"div"> & {
  /** Agrega elevación y leve desplazamiento al pasar el mouse. */
  interactive?: boolean;
};

/**
 * Tarjeta base: bordes redondeados, borde sutil y sombra suave.
 */
export const Card = component$<CardProps>(
  ({ interactive = false, class: className, ...rest }) => {
    return (
      <div
        class={[
          "ring-line shadow-card rounded-2xl bg-white p-6 ring-1 sm:p-7",
          interactive &&
            "hover:shadow-card-hover hover:ring-accent-200 transition-all duration-200 hover:-translate-y-1",
          className,
        ]}
        {...rest}
      >
        <Slot />
      </div>
    );
  },
);
