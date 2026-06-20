import { component$ } from "@builder.io/qwik";
import { Section } from "../ui/section";
import { Container } from "../ui/container";
import { SectionTitle } from "../ui/section-title";
import { ImagePlaceholder } from "../ui/image-placeholder";
import { type SectionContent, orDefault } from "~/lib/content";

const specialties = [
  "Médicos",
  "Psicólogos",
  "Nutricionistas",
  "Kinesiólogos",
  "Y más especialidades",
];

export const SobreBioBal = component$<{ content?: SectionContent }>(
  ({ content }) => {
    const eyebrow = orDefault(content?.eyebrow, "Sobre BioBal");
    const title = orDefault(
      content?.title,
      "Un espacio que potencia tu trabajo y la experiencia del paciente",
    );
    const body = orDefault(
      content?.body,
      "Creemos que el entorno donde se desarrolla la atención médica influye directamente en la experiencia del profesional y del paciente. Por eso creamos un espacio que reúne tecnología, confort, accesibilidad y servicios complementarios, permitiendo que cada especialista se enfoque plenamente en su actividad.",
    );
    const image = orDefault(content?.imageUrl, "/images/sala-biobal.webp");

    return (
      <Section id="sobre" tone="white">
        <Container class="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div class="order-2 lg:order-1" data-reveal="left">
            <ImagePlaceholder
              src={image}
              alt="Ambiente profesional y confortable dentro de las instalaciones de BioBal"
              ratio="4 / 3"
            />
          </div>

          <div class="order-1 lg:order-2" data-reveal="right">
            <SectionTitle eyebrow={eyebrow} title={title} />
            <p class="text-ink mt-5 text-base leading-relaxed sm:text-lg">
              {body}
            </p>
            <p class="text-ink mt-4 text-base leading-relaxed sm:text-lg">
              BioBal acompaña el crecimiento de médicos, psicólogos,
              nutricionistas, kinesiólogos y profesionales de diversas
              especialidades que buscan un lugar flexible, profesional y
              completamente equipado.
            </p>

            <ul class="mt-7 flex flex-wrap gap-2.5">
              {specialties.map((item) => (
                <li
                  key={item}
                  class="bg-primary-50 text-primary-700 ring-primary-100 rounded-full px-4 py-1.5 text-sm font-medium ring-1 ring-inset"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>
    );
  },
);
