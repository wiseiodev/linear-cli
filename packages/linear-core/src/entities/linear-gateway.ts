import { LinearCoreError } from "../errors/core-error.js";
import type { ListOptions, PageResult } from "../types/public.js";
import type {
  AttachmentRecord,
  CommentRecord,
  CustomerNeedRecord,
  CustomerRecord,
  CycleRecord,
  DocumentRecord,
  InitiativeRecord,
  InitiativeUpdateRecord,
  IssueRecord,
  LabelRecord,
  NotificationRecord,
  ProjectMilestoneRecord,
  ProjectRecord,
  ProjectUpdateRecord,
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
  SdkCustomerInput,
  SdkCustomerLike,
  SdkCustomerNeedInput,
  SdkCustomerNeedLike,
  SdkCustomerNeedUpdateInput,
  SdkCustomerUpdateInput,
  SdkCycleInput,
  SdkCycleLike,
  SdkCycleUpdateInput,
  SdkDocumentInput,
  SdkDocumentLike,
  SdkDocumentUpdateInput,
  SdkInitiativeInput,
  SdkInitiativeLike,
  SdkInitiativeUpdateCreateInput,
  SdkInitiativeUpdateInput,
  SdkInitiativeUpdateLike,
  SdkInitiativeUpdateUpdateInput,
  SdkIssueInput,
  SdkIssueLabelInput,
  SdkIssueLabelLike,
  SdkIssueLabelUpdateInput,
  SdkIssueLike,
  SdkIssueUpdateInput,
  SdkLinearClient,
  SdkNotificationLike,
  SdkNotificationUpdateInput,
  SdkProjectInput,
  SdkProjectLike,
  SdkProjectMilestoneInput,
  SdkProjectMilestoneLike,
  SdkProjectMilestoneUpdateInput,
  SdkProjectUpdateCreateInput,
  SdkProjectUpdateInput,
  SdkProjectUpdateLike,
  SdkProjectUpdateUpdateInput,
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

async function resolveFetch<T>(value: Promise<T> | undefined): Promise<T | undefined> {
  return value ? await value : undefined;
}

async function resolveConnectionNodes<T>(
  loader: (() => Promise<{ readonly nodes: readonly T[] }>) | undefined,
): Promise<readonly T[]> {
  if (!loader) {
    return [];
  }

  const connection = await loader();
  return connection.nodes;
}

function readDisplayName(
  value: { readonly displayName?: string; readonly name?: string } | undefined,
): string | undefined {
  return value?.displayName ?? value?.name;
}

async function toIssue(record: SdkIssueLike): Promise<IssueRecord> {
  const [state, assignee, project, cycle, team, milestone, parent, labels, children, relations] =
    await Promise.all([
      resolveFetch(record.state),
      resolveFetch(record.assignee),
      resolveFetch(record.project),
      resolveFetch(record.cycle),
      resolveFetch(record.team),
      resolveFetch(record.projectMilestone),
      resolveFetch(record.parent),
      resolveConnectionNodes(
        typeof record.labels === "function" ? () => record.labels() : undefined,
      ),
      resolveConnectionNodes(
        typeof record.children === "function" ? () => record.children() : undefined,
      ),
      resolveConnectionNodes(
        typeof record.relations === "function" ? () => record.relations() : undefined,
      ),
    ]);

  return {
    id: record.id,
    number: record.number,
    identifier: record.identifier,
    title: record.title,
    description: record.description ?? undefined,
    branchName: record.branchName ?? undefined,
    priority: record.priority,
    estimate: record.estimate ?? undefined,
    dueDate: record.dueDate ?? undefined,
    stateName: state?.name,
    assigneeId: record.assigneeId ?? undefined,
    assigneeName: readDisplayName(assignee),
    teamId: record.teamId,
    teamKey: team?.key,
    teamName: team?.displayName ?? team?.name,
    projectId: record.projectId,
    projectName: project?.name,
    cycleId: record.cycleId ?? undefined,
    cycleName: cycle?.name ?? (cycle ? `Cycle ${cycle.number}` : undefined),
    milestoneId: record.projectMilestoneId ?? undefined,
    milestoneName: milestone?.name,
    parentId: record.parentId ?? undefined,
    parentIdentifier: parent?.identifier,
    labelNames: labels
      .map((label) => label.name)
      .filter((value): value is string => typeof value === "string"),
    childCount: children.length,
    relationCount: relations.length,
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

function toInitiativeUpdate(
  record: SdkInitiativeUpdateLike,
  initiativeName?: string,
  userName?: string,
): InitiativeUpdateRecord {
  return {
    id: record.id,
    body: record.body,
    health: String(record.health),
    commentCount: record.commentCount,
    initiativeId: record.initiativeId ?? undefined,
    initiativeName,
    userId: record.userId ?? undefined,
    userName,
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

function toProjectMilestone(
  record: SdkProjectMilestoneLike,
  projectName?: string,
): ProjectMilestoneRecord {
  return {
    id: record.id,
    name: record.name,
    description: record.description ?? undefined,
    progress: record.progress,
    status: String(record.status),
    targetDate: record.targetDate ?? undefined,
    projectId: record.projectId ?? undefined,
    projectName,
    createdAt: toDateString(record.createdAt),
    updatedAt: toDateString(record.updatedAt),
  };
}

function toProjectUpdate(
  record: SdkProjectUpdateLike,
  projectName?: string,
  userName?: string,
): ProjectUpdateRecord {
  return {
    id: record.id,
    body: record.body,
    health: String(record.health),
    commentCount: record.commentCount,
    projectId: record.projectId ?? undefined,
    projectName,
    userId: record.userId ?? undefined,
    userName,
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

function toCustomer(
  record: SdkCustomerLike,
  ownerName?: string,
  statusName?: string,
  tierName?: string,
): CustomerRecord {
  return {
    id: record.id,
    name: record.name,
    slugId: record.slugId,
    domains: record.domains,
    externalIds: record.externalIds,
    approximateNeedCount: record.approximateNeedCount,
    revenue: record.revenue ?? undefined,
    size: record.size ?? undefined,
    ownerId: record.ownerId ?? undefined,
    ownerName,
    statusId: record.statusId ?? undefined,
    statusName,
    tierId: record.tierId ?? undefined,
    tierName,
    url: record.url,
    createdAt: toDateString(record.createdAt),
    updatedAt: toDateString(record.updatedAt),
  };
}

function toCustomerNeed(
  record: SdkCustomerNeedLike,
  customerName?: string,
  issueIdentifier?: string,
  projectName?: string,
): CustomerNeedRecord {
  return {
    id: record.id,
    body: record.body ?? undefined,
    priority: record.priority,
    url: record.url ?? undefined,
    customerId: record.customerId ?? undefined,
    customerName,
    issueId: record.issueId ?? undefined,
    issueIdentifier,
    projectId: record.projectId ?? undefined,
    projectName,
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

function toNotification(record: SdkNotificationLike, userName?: string): NotificationRecord {
  return {
    id: record.id,
    type: record.type,
    category: String(record.category),
    userId: record.userId ?? undefined,
    userName,
    isRead: Boolean(record.readAt),
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

    const items = await Promise.all(connection.nodes.map((node) => toIssue(node)));

    return {
      items,
      nextCursor: connection.pageInfo.endCursor ?? null,
    };
  }

  public async getIssue(id: string): Promise<IssueRecord> {
    const issue = await this.client.issue(id);
    return toIssue(issue);
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
    return toIssue(issue);
  }

  public async updateIssue(id: string, input: SdkIssueUpdateInput): Promise<IssueRecord> {
    const payload = await this.client.updateIssue(id, input);
    const issue = await requireEntity(payload.issue, "issue");
    return toIssue(issue);
  }

  public async listCustomers(options: ListOptions): Promise<PageResult<CustomerRecord>> {
    const connection = await this.client.customers(toListVariables(options));
    const items = await Promise.all(
      connection.nodes.map(async (node) =>
        toCustomer(
          node,
          readDisplayName(await resolveFetch(node.owner)),
          (await resolveFetch(node.status))?.name,
          (await resolveFetch(node.tier))?.name,
        ),
      ),
    );

    return {
      items,
      nextCursor: connection.pageInfo.endCursor ?? null,
    };
  }

  public async getCustomer(id: string): Promise<CustomerRecord> {
    const customer = await this.client.customer(id);
    return toCustomer(
      customer,
      readDisplayName(await resolveFetch(customer.owner)),
      (await resolveFetch(customer.status))?.name,
      (await resolveFetch(customer.tier))?.name,
    );
  }

  public async createCustomer(input: SdkCustomerInput): Promise<CustomerRecord> {
    const payload = await this.client.createCustomer(input);
    const customer = await requireEntity(payload.customer, "customer");
    return toCustomer(
      customer,
      readDisplayName(await resolveFetch(customer.owner)),
      (await resolveFetch(customer.status))?.name,
      (await resolveFetch(customer.tier))?.name,
    );
  }

  public async updateCustomer(id: string, input: SdkCustomerUpdateInput): Promise<CustomerRecord> {
    const payload = await this.client.updateCustomer(id, input);
    const customer = await requireEntity(payload.customer, "customer");
    return toCustomer(
      customer,
      readDisplayName(await resolveFetch(customer.owner)),
      (await resolveFetch(customer.status))?.name,
      (await resolveFetch(customer.tier))?.name,
    );
  }

  public async deleteCustomer(id: string): Promise<{ readonly success: boolean }> {
    const payload = await this.client.deleteCustomer(id);
    return {
      success: payload.success,
    };
  }

  public async listCustomerNeeds(options: ListOptions): Promise<PageResult<CustomerNeedRecord>> {
    const connection = await this.client.customerNeeds(toListVariables(options));
    const items = await Promise.all(
      connection.nodes.map(async (node) =>
        toCustomerNeed(
          node,
          (await resolveFetch(node.customer))?.name,
          (await resolveFetch(node.issue))?.identifier,
          (await resolveFetch(node.project))?.name,
        ),
      ),
    );

    return {
      items,
      nextCursor: connection.pageInfo.endCursor ?? null,
    };
  }

  public async getCustomerNeed(id: string): Promise<CustomerNeedRecord> {
    const need = await this.client.customerNeed({ id });
    return toCustomerNeed(
      need,
      (await resolveFetch(need.customer))?.name,
      (await resolveFetch(need.issue))?.identifier,
      (await resolveFetch(need.project))?.name,
    );
  }

  public async createCustomerNeed(input: SdkCustomerNeedInput): Promise<CustomerNeedRecord> {
    const payload = await this.client.createCustomerNeed(input);
    const need = await requireEntity(payload.need, "customerNeed");
    return toCustomerNeed(
      need,
      (await resolveFetch(need.customer))?.name,
      (await resolveFetch(need.issue))?.identifier,
      (await resolveFetch(need.project))?.name,
    );
  }

  public async updateCustomerNeed(
    id: string,
    input: SdkCustomerNeedUpdateInput,
  ): Promise<CustomerNeedRecord> {
    const payload = await this.client.updateCustomerNeed(id, input);
    const need = await requireEntity(payload.need, "customerNeed");
    return toCustomerNeed(
      need,
      (await resolveFetch(need.customer))?.name,
      (await resolveFetch(need.issue))?.identifier,
      (await resolveFetch(need.project))?.name,
    );
  }

  public async deleteCustomerNeed(id: string): Promise<{ readonly success: boolean }> {
    const payload = await this.client.deleteCustomerNeed(id);
    return {
      success: payload.success,
    };
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

  public async listInitiativeUpdates(
    options: ListOptions,
  ): Promise<PageResult<InitiativeUpdateRecord>> {
    const connection = await this.client.initiativeUpdates(toListVariables(options));
    const items = await Promise.all(
      connection.nodes.map(async (node) =>
        toInitiativeUpdate(
          node,
          (await resolveFetch(node.initiative))?.name,
          readDisplayName(await resolveFetch(node.user)),
        ),
      ),
    );

    return {
      items,
      nextCursor: connection.pageInfo.endCursor ?? null,
    };
  }

  public async getInitiativeUpdate(id: string): Promise<InitiativeUpdateRecord> {
    const update = await this.client.initiativeUpdate(id);
    return toInitiativeUpdate(
      update,
      (await resolveFetch(update.initiative))?.name,
      readDisplayName(await resolveFetch(update.user)),
    );
  }

  public async createInitiativeUpdate(
    input: SdkInitiativeUpdateCreateInput,
  ): Promise<InitiativeUpdateRecord> {
    const payload = await this.client.createInitiativeUpdate(input);
    const update = await requireEntity(payload.initiativeUpdate, "initiativeUpdate");
    return toInitiativeUpdate(
      update,
      (await resolveFetch(update.initiative))?.name,
      readDisplayName(await resolveFetch(update.user)),
    );
  }

  public async updateInitiativeUpdate(
    id: string,
    input: SdkInitiativeUpdateUpdateInput,
  ): Promise<InitiativeUpdateRecord> {
    const payload = await this.client.updateInitiativeUpdate(id, input);
    const update = await requireEntity(payload.initiativeUpdate, "initiativeUpdate");
    return toInitiativeUpdate(
      update,
      (await resolveFetch(update.initiative))?.name,
      readDisplayName(await resolveFetch(update.user)),
    );
  }

  public async deleteInitiativeUpdate(
    id: string,
  ): Promise<{ readonly id?: string; readonly success: boolean }> {
    const payload = await this.client.archiveInitiativeUpdate(id);
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

  public async listProjectMilestones(
    options: ListOptions,
  ): Promise<PageResult<ProjectMilestoneRecord>> {
    const connection = await this.client.projectMilestones(toListVariables(options));
    const items = await Promise.all(
      connection.nodes.map(async (node) =>
        toProjectMilestone(node, (await resolveFetch(node.project))?.name),
      ),
    );

    return {
      items,
      nextCursor: connection.pageInfo.endCursor ?? null,
    };
  }

  public async getProjectMilestone(id: string): Promise<ProjectMilestoneRecord> {
    const milestone = await this.client.projectMilestone(id);
    return toProjectMilestone(milestone, (await resolveFetch(milestone.project))?.name);
  }

  public async createProjectMilestone(
    input: SdkProjectMilestoneInput,
  ): Promise<ProjectMilestoneRecord> {
    const payload = await this.client.createProjectMilestone(input);
    const milestone = await requireEntity(payload.projectMilestone, "projectMilestone");
    return toProjectMilestone(milestone, (await resolveFetch(milestone.project))?.name);
  }

  public async updateProjectMilestone(
    id: string,
    input: SdkProjectMilestoneUpdateInput,
  ): Promise<ProjectMilestoneRecord> {
    const payload = await this.client.updateProjectMilestone(id, input);
    const milestone = await requireEntity(payload.projectMilestone, "projectMilestone");
    return toProjectMilestone(milestone, (await resolveFetch(milestone.project))?.name);
  }

  public async deleteProjectMilestone(id: string): Promise<{ readonly success: boolean }> {
    const payload = await this.client.deleteProjectMilestone(id);
    return {
      success: payload.success,
    };
  }

  public async listProjectUpdates(options: ListOptions): Promise<PageResult<ProjectUpdateRecord>> {
    const connection = await this.client.projectUpdates(toListVariables(options));
    const items = await Promise.all(
      connection.nodes.map(async (node) =>
        toProjectUpdate(
          node,
          (await resolveFetch(node.project))?.name,
          readDisplayName(await resolveFetch(node.user)),
        ),
      ),
    );

    return {
      items,
      nextCursor: connection.pageInfo.endCursor ?? null,
    };
  }

  public async getProjectUpdate(id: string): Promise<ProjectUpdateRecord> {
    const update = await this.client.projectUpdate(id);
    return toProjectUpdate(
      update,
      (await resolveFetch(update.project))?.name,
      readDisplayName(await resolveFetch(update.user)),
    );
  }

  public async createProjectUpdate(
    input: SdkProjectUpdateCreateInput,
  ): Promise<ProjectUpdateRecord> {
    const payload = await this.client.createProjectUpdate(input);
    const update = await requireEntity(payload.projectUpdate, "projectUpdate");
    return toProjectUpdate(
      update,
      (await resolveFetch(update.project))?.name,
      readDisplayName(await resolveFetch(update.user)),
    );
  }

  public async updateProjectUpdate(
    id: string,
    input: SdkProjectUpdateUpdateInput,
  ): Promise<ProjectUpdateRecord> {
    const payload = await this.client.updateProjectUpdate(id, input);
    const update = await requireEntity(payload.projectUpdate, "projectUpdate");
    return toProjectUpdate(
      update,
      (await resolveFetch(update.project))?.name,
      readDisplayName(await resolveFetch(update.user)),
    );
  }

  public async deleteProjectUpdate(id: string): Promise<{ readonly success: boolean }> {
    const payload = await this.client.deleteProjectUpdate(id);
    return {
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

  public async listNotifications(options: ListOptions): Promise<PageResult<NotificationRecord>> {
    const connection = await this.client.notifications(toListVariables(options));
    const items = await Promise.all(
      connection.nodes.map(async (node) =>
        toNotification(node, readDisplayName(await resolveFetch(node.user))),
      ),
    );

    return {
      items,
      nextCursor: connection.pageInfo.endCursor ?? null,
    };
  }

  public async getNotification(id: string): Promise<NotificationRecord> {
    const notification = await this.client.notification(id);
    return toNotification(notification, readDisplayName(await resolveFetch(notification.user)));
  }

  public async updateNotification(
    id: string,
    input: SdkNotificationUpdateInput,
  ): Promise<NotificationRecord> {
    await this.client.updateNotification(id, input);
    const notification = await this.client.notification(id);
    return toNotification(notification, readDisplayName(await resolveFetch(notification.user)));
  }

  public async deleteNotification(id: string): Promise<{ readonly success: boolean }> {
    const payload = await this.client.archiveNotification(id);
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
