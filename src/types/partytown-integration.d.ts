/**
 * Declaración de tipos para el subpath `@builder.io/partytown/integration`.
 * La versión 0.10.3 publica el campo `types` en su package.json pero no
 * incluye el archivo `integration/index.d.ts`, así que TS lo trata como `any`.
 * Tipamos acá lo que usamos (partytownSnippet + el config con `forward`).
 */
declare module "@builder.io/partytown/integration" {
  export type PartytownForwardPropertyType =
    | string
    | [string, { preserveBehavior?: boolean }?];

  export interface PartytownConfig {
    /** Propiedades del hilo principal a reenviar al worker (ej: 'gtag'). */
    forward?: PartytownForwardPropertyType[];
    /** Activa los logs de debug de Partytown. */
    debug?: boolean;
    /** Ruta donde se sirven los archivos lib (default: `/~partytown/`). */
    lib?: string;
    /** Scripts que deben seguir corriendo en el hilo principal. */
    loadScriptsOnMainThread?: (string | [string, string])[];
    /** Reescritura de URLs (útil para proxear endpoints de terceros). */
    resolveUrl?: (
      url: URL,
      location: Location,
      type: string,
    ) => URL | undefined | null;
    [key: string]: unknown;
  }

  export function partytownSnippet(config?: PartytownConfig): string;
  export const SCRIPT_TYPE: string;
}
