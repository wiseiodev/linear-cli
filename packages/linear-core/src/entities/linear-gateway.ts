import { LinearCoreError } from "../errors/core-error.js";
import type { ListOptions, PageResult } from "../types/public.js";
import type {
  AttachmentRecord,
  CommentRecord,
  CycleRecord,
  DocumentRecord,
  InitiativeRecord,
  IssueRecord,
  LabelRecord,
  ProjectRecord,
  TeamRecord,
  TemplateRecord,
  UserRecord,
  WorkflowStateRecord,
} from "./models.js";
import type {
  SdkAttachmentInput,
  SdkAttachmentLike,
  SdkAttachmentUpdateInput,
  SdkCommentInput,
  SdkCommentLike,
  SdkCommentUpdateInput,
  SdkCycleInput,
  SdkCycleLike,
  SdkCycleUpdateInput,
  SdkDocumentInput,
  SdkDocumentLike,
  SdkDocumentUpdateInput,
  SdkInitiativeInput,
  SdkInitiativeLike,
  SdkInitiativeUpdateInput,
  SdkIssueInput,
  SdkIssueLabelInput,
  SdkIssueLabelLike,
  SdkIssueLabelUpdateInput,
  SdkIssueLike,
  SdkIssueUpdateInput,
  SdkLinearClient,
  SdkProjectInput,
  SdkProjectLike,
  SdkProjectUpdateInput,
  SdkTeamInput,
  SdkTeamLike,
  SdkTeamUpdateInput,
  SdkTemplateInput,
  SdkTemplateLike,
  SdkTemplateUpdateInput,
  SdkUserLike,
  SdkUserUpdateInput,
  SdkWorkflowStateInput,
  SdkWorkflowStateLike,
  SdkWorkflowStateUpdateInput,
} from "./sdk-types.js";

function requireEntity<T>(value: Promise<T> | undefined, label: string): Promise<T> {
  if (!value) {
    throw new LinearCoreError("ENTITY_NOT_FOUND", `Missing entity payload: ${label}`);
  }
  return value;
}

function toDateString(value: Date): string {
  return value.toISOString();
}

function toIssue(record: SdkIssueLike, stateName?: string): IssueRecord {
  return {
    id: record.id,
    number: record.number,
    identifier: record.identifier,
    title: record.title,
    description: record.description ?? undefined,
    branchName: record.branchName ?? undefined,
    priority: record.priority,
    stateName,
    teamId: record.teamId,
    projectId: record.projectId,
    url: record.url,
    createdAt: toDateString(record.createdAt),
    updatedAt: toDateString(record.updatedAt),
  };
}

function toInitiative(record: SdkInitiativeLike): InitiativeRecord {
  return {
    id: record.id,
    name: record.name,
    description: record.description ?? undefined,
    content: record.content ?? undefined,
    color: record.color ?? undefined,
    status: record.status,
    targetDate: record.targetDate ?? undefined,
    url: record.url,
    createdAt: toDateString(record.createdAt),
    updatedAt: toDateString(record.updatedAt),
  };
}

function toProject(record: SdkProjectLike): ProjectRecord {
  return {
    id: record.id,
    name: record.name,
    description: record.description ?? undefined,
    content: record.content ?? undefined,
    color: record.color ?? undefined,
    state: record.state,
    priority: record.priority,
    progress: record.progress,
    targetDate: record.targetDate ?? undefined,
    url: record.url,
    createdAt: toDateString(record.createdAt),
    updatedAt: toDateString(record.updatedAt),
  };
}

function toDocument(record: SdkDocumentLike): DocumentRecord {
  const description = (record as SdkDocumentLike & { description?: string | null }).description;
  return {
    id: record.id,
    title: record.title,
    description: description ?? record.content ?? undefined,
    content: record.content ?? undefined,
    color: record.color ?? undefined,
    url: record.url,
    projectId: record.projectId,
    initiativeId: record.initiativeId,
    createdAt: toDateString(record.createdAt),
    updatedAt: toDateString(record.updatedAt),
  };
}

