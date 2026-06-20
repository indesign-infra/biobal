import { component$ } from "@builder.io/qwik";
import { LuQuote } from "@qwikest/icons/lucide";
import { Section } from "../ui/section";
import { Container } from "../ui/container";
import { ImagePlaceholder } from "../ui/image-placeholder";
import { type SectionContent, orDefault } from "~/lib/content";

export const ExperienciaPaciente = component$<{ content?: SectionContent }>(
  ({ content }) => {
    const eyebrow = orDefault(
      content?.eyebrow,
      "Experiencia diferencial para los pacientes",
    );
    const title = orDefault(
      content?.title,
      "La atención comienza mucho antes de ingresar al consultorio",
    );
    const body = orDefault(
      content?.body,
      "BioBal ofrece instalaciones modernas, espacios confortables y servicios complementarios que mejoran la experiencia de cada paciente, generando un entorno cálido, profesional y accesible.",
    );
    return (
      <Section id="experiencia" tone="surface">
        <Container class="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div data-reveal="left">
            <LuQuote class="text-accent-400 h-10 w-10" />
            <p class="bb-eyebrow text-accent-600 mt-3 text-sm font-semibold tracking-[0.14em] uppercase">
              {eyebrow}
            </p>
            <h2 class="font-display text-primary-900 mt-4 text-3xl leading-tight font-semibold sm:text-4xl">
              {title}
            </h2>
            <p class="text-ink mt-5 text-base leading-relaxed sm:text-lg">
              {body}
            </p>
            <p class="text-ink mt-4 text-base leading-relaxed sm:text-lg">
              Nuestro objetivo es que cada visita sea cómoda, eficiente y
              agradable.
            </p>
          </div>

          <div data-reveal="right">
            <ImagePlaceholder
              alt="Área de espera confortable y cálida para los pacientes de BioBal"
              src={content?.imageUrl || undefined}
              label="Imagen: sala de espera / recepción"
              ratio="4 / 3"
            />
          </div>
        </Container>
      </Section>
    );
  },
);
