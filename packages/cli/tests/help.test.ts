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
  test("contains v2 workflow, entity, and discovery commands", () => {
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
    const customersHelp =
      program.commands.find((command) => command.name() === "customers")?.helpInformation() ?? "";
    const customerNeedsHelp =
      program.commands.find((command) => command.name() === "customer-needs")?.helpInformation() ??
      "";
    const milestonesHelp =
      program.commands.find((command) => command.name() === "milestones")?.helpInformation() ?? "";
    const projectUpdatesHelp =
      program.commands.find((command) => command.name() === "project-updates")?.helpInformation() ??
      "";
    const initiativeUpdatesHelp =
      program.commands
        .find((command) => command.name() === "initiative-updates")
        ?.helpInformation() ?? "";
    const notificationsHelp =
      program.commands.find((command) => command.name() === "notifications")?.helpInformation() ??
      "";
    const doctorHelp =
      program.commands.find((command) => command.name() === "doctor")?.helpInformation() ?? "";
    const myWorkHelp =
      program.commands.find((command) => command.name() === "my-work")?.helpInformation() ?? "";
    const triageHelp =
      program.commands.find((command) => command.name() === "triage")?.helpInformation() ?? "";

    expect(help).toContain("--version");
    expect(help).toContain("docs");
    expect(help).toContain("skills");
    expect(help).toContain("doctor");
    expect(help).toContain("my-work");
    expect(help).toContain("triage");
    expect(help).toContain("issues");
    expect(help).toContain("initiatives");
    expect(help).toContain("documents");
    expect(help).toContain("templates");
    expect(help).toContain("customers");
    expect(help).toContain("customer-needs");
    expect(help).toContain("milestones");
    expect(help).toContain("project-updates");
    expect(help).toContain("initiative-updates");
    expect(help).toContain("notifications");
    expect(issuesHelp).toContain("branch");
    expect(issuesHelp).toContain("browse");
    expect(issuesHelp).toContain("--mine");
    expect(issuesHelp).toContain("--assignee");
    expect(issuesHelp).toContain("--state");
    expect(issuesHelp).toContain("--priority");
    expect(issuesHelp).toContain("--view");
    expect(issuesHelp).toContain("--fields");
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
    expect(customersHelp).toContain("list");
    expect(customerNeedsHelp).toContain("create");
    expect(milestonesHelp).toContain("get");
    expect(projectUpdatesHelp).toContain("list");
    expect(initiativeUpdatesHelp).toContain("update");
    expect(notificationsHelp).toContain("list");
    expect(doctorHelp).toContain("Validate auth");
    expect(myWorkHelp).toContain("assigned");
    expect(triageHelp).toContain("triage");
  });
});
