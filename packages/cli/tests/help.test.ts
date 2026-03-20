import type { Command } from "commander";
import { describe, expect, test } from "vitest";
import { createProgram } from "../src/index.js";

function captureRenderedHelp(command?: Command): string {
  if (!command) {
    return "";
  }

  let output = "";
  command.configureOutput({
    writeOut: (str: string) => {
      output += str;
    },
    writeErr: (str: string) => {
      output += str;
    },
  });
  command.outputHelp();
  return output;
}

describe("help output", () => {
  test("contains docs and skills commands", () => {
    const program = createProgram();
    const help = program.helpInformation();
    const issuesCommand = program.commands.find((command) => command.name() === "issues");
    const issuesHelp = issuesCommand?.helpInformation() ?? "";
    const issueBranchCommand = issuesCommand?.commands.find(
      (command) => command.name() === "branch",
    );
    const issueBranchHelp = issueBranchCommand?.helpInformation() ?? "";
    const renderedIssuesHelp = captureRenderedHelp(issuesCommand);
    const renderedIssueBranchHelp = captureRenderedHelp(issueBranchCommand);
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
    expect(renderedIssuesHelp).toContain("Global Options:");
    expect(renderedIssuesHelp).toContain("--json");
    expect(renderedIssueBranchHelp).toContain("Global Options:");
    expect(renderedIssueBranchHelp).toContain("--json");
    expect(renderedIssueBranchHelp).toContain(".data.branchName");
    expect(issueBranchHelp).toContain("id-or-identifier");
    expect(initiativesHelp).toContain("create");
    expect(documentsHelp).toContain("list");
    expect(templatesHelp).toContain("list");
    expect(commentsHelp).toContain("get");
    expect(attachmentsHelp).toContain("update");
  });
});
