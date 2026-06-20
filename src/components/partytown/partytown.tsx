import { component$ } from "@builder.io/qwik";
import {
  partytownSnippet,
  type PartytownConfig,
} from "@builder.io/partytown/integration";

export type PartytownProps = PartytownConfig;

/**
 * Inyecta el snippet de inicialización de Partytown.
 * Las funciones listadas en `forward` (ej: 'gtag', 'dataLayer.push') se
 * reenvían desde el hilo principal al Web Worker donde corre gtag.js.
 */
export const QwikPartytown = component$((props: PartytownProps) => {
  return <script dangerouslySetInnerHTML={partytownSnippet(props)} />;
});
