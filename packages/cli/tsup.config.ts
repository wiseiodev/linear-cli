import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "bin/linear": "src/bin/linear.ts",
  },
  outDir: "dist",
  format: ["esm"],
  platform: "node",
  target: "node22",
  dts: true,
  sourcemap: true,
  clean: true,
  bundle: true,
  splitting: false,
  noExternal: [/^@wiseiodev\//],
});
