import type { IssueRecord, ResolvableWorkflowState } from "@wiseiodev/linear-core";
import { describe, expect, test, vi } from "vitest";
import {
  type IssueStateGateway,
  normalizeIssueBulkUpdateStatePayloads,
  normalizeIssueCreateStatePayload,
  normalizeIssueUpdateStatePayload,
} from "../src/commands/issue-state.js";

const STATES: readonly ResolvableWorkflowState[] = [
  { id: "s-todo", name: "Todo", type: "unstarted", position: 1 },
  { id: "s-progress", name: "In Progress", type: "started", position: 2 },
];

function makeIssue(overrides: Partial<IssueRecord> = {}): IssueRecord {
  return {
    id: "issue-uuid",
    number: 1,
    identifier: "ANN-1",
    title: "Demo",
    priority: 0,
    url: "https://linear.app/x/issue/ANN-1",
    teamId: "team-1",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeGateway(
  options: { issue?: IssueRecord; states?: readonly ResolvableWorkflowState[] } = {},
) {
  const getIssue = vi.fn(async (_id: string) => options.issue ?? makeIssue());
  const listWorkflowStatesForTeam = vi.fn(async (_teamId: string) => options.states ?? STATES);
  const gateway: IssueStateGateway = { getIssue, listWorkflowStatesForTeam };
  return { gateway, getIssue, listWorkflowStatesForTeam };
}

describe("normalizeIssueUpdateStatePayload", () => {
  test("resolves the --state flag to a stateId scoped to the issue's team", async () => {
    const { gateway, getIssue, listWorkflowStatesForTeam } = makeGateway();

    const result = await normalizeIssueUpdateStatePayload(gateway, "ANN-1", {}, "In Progress");

    expect(result).toEqual({ stateId: "s-progress" });
    expect(getIssue).toHaveBeenCalledWith("ANN-1");
    expect(listWorkflowStatesForTeam).toHaveBeenCalledWith("team-1");
  });

  test("resolves a `state` key in the payload and strips it", async () => {
    const { gateway } = makeGateway();

    const result = await normalizeIssueUpdateStatePayload(
      gateway,
      "ANN-1",
      { state: "Todo", title: "x" },
      undefined,
    );

    expect(result).toEqual({ stateId: "s-todo", title: "x" });
  });

  test("resolves a `stateName` key in the payload and strips it", async () => {
    const { gateway } = makeGateway();

    const result = await normalizeIssueUpdateStatePayload(
      gateway,
      "ANN-1",
      { stateName: "In Progress" },
      undefined,
    );

    expect(result).toEqual({ stateId: "s-progress" });
  });

  test("leaves an explicit stateId untouched, skips resolution, strips name keys", async () => {
    const { gateway, getIssue } = makeGateway();

    const result = await normalizeIssueUpdateStatePayload(
      gateway,
      "ANN-1",
      { stateId: "explicit-uuid", state: "Todo", stateName: "Todo", title: "x" },
      "In Progress",
    );

    expect(result).toEqual({ stateId: "explicit-uuid", title: "x" });
    expect(getIssue).not.toHaveBeenCalled();
  });

  test("resolves a state ref even when stateId is present but empty", async () => {
    const { gateway } = makeGateway();

    const result = await normalizeIssueUpdateStatePayload(
      gateway,
      "ANN-1",
      { stateId: "" },
      "In Progress",
    );

    expect(result).toEqual({ stateId: "s-progress" });
  });

  test("trims a whitespace-padded UUID --state and skips the fetch", async () => {
    const uuid = "11111111-2222-3333-4444-555555555555";
    const { gateway, getIssue } = makeGateway();

    const result = await normalizeIssueUpdateStatePayload(gateway, "ANN-1", {}, `  ${uuid}  `);

    expect(result).toEqual({ stateId: uuid });
    expect(getIssue).not.toHaveBeenCalled();
  });

  test("prefers the --state flag over `state`/`stateName` keys", async () => {
    const { gateway } = makeGateway();

    const result = await normalizeIssueUpdateStatePayload(
      gateway,
      "ANN-1",
      { state: "Todo", stateName: "Todo" },
      "In Progress",
    );

    expect(result).toEqual({ stateId: "s-progress" });
  });

  test("returns the payload unchanged and skips the fetch when no state is provided", async () => {
    const { gateway, getIssue } = makeGateway();

    const result = await normalizeIssueUpdateStatePayload(
      gateway,
      "ANN-1",
      { title: "x" },
      undefined,
    );

    expect(result).toEqual({ title: "x" });
    expect(getIssue).not.toHaveBeenCalled();
  });

  test("passes a UUID --state through without fetching the issue", async () => {
    const uuid = "11111111-2222-3333-4444-555555555555";
    const { gateway, getIssue } = makeGateway();

    const result = await normalizeIssueUpdateStatePayload(gateway, "ANN-1", {}, uuid);

    expect(result).toEqual({ stateId: uuid });
    expect(getIssue).not.toHaveBeenCalled();
  });

  test("surfaces a listing error when the state name is unknown", async () => {
    const { gateway } = makeGateway();

    await expect(normalizeIssueUpdateStatePayload(gateway, "ANN-1", {}, "Bogus")).rejects.toThrow(
      /In Progress \(started\)/,
    );
  });
});

describe("normalizeIssueCreateStatePayload", () => {
  test("resolves the --state flag against the create payload team", async () => {
    const { gateway, listWorkflowStatesForTeam } = makeGateway();

    const result = await normalizeIssueCreateStatePayload(
      gateway,
      { teamId: "team-1", title: "Demo" },
      "Todo",
    );

    expect(result).toEqual({ teamId: "team-1", title: "Demo", stateId: "s-todo" });
    expect(listWorkflowStatesForTeam).toHaveBeenCalledWith("team-1");
  });

  test("resolves state/stateName payload keys and strips them", async () => {
    const { gateway } = makeGateway();

    await expect(
      normalizeIssueCreateStatePayload(
        gateway,
        { teamId: "team-1", title: "Demo", state: "In Progress" },
        undefined,
      ),
    ).resolves.toEqual({ teamId: "team-1", title: "Demo", stateId: "s-progress" });

    await expect(
      normalizeIssueCreateStatePayload(
        gateway,
        { teamId: "team-1", title: "Demo", stateName: "Todo" },
        undefined,
      ),
    ).resolves.toEqual({ teamId: "team-1", title: "Demo", stateId: "s-todo" });
  });

  test("keeps explicit stateId and strips state names without listing states", async () => {
    const { gateway, listWorkflowStatesForTeam } = makeGateway();

    const result = await normalizeIssueCreateStatePayload(
      gateway,
      { teamId: "team-1", title: "Demo", stateId: "state-explicit", state: "Todo" },
      "In Progress",
    );

    expect(result).toEqual({ teamId: "team-1", title: "Demo", stateId: "state-explicit" });
    expect(listWorkflowStatesForTeam).not.toHaveBeenCalled();
  });

  test("fails clearly when a create state name has no teamId", async () => {
    const { gateway } = makeGateway();

    await expect(
      normalizeIssueCreateStatePayload(gateway, { title: "Demo" }, "Todo"),
    ).rejects.toThrow(/teamId is missing/);
  });
});

describe("normalizeIssueBulkUpdateStatePayloads", () => {
  test("resolves one state flag per distinct team and strips name keys", async () => {
    const issueA = makeIssue({ id: "issue-a", identifier: "ANN-1", teamId: "team-1" });
    const issueB = makeIssue({ id: "issue-b", identifier: "ANN-2", teamId: "team-1" });
    const getIssue = vi.fn(async (id: string) => (id === "ANN-1" ? issueA : issueB));
    const listWorkflowStatesForTeam = vi.fn(async () => STATES);
    const gateway: IssueStateGateway = { getIssue, listWorkflowStatesForTeam };

    const result = await normalizeIssueBulkUpdateStatePayloads(
      gateway,
      [
        { id: "ANN-1", payload: { title: "A", stateName: "Todo" } },
        { id: "ANN-2", payload: { title: "B" } },
      ],
      "In Progress",
    );

    expect(result).toEqual([
      { id: "ANN-1", payload: { title: "A", stateId: "s-progress" } },
      { id: "ANN-2", payload: { title: "B", stateId: "s-progress" } },
    ]);
    expect(getIssue).toHaveBeenCalledTimes(2);
    expect(listWorkflowStatesForTeam).toHaveBeenCalledTimes(1);
  });

  test("explicit stateId wins per bulk item", async () => {
    const { gateway, getIssue } = makeGateway();

    const result = await normalizeIssueBulkUpdateStatePayloads(
      gateway,
      [{ id: "ANN-1", payload: { stateId: "explicit", state: "Todo" } }],
      "In Progress",
    );

    expect(result).toEqual([{ id: "ANN-1", payload: { stateId: "explicit" } }]);
    expect(getIssue).not.toHaveBeenCalled();
  });
});
