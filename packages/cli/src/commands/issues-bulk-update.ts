import type {
  AuthManager,
  IssueRecord,
  LinearGateway,
  SdkIssueUpdateInput,
} from "@wiseiodev/linear-core";
import { errorEnvelope, normalizeError, successEnvelope } from "@wiseiodev/linear-core";
import type { Command } from "commander";
import { renderEnvelope } from "../formatters/output.js";
import { getGlobalOptions } from "../runtime/options.js";
import { parseJsonInput } from "./input.js";
import { isIssueUpdateInput } from "./issue-guards.js";

export interface BulkUpdateRawOptions {
  readonly ids?: string;
  readonly input?: string;
  readonly inputFile?: string;
  readonly dryRun?: boolean;
  readonly concurrency?: number | string;
}

export interface BulkUpdateItem {
  readonly id: string;
  readonly payload: SdkIssueUpdateInput;
}

export interface ParsedBulkUpdate {
  readonly dryRun: boolean;
  readonly concurrency: number;
  readonly items: readonly BulkUpdateItem[];
}

export interface BulkUpdateSuccessLive {
  readonly id: string;
  readonly ok: true;
  readonly issue: IssueRecord;
}

export interface BulkUpdateSuccessDryRun {
  readonly id: string;
  readonly ok: true;
  readonly planned: SdkIssueUpdateInput;
  readonly resolved: { readonly id: string; readonly identifier: string; readonly title: string };
}

export interface BulkUpdateFailure {
  readonly id: string;
  readonly ok: false;
  readonly error: { readonly code: string; readonly message: string };
}

export type BulkUpdateResult = BulkUpdateSuccessLive | BulkUpdateSuccessDryRun | BulkUpdateFailure;

export interface BulkUpdateData {
  readonly dryRun: boolean;
  readonly total: number;
  readonly succeeded: number;
  readonly failed: number;
  readonly results: readonly BulkUpdateResult[];
}

const DEFAULT_CONCURRENCY = 3;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}

function parseConcurrency(value: number | string | undefined): number {
  if (value === undefined) {
    return DEFAULT_CONCURRENCY;
  }
  const parsed = typeof value === "number" ? value : Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    throw new Error("--concurrency must be a positive integer.");
  }
  return Math.floor(parsed);
}

function parseIds(value: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of value.split(",")) {
    const id = raw.trim();
    if (id.length === 0 || seen.has(id)) {
      continue;
    }
    seen.add(id);
    out.push(id);
  }
  return out;
}

async function readStdin(): Promise<string> {
  if (process.stdin.isTTY) {
    throw new Error("Cannot read --input - because stdin is a TTY.");
  }
  let buffer = "";
  process.stdin.setEncoding("utf8");
  for await (const chunk of process.stdin) {
    buffer += chunk;
  }
  return buffer;
}

export async function readBulkInput(options: BulkUpdateRawOptions): Promise<unknown> {
  if (options.input === "-") {
    if (options.inputFile) {
      throw new Error("Use either --input or --input-file, not both.");
    }
    const text = await readStdin();
    if (text.trim().length === 0) {
      throw new Error("Input was empty.");
    }
    return JSON.parse(text);
  }

  if (!options.input && !options.inputFile) {
    throw new Error("Missing input. Provide --input, --input-file, or --input -.");
  }

  return parseJsonInput({
    ...(options.input ? { input: options.input } : {}),
    ...(options.inputFile ? { inputFile: options.inputFile } : {}),
  });
}

export async function parseBulkUpdateInput(
  options: BulkUpdateRawOptions,
): Promise<ParsedBulkUpdate> {
  const dryRun = options.dryRun === true;
  const concurrency = parseConcurrency(options.concurrency);
  const parsed = await readBulkInput(options);

  if (Array.isArray(parsed)) {
    if (options.ids) {
      throw new Error("--ids is not allowed with per-issue array input.");
    }
    if (options.input) {
      throw new Error("Per-issue array input requires --input-file.");
    }
    if (parsed.length === 0) {
      throw new Error("Per-issue input must contain at least one entry.");
    }

    const items: BulkUpdateItem[] = [];
    for (const entry of parsed) {
      if (!isRecord(entry) || typeof entry.id !== "string" || entry.id.trim().length === 0) {
        throw new Error("Each per-issue entry requires a string id field.");
      }
      const { id, ...payload } = entry;
      if (!isIssueUpdateInput(payload)) {
        throw new Error(`Per-issue payload for ${id} must include at least one update field.`);
      }
      items.push({ id: id.trim(), payload });
    }
    return { dryRun, concurrency, items };
  }

  if (!options.ids) {
    throw new Error("Shared-payload mode requires --ids.");
  }
  const ids = parseIds(options.ids);
  if (ids.length === 0) {
    throw new Error("--ids was empty.");
  }
  if (!isIssueUpdateInput(parsed)) {
    throw new Error("Issue update payload must be a non-empty object.");
  }
  const sharedPayload = parsed;
  return {
    dryRun,
    concurrency,
    items: ids.map((id) => ({ id, payload: sharedPayload })),
  };
}

