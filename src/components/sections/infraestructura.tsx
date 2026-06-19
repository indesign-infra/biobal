import { component$, type FunctionComponent } from "@builder.io/qwik";
import {
  LuCheckCircle2,
  LuBuilding2,
  LuArmchair,
  LuCar,
  LuAccessibility,
  LuWifi,
  LuSnowflake,
  LuShieldCheck,
  LuSparkles,
  LuSofa,
  LuUsers,
  LuCoffee,
  LuRoute,
  LuWind,
  LuHeartPulse,
  LuSlidersHorizontal,
} from "@qwikest/icons/lucide";
import { Section } from "../ui/section";
import { Container } from "../ui/container";
import { SectionTitle } from "../ui/section-title";
import { type SectionContent, orDefault } from "~/lib/content";

type IconType = FunctionComponent<{ class?: string }>;

type Benefit = { label: string; Icon: IconType; premium?: boolean };

const benefits: Benefit[] = [
  { label: "Consultorios completamente equipados", Icon: LuCheckCircle2 },
  { label: "Espacios modernos y funcionales", Icon: LuBuilding2 },
  { label: "Recepción y áreas de espera confortables", Icon: LuArmchair },
  { label: "Estacionamiento gratuito", Icon: LuCar },
  { label: "Accesibilidad y excelente ubicación", Icon: LuAccessibility },
  { label: "Internet de alta velocidad", Icon: LuWifi },
  { label: "Ambientes climatizados", Icon: LuSnowflake },
  { label: "Seguridad y monitoreo permanente", Icon: LuShieldCheck },
  { label: "Limpieza y mantenimiento", Icon: LuSparkles },
  { label: "Espacios comunes de calidad", Icon: LuSofa },
  { label: "Entorno profesional y multidisciplinario", Icon: LuUsers },
  { label: "Propuesta gastronómica dentro del complejo", Icon: LuCoffee },
  { label: "Fácil acceso desde distintos puntos de la ciudad", Icon: LuRoute },
  { label: "Aire acondicionado central", Icon: LuWind, premium: true },
  { label: "Servicio de emergencia", Icon: LuHeartPulse, premium: true },
  {
    label: "Espacio adaptado para la especialidad",
    Icon: LuSlidersHorizontal,
    premium: true,
  },
];

export const Infraestructura = component$<{ content?: SectionContent }>(
  ({ content }) => {
    return (
      <Section id="infraestructura" tone="white">
        <Container>
          <SectionTitle
            align="center"
            eyebrow={orDefault(content?.eyebrow, "Infraestructura y servicios")}
            title={orDefault(
              content?.title,
              "Todo lo que necesitás para desarrollar tu actividad",
            )}
            subtitle={orDefault(
              content?.subtitle,
              "Servicios e instalaciones pensados para que te enfoques en tu profesión y tus pacientes.",
            )}
          />

          <ul class="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map(({ label, Icon, premium }) => (
              <li
                key={label}
                class={[
                  "flex items-center gap-4 rounded-2xl p-4 ring-1 transition-colors ring-inset",
                  premium
                    ? "bg-accent-50 ring-accent-200"
                    : "bg-surface ring-line hover:ring-primary-200",
                ]}
              >
                <span
                  class={[
                    "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                    premium
                      ? "bg-accent-500 text-white"
                      : "text-primary-600 ring-line bg-white ring-1 ring-inset",
                  ]}
                >
                  <Icon class="h-5 w-5" />
                </span>
                <span class="text-ink-strong text-sm font-medium">
                  {label}
                  {premium && (
                    <span
                      class="ml-1.5 align-middle"
                      title="Servicio destacado"
                    >
                      ✨
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </Container>
      </Section>
    );
  },
);
