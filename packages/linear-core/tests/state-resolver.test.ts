import { describe, expect, test, vi } from "vitest";
import type { ResolvableWorkflowState } from "../src/entities/state-resolver.js";
import { resolveStateId } from "../src/entities/state-resolver.js";
import { LinearCoreError } from "../src/errors/core-error.js";

const STATES: readonly ResolvableWorkflowState[] = [
  { id: "s-backlog", name: "Backlog", type: "backlog", position: 0 },
  { id: "s-todo", name: "Todo", type: "unstarted", position: 1 },
  { id: "s-progress", name: "In Progress", type: "started", position: 2 },
  { id: "s-review", name: "In Review", type: "started", position: 3 },
  { id: "s-done", name: "Done", type: "completed", position: 4 },
];

const listStates = async (): Promise<readonly ResolvableWorkflowState[]> => STATES;

describe("resolveStateId", () => {
  test("returns a UUID reference unchanged without listing states", async () => {
    const uuid = "11111111-2222-3333-4444-555555555555";
    const list = vi.fn(async () => STATES);

    const result = await resolveStateId("team-1", uuid, list);

    expect(result).toBe(uuid);
    expect(list).not.toHaveBeenCalled();
  });

  test("matches an exact state name case-insensitively", async () => {
    const result = await resolveStateId("team-1", "in progress", listStates);
    expect(result).toBe("s-progress");
  });

  test("scopes the lookup to the provided team id", async () => {
    const list = vi.fn(async () => STATES);

    await resolveStateId("team-xyz", "Done", list);

    expect(list).toHaveBeenCalledWith("team-xyz");
  });

  test("falls back to the lowest-position state of the preferred type", async () => {
    const result = await resolveStateId("team-1", "Doing", listStates, {
      preferredType: "started",
    });

    expect(result).toBe("s-progress");
  });

  test("throws a LinearCoreError listing valid states when the name is unknown", async () => {
    const error = await resolveStateId("team-1", "Nope", listStates).catch((thrown) => thrown);

    expect(error).toBeInstanceOf(LinearCoreError);
    expect((error as LinearCoreError).code).toBe("InvalidInput");
    expect((error as LinearCoreError).message).toContain("In Progress (started)");
    expect((error as LinearCoreError).message).toContain("not found");
  });

  test("preferred-type fallback ignores states without a position", async () => {
    const mixed: readonly ResolvableWorkflowState[] = [
      { id: "no-pos", name: "Started A", type: "started" },
      { id: "pos-5", name: "Started B", type: "started", position: 5 },
    ];

    const result = await resolveStateId("team-1", "Doing", async () => mixed, {
      preferredType: "started",
    });

    expect(result).toBe("pos-5");
  });

  test("throws when no name match and the preferred type is absent", async () => {
    await expect(
      resolveStateId("team-1", "Doing", listStates, { preferredType: "triage" }),
    ).rejects.toThrow(/not found/);
  });

  test("throws an ambiguity error when multiple states share the name", async () => {
    const ambiguous: readonly ResolvableWorkflowState[] = [
      { id: "a", name: "In Progress", type: "started", position: 1 },
      { id: "b", name: "in progress", type: "started", position: 2 },
    ];

    await expect(resolveStateId("team-1", "In Progress", async () => ambiguous)).rejects.toThrow(
      /ambiguous/,
    );
  });
});