interface BulkGateway {
  getIssue(id: string): Promise<IssueRecord>;
  updateIssue(id: string, input: SdkIssueUpdateInput): Promise<IssueRecord>;
}

async function runItem(
  gateway: BulkGateway,
  item: BulkUpdateItem,
  dryRun: boolean,
): Promise<BulkUpdateResult> {
  try {
    if (dryRun) {
      const issue = await gateway.getIssue(item.id);
      return {
        id: item.id,
        ok: true,
        planned: item.payload,
        resolved: { id: issue.id, identifier: issue.identifier, title: issue.title },
      };
    }
    const issue = await gateway.updateIssue(item.id, item.payload);
    return { id: item.id, ok: true, issue };
  } catch (error) {
    const normalized = normalizeError(error);
    return {
      id: item.id,
      ok: false,
      error: { code: normalized.code, message: normalized.message },
    };
  }
}

export async function runBulkUpdate(
  gateway: BulkGateway,
  parsed: ParsedBulkUpdate,
): Promise<BulkUpdateData> {
  const results: BulkUpdateResult[] = new Array(parsed.items.length);
  let nextIndex = 0;

  const worker = async (): Promise<void> => {
    while (true) {
      const index = nextIndex++;
      if (index >= parsed.items.length) {
        return;
      }
      const item = parsed.items[index];
      if (!item) {
        return;
      }
      results[index] = await runItem(gateway, item, parsed.dryRun);
    }
  };

  const poolSize = Math.min(parsed.concurrency, parsed.items.length);
  const workers: Array<Promise<void>> = [];
  for (let i = 0; i < poolSize; i++) {
    workers.push(worker());
  }
  await Promise.all(workers);

  let succeeded = 0;
  for (const result of results) {
    if (result.ok) {
      succeeded++;
    }
  }

  return {
    dryRun: parsed.dryRun,
    total: results.length,
    succeeded,
    failed: results.length - succeeded,
    results,
  };
}

export function exitCodeForBulk(data: BulkUpdateData): number {
  if (data.failed === 0) {
    return 0;
  }
  if (data.succeeded === 0) {
    return 1;
  }
  return 2;
}

export function registerIssuesBulkUpdate(issuesCommand: Command, authManager: AuthManager): void {
  issuesCommand
    .command("bulk-update")
    .description(
      "Apply updates to many issues in one pass. Linear only updates fields present in the payload; relations, labels, and comments stay intact unless removal fields are supplied.",
    )
    .option("--ids <list>", "Comma-separated issue identifiers or UUIDs (shared-payload mode)")
    .option("--input <json|->", "Inline JSON payload, or '-' to read from stdin")
    .option(
      "--input-file <path>",
      "JSON object (shared-payload) or array of {id, ...fields} (per-issue)",
    )
    .option("--dry-run", "Preview without writing; pre-resolves each id")
    .option("--concurrency <n>", `Max parallel updates (default ${DEFAULT_CONCURRENCY})`, (value) =>
      Number.parseInt(value, 10),
    )
    .action(async (opts: BulkUpdateRawOptions, cmd: Command) => {
      const globals = getGlobalOptions(cmd);
      let parsed: ParsedBulkUpdate;
      try {
        parsed = await parseBulkUpdateInput(opts);
      } catch (error) {
        const normalized = normalizeError(error);
        renderEnvelope(
          errorEnvelope("issues", "update", {
            code: normalized.code,
            message: normalized.message,
            details: normalized.details,
          }),
          globals,
        );
        process.exitCode = 1;
        return;
      }

      try {
        const session = await authManager.openSession({ profile: globals.profile });
        const gateway: BulkGateway = session.gateway as LinearGateway;
        const data = await runBulkUpdate(gateway, parsed);
        renderEnvelope(successEnvelope("issues", "update", data), globals);
        const code = exitCodeForBulk(data);
        if (code !== 0) {
          process.exitCode = code;
        }
      } catch (error) {
        const normalized = normalizeError(error);
        renderEnvelope(
          errorEnvelope("issues", "update", {
            code: normalized.code,
            message: normalized.message,
            details: normalized.details,
          }),
          globals,
        );
        process.exitCode = 1;
      }
    });
}
