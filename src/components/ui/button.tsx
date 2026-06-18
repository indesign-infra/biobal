import { component$, Slot, type PropsOf } from "@builder.io/qwik";

type Variant = "primary" | "secondary" | "outlineLight";
type Size = "md" | "lg";

type ButtonOwnProps = {
  variant?: Variant;
  size?: Size;
  /** Si se pasa, el botón se renderiza como `<a>`. */
  href?: string;
  target?: string;
  rel?: string;
  /** Ocupa todo el ancho disponible. */
  block?: boolean;
};

type ButtonProps = ButtonOwnProps & PropsOf<"button">;

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium leading-none transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60";

const sizes: Record<Size, string> = {
  md: "px-5 py-3 text-sm",
  lg: "px-7 py-3.5 text-[0.95rem] sm:text-base",
};

const variants: Record<Variant, string> = {
  primary:
    "bg-accent-500 text-white shadow-sm hover:bg-accent-600 hover:shadow-md active:bg-accent-700",
  secondary:
    "bg-white text-primary-700 ring-1 ring-inset ring-primary-200 hover:bg-primary-50 hover:ring-primary-300",
  outlineLight: "text-white ring-1 ring-inset ring-white/35 hover:bg-white/10",
};

/**
 * Botón/CTA reutilizable. Renderiza `<a>` cuando recibe `href`, o `<button>`
 * en caso contrario. Estados hover/focus accesibles (focus global en CSS).
 */
export const Button = component$<ButtonProps>((props) => {
  const {
    variant = "primary",
    size = "md",
    href,
    target,
    rel,
    block,
    class: className,
    ...rest
  } = props;

  const classes = [
    base,
    sizes[size],
    variants[variant],
    block && "w-full",
    className,
  ];

  if (href !== undefined) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        class={classes}
        {...(rest as PropsOf<"a">)}
      >
        <Slot />
      </a>
    );
  }

  return (
    <button class={classes} {...rest}>
      <Slot />
    </button>
  );
});
