import { describe, expect, test } from "vitest";
import { createProgram } from "../src/index.js";

describe("help output", () => {
  test("contains docs and skills commands", () => {
    const program = createProgram();
    const help = program.helpInformation();
    const issuesHelp =
      program.commands.find((command) => command.name() === "issues")?.helpInformation() ?? "";
    const initiativesHelp =
      program.commands.find((command) => command.name() === "initiatives")?.helpInformation() ?? "";
    const documentsHelp =
      program.commands.find((command) => command.name() === "documents")?.helpInformation() ?? "";
    const templatesHelp =
      program.commands.find((command) => command.name() === "templates")?.helpInformation() ?? "";
    const commentsHelp =
      program.commands.find((command) => command.name() === "comments")?.helpInformation() ?? "";
    const attachmentsHelp =
      program.commands.find((command) => command.name() === "attachments")?.helpInformation() ?? "";

    expect(help).toContain("--version");
    expect(help).toContain("docs");
    expect(help).toContain("skills");
    expect(help).toContain("issues");
    expect(help).toContain("initiatives");
    expect(help).toContain("documents");
    expect(help).toContain("templates");
    expect(issuesHelp).toContain("branch");
    expect(issuesHelp).toContain("browse");
    expect(initiativesHelp).toContain("create");
    expect(documentsHelp).toContain("list");
    expect(templatesHelp).toContain("list");
    expect(commentsHelp).toContain("get");
    expect(attachmentsHelp).toContain("update");
  });
});
