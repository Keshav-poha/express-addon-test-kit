import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  "packages/ui-sdk-mock/vitest.config.ts",
  "packages/doc-sdk-mock/vitest.config.ts",
  "packages/test-bridge/vitest.config.ts",
  "packages/test-utils/vitest.config.ts",
]);
