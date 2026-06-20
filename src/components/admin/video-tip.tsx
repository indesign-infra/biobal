import { component$, useSignal } from "@builder.io/qwik";
import { LuInfo, LuChevronDown } from "@qwikest/icons/lucide";

/**
 * Aviso colapsable con recomendaciones para optimizar videos antes de subirlos.
 * La conversión/compresión real no se hace en el servidor (Vercel Edge no corre
 * ffmpeg), así que guiamos al usuario a herramientas externas.
 */
export const VideoTip = component$(() => {
  const open = useSignal(false);

  return (
    <div class="rounded-xl border border-sky-200 bg-sky-50/70 p-4">
      <button
        type="button"
        onClick$={() => (open.value = !open.value)}
        class="flex w-full items-center gap-2 text-left text-sm font-semibold text-sky-900"
        aria-expanded={open.value}
      >
        <LuInfo class="h-4 w-4 shrink-0 text-sky-600" />
        Optimizá el video antes de subir (MOV pesado → MP4 liviano)
        <LuChevronDown
          class={[
            "ml-auto h-4 w-4 shrink-0 transition-transform",
            open.value && "rotate-180",
          ]}
        />
      </button>

      {open.value && (
        <div class="mt-3 space-y-3 border-t border-sky-200 pt-3 text-xs leading-relaxed text-sky-900/85">
          <p>
            Los <strong>.MOV</strong> de iPhone pesan muchísimo. Para que la web
            cargue rápido, conviene subir <strong>MP4 (H.264)</strong>{" "}
            comprimido: idealmente <strong>menos de 15–20 MB</strong>, máximo{" "}
            <strong>1080×1920</strong> (vertical). Para reels alcanza con
            720×1280.
          </p>

          <div>
            <p class="font-semibold text-sky-900">Opciones para convertir:</p>
            <ul class="mt-1.5 space-y-1.5">
              <li>
                <span class="font-semibold">HandBrake</span> (gratis,
                recomendado — Win/Mac/Linux): abrí el .MOV, elegí el preset{" "}
                <em>“Fast 1080p30”</em>, formato MP4 y exportá.{" "}
                <a
                  href="https://handbrake.fr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="font-semibold text-sky-700 underline"
                >
                  handbrake.fr
                </a>
              </li>
              <li>
                <span class="font-semibold">Online sin instalar nada:</span>{" "}
                <a
                  href="https://cloudconvert.com/mov-to-mp4"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="font-semibold text-sky-700 underline"
                >
                  CloudConvert
                </a>{" "}
                o{" "}
                <a
                  href="https://www.freeconvert.com/mov-to-mp4"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="font-semibold text-sky-700 underline"
                >
                  FreeConvert
                </a>{" "}
                (subís el MOV, descargás el MP4).
              </li>
              <li>
                <span class="font-semibold">Con ffmpeg</span> (avanzado), un
                solo comando:
                <code class="mt-1 block overflow-x-auto rounded-lg bg-sky-900 px-3 py-2 font-mono text-[11px] text-sky-50">
                  ffmpeg -i entrada.mov -vcodec libx264 -crf 26 -preset medium
                  -acodec aac -movflags +faststart salida.mp4
                </code>
              </li>
            </ul>
          </div>

          <p>
            💡 Activá la opción <strong>“Web Optimized”</strong> /{" "}
            <code class="rounded bg-sky-100 px-1 py-0.5 font-mono">
              +faststart
            </code>{" "}
            para que el video empiece a reproducirse sin esperar a que se
            descargue entero.
          </p>
        </div>
      )}
    </div>
  );
});