function toCycle(record: SdkCycleLike): CycleRecord {
  return {
    id: record.id,
    number: record.number,
    name: record.name ?? undefined,
    description: record.description ?? undefined,
    progress: record.progress,
    startsAt: toDateString(record.startsAt),
    endsAt: toDateString(record.endsAt),
    isActive: record.isActive,
    teamId: record.teamId,
    createdAt: toDateString(record.createdAt),
    updatedAt: toDateString(record.updatedAt),
  };
}

function toTeam(record: SdkTeamLike): TeamRecord {
  return {
    id: record.id,
    key: record.key,
    name: record.name,
    displayName: record.displayName,
    description: record.description ?? undefined,
    color: record.color ?? undefined,
    createdAt: toDateString(record.createdAt),
    updatedAt: toDateString(record.updatedAt),
  };
}

function toUser(record: SdkUserLike): UserRecord {
  return {
    id: record.id,
    name: record.name,
    displayName: record.displayName,
    description: record.description ?? undefined,
    email: record.email,
    active: record.active,
    url: record.url,
    createdAt: toDateString(record.createdAt),
    updatedAt: toDateString(record.updatedAt),
  };
}

function toLabel(record: SdkIssueLabelLike): LabelRecord {
  return {
    id: record.id,
    name: record.name,
    description: record.description ?? undefined,
    color: record.color ?? undefined,
    teamId: record.teamId,
    createdAt: toDateString(record.createdAt),
    updatedAt: toDateString(record.updatedAt),
  };
}

function toComment(record: SdkCommentLike): CommentRecord {
  return {
    id: record.id,
    body: record.body,
    url: record.url,
    createdAt: toDateString(record.createdAt),
    updatedAt: toDateString(record.updatedAt),
    issueId: record.issueId ?? undefined,
  };
}

function toAttachment(record: SdkAttachmentLike): AttachmentRecord {
  return {
    id: record.id,
    title: record.title,
    subtitle: record.subtitle ?? undefined,
    url: record.url,
    sourceType: record.sourceType ?? undefined,
    createdAt: toDateString(record.createdAt),
    updatedAt: toDateString(record.updatedAt),
  };
}

function toWorkflowState(record: SdkWorkflowStateLike): WorkflowStateRecord {
  return {
    id: record.id,
    name: record.name,
    description: record.description ?? undefined,
    type: record.type,
    color: record.color ?? undefined,
    teamId: record.teamId,
    createdAt: toDateString(record.createdAt),
    updatedAt: toDateString(record.updatedAt),
  };
}

function toTemplate(record: SdkTemplateLike): TemplateRecord {
  return {
    id: record.id,
    name: record.name,
    description: record.description ?? undefined,
    color: record.color ?? undefined,
    type: record.type,
    teamId: record.teamId,
    templateData: record.templateData,
    createdAt: toDateString(record.createdAt),
    updatedAt: toDateString(record.updatedAt),
  };
}

function toListVariables(options: ListOptions): { first: number; after?: string | null } {
  const base = {
    first: options.limit ?? 50,
  };

  if (options.cursor === undefined) {
    return base;
  }

  return {
    ...base,
    after: options.cursor,
  };
}

export class LinearGateway {
  private readonly client: SdkLinearClient;

  public constructor(client: SdkLinearClient) {
    this.client = client;
  }

  public async listIssues(options: ListOptions): Promise<PageResult<IssueRecord>> {
    const connection = await this.client.issues(toListVariables(options));

    const items = await Promise.all(
      connection.nodes.map(async (node) => {
        const state = node.state ? await node.state : undefined;
        return toIssue(node, state?.name);
      }),
    );

    return {
      items,
      nextCursor: connection.pageInfo.endCursor ?? null,
    };
  }

  public async getIssue(id: string): Promise<IssueRecord> {
    const issue = await this.client.issue(id);
    const state = issue.state ? await issue.state : undefined;
    return toIssue(issue, state?.name);
  }

  public async getIssueBranchName(idOrIdentifier: string): Promise<{
    readonly id: string;
    readonly identifier: string;
    readonly branchName: string;
    readonly url: string;
  }> {
    const issue = await this.client.issue(idOrIdentifier);
    return {
      id: issue.id,
      identifier: issue.identifier,
      branchName: issue.branchName,
      url: issue.url,
    };
  }

