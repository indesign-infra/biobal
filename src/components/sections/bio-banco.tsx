import { component$ } from "@builder.io/qwik";
import { LuShieldCheck, LuSparkles } from "@qwikest/icons/lucide";
import { Section } from "../ui/section";
import { Container } from "../ui/container";
import { type SectionContent, orDefault } from "~/lib/content";

export const BioBanco = component$<{ content?: SectionContent }>(
  ({ content }) => {
    const eyebrow = orDefault(content?.eyebrow, "Unidad especializada");
    const title = orDefault(content?.title, "Bio Banco de Tejidos");
    const body = orDefault(
      content?.body,
      "Dentro de las instalaciones de BioBal funciona Bio Banco de Tejidos, una unidad especializada que forma parte del ecosistema de servicios de salud de la institución. Su actividad se orienta a la gestión, procesamiento y conservación de tejidos bajo estrictos estándares de calidad, contribuyendo al desarrollo de soluciones innovadoras para el ámbito sanitario y reforzando el compromiso de BioBal con la excelencia y la innovación en salud.",
    );
    const image = orDefault(content?.imageUrl, "/images/laboratorio.jpg");
    return (
      <Section id="bio-banco" tone="primary" class="overflow-hidden">
        <Container>
          <div class="bg-primary-800/60 relative overflow-hidden rounded-3xl p-8 ring-1 ring-white/10 ring-inset sm:p-12 lg:p-16">
            {/* Foto de laboratorio de fondo + gradiente para legibilidad */}
            <img
              src={image}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              class="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-30"
            />
            <div
              aria-hidden="true"
              class="from-primary-950/95 via-primary-900/85 to-primary-800/60 pointer-events-none absolute inset-0 bg-linear-to-r"
            />
            {/* Glow decorativo */}
            <div
              aria-hidden="true"
              class="bg-accent-500/20 pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full blur-3xl"
            />

            <div class="relative grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:items-center lg:gap-16">
              <div>
                <span class="bg-accent-500/15 text-accent-300 ring-accent-500/30 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold tracking-[0.14em] uppercase ring-1 ring-inset">
                  {eyebrow}
                </span>
                <h2 class="font-display mt-5 text-3xl font-semibold text-white sm:text-4xl">
                  {title}
                </h2>
                <p class="text-primary-100/90 mt-5 text-base leading-relaxed sm:text-lg">
                  {body}
                </p>
              </div>

              <ul class="grid gap-4">
                <li class="flex items-start gap-4 rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 ring-inset">
                  <LuShieldCheck class="text-accent-300 mt-0.5 h-7 w-7 shrink-0" />
                  <div>
                    <p class="font-display font-semibold text-white">
                      Estándares de calidad
                    </p>
                    <p class="text-primary-100/80 mt-1 text-sm">
                      Gestión, procesamiento y conservación de tejidos con
                      controles estrictos.
                    </p>
                  </div>
                </li>
                <li class="flex items-start gap-4 rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 ring-inset">
                  <LuSparkles class="text-accent-300 mt-0.5 h-7 w-7 shrink-0" />
                  <div>
                    <p class="font-display font-semibold text-white">
                      Innovación en salud
                    </p>
                    <p class="text-primary-100/80 mt-1 text-sm">
                      Soluciones que aportan al desarrollo del ámbito sanitario.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </Container>
      </Section>
    );
  },
);
