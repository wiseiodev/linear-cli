export interface IssueRecord {
  readonly id: string;
  readonly identifier: string;
  readonly title: string;
  readonly priority: number;
  readonly stateName?: string;
  readonly teamId?: string;
  readonly projectId?: string;
  readonly url: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ProjectRecord {
  readonly id: string;
  readonly name: string;
  readonly state: string;
  readonly priority: number;
  readonly progress: number;
  readonly url: string;
  readonly updatedAt: string;
}

export interface DocumentRecord {
  readonly id: string;
  readonly title: string;
  readonly content?: string;
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
  readonly status: string;
  readonly targetDate?: string;
  readonly url: string;
  readonly updatedAt: string;
}

export interface CycleRecord {
  readonly id: string;
  readonly number: number;
  readonly name?: string;
  readonly progress: number;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly isActive: boolean;
  readonly teamId?: string;
}

export interface TeamRecord {
  readonly id: string;
  readonly key: string;
  readonly name: string;
  readonly displayName: string;
  readonly description?: string;
}

export interface UserRecord {
  readonly id: string;
  readonly name: string;
  readonly displayName: string;
  readonly email: string;
  readonly active: boolean;
}

export interface LabelRecord {
  readonly id: string;
  readonly name: string;
  readonly color?: string;
  readonly teamId?: string;
}

export interface CommentRecord {
  readonly id: string;
  readonly body: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly issueId?: string;
}

export interface AttachmentRecord {
  readonly id: string;
  readonly title: string;
  readonly url: string;
  readonly sourceType?: string;
  readonly createdAt: string;
}

export interface WorkflowStateRecord {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly color?: string;
  readonly teamId?: string;
}

export interface TemplateRecord {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly type: string;
  readonly teamId?: string;
  readonly templateData: Readonly<Record<string, unknown>>;
  readonly updatedAt: string;
}
