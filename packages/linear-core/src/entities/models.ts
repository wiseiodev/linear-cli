export interface IssueRecord {
  readonly id: string;
  readonly number: number;
  readonly identifier: string;
  readonly title: string;
  readonly description?: string;
  readonly branchName?: string;
  readonly priority: number;
  readonly estimate?: number;
  readonly dueDate?: string;
  readonly stateName?: string;
  readonly assigneeId?: string;
  readonly assigneeName?: string;
  readonly teamId?: string;
  readonly teamKey?: string;
  readonly teamName?: string;
  readonly projectId?: string;
  readonly projectName?: string;
  readonly cycleId?: string;
  readonly cycleName?: string;
  readonly milestoneId?: string;
  readonly milestoneName?: string;
  readonly parentId?: string;
  readonly parentIdentifier?: string;
  readonly labelNames?: readonly string[];
  readonly childCount?: number;
  readonly relationCount?: number;
  readonly url: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ProjectRecord {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly content?: string;
  readonly color?: string;
  readonly state: string;
  readonly priority: number;
  readonly progress: number;
  readonly targetDate?: string;
  readonly url: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ProjectMilestoneRecord {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly progress: number;
  readonly status: string;
  readonly targetDate?: string;
  readonly projectId?: string;
  readonly projectName?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ProjectUpdateRecord {
  readonly id: string;
  readonly body: string;
  readonly health: string;
  readonly commentCount: number;
  readonly projectId?: string;
  readonly projectName?: string;
  readonly userId?: string;
  readonly userName?: string;
  readonly url: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface DocumentRecord {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly content?: string;
  readonly color?: string;
  readonly url: string;
  readonly projectId?: string;
  readonly initiativeId?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface InitiativeRecord {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly content?: string;
  readonly color?: string;
  readonly status: string;
  readonly targetDate?: string;
  readonly url: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface InitiativeUpdateRecord {
  readonly id: string;
  readonly body: string;
  readonly health: string;
  readonly commentCount: number;
  readonly initiativeId?: string;
  readonly initiativeName?: string;
  readonly userId?: string;
  readonly userName?: string;
  readonly url: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CycleRecord {
  readonly id: string;
  readonly number: number;
  readonly name?: string;
  readonly description?: string;
  readonly progress: number;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly isActive: boolean;
  readonly teamId?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface TeamRecord {
  readonly id: string;
  readonly key: string;
  readonly name: string;
  readonly displayName: string;
  readonly description?: string;
  readonly color?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CustomerRecord {
  readonly id: string;
  readonly name: string;
  readonly slugId: string;
  readonly domains: readonly string[];
  readonly externalIds: readonly string[];
  readonly approximateNeedCount: number;
  readonly revenue?: number;
  readonly size?: number;
  readonly ownerId?: string;
  readonly ownerName?: string;
  readonly statusId?: string;
  readonly statusName?: string;
  readonly tierId?: string;
  readonly tierName?: string;
  readonly url: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CustomerNeedRecord {
  readonly id: string;
  readonly body?: string;
  readonly priority: number;
  readonly url?: string;
  readonly customerId?: string;
  readonly customerName?: string;
  readonly issueId?: string;
  readonly issueIdentifier?: string;
  readonly projectId?: string;
  readonly projectName?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface UserRecord {
  readonly id: string;
  readonly name: string;
  readonly displayName: string;
  readonly description?: string;
  readonly email: string;
  readonly active: boolean;
  readonly url: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface LabelRecord {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly color?: string;
  readonly teamId?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CommentRecord {
  readonly id: string;
  readonly body: string;
  readonly url: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly issueId?: string;
}

export interface AttachmentRecord {
  readonly id: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly url: string;
  readonly sourceType?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface NotificationRecord {
  readonly id: string;
  readonly type: string;
  readonly category: string;
  readonly userId?: string;
  readonly userName?: string;
  readonly isRead: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface WorkflowStateRecord {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly type: string;
  readonly color?: string;
  readonly teamId?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface TemplateRecord {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly color?: string;
  readonly type: string;
  readonly teamId?: string;
  readonly templateData: Readonly<Record<string, unknown>>;
  readonly createdAt: string;
  readonly updatedAt: string;
}
