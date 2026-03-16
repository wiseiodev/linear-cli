import { describe, expect, test } from "vitest";
import { createProgram } from "../src/index.js";

describe("help output", () => {
  test("contains docs and skills commands", () => {
    const program = createProgram();
    const help = program.helpInformation();

    expect(help).toContain("docs");
    expect(help).toContain("skills");
    expect(help).toContain("issues");
  });
});
