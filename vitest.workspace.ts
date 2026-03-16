import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  "packages/linear-core/vitest.config.ts",
  "packages/skills-catalog/vitest.config.ts",
  "packages/cli/vitest.config.ts",
  "packages/tui/vitest.config.ts",
]);
