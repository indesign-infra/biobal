import { component$, isDev } from "@builder.io/qwik";
import { QwikCityProvider, RouterOutlet } from "@builder.io/qwik-city";
import { RouterHead } from "./components/router-head/router-head";

import "./global.css";

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
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@500;600;700&display=swap"
        />
        {!isDev && (
          <link
            rel="manifest"
            href={`${import.meta.env.BASE_URL}manifest.json`}
          />
        )}
        <RouterHead />
      </head>
      <body lang="es-AR">
        <RouterOutlet />
      </body>
    </QwikCityProvider>
  );
});
