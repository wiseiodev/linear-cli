import { readFile } from "node:fs/promises";

interface InputOptions {
  readonly input?: string;
  readonly inputFile?: string;
}

export async function parseJsonInput(options: InputOptions): Promise<unknown> {
  if (options.input && options.inputFile) {
    throw new Error("Use either --input or --input-file, not both.");
  }

  if (!options.input && !options.inputFile) {
    throw new Error("Missing input. Provide --input or --input-file.");
  }

  const text = options.inputFile ? await readFile(options.inputFile, "utf8") : options.input;
  if (!text) {
    throw new Error("Input was empty.");
  }

  return JSON.parse(text);
}
