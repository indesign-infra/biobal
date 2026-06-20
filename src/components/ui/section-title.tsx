import { component$, Slot, type PropsOf } from "@builder.io/qwik";

type SectionTitleProps = {
  /** Texto pequeño en mayúsculas sobre el título. */
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  /** `light` para usar sobre fondos oscuros. */
  tone?: "dark" | "light";
} & Pick<PropsOf<"div">, "class">;

export const SectionTitle = component$<SectionTitleProps>(
  ({
    eyebrow,
    title,
    subtitle,
    align = "left",
    tone = "dark",
    class: className,
  }) => {
    const isCenter = align === "center";
    const isLight = tone === "light";

    return (
      <div class={["max-w-2xl", isCenter && "mx-auto text-center", className]}>
        {eyebrow && (
          <p
            class={[
              "bb-eyebrow mb-3 text-sm font-semibold tracking-[0.14em] uppercase",
              isCenter && "is-center w-full justify-center",
              isLight ? "text-accent-300" : "text-accent-600",
            ]}
          >
            {eyebrow}
          </p>
        )}
        <h2
          class={[
            "font-display text-3xl leading-tight font-semibold sm:text-4xl",
            isLight ? "text-white" : "text-primary-900",
          ]}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            class={[
              "mt-4 text-base leading-relaxed sm:text-lg",
              isLight ? "text-primary-100/85" : "text-ink-soft",
            ]}
          >
            {subtitle}
          </p>
        )}
        <Slot />
      </div>
    );
  },
);
