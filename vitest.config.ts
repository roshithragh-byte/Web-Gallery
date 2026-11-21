import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    alias: {
      "server-only": resolve(__dirname, "tests/mocks/server-only.ts"),
      "@": resolve(__dirname, "."),
    },
  },
});
