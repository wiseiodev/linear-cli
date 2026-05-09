#!/usr/bin/env node
import { createProgram } from "../index.js";

const program = createProgram();

const drainAndExit = (code: number): void => {
  Promise.all([
    new Promise<void>((resolve) => process.stdout.write("", () => resolve())),
    new Promise<void>((resolve) => process.stderr.write("", () => resolve())),
  ]).finally(() => process.exit(code));
};

program
  .parseAsync(process.argv)
  .then(() => drainAndExit(typeof process.exitCode === "number" ? process.exitCode : 0))
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "Unknown CLI error";
    console.error(message);
    drainAndExit(1);
  });
