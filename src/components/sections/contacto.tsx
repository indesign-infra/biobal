import { component$, type FunctionComponent } from "@builder.io/qwik";
import { Form } from "@builder.io/qwik-city";
import {
  LuMapPin,
  LuPhone,
  LuInstagram,
  LuGlobe,
  LuUser,
  LuCheckCircle2,
  LuLoader2,
  LuArrowRight,
} from "@qwikest/icons/lucide";
import type { useCreateLead } from "~/routes/index";
import { useSiteSettings } from "~/routes/layout";
import { Section } from "../ui/section";
import { Container } from "../ui/container";
import { Button } from "../ui/button";
import { especialidades, site } from "~/lib/site";
import { type SectionContent, orDefault } from "~/lib/content";

type ContactoProps = {
  action: ReturnType<typeof useCreateLead>;
  content?: SectionContent;
};

const fieldBase =
  "w-full rounded-xl border bg-white px-4 py-3 text-ink shadow-sm transition-colors placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-accent-500/40";

type IconType = FunctionComponent<{ class?: string }>;

type ContactItem = {
  Icon: IconType;
  label: string;
  href?: string;
  external?: boolean;
  sub?: string;
};

export const Contacto = component$<ContactoProps>(({ action, content }) => {
  const v = action.value;
  const errors = v?.fieldErrors;
  const s = useSiteSettings().value;

  const contactItems: ContactItem[] = [
    {
      Icon: LuMapPin,
      href: s.mapsUrl,
      external: true,
      label: s.addressLine1,
      sub: s.addressLine2,
    },
    { Icon: LuPhone, href: `tel:${s.phoneTel}`, label: s.phoneDisplay },
    {
      Icon: LuInstagram,
      href: s.instagramUrl,
      external: true,
      label: s.instagramHandle,
    },
    { Icon: LuGlobe, href: site.url, label: site.domain },
    { Icon: LuUser, label: s.referente },
  ];

  return (
    <Section id="contacto" tone="primary">
      <Container class="grid gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Columna de info */}
        <div>
          <p class="text-accent-300 text-sm font-semibold tracking-[0.14em] uppercase">
            {orDefault(content?.eyebrow, "Sumate a BioBal")}
          </p>
          <h2 class="font-display mt-4 text-3xl leading-tight font-semibold text-white sm:text-4xl">
            {orDefault(content?.title, "Sumate a BioBal")}
          </h2>
          <p class="text-primary-100/85 mt-5 max-w-lg text-base leading-relaxed sm:text-lg">
            Desarrollá tu actividad profesional en un espacio pensado para
            crecer. Consultá disponibilidad, conocé las instalaciones y descubrí
            una nueva forma de ejercer tu profesión.
          </p>

          <ul class="mt-8 space-y-4">
            {contactItems.map(({ Icon, href, external, label, sub }) => (
              <li key={label} class="flex items-start gap-3.5">
                <span class="text-accent-300 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15 ring-inset">
                  <Icon class="h-5 w-5" />
                </span>
                <div class="pt-1.5 text-sm">
                  {href ? (
                    <a
                      href={href}
                      target={external ? "_blank" : undefined}
                      rel={external ? "noreferrer noopener" : undefined}
                      class="text-primary-100 font-medium transition-colors hover:text-white"
                    >
                      {label}
                    </a>
                  ) : (
                    <span class="text-primary-100 font-medium">{label}</span>
                  )}
                  {sub && <span class="text-primary-200/60 block">{sub}</span>}
                </div>
              </li>
            ))}
          </ul>

          <div class="mt-8 rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 ring-inset">
            <p class="text-accent-300 text-xs font-semibold tracking-[0.14em] uppercase">
              Especialidades atendidas
            </p>
            <p class="text-primary-100/80 mt-2 text-sm leading-relaxed">
              Odontología, Psicología, Kinesiología, Ginecología, Clínica
              Médica, Nutrición, Cardiología, Pediatría, Fonoaudiología y más.
            </p>
          </div>
        </div>

        {/* Formulario */}
        <div class="shadow-primary-950/40 rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
          {v?.success ? (
            <div class="flex h-full flex-col items-center justify-center py-10 text-center">
              <span class="bg-success-soft text-success inline-flex h-16 w-16 items-center justify-center rounded-full">
                <LuCheckCircle2 class="h-9 w-9" />
              </span>
              <h3 class="font-display text-primary-900 mt-5 text-2xl font-semibold">
                ¡Gracias por tu consulta!
              </h3>
              <p class="text-ink-soft mt-3 max-w-sm">
                Recibimos tus datos y nos vamos a contactar a la brevedad para
                coordinar tu visita.
              </p>
            </div>
          ) : (
            <Form action={action} class="space-y-5">
              {/* Honeypot anti-bots: invisible para humanos, debe quedar vacío. */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                class="absolute left-[-9999px] h-0 w-0 opacity-0"
              />
              <div>
                <h3 class="font-display text-primary-900 text-xl font-semibold">
                  Solicitá una visita
                </h3>
                <p class="text-ink-soft mt-1 text-sm">
                  Dejanos tus datos y te contactamos.
                </p>
              </div>

              {v?.failed && v?.message && (
                <p
                  role="alert"
                  class="border-error/30 bg-error-soft text-error rounded-xl border px-4 py-3 text-sm font-medium"
                >
                  {v.message}
                </p>
              )}

              {/* Nombre */}
              <div>
                <label
                  for="nombre"
                  class="text-ink-strong mb-1.5 block text-sm font-medium"
                >
                  Nombre <span class="text-error">*</span>
                </label>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  autoComplete="name"
                  required
                  aria-invalid={errors?.nombre ? "true" : undefined}
                  placeholder="Tu nombre y apellido"
                  class={[
                    fieldBase,
                    errors?.nombre
                      ? "border-error focus:ring-error/30"
                      : "border-line focus:border-accent-500",
                  ]}
                />
                {errors?.nombre && (
                  <p class="text-error mt-1.5 text-sm">{errors.nombre[0]}</p>
                )}
              </div>

              {/* Email + Teléfono */}
              <div class="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    for="email"
                    class="text-ink-strong mb-1.5 block text-sm font-medium"
                  >
                    Email <span class="text-error">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    aria-invalid={errors?.email ? "true" : undefined}
                    placeholder="vos@ejemplo.com"
                    class={[
                      fieldBase,
                      errors?.email
                        ? "border-error focus:ring-error/30"
                        : "border-line focus:border-accent-500",
                    ]}
                  />
                  {errors?.email && (
                    <p class="text-error mt-1.5 text-sm">{errors.email[0]}</p>
                  )}
                </div>

                <div>
                  <label
                    for="telefono"
                    class="text-ink-strong mb-1.5 block text-sm font-medium"
                  >
                    Teléfono <span class="text-error">*</span>
                  </label>
                  <input
                    id="telefono"
                    name="telefono"
                    type="tel"
                    autoComplete="tel"
                    required
                    aria-invalid={errors?.telefono ? "true" : undefined}
                    placeholder="11 1234-5678"
                    class={[
                      fieldBase,
                      errors?.telefono
                        ? "border-error focus:ring-error/30"
                        : "border-line focus:border-accent-500",
                    ]}
                  />
                  {errors?.telefono && (
                    <p class="text-error mt-1.5 text-sm">
                      {errors.telefono[0]}
                    </p>
                  )}
                </div>
              </div>

              {/* Especialidad */}
              <div>
                <label
                  for="especialidad"
                  class="text-ink-strong mb-1.5 block text-sm font-medium"
                >
                  Especialidad
                </label>
                <select
                  id="especialidad"
                  name="especialidad"
                  class={[fieldBase, "border-line focus:border-accent-500"]}
                >
                  <option value="">Seleccioná tu especialidad</option>
                  {especialidades.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mensaje */}
              <div>
                <label
                  for="mensaje"
                  class="text-ink-strong mb-1.5 block text-sm font-medium"
                >
                  Mensaje
                </label>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  rows={4}
                  placeholder="Contanos qué estás buscando (opcional)"
                  class={[
                    fieldBase,
                    "border-line focus:border-accent-500 resize-y",
                  ]}
                />
                {errors?.mensaje && (
                  <p class="text-error mt-1.5 text-sm">{errors.mensaje[0]}</p>
                )}
              </div>

              <Button type="submit" size="lg" block disabled={action.isRunning}>
                {action.isRunning ? (
                  <>
                    <LuLoader2 class="h-5 w-5 animate-spin" />
                    Enviando…
                  </>
                ) : (
                  <>
                    Solicitar una visita
                    <LuArrowRight class="h-5 w-5" />
                  </>
                )}
              </Button>

              <p class="text-ink-soft text-center text-xs">
                Al enviar aceptás que BioBal te contacte por los datos
                provistos.
              </p>
            </Form>
          )}
        </div>
      </Container>
    </Section>
  );
});
