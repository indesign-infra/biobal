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
          <div data-reveal>
            <SectionTitle
              align="center"
              eyebrow={orDefault(
                content?.eyebrow,
                "Infraestructura y servicios",
              )}
              title={orDefault(
                content?.title,
                "Todo lo que necesitás para desarrollar tu actividad",
              )}
              subtitle={orDefault(
                content?.subtitle,
                "Servicios e instalaciones pensados para que te enfoques en tu profesión y tus pacientes.",
              )}
            />
          </div>

          <ul class="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map(({ label, Icon, premium }, i) => (
              <li
                key={label}
                data-reveal
                style={{ "--reveal-delay": `${(i % 6) * 60}ms` }}
                class={[
                  "flex items-center gap-4 rounded-2xl p-4 ring-1 transition-all ring-inset hover:-translate-y-0.5",
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

          {/* Seguridad y habilitaciones */}
          <div
            data-reveal
            class="bg-primary-50 ring-primary-100 mt-10 rounded-3xl p-6 ring-1 ring-inset sm:p-8"
          >
            <div class="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
              <div class="sm:max-w-xs">
                <span class="bg-primary-600 inline-flex h-12 w-12 items-center justify-center rounded-xl text-white">
                  <LuShieldCheck class="h-6 w-6" />
                </span>
                <h3 class="font-display text-primary-900 mt-4 text-xl font-semibold">
                  Seguridad y habilitaciones
                </h3>
                <p class="text-ink-soft mt-2 text-base leading-relaxed">
                  Cumplimiento de las normas de seguridad y los controles
                  correspondientes, para que trabajes con total tranquilidad.
                </p>
              </div>

              <ul class="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  "Señalización de seguridad",
                  "Plano de evacuación",
                  "Sistema de protección contra incendios",
                  "Controles y habilitaciones al día",
                ].map((item) => (
                  <li key={item} class="flex items-center gap-3">
                    <LuCheckCircle2 class="text-primary-600 h-5 w-5 shrink-0" />
                    <span class="text-ink-strong text-sm font-medium">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </Section>
    );
  },
);
