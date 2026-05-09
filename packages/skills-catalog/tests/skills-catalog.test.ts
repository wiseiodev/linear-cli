import { readFile } from "node:fs/promises";
import { describe, expect, test } from "vitest";
import {
  buildInstallArgs,
  type CommandExecutor,
  getSkill,
  installSkill,
  listSkills,
} from "../src/index.js";

class StubExecutor implements CommandExecutor {
  public readonly calls: Array<{ command: string; args: readonly string[] }> = [];

  public async run(command: string, args: readonly string[]) {
    this.calls.push({ command, args });
    return {
      ok: true,
      command: [command, ...args].join(" "),
      exitCode: 0,
      stdout: "installed",
      stderr: "",
    };
  }
}

describe("skills catalog", () => {
  test("lists available catalog entries", () => {
    const skills = listSkills();
    expect(skills.length).toBeGreaterThan(0);
    expect(skills.some((skill) => skill.name === "issue-triage")).toBe(true);
    expect(skills.some((skill) => skill.name === "linear-cli")).toBe(true);
  });

  test("returns null for unknown skill", () => {
    expect(getSkill("missing")).toBeNull();
  });

  test("builds install args using Vercel skills CLI source", () => {
    const skill = getSkill("cycle-planning");
    if (!skill) {
      throw new Error("Expected skill in catalog");
    }

    const args = buildInstallArgs(skill);
    expect(args.slice(0, 2)).toEqual(["skills", "add"]);
    expect(args[3]).toBe("https://github.com/vercel-labs/skills");
  });

  test("installs a known skill through executor", async () => {
    const executor = new StubExecutor();
    const result = await installSkill("linear-cli", executor);

    expect(result.ok).toBe(true);
    expect(executor.calls).toHaveLength(1);
    expect(executor.calls[0]?.command).toBe("npx");
    expect(executor.calls[0]?.args).toContain("wiseiodev/linear-cli/assets/skills/linear-cli");
  });

  test("ships linear-cli skill content with CLI usage examples", async () => {
    const skill = getSkill("linear-cli");
    if (!skill) {
      throw new Error("Expected linear-cli skill in catalog");
    }

    const repoRelativePath = skill.repoPath.replace("wiseiodev/linear-cli/", "");
    const content = await readFile(
      new URL(`../../../${repoRelativePath}/SKILL.md`, import.meta.url),
      "utf8",
    );

    expect(content).toContain("name: linear-cli");
    expect(content).toContain("linear issues list --json");
    expect(content).toContain("linear issues get <id-or-identifier> --json");
    expect(content).toContain("linear issues create --input");
    expect(content).toContain("linear issues update <id-or-identifier>");
    expect(content).toContain("linear issues branch <id-or-identifier> --json");
    expect(content).toContain("linear auth status --json");
    expect(content).toContain("linear issues bulk-update");
    expect(content).toContain("Fixes ENG-123");
    expect(content).toContain("Recognized closing magic words");
    expect(content).toContain("`implements`");
    expect(content).toContain("Recognized non-closing magic words");
    expect(content).toContain("`related to`");
    expect(content).toContain("Fixes ENG-123, DES-5 and ENG-256");
  });

  test("fails gracefully for unknown skill", async () => {
    const executor = new StubExecutor();
    const result = await installSkill("not-real", executor);

    expect(result.ok).toBe(false);
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("Unknown skill");
    expect(executor.calls).toHaveLength(0);
  });
});
