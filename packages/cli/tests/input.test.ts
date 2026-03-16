import { mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { parseJsonInput } from "../src/commands/input.js";

describe("parseJsonInput", () => {
  test("parses inline JSON", async () => {
    const parsed = await parseJsonInput({
      input: '{"title":"Demo"}',
    });

    expect(parsed).toEqual({ title: "Demo" });
  });

  test("parses JSON from file", async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), "linear-cli-input-"));
    const filePath = path.join(directory, "payload.json");
    await writeFile(filePath, '{"name":"Project"}\n', "utf8");

    const parsed = await parseJsonInput({ inputFile: filePath });

    expect(parsed).toEqual({ name: "Project" });
  });

  test("throws if missing input", async () => {
    await expect(parseJsonInput({})).rejects.toThrow("Missing input");
  });
});
