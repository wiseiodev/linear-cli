import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@linear-agent/linear-core": path.resolve(currentDirectory, "../linear-core/src/index.ts"),
      "@linear-agent/skills-catalog": path.resolve(
        currentDirectory,
        "../skills-catalog/src/index.ts",
      ),
      "@linear-agent/tui": path.resolve(currentDirectory, "../tui/src/index.tsx"),
    },
  },
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
  },
});
