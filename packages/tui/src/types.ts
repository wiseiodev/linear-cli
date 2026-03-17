export interface IssueViewModel {
  readonly id: string;
  readonly identifier: string;
  readonly title: string;
  readonly priority: number;
  readonly stateName?: string;
  readonly updatedAt: string;
  readonly url: string;
}

export interface ProjectViewModel {
  readonly id: string;
  readonly name: string;
  readonly state: string;
  readonly progress: number;
  readonly url: string;
  readonly updatedAt: string;
}

export interface InitiativeViewModel {
  readonly id: string;
  readonly name: string;
  readonly status: string;
  readonly targetDate?: string;
  readonly url: string;
  readonly updatedAt: string;
}

export interface CycleViewModel {
  readonly id: string;
  readonly number: number;
  readonly name?: string;
  readonly progress: number;
  readonly isActive: boolean;
}

export interface PageResult<T> {
  readonly items: T[];
  readonly nextCursor: string | null;
}

export interface TuiGateway {
  listIssues(options: {
    readonly limit?: number;
    readonly cursor?: string | null;
  }): Promise<PageResult<IssueViewModel>>;
  listProjects(options: {
    readonly limit?: number;
    readonly cursor?: string | null;
  }): Promise<PageResult<ProjectViewModel>>;
  listInitiatives(options: {
    readonly limit?: number;
    readonly cursor?: string | null;
  }): Promise<PageResult<InitiativeViewModel>>;
  listCycles(options: {
    readonly limit?: number;
    readonly cursor?: string | null;
  }): Promise<PageResult<CycleViewModel>>;
}
