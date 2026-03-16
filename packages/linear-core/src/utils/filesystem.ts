import { mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

export function getConfigRoot(): string {
  return path.join(os.homedir(), ".linear-agent-cli");
}

export async function ensureDirectory(filePath: string): Promise<void> {
  const directory = path.dirname(filePath);
  await mkdir(directory, { recursive: true });
}

export async function readJsonFile(filePath: string): Promise<unknown | null> {
  try {
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

export async function writeJsonFile(filePath: string, value: unknown, mode = 0o600): Promise<void> {
  await ensureDirectory(filePath);
  const json = JSON.stringify(value, null, 2);
  await writeFile(filePath, `${json}\n`, {
    encoding: "utf8",
    mode,
  });
}