  public async createIssue(input: SdkIssueInput): Promise<IssueRecord> {
    const payload = await this.client.createIssue(input);
    const issue = await requireEntity(payload.issue, "issue");
    const state = issue.state ? await issue.state : undefined;
    return toIssue(issue, state?.name);
  }

  public async updateIssue(id: string, input: SdkIssueUpdateInput): Promise<IssueRecord> {
    const payload = await this.client.updateIssue(id, input);
    const issue = await requireEntity(payload.issue, "issue");
    const state = issue.state ? await issue.state : undefined;
    return toIssue(issue, state?.name);
  }

  public async deleteIssue(
    id: string,
  ): Promise<{ readonly id?: string; readonly success: boolean }> {
    const payload = await this.client.deleteIssue(id);
    return {
      id: payload.entityId,
      success: payload.success,
    };
  }

  public async listInitiatives(options: ListOptions): Promise<PageResult<InitiativeRecord>> {
    const connection = await this.client.initiatives(toListVariables(options));
    return {
      items: connection.nodes.map(toInitiative),
      nextCursor: connection.pageInfo.endCursor ?? null,
    };
  }

  public async getInitiative(id: string): Promise<InitiativeRecord> {
    return toInitiative(await this.client.initiative(id));
  }

  public async createInitiative(input: SdkInitiativeInput): Promise<InitiativeRecord> {
    const payload = await this.client.createInitiative(input);
    return toInitiative(await requireEntity(payload.initiative, "initiative"));
  }

  public async updateInitiative(
    id: string,
    input: SdkInitiativeUpdateInput,
  ): Promise<InitiativeRecord> {
    const payload = await this.client.updateInitiative(id, input);
    return toInitiative(await requireEntity(payload.initiative, "initiative"));
  }

  public async deleteInitiative(
    id: string,
  ): Promise<{ readonly id?: string; readonly success: boolean }> {
    const payload = await this.client.deleteInitiative(id);
    return {
      id: payload.entityId,
      success: payload.success,
    };
  }

  public async listProjects(options: ListOptions): Promise<PageResult<ProjectRecord>> {
    const connection = await this.client.projects(toListVariables(options));
    return {
      items: connection.nodes.map(toProject),
      nextCursor: connection.pageInfo.endCursor ?? null,
    };
  }

  public async getProject(id: string): Promise<ProjectRecord> {
    return toProject(await this.client.project(id));
  }

  public async createProject(input: SdkProjectInput): Promise<ProjectRecord> {
    const payload = await this.client.createProject(input);
    return toProject(await requireEntity(payload.project, "project"));
  }

  public async updateProject(id: string, input: SdkProjectUpdateInput): Promise<ProjectRecord> {
    const payload = await this.client.updateProject(id, input);
    return toProject(await requireEntity(payload.project, "project"));
  }

  public async deleteProject(
    id: string,
  ): Promise<{ readonly id?: string; readonly success: boolean }> {
    const payload = await this.client.deleteProject(id);
    return {
      id: payload.entityId,
      success: payload.success,
    };
  }

  public async listDocuments(options: ListOptions): Promise<PageResult<DocumentRecord>> {
    const connection = await this.client.documents(toListVariables(options));
    return {
      items: connection.nodes.map(toDocument),
      nextCursor: connection.pageInfo.endCursor ?? null,
    };
  }

  public async getDocument(id: string): Promise<DocumentRecord> {
    return toDocument(await this.client.document(id));
  }

  public async createDocument(input: SdkDocumentInput): Promise<DocumentRecord> {
    const payload = await this.client.createDocument(input);
    return toDocument(await requireEntity(payload.document, "document"));
  }

  public async updateDocument(id: string, input: SdkDocumentUpdateInput): Promise<DocumentRecord> {
    const payload = await this.client.updateDocument(id, input);
    return toDocument(await requireEntity(payload.document, "document"));
  }

