import { $, component$, isDev } from "@builder.io/qwik";
import { QwikCityProvider, RouterOutlet } from "@builder.io/qwik-city";
import { RouterHead } from "./components/router-head/router-head";
import { QwikPartytown } from "./components/partytown/partytown";
import { useImageProvider, type ImageTransformerProps } from "qwik-image";

import "./global.css";

// ID de medición de GA4 (G-XXXXXXXXXX). Por defecto usa el ID del sitio, pero
// se puede sobreescribir con la var de entorno pública PUBLIC_GA_ID (Vercel/.env).
// Solo se carga en producción (ver gate `!isDev` abajo).
const GA_ID =
  (import.meta.env.PUBLIC_GA_ID as string | undefined) ?? "G-Y278KWG3W6";

// Hoja de estilos de las fuentes (Google Fonts).
const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@500;600;700&display=swap";

// Carga la hoja de fuentes sin bloquear el primer render: se baja con
// media="print" (no bloquea) y al terminar se activa con media="all".
// Patrón estándar (Filament Group), tolerante a fallos.
const fontFlipScript = `(function(){var l=document.getElementById('bb-fonts');if(!l)return;var on=function(){l.media='all';};if(l.sheet){on();}else{l.addEventListener('load',on);}})();`;

/**
 * Reveal-on-scroll con un único IntersectionObserver, sin hidratación de Qwik.
 * Corre en el <head> antes del paint: agrega `reveal-ready` (que activa el
 * estado oculto inicial de los [data-reveal]) y luego revela cada uno al entrar
 * en viewport. Si no hay soporte o el usuario pide menos movimiento, no oculta
 * nada (el contenido se ve normal). Tolerante a fallos (try/catch).
 */
const revealScript = `(function(){var d=document,h=d.documentElement;try{if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches)return;h.classList.add('reveal-ready');var run=function(){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target);}});},{rootMargin:'0px 0px -8% 0px',threshold:0.12});d.querySelectorAll('[data-reveal]').forEach(function(n){io.observe(n);});};if(d.readyState!=='loading')run();else d.addEventListener('DOMContentLoaded',run);}catch(e){h.classList.remove('reveal-ready');}})();`;

export default component$(() => {
  /**
   * The root of a QwikCity site always start with the <QwikCityProvider> component,
   * immediately followed by the document's <head> and <body>.
   *
   * Don't remove the `<head>` and `<body>` elements.
   */

  const imageTransformer$ = $(
    ({ src, width }: ImageTransformerProps): string => {
      if (src.startsWith("data:") || src.startsWith("blob:")) {
        return src;
      }
      return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=65`;
    }
  );

  useImageProvider({
    resolutions: [320, 420, 640, 750, 828, 1080, 1200],
    imageTransformer$,
  });

  return (
    <QwikCityProvider>
      <head>
        <meta charset="utf-8" />
        <script dangerouslySetInnerHTML={revealScript} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        {/* Storage de las imágenes (Vercel Blob): adelantamos DNS+TLS para que
            la imagen LCP del hero empiece a bajar antes. */}
        <link
          rel="preconnect"
          href="https://pu9e3rk9wbrecavn.public.blob.vercel-storage.com"
          crossOrigin=""
        />
        <link rel="preload" as="style" href={FONTS_HREF} />
        <link id="bb-fonts" rel="stylesheet" href={FONTS_HREF} media="print" />
        <noscript>
          <link rel="stylesheet" href={FONTS_HREF} />
        </noscript>
        <script dangerouslySetInnerHTML={fontFlipScript} />
        {!isDev && (
          <link
            rel="manifest"
            href={`${import.meta.env.BASE_URL}manifest.json`}
          />
        )}
        <RouterHead />
        {!isDev && GA_ID && (
          <>
            <QwikPartytown forward={["gtag", "dataLayer.push"]} />
            <script
              async
              type="text/partytown"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            />
            <script
              type="text/partytown"
              dangerouslySetInnerHTML={`
                window.dataLayer = window.dataLayer || [];
                window.gtag = function() { dataLayer.push(arguments); };
                gtag('js', new Date());
                // Desactivamos las funciones de publicidad (Google Signals /
                // personalización de anuncios). No las usamos —es un sitio de
                // leads, no corre Google Ads— y son las que hacen que gtag.js
                // invoque las APIs deprecadas Shared Storage y Attribution
                // Reporting (las advertencias de "API obsoletas" en PageSpeed).
                gtag('config', '${GA_ID}', {
                  allow_google_signals: false,
                  allow_ad_personalization_signals: false
                });
              `}
            />
          </>
        )}
      </head>
      <body lang="es-AR">
        <RouterOutlet />
      </body>
    </QwikCityProvider>
  );
});
