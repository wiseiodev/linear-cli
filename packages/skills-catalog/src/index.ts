import { spawn } from "node:child_process";

export interface CatalogSkill {
  readonly name: string;
  readonly title: string;
  readonly description: string;
  readonly repoPath: string;
}

export interface InstallResult {
  readonly ok: boolean;
  readonly command: string;
  readonly exitCode: number;
  readonly stdout: string;
  readonly stderr: string;
}

export interface CommandExecutor {
  run(command: string, args: readonly string[]): Promise<InstallResult>;
}

const CATALOG: readonly CatalogSkill[] = [
  {
    name: "issue-triage",
    title: "Issue Triage",
    description: "Prioritize and route incoming issues with consistent quality gates.",
    repoPath: "wiseiodev/linear-cli/assets/skills/issue-triage",
  },
  {
    name: "cycle-planning",
    title: "Cycle Planning",
    description: "Build and validate cycle scope from Linear issues and constraints.",
    repoPath: "wiseiodev/linear-cli/assets/skills/cycle-planning",
  },
];

class SpawnExecutor implements CommandExecutor {
  public async run(command: string, args: readonly string[]): Promise<InstallResult> {
    return new Promise((resolve) => {
      const child = spawn(command, [...args], {
        shell: false,
        stdio: ["ignore", "pipe", "pipe"],
      });

      let stdout = "";
      let stderr = "";

      child.stdout.on("data", (chunk: Buffer | string) => {
        stdout += chunk.toString();
      });

      child.stderr.on("data", (chunk: Buffer | string) => {
        stderr += chunk.toString();
      });

      child.on("close", (code) => {
        resolve({
          ok: code === 0,
          command: [command, ...args].join(" "),
          exitCode: code ?? 1,
          stdout,
          stderr,
        });
      });
    });
  }
}

export function listSkills(): readonly CatalogSkill[] {
  return CATALOG;
}

export function getSkill(name: string): CatalogSkill | null {
  return CATALOG.find((skill) => skill.name === name) ?? null;
}

export function buildInstallArgs(skill: CatalogSkill): readonly string[] {
  return ["skills", "add", skill.repoPath, "https://github.com/vercel-labs/skills"];
}

export async function installSkill(
  skillName: string,
  executor: CommandExecutor = new SpawnExecutor(),
): Promise<InstallResult> {
  const skill = getSkill(skillName);
  if (!skill) {
    return {
      ok: false,
      command: "",
      exitCode: 1,
      stdout: "",
      stderr: `Unknown skill: ${skillName}`,
    };
  }

  return executor.run("npx", buildInstallArgs(skill));
}