  public async deleteDocument(
    id: string,
  ): Promise<{ readonly id?: string; readonly success: boolean }> {
    const payload = await this.client.deleteDocument(id);
    return {
      id: payload.entityId,
      success: payload.success,
    };
  }

  public async listCycles(options: ListOptions): Promise<PageResult<CycleRecord>> {
    const connection = await this.client.cycles(toListVariables(options));
    return {
      items: connection.nodes.map(toCycle),
      nextCursor: connection.pageInfo.endCursor ?? null,
    };
  }

  public async getCycle(id: string): Promise<CycleRecord> {
    return toCycle(await this.client.cycle(id));
  }

  public async createCycle(input: SdkCycleInput): Promise<CycleRecord> {
    const payload = await this.client.createCycle(input);
    return toCycle(await requireEntity(payload.cycle, "cycle"));
  }

  public async updateCycle(id: string, input: SdkCycleUpdateInput): Promise<CycleRecord> {
    const payload = await this.client.updateCycle(id, input);
    return toCycle(await requireEntity(payload.cycle, "cycle"));
  }

  public async deleteCycle(
    id: string,
  ): Promise<{ readonly id?: string; readonly success: boolean }> {
    const payload = await this.client.archiveCycle(id);
    return {
      id: payload.entityId,
      success: payload.success,
    };
  }

  public async listTeams(options: ListOptions): Promise<PageResult<TeamRecord>> {
    const connection = await this.client.teams(toListVariables(options));
    return {
      items: connection.nodes.map(toTeam),
      nextCursor: connection.pageInfo.endCursor ?? null,
    };
  }

  public async getTeam(id: string): Promise<TeamRecord> {
    return toTeam(await this.client.team(id));
  }

  public async createTeam(input: SdkTeamInput): Promise<TeamRecord> {
    const payload = await this.client.createTeam(input);
    return toTeam(await requireEntity(payload.team, "team"));
  }

  public async updateTeam(id: string, input: SdkTeamUpdateInput): Promise<TeamRecord> {
    const payload = await this.client.updateTeam(id, input);
    return toTeam(await requireEntity(payload.team, "team"));
  }

  public async deleteTeam(id: string): Promise<{ readonly success: boolean }> {
    const payload = await this.client.deleteTeam(id);
    return {
      success: payload.success,
    };
  }

  public async listUsers(options: ListOptions): Promise<PageResult<UserRecord>> {
    const connection = await this.client.users(toListVariables(options));
    return {
      items: connection.nodes.map(toUser),
      nextCursor: connection.pageInfo.endCursor ?? null,
    };
  }

  public async getUser(id: string): Promise<UserRecord> {
    return toUser(await this.client.user(id));
  }

  public async updateUser(id: string, input: SdkUserUpdateInput): Promise<UserRecord> {
    const payload = await this.client.updateUser(id, input);
    return toUser(await requireEntity(payload.user, "user"));
  }

  public async listLabels(options: ListOptions): Promise<PageResult<LabelRecord>> {
    const connection = await this.client.issueLabels(toListVariables(options));
    return {
      items: connection.nodes.map(toLabel),
      nextCursor: connection.pageInfo.endCursor ?? null,
    };
  }

  public async getLabel(id: string): Promise<LabelRecord> {
    return toLabel(await this.client.issueLabel(id));
  }

  public async createLabel(input: SdkIssueLabelInput): Promise<LabelRecord> {
    const payload = await this.client.createIssueLabel(input);
    return toLabel(await requireEntity(payload.issueLabel, "issueLabel"));
  }

  public async updateLabel(id: string, input: SdkIssueLabelUpdateInput): Promise<LabelRecord> {
    const payload = await this.client.updateIssueLabel(id, input);
    return toLabel(await requireEntity(payload.issueLabel, "issueLabel"));
  }

  public async deleteLabel(id: string): Promise<{ readonly success: boolean }> {
    const payload = await this.client.deleteIssueLabel(id);
    return {
      success: payload.success,
    };
  }

  public async listComments(options: ListOptions): Promise<PageResult<CommentRecord>> {
    const connection = await this.client.comments(toListVariables(options));
    return {
      items: connection.nodes.map(toComment),
      nextCursor: connection.pageInfo.endCursor ?? null,
    };
  }

