import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Las pantallas leen la BD a través de lib/data/*, que pasa por
  // lib/permissions.ts. lib/mockData.ts solo alimenta db/seed.ts: importarlo
  // desde una página es saltarse el control de acceso (ver su cabecera).
  {
    files: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@/lib/mockData",
              message:
                "lib/mockData.ts es solo para db/seed.ts. Lee los datos con lib/data/*, que aplica lib/permissions.ts.",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Salida de la demostración estática (scripts/build-demo.mjs): es código
    // compilado, no fuente del proyecto.
    "demo-out/**",
    ".demo-build/**",
  ]),
]);

export default eslintConfig;
