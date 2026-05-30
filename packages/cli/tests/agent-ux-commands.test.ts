import type { CommentRecord, IssueRecord, PageResult } from "@wiseiodev/linear-core";
import { afterEach, describe, expect, test, vi } from "vitest";
import { createProgram } from "../src/index.js";

const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

afterEach(() => {
  logSpy.mockClear();
  process.exitCode = undefined;
});

function issue(): IssueRecord {
  return {
    id: "issue-1",
    number: 1,
    identifier: "ANN-1",
    title: "Demo",
    priority: 0,
    teamId: "team-1",
    url: "https://linear.app/x/issue/ANN-1",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

function comment(): CommentRecord {
  return {
    id: "comment-1",
    body: "Ready",
    issueId: "issue-1",
    url: "https://linear.app/comment/comment-1",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

function workflowGateway(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    getIssue: vi.fn(async () => issue({ projectId: "project-1" })),
    getProject: vi.fn(async () => ({
      id: "project-1",
      name: "Project",
      state: "active",
      priority: 0,
      progress: 0,
      url: "https://linear.app/project/project",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    })),
    getIssueBranchName: vi.fn(async () => ({
      id: "issue-1",
      identifier: "ANN-1",
      branchName: "ann-1-demo",
      url: "https://linear.app/x/issue/ANN-1",
    })),
    listWorkflowStatesForTeam: vi.fn(async () => [
      { id: "state-started", name: "In Progress", type: "started", position: 1 },
      { id: "state-review", name: "In Review", type: "started", position: 2 },
    ]),
    updateIssue: vi.fn(async (_id: string, input: { stateId?: string }) =>
      issue({ stateId: input.stateId }),
    ),
    createComment: vi.fn(async (input: { issueId?: string; body?: string }) => ({
      ...comment(),
      issueId: input.issueId,
      body: input.body ?? "",
    })),
    ...overrides,
  };
}

describe("agent UX commands", () => {
  test("blocks an unbounded issues list before opening a Linear session", async () => {
    const openSession = vi.fn();
    const program = createProgram({ openSession } as never);

    await program.parseAsync(["node", "linear", "--json", "issues", "list"]);

    expect(openSession).not.toHaveBeenCalled();
    expect(process.exitCode).toBe(1);
    expect(JSON.parse(String(logSpy.mock.calls[0]?.[0]))).toMatchObject({
      ok: false,
      error: { message: expect.stringContaining("unbounded issues list") },
    });
  });

  test("renders unexpected issues list positionals as a JSON error envelope", async () => {
    const openSession = vi.fn();
    const program = createProgram({ openSession } as never);

    await program.parseAsync(["node", "linear", "--json", "issues", "list", "ANN-1"]);

    expect(openSession).not.toHaveBeenCalled();
    expect(process.exitCode).toBe(1);
    expect(JSON.parse(String(logSpy.mock.calls[0]?.[0]))).toMatchObject({
      ok: false,
      entity: "issues",
      action: "list",
      error: {
        code: "InvalidInput",
        message: expect.stringContaining('Unexpected positional argument "ANN-1"'),
      },
    });
  });

  test("allows bounded issues list calls", async () => {
    const listIssues = vi.fn(
      async (): Promise<PageResult<IssueRecord>> => ({
        items: [issue()],
        nextCursor: null,
      }),
    );
    const openSession = vi.fn().mockResolvedValue({ gateway: { listIssues } });
    const program = createProgram({ openSession } as never);

    await program.parseAsync(["node", "linear", "--json", "issues", "list", "--limit", "1"]);

    expect(listIssues).toHaveBeenCalledWith({ limit: 1, cursor: undefined });
    expect(JSON.parse(String(logSpy.mock.calls[0]?.[0]))).toMatchObject({
      ok: true,
      entity: "issues",
      action: "list",
    });
  });

  test("comments list --issue resolves the issue and scopes the list", async () => {
    const resolveIssueId = vi.fn(async () => "issue-1");
    const listComments = vi.fn(
      async (): Promise<PageResult<CommentRecord>> => ({
        items: [comment()],
        nextCursor: null,
      }),
    );
    const openSession = vi.fn().mockResolvedValue({
      gateway: { resolveIssueId, listComments },
    });
    const program = createProgram({ openSession } as never);

    await program.parseAsync(["node", "linear", "--json", "comments", "list", "--issue", "ANN-1"]);

    expect(resolveIssueId).toHaveBeenCalledWith("ANN-1");
    expect(listComments).toHaveBeenCalledWith({
      limit: undefined,
      cursor: undefined,
      issueId: "issue-1",
    });
  });

  test("doctor includes binary install information", async () => {
    const status = vi.fn(async () => ({
      profile: "default",
      hasApiKey: true,
      hasAccessToken: false,
      oauthConfigured: false,
      hasRefreshToken: false,
      expired: false,
    }));
    const openSession = vi.fn().mockResolvedValue({
      client: {
        viewer: Promise.resolve({
          id: "user-1",
          displayName: "Wise",
          name: "wise",
          email: "w@example.com",
        }),
        rateLimitStatus: Promise.resolve({ requests: { remaining: 100 } }),
      },
    });
    const program = createProgram({ status, openSession } as never);

    await program.parseAsync(["node", "linear", "--json", "doctor"]);

    expect(JSON.parse(String(logSpy.mock.calls[0]?.[0]))).toMatchObject({
      ok: true,
      entity: "doctor",
      action: "show",
      data: {
        binary: expect.objectContaining({
          executable: expect.any(String),
          onPath: expect.any(Boolean),
          candidates: expect.any(Array),
        }),
      },
    });
  });

  test("prep command returns branch and state context", async () => {
    const gateway = workflowGateway();
    const openSession = vi.fn().mockResolvedValue({ gateway });
    const program = createProgram({ openSession } as never);

    await program.parseAsync(["node", "linear", "--json", "prep", "ANN-1"]);

    expect(gateway.updateIssue).toHaveBeenCalledWith("ANN-1", { stateId: "state-started" });
    expect(JSON.parse(String(logSpy.mock.calls[0]?.[0]))).toMatchObject({
      ok: true,
      entity: "issues",
      action: "update",
      data: {
        branchName: "ann-1-demo",
        state: { name: "In Progress" },
      },
    });
  });

  test("pr-ready command posts a PR comment when requested", async () => {
    const gateway = workflowGateway();
    const openSession = vi.fn().mockResolvedValue({ gateway });
    const program = createProgram({ openSession } as never);

    await program.parseAsync([
      "node",
      "linear",
      "--json",
      "pr-ready",
      "ANN-1",
      "--pr",
      "https://github.com/wiseiodev/linear-cli/pull/21",
    ]);

    expect(gateway.updateIssue).toHaveBeenCalledWith("ANN-1", { stateId: "state-review" });
    expect(gateway.createComment).toHaveBeenCalledWith({
      issueId: "issue-1",
      body: "PR: https://github.com/wiseiodev/linear-cli/pull/21",
    });
  });
});
