import { component$, useSignal, useOnDocument, $ } from "@builder.io/qwik";
import { LuMenu, LuX } from "@qwikest/icons/lucide";
import { Container } from "../ui/container";
import { Button } from "../ui/button";
import { Brand } from "./brand";
import { useNavSections } from "~/routes/layout";

/**
 * Header sticky con navegación ancla (scroll suave vía CSS) y CTA destacado.
 * El fondo se intensifica levemente al hacer scroll. Incluye menú mobile.
 */
export const Header = component$(() => {
  const navLinks = useNavSections();
  const scrolled = useSignal(false);
  const menuOpen = useSignal(false);

  useOnDocument(
    "scroll",
    $(() => {
      const next = window.scrollY > 8;
      if (next !== scrolled.value) scrolled.value = next;
    }),
  );

  const closeMenu = $(() => (menuOpen.value = false));

  return (
    <header
      class={[
        "sticky top-0 z-50 transition-colors duration-300",
        scrolled.value
          ? "border-line border-b bg-white/90 shadow-[0_2px_24px_-16px_rgba(8,24,42,0.5)] backdrop-blur-md"
          : "border-b border-transparent bg-white/70 backdrop-blur-md",
      ]}
    >
      <Container class="flex h-16 items-center justify-between gap-4 lg:h-[4.5rem]">
        <a
          href="#inicio"
          aria-label="BioBal — Inicio"
          class="shrink-0"
          onClick$={closeMenu}
        >
          <Brand class="h-10 lg:h-12" />
        </a>

        <nav class="hidden items-center gap-0.5 lg:flex" aria-label="Principal">
          {navLinks.value.map((link) => (
            <a
              key={link.href}
              href={link.href}
              class="text-ink hover:bg-primary-50 hover:text-primary-700 rounded-full px-3.5 py-2 text-sm font-medium transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div class="flex items-center gap-2">
          <Button href="#contacto" class="hidden sm:inline-flex">
            Contactanos
          </Button>
          <button
            type="button"
            class="text-primary-800 hover:bg-primary-50 inline-flex h-11 w-11 items-center justify-center rounded-xl transition-colors lg:hidden"
            aria-label={menuOpen.value ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen.value}
            aria-controls="mobile-menu"
            onClick$={() => (menuOpen.value = !menuOpen.value)}
          >
            {menuOpen.value ? (
              <LuX class="h-6 w-6" />
            ) : (
              <LuMenu class="h-6 w-6" />
            )}
          </button>
        </div>
      </Container>

      {menuOpen.value && (
        <div id="mobile-menu" class="border-line border-t bg-white lg:hidden">
          <Container class="flex flex-col gap-1 py-4">
            {navLinks.value.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick$={closeMenu}
                class="text-ink hover:bg-primary-50 hover:text-primary-700 rounded-xl px-4 py-3 text-base font-medium transition-colors"
              >
                {link.label}
              </a>
            ))}
            <Button href="#contacto" block class="mt-2" onClick$={closeMenu}>
              Contactanos
            </Button>
          </Container>
        </div>
      )}
    </header>
  );
});
