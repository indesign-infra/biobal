/**
 * This is the base config for vite.
 * When building, the adapter config is used which loads this file and extends it.
 */
import { defineConfig, type UserConfig } from "vite";
import { qwikVite } from "@builder.io/qwik/optimizer";
import { qwikCity } from "@builder.io/qwik-city/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import pkg from "./package.json";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
type PkgDep = Record<string, string>;
const { dependencies = {}, devDependencies = {} } = pkg as any as {
  dependencies: PkgDep;
  devDependencies: PkgDep;
  [key: string]: unknown;
};
errorOnDuplicatesPkgDeps(devDependencies, dependencies);
/**
 * Note that Vite normally starts from `index.html` but the qwikCity plugin makes start at `src/entry.ssr.tsx` instead.
 */

// El build del servidor (adapter Vercel Edge) setea VITE_SSR_BUILD=1. En el
// build de cliente (browser) NO está, así que aplicamos los shims de @vercel/blob
// para evitar que se bundlee el crypto/undici de Node (que usa util.promisify y
// rompe en el navegador). En el server se usan los módulos reales.
const isServerBuild = process.env.VITE_SSR_BUILD === "1";
const blobShim = (file: string) =>
  fileURLToPath(new URL(`node_modules/@vercel/blob/dist/${file}`, import.meta.url));

export default defineConfig(({ command, mode }): UserConfig => {
  // Sólo en el build de producción de CLIENTE (no dev, no server) forzamos la
  // resolución browser. En dev, Vite ya distingue cliente/SSR por request.
  const applyBrowserResolve = command === "build" && !isServerBuild;
  return {
    plugins: [
      qwikCity(),
      qwikVite(),
      tsconfigPaths({ root: "." }),
      tailwindcss(),
    ],
    resolve: !applyBrowserResolve
      ? undefined
      : {
          // Forzamos la condición `browser` para el build de cliente: así deps
          // como `jose` (que trae @vercel/blob vía @vercel/oidc) resuelven su
          // build de navegador (Web Crypto) en vez del de Node (que usa
          // util.promisify y rompe en el browser).
          conditions: ["browser", "module", "import", "default"],
          alias: {
            // @vercel/blob usa el `browser` FIELD (no exports) para estos
            // builtins de Node; lo replicamos con sus propios shims.
            crypto: blobShim("crypto-browser.js"),
            undici: blobShim("undici-browser.js"),
            stream: blobShim("stream-browser.js"),
          },
        },
    // This tells Vite which dependencies to pre-build in dev mode.
    optimizeDeps: {
      // Put problematic deps that break bundling here, mostly those with binaries.
      // For example ['better-sqlite3'] if you use that in server functions.
      exclude: [],
    },
    /**
     * This is an advanced setting. It improves the bundling of your server code. To use it, make sure you understand when your consumed packages are dependencies or dev dependencies. (otherwise things will break in production)
     */
    // ssr:
    //   command === "build" && mode === "production"
    //     ? {
    //         // All dev dependencies should be bundled in the server build
    //         noExternal: Object.keys(devDependencies),
    //         // Anything marked as a dependency will not be bundled
    //         // These should only be production binary deps (including deps of deps), CLI deps, and their module graph
    //         // If a dep-of-dep needs to be external, add it here
    //         // For example, if something uses `bcrypt` but you don't have it as a dep, you can write
    //         // external: [...Object.keys(dependencies), 'bcrypt']
    //         external: Object.keys(dependencies),
    //       }
    //     : undefined,
    server: {
      headers: {
        // Don't cache the server response in dev mode
        "Cache-Control": "public, max-age=0",
      },
    },
    preview: {
      headers: {
        // Do cache the server response in preview (non-adapter production build)
        "Cache-Control": "public, max-age=600",
      },
    },
  };
});
// *** utils ***
/**
 * Function to identify duplicate dependencies and throw an error
 * @param {Object} devDependencies - List of development dependencies
 * @param {Object} dependencies - List of production dependencies
 */
function errorOnDuplicatesPkgDeps(
  devDependencies: PkgDep,
  dependencies: PkgDep,
) {
  let msg = "";
  // Create an array 'duplicateDeps' by filtering devDependencies.
  // If a dependency also exists in dependencies, it is considered a duplicate.
  const duplicateDeps = Object.keys(devDependencies).filter(
    (dep) => dependencies[dep],
  );
  // include any known qwik packages
  const qwikPkg = Object.keys(dependencies).filter((value) =>
    /qwik/i.test(value),
  );
  // any errors for missing "qwik-city-plan"
  // [PLUGIN_ERROR]: Invalid module "@qwik-city-plan" is not a valid package
  msg = `Move qwik packages ${qwikPkg.join(", ")} to devDependencies`;
  if (qwikPkg.length > 0) {
    throw new Error(msg);
  }
  // Format the error message with the duplicates list.
  // The `join` function is used to represent the elements of the 'duplicateDeps' array as a comma-separated string.
  msg = `
    Warning: The dependency "${duplicateDeps.join(", ")}" is listed in both "devDependencies" and "dependencies".
    Please move the duplicated dependencies to "devDependencies" only and remove it from "dependencies"
  `;
  // Throw an error with the constructed message.
  if (duplicateDeps.length > 0) {
    throw new Error(msg);
  }
}
