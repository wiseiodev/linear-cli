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

  test("subcommands surface filters, examples, and input field hints", () => {
    const program = createProgram();
    const issuesCommand = program.commands.find((command) => command.name() === "issues");
    const issuesListCommand = issuesCommand?.commands.find((command) => command.name() === "list");
    const issuesCreateCommand = issuesCommand?.commands.find(
      (command) => command.name() === "create",
    );
    const issuesUpdateCommand = issuesCommand?.commands.find(
      (command) => command.name() === "update",
    );
    const projectsCommand = program.commands.find((command) => command.name() === "projects");
    const projectsCreateCommand = projectsCommand?.commands.find(
      (command) => command.name() === "create",
    );
    const customersCommand = program.commands.find((command) => command.name() === "customers");
    const customersListCommand = customersCommand?.commands.find(
      (command) => command.name() === "list",
    );

    const issuesListHelp = captureRenderedHelp(issuesListCommand);
    const issuesCreateHelp = captureRenderedHelp(issuesCreateCommand);
    const issuesUpdateHelp = captureRenderedHelp(issuesUpdateCommand);
    const projectsCreateHelp = captureRenderedHelp(projectsCreateCommand);
    const customersListHelp = captureRenderedHelp(customersListCommand);

    expect(issuesListHelp).toContain("Filters, pagination, and output");
    expect(issuesListHelp).toContain("--team");
    expect(issuesListHelp).toContain("--limit");
    expect(issuesListHelp).toContain("--all");
    expect(issuesListHelp).toContain("Examples:");
    expect(issuesListHelp).toContain("linear issues list");

    expect(issuesCreateHelp).toContain("Required input fields");
    expect(issuesCreateHelp).toContain("teamId");
    expect(issuesCreateHelp).toContain("IssueCreateInput");
    expect(issuesCreateHelp).toContain("schema.graphql");

    expect(issuesUpdateHelp).toContain("Examples:");
    expect(issuesUpdateHelp).toContain("linear issues update");
    expect(issuesUpdateHelp).toContain("IssueUpdateInput");

    expect(projectsCreateHelp).toContain("Required input fields: name");
    expect(projectsCreateHelp).toContain("ProjectCreateInput");

    expect(customersListHelp).toContain("Filters, pagination, and output");
    expect(customersListHelp).toContain("linear customers list");
  });

  test("list help only advertises options that the handler honors", () => {
    const program = createProgram();

    const findCustomHelpBlock = (entity: string): string => {
      const command = program.commands.find((c) => c.name() === entity);
      const list = command?.commands.find((c) => c.name() === "list");
      const rendered = captureRenderedHelp(list);
      const headingMatch = rendered.match(
        /(Filters[^\n]*|Pagination and output|Output)\s*\(inherited globals\):/,
      );
      if (!headingMatch || headingMatch.index === undefined) {
        return "";
      }
      const tail = rendered.slice(headingMatch.index);
      const examplesIndex = tail.indexOf("Examples:");
      return examplesIndex === -1 ? tail : tail.slice(0, examplesIndex);
    };

    const cyclesBlock = findCustomHelpBlock("cycles");
    expect(cyclesBlock).toContain("Pagination and output");
    expect(cyclesBlock).toContain("--limit");
    expect(cyclesBlock).not.toContain("--team <key>");
    expect(cyclesBlock).not.toContain("--all");
    expect(cyclesBlock).not.toContain("--filter <expr>");

    const templatesBlock = findCustomHelpBlock("templates");
    expect(templatesBlock).toContain("Output (inherited globals):");
    expect(templatesBlock).not.toContain("--limit");
    expect(templatesBlock).not.toContain("--cursor");
    expect(templatesBlock).not.toContain("--team <key>");

    const labelsBlock = findCustomHelpBlock("labels");
    expect(labelsBlock).not.toContain("--team <key>");
    expect(labelsBlock).not.toContain("--all");
    expect(labelsBlock).toContain("--limit");

    const projectsBlock = findCustomHelpBlock("projects");
    expect(projectsBlock).toContain("--status");
    expect(projectsBlock).toContain("--all");
    expect(projectsBlock).not.toContain("--team <key>");
    expect(projectsBlock).not.toContain("--assignee");
  });
});
