/* eslint-disable qwik/jsx-img -- imagen decorativa local de public/, ya optimizada a WebP; ?jsx no aplica a backgrounds */
import { component$ } from "@builder.io/qwik";
import { LuMapPin, LuPhone, LuInstagram, LuGlobe } from "@qwikest/icons/lucide";
import { Container } from "../ui/container";
import { Brand } from "./brand";
import { site } from "~/lib/site";
import { useNavSections, useSiteSettings } from "~/routes/layout";

export const Footer = component$(() => {
  const year = new Date().getFullYear();
  const navLinks = useNavSections();
  const s = useSiteSettings().value;

  return (
    <footer class="bg-primary-950 text-primary-100 relative overflow-hidden">
      {/* Imagen decorativa de fondo (ADN / laboratorio): textura sutil que
          refuerza la identidad "Bio" sin restar legibilidad. Lazy: está al
          final de la página. */}
      <img
        src="/images/laboratorio.webp"
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        width={1600}
        height={1067}
        class="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.35] select-none"
      />
      {/* Velo: oscurece para que el texto se lea siempre y difumina los bordes. */}
      <div
        aria-hidden="true"
        class="from-primary-950 via-primary-950/45 to-primary-950 absolute inset-0 bg-linear-to-b"
      />

      <Container class="relative py-14 sm:py-16">
        <div class="grid gap-10 lg:grid-cols-[1.4fr_1fr_1.2fr]">
          {/* Marca + tagline */}
          <div>
            <Brand tone="light" />
            <p class="text-primary-200/80 mt-4 max-w-sm text-sm leading-relaxed">
              Espacio integral de salud y alquiler de consultorios profesionales
              en el complejo Small Center Las Piedras, Buenos Aires.
            </p>
            <p class="text-primary-200/70 mt-4 text-sm">
              Referente: {s.referente}.
            </p>
          </div>

          {/* Navegación */}
          <nav aria-label="Pie de página">
            <h3 class="text-accent-300 text-sm font-semibold tracking-[0.14em] uppercase">
              Navegación
            </h3>
            <ul class="mt-4 space-y-2.5 text-sm">
              {navLinks.value.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    class="text-primary-200/85 transition-colors hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#contacto"
                  class="text-primary-200/85 transition-colors hover:text-white"
                >
                  Contacto
                </a>
              </li>
            </ul>
          </nav>

          {/* Contacto */}
          <div>
            <h3 class="text-accent-300 text-sm font-semibold tracking-[0.14em] uppercase">
              Contacto
            </h3>
            <ul class="mt-4 space-y-3.5 text-sm">
              <li class="flex gap-3">
                <LuMapPin class="text-accent-400 mt-0.5 h-5 w-5 shrink-0" />
                <a
                  href={s.mapsUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  class="text-primary-200/85 transition-colors hover:text-white"
                >
                  {s.addressLine1}
                  <span class="text-primary-200/60 block">
                    {s.addressLine2}
                  </span>
                </a>
              </li>
              <li class="flex gap-3">
                <LuPhone class="text-accent-400 h-5 w-5 shrink-0" />
                <a
                  href={`tel:${s.phoneTel}`}
                  class="text-primary-200/85 transition-colors hover:text-white"
                >
                  {s.phoneDisplay}
                </a>
              </li>
              <li class="flex gap-3">
                <LuInstagram class="text-accent-400 h-5 w-5 shrink-0" />
                <a
                  href={s.instagramUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  class="text-primary-200/85 transition-colors hover:text-white"
                >
                  {s.instagramHandle}
                </a>
              </li>
              <li class="flex gap-3">
                <LuGlobe class="text-accent-400 h-5 w-5 shrink-0" />
                <a
                  href={site.url}
                  class="text-primary-200/85 transition-colors hover:text-white"
                >
                  {site.domain}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div class="text-primary-200/60 mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.name}. TTodos los derechos reservados.
          </p>
          <p>{s.tagline} · Las Piedras, Buenos Aires</p>
        </div>
      </Container>
    </footer>
  );
});
