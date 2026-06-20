import { component$, type FunctionComponent } from "@builder.io/qwik";
import {
  LuAward,
  LuSlidersHorizontal,
  LuMapPin,
  LuBuilding2,
  LuUsers,
} from "@qwikest/icons/lucide";
import { Section } from "../ui/section";
import { Container } from "../ui/container";
import { SectionTitle } from "../ui/section-title";
import { Card } from "../ui/card";
import { type SectionContent, orDefault } from "~/lib/content";

type IconType = FunctionComponent<{ class?: string }>;

const razones: { title: string; text: string; Icon: IconType }[] = [
  {
    title: "Profesionalismo",
    text: "Un entorno diseñado específicamente para profesionales de la salud.",
    Icon: LuAward,
  },
  {
    title: "Flexibilidad",
    text: "Opciones adaptadas a las necesidades de cada especialidad.",
    Icon: LuSlidersHorizontal,
  },
  {
    title: "Ubicación estratégica",
    text: "Dentro de Small Center Las Piedras, con excelente accesibilidad.",
    Icon: LuMapPin,
  },
  {
    title: "Infraestructura de calidad",
    text: "Espacios modernos, funcionales y preparados para una atención de excelencia.",
    Icon: LuBuilding2,
  },
  {
    title: "Comunidad profesional",
    text: "Una red interdisciplinaria que favorece la colaboración y el crecimiento.",
    Icon: LuUsers,
  },
];

export const PorQue = component$<{ content?: SectionContent }>(
  ({ content }) => {
    return (
      <Section id="por-que" tone="white">
        <Container>
          <div data-reveal>
            <SectionTitle
              align="center"
              eyebrow={orDefault(content?.eyebrow, "Por qué BioBal")}
              title={orDefault(content?.title, "¿Por qué elegir BioBal?")}
            />
          </div>

          <div class="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {razones.map(({ title, text, Icon }, i) => (
              <Card
                key={title}
                interactive
                class="bb-card-glow"
                data-reveal
                style={{ "--reveal-delay": `${i * 80}ms` }}
              >
                <span class="bg-primary-50 text-primary-700 ring-primary-100 inline-flex h-12 w-12 items-center justify-center rounded-xl ring-1 ring-inset">
                  <Icon class="h-6 w-6" />
                </span>
                <h3 class="font-display text-primary-900 mt-5 text-xl font-semibold">
                  {title}
                </h3>
                <p class="text-ink-soft mt-2 text-base leading-relaxed">
                  {text}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>
    );
  },
);
