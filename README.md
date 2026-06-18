# BioBal ⚡️

Sitio institucional / landing de **BioBal** — espacio integral de salud y alquiler
de consultorios profesionales en el complejo **Small Center Las Piedras**
(Buenos Aires, Argentina). El sitio es informativo + captación de leads: un
profesional entra, entiende la propuesta y deja sus datos para visitar o
consultar disponibilidad.

## Stack

- **[Qwik City](https://qwik.dev/)** + Qwik (routing por archivos, SSR).
- **TypeScript** en modo estricto.
- **[Tailwind CSS v4](https://tailwindcss.com/)** con el plugin `@tailwindcss/vite`
  (sin `tailwind.config.js` ni `postcss.config.js`; el tema se define con la
  directiva `@theme` en [`src/global.css`](src/global.css)).
- **[Supabase](https://supabase.com/)** (`@supabase/supabase-js`) para guardar los
  leads del formulario de contacto.
- **Deploy en Vercel** con el adapter **Vercel Edge** de Qwik.
- Íconos: **[`@qwikest/icons`](https://github.com/qwikest/icons)** (set Lucide,
  tree-shakeable y nativo de Qwik).
- Tipografías: **Sora** (títulos) e **Inter** (texto), vía Google Fonts con
  `display=swap` (ver `<head>` en [`src/root.tsx`](src/root.tsx)).
- Gestor de paquetes: **pnpm**.

## Requisitos

- Node.js `^18.17.0 || ^20.3.0 || >=21.0.0`
- pnpm (`npm i -g pnpm`)

## Correr en local

```bash
pnpm install
cp .env.example .env.local   # completá las variables (ver abajo)
pnpm dev                     # http://localhost:5173
```

Otros scripts:

```bash
pnpm build      # type-check + build de cliente + build del adapter (Vercel Edge) + lint
pnpm preview    # build de producción + servidor local de preview
pnpm fmt        # formatear con Prettier
pnpm lint       # ESLint
```

## Variables de entorno

El formulario de contacto usa Supabase. Definí estas variables en `.env.local`
(local) y en el panel de Vercel (producción):

| Variable                   | Descripción                                         |
| -------------------------- | --------------------------------------------------- |
| `PUBLIC_SUPABASE_URL`      | URL del proyecto de Supabase (Settings → API).      |
| `PUBLIC_SUPABASE_ANON_KEY` | Clave pública `anon` del proyecto (Settings → API). |

> Llevan el prefijo `PUBLIC_` porque Qwik las expone en `import.meta.env`. Son
> claves públicas: el acceso real lo controla la **RLS** de Supabase (ver abajo).
>
> Si las variables no están cargadas, el sitio **no se rompe**: el formulario
> responde con un mensaje de error controlado.

## Base de datos (tabla `leads`)

Los leads se guardan en la tabla `leads`. El script está en
[`supabase/schema.sql`](supabase/schema.sql).

1. Entrá al proyecto de Supabase → **SQL Editor** → **New query**.
2. Pegá el contenido de `supabase/schema.sql` y ejecutá **Run**.

El script crea la tabla y habilita **Row Level Security** con una policy que
**solo permite `INSERT`** con el `anon key` (insert público, sin lectura), de modo
que el formulario puede guardar datos desde el navegador sin exponer los leads.

| Campo          | Tipo          | Notas                           |
| -------------- | ------------- | ------------------------------- |
| `id`           | `uuid`        | PK, default `gen_random_uuid()` |
| `created_at`   | `timestamptz` | default `now()`                 |
| `nombre`       | `text`        | requerido                       |
| `email`        | `text`        | requerido (validado en server)  |
| `telefono`     | `text`        | requerido                       |
| `especialidad` | `text`        | opcional                        |
| `mensaje`      | `text`        | opcional                        |

La validación server-side se hace con `routeAction$` + `zod$` en
[`src/routes/index.tsx`](src/routes/index.tsx).

## Deploy en Vercel

El proyecto usa el adapter **Vercel Edge** de Qwik (configurado en
[`adapters/vercel-edge/vite.config.ts`](adapters/vercel-edge/vite.config.ts) y
[`src/entry.vercel-edge.tsx`](src/entry.vercel-edge.tsx)). El comando `pnpm build`
genera la salida en `.vercel/output` (Build Output API de Vercel).

Pasos:

1. Importá el repo en Vercel (framework: **Qwik**; Vercel detecta el preset).
2. En **Settings → Environment Variables** cargá, para los entornos
   _Production_ y _Preview_:
   - `PUBLIC_SUPABASE_URL`
   - `PUBLIC_SUPABASE_ANON_KEY`
3. Deploy. (Para deploy manual desde la CLI: `pnpm deploy`, que corre `vercel deploy`.)

> **Edge vs Serverless:** se eligió **Edge** porque el sitio solo hace un `insert`
> en Supabase vía `fetch` (compatible con el runtime edge) y se beneficia del
> arranque rápido y la distribución global. Si en el futuro necesitás APIs de
> Node no disponibles en edge, podés cambiar al adapter serverless con
> `pnpm qwik add vercel` y ajustar `build.server` en `package.json`.

## Estructura

```
src/
  components/
    layout/    Brand, Header (nav sticky), Footer
    ui/        Container, Section, SectionTitle, Button, Card, ImagePlaceholder
    sections/  Hero, SobreBioBal, BioBanco, Consultorios, Infraestructura,
               ExperienciaPaciente, PorQue, Contacto (formulario)
  lib/         supabase.ts (cliente tipado), site.ts (datos institucionales)
  routes/
    layout.tsx Header + Footer envolviendo la página
    index.tsx  Home: arma las sections + routeAction$ (leads) + DocumentHead (SEO)
  global.css   @import "tailwindcss" + tokens @theme + estilos base
supabase/
  schema.sql   CREATE TABLE leads + RLS
adapters/
  vercel-edge/ Config del adapter de Vercel Edge
```

## Imágenes

Las imágenes son **placeholders**: el componente
[`ImagePlaceholder`](src/components/ui/image-placeholder.tsx) renderiza un `<img>`
real (con un data-URI liviano, sin pedidos externos) y una etiqueta de la foto
prevista. Buscá los `TODO: imagen real` para reemplazarlas por las definitivas
(por ejemplo en `/public/images/...`) manteniendo `alt`, `width`, `height` y
`loading`. Falta también subir `/public/og-image.jpg` (1200×630) para Open Graph.

## Vercel Edge

This starter site is configured to deploy to [Vercel Edge Functions](https://vercel.com/docs/concepts/functions/edge-functions), which means it will be rendered at an edge location near to your users.

## Installation

The adaptor will add a new `vite.config.ts` within the `adapters/` directory, and a new entry file will be created, such as:

```
└── adapters/
    └── vercel-edge/
        └── vite.config.ts
└── src/
    └── entry.vercel-edge.tsx
```

Additionally, within the `package.json`, the `build.server` script will be updated with the Vercel Edge build.

## Production build

To build the application for production, use the `build` command, this command will automatically run `pnpm build.server` and `pnpm build.client`:

```shell
pnpm build
```

[Read the full guide here](https://github.com/QwikDev/qwik/blob/main/starters/adapters/vercel-edge/README.md)

## Dev deploy

To deploy the application for development:

```shell
pnpm deploy
```

Notice that you might need a [Vercel account](https://docs.Vercel.com/get-started/) in order to complete this step!

## Production deploy

The project is ready to be deployed to Vercel. However, you will need to create a git repository and push the code to it.

You can [deploy your site to Vercel](https://vercel.com/docs/concepts/deployments/overview) either via a Git provider integration or through the Vercel CLI.
