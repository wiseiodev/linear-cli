import type {
  CommentRecord,
  IssueRecord,
  ProjectRecord,
  ResolvableWorkflowState,
  SdkCommentInput,
  SdkIssueUpdateInput,
} from "@wiseiodev/linear-core";
import { LinearCoreError, resolveStateId } from "@wiseiodev/linear-core";

export interface IssueWorkflowGateway {
  getIssue(id: string): Promise<IssueRecord>;
  getProject(id: string): Promise<ProjectRecord>;
  getIssueBranchName(id: string): Promise<{
    readonly id: string;
    readonly identifier: string;
    readonly branchName: string;
    readonly url: string;
  }>;
  listWorkflowStatesForTeam(teamId: string): Promise<readonly ResolvableWorkflowState[]>;
  updateIssue(id: string, input: SdkIssueUpdateInput): Promise<IssueRecord>;
  createComment(input: SdkCommentInput): Promise<CommentRecord>;
}

export interface WorkflowStateSummary {
  readonly id: string;
  readonly name: string;
  readonly type: string;
}

export type IssueContext =
  | { readonly type: "parent"; readonly issue: IssueRecord }
  | { readonly type: "project"; readonly project: ProjectRecord }
  | null;

export interface PrepResult {
  readonly issue: IssueRecord;
  readonly context: IssueContext;
  readonly branchName: string;
  readonly state: WorkflowStateSummary;
}

export interface PrReadyResult {
  readonly issue: IssueRecord;
  readonly state: WorkflowStateSummary;
  readonly comment?: CommentRecord;
}

function requireTeam(issue: IssueRecord): string {
  if (!issue.teamId) {
    throw new LinearCoreError(
      "InvalidInput",
      `Cannot change state for ${issue.identifier} because it has no team.`,
    );
  }
  return issue.teamId;
}

function findState(
  states: readonly ResolvableWorkflowState[],
  stateId: string,
): WorkflowStateSummary {
  const state = states.find((candidate) => candidate.id === stateId);
  if (!state) {
    return { id: stateId, name: stateId, type: "unknown" };
  }
  return { id: state.id, name: state.name, type: state.type };
}

async function resolveStateSummary(
  gateway: IssueWorkflowGateway,
  teamId: string,
  stateRef: string,
  options: { readonly preferredType?: string } = {},
): Promise<WorkflowStateSummary> {
  const states = await gateway.listWorkflowStatesForTeam(teamId);
  const stateId = await resolveStateId(teamId, stateRef, async () => states, options);
  return findState(states, stateId);
}

async function loadContext(
  gateway: IssueWorkflowGateway,
  issue: IssueRecord,
): Promise<IssueContext> {
  if (issue.parentId) {
    return { type: "parent", issue: await gateway.getIssue(issue.parentId) };
  }
  if (issue.projectId) {
    return { type: "project", project: await gateway.getProject(issue.projectId) };
  }
  return null;
}

export async function runPrep(
  gateway: IssueWorkflowGateway,
  issueRef: string,
  stateOverride?: string,
): Promise<PrepResult> {
  const issue = await gateway.getIssue(issueRef);
  const teamId = requireTeam(issue);
  const state = await resolveStateSummary(gateway, teamId, stateOverride ?? "In Progress", {
    ...(stateOverride ? {} : { preferredType: "started" }),
  });
  const [context, branch] = await Promise.all([
    loadContext(gateway, issue),
    gateway.getIssueBranchName(issueRef),
  ]);
  const updated = await gateway.updateIssue(issueRef, { stateId: state.id });

  return {
    issue: updated,
    context,
    branchName: branch.branchName,
    state,
  };
}

function buildPrComment(comment: string | undefined, pr: string | undefined): string | undefined {
  if (!comment && !pr) {
    return undefined;
  }
  if (comment && pr) {
    return `${comment}\n\nPR: ${pr}`;
  }
  return comment ?? `PR: ${pr}`;
}

export async function runPrReady(
  gateway: IssueWorkflowGateway,
  issueRef: string,
  options: { readonly state?: string; readonly comment?: string; readonly pr?: string },
): Promise<PrReadyResult> {
  const issue = await gateway.getIssue(issueRef);
  const teamId = requireTeam(issue);
  const state = await resolveStateSummary(gateway, teamId, options.state ?? "In Review");
  const updated = await gateway.updateIssue(issueRef, { stateId: state.id });
  const body = buildPrComment(options.comment, options.pr);
  const comment = body ? await gateway.createComment({ issueId: issue.id, body }) : undefined;

  return {
    issue: updated,
    state,
    ...(comment ? { comment } : {}),
  };
}
