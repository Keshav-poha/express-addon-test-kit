import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "test-bridge",
    globals: true,
    environment: "node",
    include: ["test/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
    },
  },
});
