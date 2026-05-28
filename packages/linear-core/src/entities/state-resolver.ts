import { LinearCoreError } from "../errors/core-error.js";

const WORKFLOW_STATE_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface ResolvableWorkflowState {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly position?: number;
}

export type ListTeamWorkflowStates = (
  teamId: string,
) => Promise<readonly ResolvableWorkflowState[]>;

export interface ResolveStateIdOptions {
  readonly preferredType?: string;
}

export function isWorkflowStateId(reference: string): boolean {
  return WORKFLOW_STATE_ID_PATTERN.test(reference);
}

export async function resolveStateId(
  teamId: string,
  stateRef: string,
  listStates: ListTeamWorkflowStates,
  options: ResolveStateIdOptions = {},
): Promise<string> {
  if (isWorkflowStateId(stateRef)) {
    return stateRef;
  }

  const states = await listStates(teamId);
  const target = normalizeName(stateRef);
  const nameMatches = states.filter((state) => normalizeName(state.name) === target);

  if (nameMatches.length > 1) {
    throw new LinearCoreError(
      "InvalidInput",
      `Workflow state "${stateRef}" is ambiguous for this team. ${describeStates(states)}`,
      { stateRef },
    );
  }

  const [exactMatch] = nameMatches;
  if (exactMatch) {
    return exactMatch.id;
  }

  if (options.preferredType) {
    const fallback = lowestPositionOfType(states, options.preferredType);
    if (fallback) {
      return fallback.id;
    }
  }

  throw new LinearCoreError(
    "InvalidInput",
    `Workflow state "${stateRef}" not found for this team. ${describeStates(states)}`,
    { stateRef },
  );
}

function normalizeName(value: string): string {
  return value.trim().toLowerCase();
}

function lowestPositionOfType(
  states: readonly ResolvableWorkflowState[],
  type: string,
): ResolvableWorkflowState | undefined {
  let best: ResolvableWorkflowState | undefined;
  for (const state of states) {
    if (state.type !== type) {
      continue;
    }
    // States without a position sort last so explicitly-positioned states always win.
    const position = state.position ?? Number.POSITIVE_INFINITY;
    const bestPosition = best?.position ?? Number.POSITIVE_INFINITY;
    if (best === undefined || position < bestPosition) {
      best = state;
    }
  }
  return best;
}

function describeStates(states: readonly ResolvableWorkflowState[]): string {
  if (states.length === 0) {
    return "This team has no workflow states.";
  }
  const list = states.map((state) => `${state.name} (${state.type})`).join(", ");
  return `Valid states: ${list}.`;
}
