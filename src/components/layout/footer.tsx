import { component$ } from "@builder.io/qwik";
import { LuMapPin, LuPhone, LuInstagram, LuGlobe } from "@qwikest/icons/lucide";
import { Container } from "../ui/container";
import { Brand } from "./brand";
import { navLinks, site } from "~/lib/site";

export const Footer = component$(() => {
  const year = new Date().getFullYear();

  return (
    <footer class="bg-primary-950 text-primary-100">
      <Container class="py-14 sm:py-16">
        <div class="grid gap-10 lg:grid-cols-[1.4fr_1fr_1.2fr]">
          {/* Marca + tagline */}
          <div>
            <Brand tone="light" />
            <p class="text-primary-200/80 mt-4 max-w-sm text-sm leading-relaxed">
              Espacio integral de salud y alquiler de consultorios profesionales
              en el complejo Small Center Las Piedras, Buenos Aires.
            </p>
            <p class="text-primary-200/70 mt-4 text-sm">
              Referente: {site.referente}.
            </p>
          </div>

          {/* Navegación */}
          <nav aria-label="Pie de página">
            <h3 class="text-accent-300 text-sm font-semibold tracking-[0.14em] uppercase">
              Navegación
            </h3>
            <ul class="mt-4 space-y-2.5 text-sm">
              {navLinks.map((link) => (
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
                  href={site.address.maps}
                  target="_blank"
                  rel="noreferrer noopener"
                  class="text-primary-200/85 transition-colors hover:text-white"
                >
                  {site.address.line1}
                  <span class="text-primary-200/60 block">
                    {site.address.line2}
                  </span>
                </a>
              </li>
              <li class="flex gap-3">
                <LuPhone class="text-accent-400 h-5 w-5 shrink-0" />
                <a
                  href={`tel:${site.phone.tel}`}
                  class="text-primary-200/85 transition-colors hover:text-white"
                >
                  {site.phone.display}
                </a>
              </li>
              <li class="flex gap-3">
                <LuInstagram class="text-accent-400 h-5 w-5 shrink-0" />
                <a
                  href={site.instagram.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  class="text-primary-200/85 transition-colors hover:text-white"
                >
                  {site.instagram.handle}
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
            © {year} {site.name}. Todos los derechos reservados.
          </p>
          <p>{site.tagline} · Las Piedras, Buenos Aires</p>
        </div>
      </Container>
    </footer>
  );
});
