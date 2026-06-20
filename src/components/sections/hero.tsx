import { component$ } from "@builder.io/qwik";
import { LuMapPin, LuArrowRight } from "@qwikest/icons/lucide";
import { Container } from "../ui/container";
import { Button } from "../ui/button";
import { ImagePlaceholder } from "../ui/image-placeholder";
import { type SectionContent, orDefault } from "~/lib/content";

export const Hero = component$<{ content?: SectionContent }>(({ content }) => {
  const eyebrow = orDefault(
    content?.eyebrow,
    "Small Center Las Piedras · Buenos Aires",
  );
  const title = orDefault(content?.title, "BioBal — Espacio Integral de Salud");
  const subtitle = orDefault(
    content?.subtitle,
    "Un entorno diseñado para el crecimiento profesional y la excelencia en la atención.",
  );
  const body = orDefault(
    content?.body,
    "Espacio integral de salud en el complejo Small Center Las Piedras, Buenos Aires. Infraestructura de calidad, servicios especializados y espacios pensados para que los profesionales de la salud trabajen en las mejores condiciones.",
  );
  const image = orDefault(content?.imageUrl, "/images/consultorio.jpg");

  return (
    <section class="from-primary-950 via-primary-900 to-primary-800 relative overflow-hidden bg-linear-160">
      {/* Glows decorativos */}
      <div aria-hidden="true" class="pointer-events-none absolute inset-0">
        <div class="bb-glow bg-accent-500/25 absolute -top-32 -right-24 h-[28rem] w-[28rem] rounded-full blur-3xl" />
        <div class="bb-glow bg-primary-500/40 absolute -bottom-24 left-1/4 h-80 w-80 rounded-full blur-3xl [animation-delay:-3s]" />
        {/* Malla sutil de puntos */}
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-size-[26px_26px] opacity-[0.07]" />
      </div>

      <Container class="relative grid items-center gap-12 py-20 sm:py-24 lg:grid-cols-2 lg:gap-16 lg:py-28">
        <div>
          <span
            data-reveal="fade"
            class="text-accent-200 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium ring-1 ring-white/15 backdrop-blur ring-inset"
          >
            <span class="bb-pulse-dot bg-accent-400 inline-block h-2 w-2 rounded-full" />
            <LuMapPin class="h-4 w-4" />
            {eyebrow}
          </span>

          <h1
            data-reveal
            style={{ "--reveal-delay": "80ms" }}
            class="font-display mt-6 text-4xl leading-[1.08] font-bold tracking-tight text-white sm:text-5xl lg:text-[3.4rem]"
          >
            {title}
          </h1>

          <p
            data-reveal
            style={{ "--reveal-delay": "160ms" }}
            class="text-accent-100 mt-5 max-w-xl text-lg font-medium sm:text-xl"
          >
            {subtitle}
          </p>

          <p
            data-reveal
            style={{ "--reveal-delay": "220ms" }}
            class="text-primary-100/85 mt-5 max-w-xl text-base leading-relaxed"
          >
            {body}
          </p>

          <div
            data-reveal
            style={{ "--reveal-delay": "300ms" }}
            class="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Button href="#contacto" size="lg">
              Solicitá una visita
              <LuArrowRight class="h-5 w-5" />
            </Button>
            <Button href="#consultorios" size="lg" variant="outlineLight">
              Conocé los consultorios
            </Button>
          </div>
        </div>

        <div
          class="relative"
          data-reveal="right"
          style={{ "--reveal-delay": "150ms" }}
        >
          <div class="bb-float">
            <ImagePlaceholder
              alt="Consultorio profesional de BioBal con amplio ventanal y vista al entorno verde, en Small Center Las Piedras"
              src={image}
              ratio="4 / 5"
              width={1200}
              height={1600}
              eager
              class="shadow-primary-950/40 shadow-2xl ring-white/10"
            />
          </div>
        </div>
      </Container>
    </section>
  );
});
