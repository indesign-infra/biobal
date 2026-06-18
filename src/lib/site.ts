/**
 * Datos institucionales de BioBal, centralizados para reutilizar en el header,
 * el footer, el formulario de contacto y el SEO.
 */
export const site = {
  name: "BioBal",
  tagline: "Espacio Integral de Salud",
  domain: "biobal.com.ar",
  url: "https://biobal.com.ar",
  description:
    "Espacio integral de salud y alquiler de consultorios profesionales en el complejo Small Center Las Piedras, Buenos Aires. Infraestructura de calidad y servicios pensados para profesionales de la salud.",
  phone: {
    display: "11 2758-5392",
    tel: "+541127585392",
  },
  instagram: {
    handle: "@biobal_consultorios",
    url: "https://instagram.com/biobal_consultorios",
  },
  address: {
    line1: "Golfers G. C. 2972, Las Piedras, Buenos Aires",
    line2: "Small Center Las Piedras — Piso 2, Oficina 202",
    maps: "https://www.google.com/maps/search/?api=1&query=Small+Center+Las+Piedras+Golfers+2972",
  },
  referente: "Lic. Mónica Álvarez — Bióloga",
} as const;

/** Enlaces de navegación ancla del header. */
export const navLinks = [
  { label: "Sobre BioBal", href: "#sobre" },
  { label: "Bio Banco", href: "#bio-banco" },
  { label: "Consultorios", href: "#consultorios" },
  { label: "Infraestructura", href: "#infraestructura" },
  { label: "Por qué BioBal", href: "#por-que" },
] as const;

/**
 * Especialidades para el `select` del formulario. La última opción ("Otra")
 * cubre cualquier caso no listado.
 */
export const especialidades = [
  "Odontología",
  "Psicología",
  "Kinesiología",
  "Ginecología",
  "Clínica Médica",
  "Nutrición",
  "Cardiología",
  "Pediatría",
  "Fonoaudiología",
  "Medicina estética",
  "Terapia ocupacional",
  "Otra",
] as const;
