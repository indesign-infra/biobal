import { component$, type FunctionComponent } from "@builder.io/qwik";
import {
  LuStethoscope,
  LuBrain,
  LuApple,
  LuActivity,
  LuEar,
  LuHeartHandshake,
  LuSparkles,
  LuLeaf,
  LuArrowRight,
} from "@qwikest/icons/lucide";
import { Section } from "../ui/section";
import { Container } from "../ui/container";
import { SectionTitle } from "../ui/section-title";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { ImagePlaceholder } from "../ui/image-placeholder";
import { type SectionContent, orDefault } from "~/lib/content";

type IconType = FunctionComponent<{ class?: string }>;

const destinatarios: { label: string; Icon: IconType }[] = [
  { label: "Médicos clínicos y especialistas", Icon: LuStethoscope },
  { label: "Psicólogos", Icon: LuBrain },
  { label: "Nutricionistas", Icon: LuApple },
  { label: "Kinesiólogos", Icon: LuActivity },
  { label: "Fonoaudiólogos", Icon: LuEar },
  { label: "Terapistas ocupacionales", Icon: LuHeartHandshake },
  { label: "Medicina estética", Icon: LuSparkles },
  { label: "Profesionales de la salud y el bienestar", Icon: LuLeaf },
];

export const Consultorios = component$<{ content?: SectionContent }>(
  ({ content }) => {
    const eyebrow = orDefault(content?.eyebrow, "Consultorios profesionales");
    const title = orDefault(
      content?.title,
      "Espacios listos para comenzar a atender",
    );
    const subtitle = orDefault(
      content?.subtitle,
      "Consultorios en alquiler para distintas especialidades médicas y terapéuticas. Cada espacio está diseñado para ofrecer comodidad, privacidad y funcionalidad.",
    );
    const image = orDefault(content?.imageUrl, "/images/consultorio.jpg");
    return (
      <Section id="consultorios" tone="surface">
        <Container>
          <div class="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
            <div>
              <SectionTitle
                eyebrow={eyebrow}
                title={title}
                subtitle={subtitle}
              />
              <Button href="#contacto" class="mt-7">
                Consultá disponibilidad
                <LuArrowRight class="h-5 w-5" />
              </Button>
            </div>
            <ImagePlaceholder
              alt="Consultorio profesional equipado en BioBal, con escritorio, sillas y luz natural"
              src={image}
              ratio="4 / 5"
              width={1200}
              height={1600}
            />
          </div>

          <p class="text-accent-600 mt-14 text-sm font-semibold tracking-[0.14em] uppercase">
            Destinado a
          </p>
          <div class="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {destinatarios.map(({ label, Icon }) => (
              <Card
                key={label}
                interactive
                class="flex items-center gap-4 p-5 sm:p-5"
              >
                <span class="bg-accent-50 text-accent-600 ring-accent-100 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset">
                  <Icon class="h-6 w-6" />
                </span>
                <span class="text-ink-strong text-sm font-medium">{label}</span>
              </Card>
            ))}
          </div>
        </Container>
      </Section>
    );
  },
);
