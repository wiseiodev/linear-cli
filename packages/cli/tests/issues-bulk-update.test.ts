import { mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import type { IssueRecord, SdkIssueUpdateInput } from "@wiseiodev/linear-core";
import { LinearCoreError } from "@wiseiodev/linear-core";
import { describe, expect, test } from "vitest";
import {
  exitCodeForBulk,
  parseBulkUpdateInput,
  readBulkInput,
  runBulkUpdate,
} from "../src/commands/issues-bulk-update.js";

function makeIssue(
  overrides: Partial<IssueRecord> & Pick<IssueRecord, "id" | "identifier">,
): IssueRecord {
  return {
    number: 1,
    title: `Title for ${overrides.identifier}`,
    priority: 0,
    url: `https://linear.app/x/issue/${overrides.identifier}`,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

interface RecordedCall {
  readonly type: "get" | "update";
  readonly id: string;
  readonly input?: SdkIssueUpdateInput;
}

function makeGateway(handlers: {
  getIssue?: (id: string) => Promise<IssueRecord>;
  updateIssue?: (id: string, input: SdkIssueUpdateInput) => Promise<IssueRecord>;
}): {
  gateway: {
    getIssue: (id: string) => Promise<IssueRecord>;
    updateIssue: (id: string, input: SdkIssueUpdateInput) => Promise<IssueRecord>;
  };
  calls: RecordedCall[];
} {
  const calls: RecordedCall[] = [];
  return {
    calls,
    gateway: {
      getIssue: async (id) => {
        calls.push({ type: "get", id });
        if (!handlers.getIssue) {
          throw new Error("getIssue not implemented");
        }
        return handlers.getIssue(id);
      },
      updateIssue: async (id, input) => {
        calls.push({ type: "update", id, input });
        if (!handlers.updateIssue) {
          throw new Error("updateIssue not implemented");
        }
        return handlers.updateIssue(id, input);
      },
    },
  };
}

describe("parseBulkUpdateInput", () => {
  test("parses shared-payload mode from --ids and --input", async () => {
    const parsed = await parseBulkUpdateInput({
      ids: "ANN-1, ANN-2 ,ANN-1",
      input: '{"priority":2}',
    });

    expect(parsed.dryRun).toBe(false);
    expect(parsed.concurrency).toBe(3);
    expect(parsed.items).toEqual([
      { id: "ANN-1", payload: { priority: 2 } },
      { id: "ANN-2", payload: { priority: 2 } },
    ]);
  });

  test("parses per-issue mode from JSON array file", async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), "linear-cli-bulk-"));
    const filePath = path.join(dir, "updates.json");
    await writeFile(
      filePath,
      JSON.stringify([
        { id: "ANN-1", title: "x" },
        { id: "ANN-2", priority: 1 },
      ]),
      "utf8",
    );

    const parsed = await parseBulkUpdateInput({ inputFile: filePath });

    expect(parsed.items).toEqual([
      { id: "ANN-1", payload: { title: "x" } },
      { id: "ANN-2", payload: { priority: 1 } },
    ]);
  });

  test("rejects --ids combined with per-issue array input", async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), "linear-cli-bulk-"));
    const filePath = path.join(dir, "updates.json");
    await writeFile(filePath, JSON.stringify([{ id: "ANN-1", title: "x" }]), "utf8");

    await expect(parseBulkUpdateInput({ ids: "ANN-1", inputFile: filePath })).rejects.toThrow(
      /--ids is not allowed/,
    );
  });

  test("rejects empty payload in shared-payload mode", async () => {
    await expect(parseBulkUpdateInput({ ids: "ANN-1", input: "{}" })).rejects.toThrow(
      /non-empty object/,
    );
  });

  test("rejects shared-payload object without --ids", async () => {
    await expect(parseBulkUpdateInput({ input: '{"priority":2}' })).rejects.toThrow(
      /requires --ids/,
    );
  });

  test("honors --concurrency override", async () => {
    const parsed = await parseBulkUpdateInput({
      ids: "ANN-1",
      input: '{"priority":2}',
      concurrency: "5",
    });
    expect(parsed.concurrency).toBe(5);
  });

  test("rejects invalid --concurrency", async () => {
    await expect(
      parseBulkUpdateInput({
        ids: "ANN-1",
        input: '{"priority":2}',
        concurrency: "0",
      }),
    ).rejects.toThrow(/positive integer/);
  });

  test("rejects fractional --concurrency", async () => {
    await expect(
      parseBulkUpdateInput({
        ids: "ANN-1",
        input: '{"priority":2}',
        concurrency: "2.5",
      }),
    ).rejects.toThrow(/positive integer/);
  });

  test("rejects excessive --concurrency", async () => {
    await expect(
      parseBulkUpdateInput({
        ids: "ANN-1",
        input: '{"priority":2}',
        concurrency: "11",
      }),
    ).rejects.toThrow(/10 or less/);
  });
});

