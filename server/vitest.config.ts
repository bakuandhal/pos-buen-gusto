import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.{test,spec}.ts"],
    exclude: ["node_modules", "dist"],
    setupFiles: ["./vitest.setup.ts"],
    // Las pruebas de integración comparten una única base PostgreSQL de
    // pruebas y limpian tablas operativas. Ejecutarlas en paralelo entre
    // archivos produciría interferencias y falsos negativos.
    fileParallelism: false,
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});
