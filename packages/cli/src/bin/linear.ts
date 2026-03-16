#!/usr/bin/env node
import { createProgram } from "../index.js";

const program = createProgram();

program.parseAsync(process.argv).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown CLI error";
  console.error(message);
  process.exitCode = 1;
});
