import { Command } from "commander";
import { describe, expect, test } from "vitest";
import { getGlobalOptions } from "../src/runtime/options.js";

describe("getGlobalOptions", () => {
  test("parses shared v2 query and presentation options", () => {
    const program = new Command();
    program
      .option("--json")
      .option("--profile <name>")
      .option("--team <key>")
      .option("--limit <n>", (value) => Number.parseInt(value, 10))
      .option("--cursor <cursor>")
      .option("--quiet")
      .option("--mine")
      .option("--project <id>")
      .option("--cycle <id>")
      .option("--state <name>")
      .option("--assignee <name>")
      .option("--label <name>")
      .option("--priority <value>")
      .option("--status <name>")
      .option("--filter <expr>")
      .option("--sort <field>")
      .option("--view <preset>")
      .option("--all")
      .option("--fields <list>");

    program.parse([
      "node",
      "linear",
      "--profile",
      "work",
      "--team",
      "ENG",
      "--limit",
      "25",
      "--mine",
      "--project",
      "proj_1",
      "--cycle",
      "cycle_1",
      "--state",
      "Todo",
      "--assignee",
      "me",
      "--label",
      "Bug",
      "--priority",
      "2",
      "--status",
      "active",
      "--filter",
      "estimate>2",
      "--sort",
      "updatedAt",
      "--view",
      "detail",
      "--all",
      "--fields",
      "identifier,title,assigneeName",
    ]);

    expect(getGlobalOptions(program)).toEqual({
      json: false,
      profile: "work",
      team: "ENG",
      limit: 25,
      quiet: false,
      mine: true,
      project: "proj_1",
      cycle: "cycle_1",
      state: "Todo",
      assignee: "me",
      label: "Bug",
      priority: "2",
      status: "active",
      filter: "estimate>2",
      sort: "updatedAt",
      view: "detail",
      all: true,
      fields: ["identifier", "title", "assigneeName"],
    });
  });
});
