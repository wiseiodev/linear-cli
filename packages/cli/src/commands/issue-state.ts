import type { IssueRecord, ResolvableWorkflowState } from "@wiseiodev/linear-core";
import { isWorkflowStateId, LinearCoreError, resolveStateId } from "@wiseiodev/linear-core";

export interface IssueStateGateway {
  getIssue(id: string): Promise<IssueRecord>;
  listWorkflowStatesForTeam(teamId: string): Promise<readonly ResolvableWorkflowState[]>;
}

function asString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function pickStateRef(
  stateFlag: string | undefined,
  state: unknown,
  stateName: unknown,
): string | undefined {
  return asString(stateFlag) ?? asString(state) ?? asString(stateName);
}

async function resolveStateRef(
  gateway: IssueStateGateway,
  issueId: string,
  stateRef: string,
): Promise<string> {
  // Short-circuit a UUID here (not just inside resolveStateId) so a UUID
  // reference never triggers the getIssue() round-trip needed for name lookup.
  if (isWorkflowStateId(stateRef)) {
    return stateRef;
  }

  const issue = await gateway.getIssue(issueId);
  if (!issue.teamId) {
    throw new LinearCoreError(
      "InvalidInput",
      `Cannot resolve state "${stateRef}" because issue ${issue.identifier} has no team.`,
    );
  }

  return resolveStateId(issue.teamId, stateRef, (teamId) =>
    gateway.listWorkflowStatesForTeam(teamId),
  );
}

async function resolveStateRefForTeam(
  gateway: IssueStateGateway,
  teamId: string,
  stateRef: string,
): Promise<string> {
  if (isWorkflowStateId(stateRef)) {
    return stateRef;
  }

  return resolveStateId(teamId, stateRef, (id) => gateway.listWorkflowStatesForTeam(id));
}

/**
 * Folds a state reference (from --state, or a `state`/`stateName` key) into a
 * resolved `stateId`, scoped to the target issue's team. An explicit `stateId`
 * in the payload always wins and skips resolution; `state`/`stateName` keys are
 * stripped so they never reach GraphQL.
 */
export async function normalizeIssueUpdateStatePayload(
  gateway: IssueStateGateway,
  issueId: string,
  payload: Record<string, unknown>,
  stateFlag: string | undefined,
): Promise<Record<string, unknown>> {
  const { state, stateName, ...rest } = payload;

  // An explicit, non-empty stateId always wins and skips resolution. A blank or
  // non-string stateId is not treated as explicit, so a state ref can still resolve.
  if (typeof rest.stateId === "string" && rest.stateId.trim().length > 0) {
    return rest;
  }

  const stateRef = pickStateRef(stateFlag, state, stateName);
  if (stateRef === undefined) {
    return rest;
  }

  const stateId = await resolveStateRef(gateway, issueId, stateRef);
  return { ...rest, stateId };
}

export async function normalizeIssueCreateStatePayload(
  gateway: IssueStateGateway,
  payload: Record<string, unknown>,
  stateFlag: string | undefined,
): Promise<Record<string, unknown>> {
  const { state, stateName, ...rest } = payload;

  if (typeof rest.stateId === "string" && rest.stateId.trim().length > 0) {
    return rest;
  }

  const stateRef = pickStateRef(stateFlag, state, stateName);
  if (stateRef === undefined) {
    return rest;
  }

  if (typeof rest.teamId !== "string" || rest.teamId.trim().length === 0) {
    throw new LinearCoreError(
      "InvalidInput",
      `Cannot resolve state "${stateRef}" for issue create because teamId is missing.`,
    );
  }

  const stateId = await resolveStateRefForTeam(gateway, rest.teamId, stateRef);
  return { ...rest, stateId };
}

export async function normalizeIssueBulkUpdateStatePayloads<T extends { id: string }>(
  gateway: IssueStateGateway,
  items: readonly (T & { payload: Record<string, unknown> })[],
  stateFlag: string | undefined,
): Promise<Array<T & { payload: Record<string, unknown> }>> {
  const stateCache = new Map<string, Promise<string>>();

  const normalizeItem = async (
    item: T & { payload: Record<string, unknown> },
  ): Promise<T & { payload: Record<string, unknown> }> => {
    const { state, stateName, ...rest } = item.payload;

    if (typeof rest.stateId === "string" && rest.stateId.trim().length > 0) {
      return { ...item, payload: rest };
    }

    const stateRef = pickStateRef(stateFlag, state, stateName);
    if (stateRef === undefined) {
      return { ...item, payload: rest };
    }

    if (isWorkflowStateId(stateRef)) {
      return { ...item, payload: { ...rest, stateId: stateRef } };
    }

    const issue = await gateway.getIssue(item.id);
    if (!issue.teamId) {
      throw new LinearCoreError(
        "InvalidInput",
        `Cannot resolve state "${stateRef}" because issue ${issue.identifier} has no team.`,
      );
    }

    const cacheKey = `${issue.teamId}\n${stateRef.trim().toLowerCase()}`;
    let stateIdPromise = stateCache.get(cacheKey);
    if (!stateIdPromise) {
      stateIdPromise = resolveStateRefForTeam(gateway, issue.teamId, stateRef);
      stateCache.set(cacheKey, stateIdPromise);
    }
    const stateId = await stateIdPromise;

    return { ...item, payload: { ...rest, stateId } };
  };

  return Promise.all(items.map((item) => normalizeItem(item)));
}