describe("readBulkInput", () => {
  test("parses JSON from stdin when --input is -", async () => {
    const stdin = Readable.from(['{"priority":2}']);

    const parsed = await readBulkInput({ input: "-" }, stdin);

    expect(parsed).toEqual({ priority: 2 });
  });

  test("rejects stdin input when stdin is a TTY", async () => {
    const stdin = Readable.from([]);
    Object.defineProperty(stdin, "isTTY", { value: true });

    await expect(readBulkInput({ input: "-" }, stdin)).rejects.toThrow(/stdin is a TTY/);
  });
});

describe("runBulkUpdate", () => {
  test("dry-run returns planned entries and never calls updateIssue", async () => {
    const { gateway, calls } = makeGateway({
      getIssue: async (id) => makeIssue({ id: `uuid-${id}`, identifier: id }),
    });

    const data = await runBulkUpdate(gateway, {
      dryRun: true,
      concurrency: 2,
      items: [
        { id: "ANN-1", payload: { priority: 2 } },
        { id: "ANN-2", payload: { priority: 2 } },
      ],
    });

    expect(data.dryRun).toBe(true);
    expect(data.total).toBe(2);
    expect(data.succeeded).toBe(2);
    expect(data.failed).toBe(0);
    expect(calls.every((call) => call.type === "get")).toBe(true);
    const first = data.results[0];
    if (!first || !first.ok || !("planned" in first)) {
      throw new Error("expected dry-run success entry");
    }
    expect(first.planned).toEqual({ priority: 2 });
    expect(first.resolved.identifier).toBe("ANN-1");
    expect(exitCodeForBulk(data)).toBe(0);
  });

  test("aggregates mixed success and failure with exit code 2", async () => {
    const { gateway } = makeGateway({
      updateIssue: async (id, input) => {
        if (id === "ANN-2") {
          throw new LinearCoreError("ENTITY_NOT_FOUND", `No issue ${id}`);
        }
        return makeIssue({ id: `uuid-${id}`, identifier: id, title: input.title ?? "x" });
      },
    });

    const data = await runBulkUpdate(gateway, {
      dryRun: false,
      concurrency: 2,
      items: [
        { id: "ANN-1", payload: { title: "ok" } },
        { id: "ANN-2", payload: { title: "boom" } },
      ],
    });

    expect(data.total).toBe(2);
    expect(data.succeeded).toBe(1);
    expect(data.failed).toBe(1);
    const success = data.results[0];
    const failure = data.results[1];
    if (!success || !success.ok || !("issue" in success)) {
      throw new Error("expected first result to be live success");
    }
    if (!failure || failure.ok) {
      throw new Error("expected second result to be failure");
    }
    expect(success.issue.identifier).toBe("ANN-1");
    expect(failure.error.code).toBe("ENTITY_NOT_FOUND");
    expect(exitCodeForBulk(data)).toBe(2);
  });

  test("zero successes yields exit code 1", async () => {
    const { gateway } = makeGateway({
      updateIssue: async (id) => {
        throw new LinearCoreError("ENTITY_NOT_FOUND", `No issue ${id}`);
      },
    });

    const data = await runBulkUpdate(gateway, {
      dryRun: false,
      concurrency: 1,
      items: [{ id: "ANN-1", payload: { title: "x" } }],
    });

    expect(data.succeeded).toBe(0);
    expect(data.failed).toBe(1);
    expect(exitCodeForBulk(data)).toBe(1);
  });
});
