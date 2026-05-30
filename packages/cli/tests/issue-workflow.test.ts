import type {
  CommentRecord,
  IssueRecord,
  ProjectRecord,
  ResolvableWorkflowState,
  SdkCommentInput,
  SdkIssueUpdateInput,
} from "@wiseiodev/linear-core";
import { describe, expect, test, vi } from "vitest";
import { type IssueWorkflowGateway, runPrep, runPrReady } from "../src/commands/issue-workflow.js";

const STATES: readonly ResolvableWorkflowState[] = [
  { id: "state-todo", name: "Todo", type: "unstarted", position: 1 },
  { id: "state-started", name: "Doing", type: "started", position: 1 },
  { id: "state-review", name: "In Review", type: "started", position: 2 },
];

function issue(overrides: Partial<IssueRecord> = {}): IssueRecord {
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
    ...overrides,
  };
}

function project(): ProjectRecord {
  return {
    id: "project-1",
    name: "Demo project",
    state: "active",
    priority: 0,
    progress: 0,
    url: "https://linear.app/project/demo",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

function comment(input: SdkCommentInput): CommentRecord {
  return {
    id: "comment-1",
    body: input.body ?? "",
    issueId: input.issueId,
    url: "https://linear.app/comment/comment-1",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

function makeGateway(
  options: { baseIssue?: IssueRecord; states?: readonly ResolvableWorkflowState[] } = {},
) {
  const baseIssue = options.baseIssue ?? issue();
  const getIssue = vi.fn(async (id: string) =>
    id === "parent-1" ? issue({ id: "parent-1", identifier: "ANN-0", title: "Parent" }) : baseIssue,
  );
  const getProject = vi.fn(async () => project());
  const getIssueBranchName = vi.fn(async () => ({
    id: baseIssue.id,
    identifier: baseIssue.identifier,
    branchName: "ann-1-demo",
    url: baseIssue.url,
  }));
  const listWorkflowStatesForTeam = vi.fn(async () => options.states ?? STATES);
  const updateIssue = vi.fn(async (_id: string, input: SdkIssueUpdateInput) =>
    issue({ ...baseIssue, stateId: input.stateId }),
  );
  const createComment = vi.fn(async (input: SdkCommentInput) => comment(input));
  const gateway: IssueWorkflowGateway = {
    getIssue,
    getProject,
    getIssueBranchName,
    listWorkflowStatesForTeam,
    updateIssue,
    createComment,
  };
  return { gateway, getIssue, getProject, getIssueBranchName, updateIssue, createComment };
}

describe("runPrep", () => {
  test("moves to the first started state, includes parent context, and returns branch name", async () => {
    const { gateway, getIssue, getIssueBranchName, updateIssue } = makeGateway({
      baseIssue: issue({ parentId: "parent-1" }),
    });

    const result = await runPrep(gateway, "ANN-1");

    expect(result.branchName).toBe("ann-1-demo");
    expect(result.state).toEqual({ id: "state-started", name: "Doing", type: "started" });
    expect(result.context?.type).toBe("parent");
    expect(getIssue).toHaveBeenCalledWith("parent-1");
    expect(getIssueBranchName).toHaveBeenCalledWith("ANN-1");
    expect(updateIssue).toHaveBeenCalledWith("ANN-1", { stateId: "state-started" });
  });

  test("honors a state override and uses project context when there is no parent", async () => {
    const { gateway, getProject, updateIssue } = makeGateway({
      baseIssue: issue({ projectId: "project-1" }),
    });

    const result = await runPrep(gateway, "ANN-1", "In Review");

    expect(result.context?.type).toBe("project");
    expect(getProject).toHaveBeenCalledWith("project-1");
    expect(updateIssue).toHaveBeenCalledWith("ANN-1", { stateId: "state-review" });
  });
});

describe("runPrReady", () => {
  test("moves to In Review without posting a comment by default", async () => {
    const { gateway, updateIssue, createComment } = makeGateway();

    const result = await runPrReady(gateway, "ANN-1", {});

    expect(result.state.id).toBe("state-review");
    expect(updateIssue).toHaveBeenCalledWith("ANN-1", { stateId: "state-review" });
    expect(createComment).not.toHaveBeenCalled();
    expect(result.comment).toBeUndefined();
  });

  test("posts a generated PR comment when --pr is supplied", async () => {
    const { gateway, createComment } = makeGateway();

    const result = await runPrReady(gateway, "ANN-1", {
      pr: "https://github.com/wiseiodev/linear-cli/pull/21",
    });

    expect(createComment).toHaveBeenCalledWith({
      issueId: "issue-1",
      body: "PR: https://github.com/wiseiodev/linear-cli/pull/21",
    });
    expect(result.comment?.body).toContain("/pull/21");
  });
});
