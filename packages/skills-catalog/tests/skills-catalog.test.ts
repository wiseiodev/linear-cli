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
    const result = await installSkill("issue-triage", executor);

    expect(result.ok).toBe(true);
    expect(executor.calls).toHaveLength(1);
    expect(executor.calls[0]?.command).toBe("npx");
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
