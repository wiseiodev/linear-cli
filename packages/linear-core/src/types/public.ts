export type LinearEntity =
  | "auth"
  | "issues"
  | "customers"
  | "customer-needs"
  | "initiatives"
  | "initiative-updates"
  | "projects"
  | "milestones"
  | "project-updates"
  | "documents"
  | "cycles"
  | "teams"
  | "users"
  | "labels"
  | "comments"
  | "attachments"
  | "notifications"
  | "states"
  | "templates"
  | "skills"
  | "docs"
  | "doctor"
  | "tui";

export type LinearAction =
  | "list"
  | "browse"
  | "get"
  | "create"
  | "update"
  | "delete"
  | "login"
  | "logout"
  | "status"
  | "set"
  | "show"
  | "install"
  | "open";

export interface EnvelopeMeta {
  readonly count?: number;
  readonly limit?: number;
  readonly cursor?: string | null;
  readonly nextCursor?: string | null;
  readonly profile?: string;
  readonly team?: string;
}

export interface EnvelopeError {
  readonly code: string;
  readonly message: string;
  readonly details?: Readonly<Record<string, string>>;
}

export interface SuccessEnvelope<Data> {
  readonly ok: true;
  readonly entity: LinearEntity;
  readonly action: LinearAction;
  readonly data: Data;
  readonly meta?: EnvelopeMeta;
}

export interface ErrorEnvelope {
  readonly ok: false;
  readonly entity: LinearEntity;
  readonly action: LinearAction;
  readonly error: EnvelopeError;
  readonly meta?: EnvelopeMeta;
}

export type OutputEnvelope<Data> = SuccessEnvelope<Data> | ErrorEnvelope;

export interface PageResult<T> {
  readonly items: T[];
  readonly nextCursor: string | null;
}

export interface ListOptions {
  readonly limit?: number;
  readonly cursor?: string | null;
}

export type ViewPreset = "table" | "detail" | "dense";

export interface SortSpec {
  readonly field: string;
  readonly direction?: "asc" | "desc";
}

export interface FieldSelection {
  readonly fields?: readonly string[];
  readonly view?: ViewPreset;
}

export interface ListQuery extends ListOptions, FieldSelection {
  readonly mine?: boolean;
  readonly project?: string;
  readonly cycle?: string;
  readonly state?: string;
  readonly assignee?: string;
  readonly label?: string;
  readonly priority?: string | number;
  readonly status?: string;
  readonly filter?: string;
  readonly sort?: string | SortSpec;
  readonly all?: boolean;
}
