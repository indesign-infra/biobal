import { component$ } from "@builder.io/qwik";
import { LuQuote } from "@qwikest/icons/lucide";
import { Section } from "../ui/section";
import { Container } from "../ui/container";
import { ImagePlaceholder } from "../ui/image-placeholder";

export const ExperienciaPaciente = component$(() => {
  return (
    <Section id="experiencia" tone="surface">
      <Container class="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <LuQuote class="text-accent-400 h-10 w-10" />
          <p class="text-accent-600 mt-3 text-sm font-semibold tracking-[0.14em] uppercase">
            Experiencia diferencial para los pacientes
          </p>
          <h2 class="font-display text-primary-900 mt-4 text-3xl leading-tight font-semibold sm:text-4xl">
            La atención comienza mucho antes de ingresar al consultorio
          </h2>
          <p class="text-ink mt-5 text-base leading-relaxed sm:text-lg">
            BioBal ofrece instalaciones modernas, espacios confortables y
            servicios complementarios que mejoran la experiencia de cada
            paciente, generando un entorno cálido, profesional y accesible.
          </p>
          <p class="text-ink mt-4 text-base leading-relaxed sm:text-lg">
            Nuestro objetivo es que cada visita sea cómoda, eficiente y
            agradable.
          </p>
        </div>

        <ImagePlaceholder
          alt="Área de espera confortable y cálida para los pacientes de BioBal"
          label="Imagen: sala de espera / recepción"
          ratio="4 / 3"
        />
      </Container>
    </Section>
  );
});