  public async getComment(id: string): Promise<CommentRecord> {
    return toComment(await this.client.comment({ id }));
  }

  public async createComment(input: SdkCommentInput): Promise<CommentRecord> {
    const payload = await this.client.createComment(input);
    return toComment(await requireEntity(payload.comment, "comment"));
  }

  public async updateComment(id: string, input: SdkCommentUpdateInput): Promise<CommentRecord> {
    const payload = await this.client.updateComment(id, input);
    return toComment(await requireEntity(payload.comment, "comment"));
  }

  public async deleteComment(id: string): Promise<{ readonly success: boolean }> {
    const payload = await this.client.deleteComment(id);
    return {
      success: payload.success,
    };
  }

  public async listAttachments(options: ListOptions): Promise<PageResult<AttachmentRecord>> {
    const connection = await this.client.attachments(toListVariables(options));
    return {
      items: connection.nodes.map(toAttachment),
      nextCursor: connection.pageInfo.endCursor ?? null,
    };
  }

  public async getAttachment(id: string): Promise<AttachmentRecord> {
    return toAttachment(await this.client.attachment(id));
  }

  public async createAttachment(input: SdkAttachmentInput): Promise<AttachmentRecord> {
    const payload = await this.client.createAttachment(input);
    return toAttachment(await requireEntity(payload.attachment, "attachment"));
  }

  public async updateAttachment(
    id: string,
    input: SdkAttachmentUpdateInput,
  ): Promise<AttachmentRecord> {
    const payload = await this.client.updateAttachment(id, input);
    return toAttachment(await requireEntity(payload.attachment, "attachment"));
  }

  public async deleteAttachment(id: string): Promise<{ readonly success: boolean }> {
    const payload = await this.client.deleteAttachment(id);
    return {
      success: payload.success,
    };
  }

  public async listWorkflowStates(options: ListOptions): Promise<PageResult<WorkflowStateRecord>> {
    const connection = await this.client.workflowStates(toListVariables(options));
    return {
      items: connection.nodes.map(toWorkflowState),
      nextCursor: connection.pageInfo.endCursor ?? null,
    };
  }

  public async getWorkflowState(id: string): Promise<WorkflowStateRecord> {
    return toWorkflowState(await this.client.workflowState(id));
  }

  public async createWorkflowState(input: SdkWorkflowStateInput): Promise<WorkflowStateRecord> {
    const payload = await this.client.createWorkflowState(input);
    return toWorkflowState(await requireEntity(payload.workflowState, "workflowState"));
  }

  public async updateWorkflowState(
    id: string,
    input: SdkWorkflowStateUpdateInput,
  ): Promise<WorkflowStateRecord> {
    const payload = await this.client.updateWorkflowState(id, input);
    return toWorkflowState(await requireEntity(payload.workflowState, "workflowState"));
  }

  public async deleteWorkflowState(
    id: string,
  ): Promise<{ readonly id?: string; readonly success: boolean }> {
    const payload = await this.client.archiveWorkflowState(id);
    return {
      id: payload.entityId,
      success: payload.success,
    };
  }

  public async listTemplates(): Promise<TemplateRecord[]> {
    const templates = await this.client.templates;
    return templates.map(toTemplate);
  }

  public async getTemplate(id: string): Promise<TemplateRecord> {
    return toTemplate(await this.client.template(id));
  }

  public async createTemplate(input: SdkTemplateInput): Promise<TemplateRecord> {
    const payload = await this.client.createTemplate(input);
    return toTemplate(await requireEntity(payload.template, "template"));
  }

  public async updateTemplate(id: string, input: SdkTemplateUpdateInput): Promise<TemplateRecord> {
    const payload = await this.client.updateTemplate(id, input);
    return toTemplate(await requireEntity(payload.template, "template"));
  }

  public async deleteTemplate(
    id: string,
  ): Promise<{ readonly id?: string; readonly success: boolean }> {
    const payload = await this.client.deleteTemplate(id);
    return {
      id: payload.entityId,
      success: payload.success,
    };
  }
}
