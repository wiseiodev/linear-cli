export type LinearEntity =
  | "auth"
  | "issues"
  | "projects"
  | "cycles"
  | "teams"
  | "users"
  | "labels"
  | "comments"
  | "attachments"
  | "states"
  | "skills"
  | "docs"
  | "tui";

export type LinearAction =
  | "list"
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
