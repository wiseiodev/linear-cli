import type { IssueRecord, PageResult } from "@wiseiodev/linear-core";
import { afterEach, describe, expect, test, vi } from "vitest";
import { createProgram } from "../src/index.js";
import { collectPageResult, matchesCustomerNeed } from "../src/runtime/query.js";

describe("collectPageResult", () => {
  test("fetches fixed-size batches until filtered results satisfy the requested limit", async () => {
    const loader = vi
      .fn<
        (options: {
          limit?: number;
          cursor?: string;
        }) => Promise<PageResult<{ id: string; keep: boolean }>>
      >()
      .mockResolvedValueOnce({
        items: [{ id: "issue-1", keep: false }],
        nextCursor: "cursor-1",
      })
      .mockResolvedValueOnce({
        items: [
          { id: "issue-2", keep: true },
          { id: "issue-3", keep: true },
        ],
        nextCursor: "cursor-2",
      });

    const result = await collectPageResult(
      loader,
      {
        json: false,
        quiet: false,
        mine: true,
        limit: 2,
      },
      (item) => item.keep,
    );

    expect(loader).toHaveBeenNthCalledWith(1, {
      limit: 50,
      cursor: undefined,
    });
    expect(loader).toHaveBeenNthCalledWith(2, {
      limit: 50,
      cursor: "cursor-1",
    });
    expect(result).toEqual({
      items: [
        { id: "issue-2", keep: true },
        { id: "issue-3", keep: true },
      ],
      nextCursor: "cursor-2",
    });
  });

  test("uses fixed-size batches for full drains and applies the limit after sorting", async () => {
    const loader = vi
      .fn<
        (options: {
          limit?: number;
          cursor?: string;
        }) => Promise<PageResult<{ id: string; title: string }>>
      >()
      .mockResolvedValueOnce({
        items: [{ id: "2", title: "Zulu" }],
        nextCursor: "cursor-1",
      })
      .mockResolvedValueOnce({
        items: [{ id: "1", title: "Alpha" }],
        nextCursor: null,
      });

    const result = await collectPageResult(loader, {
      json: false,
      quiet: false,
      all: true,
      sort: "title",
      limit: 1,
    });

    expect(loader).toHaveBeenNthCalledWith(1, {
      limit: 50,
      cursor: undefined,
    });
    expect(loader).toHaveBeenNthCalledWith(2, {
      limit: 50,
      cursor: "cursor-1",
    });
    expect(result).toEqual({
      items: [{ id: "1", title: "Alpha" }],
      nextCursor: null,
    });
  });
});

describe("matchesCustomerNeed", () => {
  test("matches the project filter against project fields instead of customer fields", () => {
    expect(
      matchesCustomerNeed(
        {
          id: "need-1",
          customerId: "customer-1",
          customerName: "Acme",
          projectId: "project-1",
          projectName: "CLI v2",
          body: "Need richer CLI commands",
          priority: 1,
          createdAt: "2026-03-19T00:00:00.000Z",
          updatedAt: "2026-03-19T00:00:00.000Z",
        },
        {
          json: false,
          quiet: false,
          project: "cli v2",
        },
      ),
    ).toBe(true);
  });
});

describe("my-work", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    process.exitCode = 0;
  });

  test("resolves the authenticated user even when --mine was implied by the command", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const fakeIssue = {
      id: "issue-1",
      identifier: "ENG-1",
      title: "Only my issue should remain",
      priority: 2,
      stateName: "Todo",
      assigneeName: "Wise Dev",
      updatedAt: "2026-03-19T00:00:00.000Z",
    } satisfies IssueRecord;

    const otherIssue = {
      ...fakeIssue,
      id: "issue-2",
      identifier: "ENG-2",
      assigneeName: "Someone Else",
    } satisfies IssueRecord;

    const openSession = vi.fn().mockResolvedValue({
      client: {
        viewer: Promise.resolve({
          displayName: "Wise Dev",
          name: "wise",
        }),
      },
      gateway: {
        listIssues: vi.fn().mockResolvedValue({
          items: [fakeIssue, otherIssue],
          nextCursor: null,
        }),
      },
    });

    const program = createProgram({
      openSession,
    } as never);

    await program.parseAsync(["node", "linear", "--json", "my-work"]);

    const [[payload]] = logSpy.mock.calls;
    expect(openSession).toHaveBeenCalledTimes(2);
    expect(JSON.parse(String(payload))).toMatchObject({
      ok: true,
      entity: "issues",
      action: "list",
      data: {
        items: [expect.objectContaining({ identifier: "ENG-1" })],
      },
    });
  });
});
