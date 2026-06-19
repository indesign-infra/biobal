/**
 * Contenido editable de una sección (subconjunto de la tabla `sections`).
 * Lo recibe cada componente de sección; si un campo viene null/undefined se usa
 * el valor por defecto del propio componente.
 */
export type SectionContent = {
  eyebrow?: string | null;
  title?: string | null;
  subtitle?: string | null;
  body?: string | null;
  imageUrl?: string | null;
};

/** Devuelve `value` si tiene contenido, si no el `fallback`. */
export const orDefault = (
  value: string | null | undefined,
  fallback: string,
): string => (value != null && value !== "" ? value : fallback);
