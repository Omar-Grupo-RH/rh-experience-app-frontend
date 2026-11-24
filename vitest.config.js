import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";

// Configuración independiente de vite.config.js para no cargar
// plugins de desarrollo (devtools, tailwind) durante las pruebas.
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.js"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
