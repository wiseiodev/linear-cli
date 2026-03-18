import { isErrorEnvelope, type OutputEnvelope } from "@wiseiodev/linear-core";
import type { GlobalOptions } from "../runtime/options.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}

function isPageResult(value: unknown): value is {
  readonly items: readonly unknown[];
  readonly nextCursor: string | null;
} {
  return (
    isRecord(value) &&
    Array.isArray(value.items) &&
    (typeof value.nextCursor === "string" || value.nextCursor === null)
  );
}

function isIssueLike(value: unknown): value is {
  readonly identifier: string;
  readonly title: string;
  readonly priority: number;
  readonly stateName?: string;
  readonly updatedAt: string;
} {
  return (
    isRecord(value) &&
    typeof value.identifier === "string" &&
    typeof value.title === "string" &&
    typeof value.priority === "number" &&
    typeof value.updatedAt === "string"
  );
}

function isDocumentLike(value: unknown): value is {
  readonly id: string;
  readonly title: string;
  readonly content?: string;
  readonly url: string;
  readonly projectId?: string | null;
  readonly initiativeId?: string | null;
  readonly updatedAt: string;
} {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.url === "string" &&
    typeof value.updatedAt === "string"
  );
}

function formatUpdatedAt(value: string): string {
  return value.replace("T", " ").slice(0, 16);
}

function truncate(value: string, length: number): string {
  if (value.length <= length) {
    return value;
  }

  return `${value.slice(0, Math.max(0, length - 1))}\u2026`;
}

function shortId(value: string | null | undefined): string {
  if (!value) {
    return "-";
  }

  return value.slice(0, 8);
}

function documentScope(item: {
  readonly projectId?: string | null;
  readonly initiativeId?: string | null;
}): string {
  if (item.projectId && item.initiativeId) {
    return `p:${shortId(item.projectId)} i:${shortId(item.initiativeId)}`;
  }

  if (item.projectId) {
    return `p:${shortId(item.projectId)}`;
  }

  if (item.initiativeId) {
    return `i:${shortId(item.initiativeId)}`;
  }

  return "-";
}

function toDocumentRow(item: {
  readonly id: string;
  readonly title: string;
  readonly content?: string;
  readonly url: string;
  readonly projectId?: string | null;
  readonly initiativeId?: string | null;
  readonly updatedAt: string;
}): Record<string, unknown> {
  return {
    key: shortId(item.id),
    title: truncate(item.title, 56),
    scope: documentScope(item),
    content: typeof item.content === "string" ? `${item.content.length} chars` : "-",
    updated: formatUpdatedAt(item.updatedAt),
    url: truncate(item.url, 80),
  };
}

function toHumanRows(items: readonly unknown[]): readonly unknown[] {
  if (items.every(isIssueLike)) {
    return items.map((item) => ({
      key: item.identifier,
      title: item.title,
      state: item.stateName ?? "-",
      priority: item.priority,
      updated: formatUpdatedAt(item.updatedAt),
    }));
  }

  if (items.every(isDocumentLike)) {
    return items.map(toDocumentRow);
  }

  return items;
}

function printHumanData(data: unknown): void {
  if (Array.isArray(data)) {
    console.table(toHumanRows(data));
    return;
  }

  if (isPageResult(data)) {
    console.table(toHumanRows(data.items));
    if (data.nextCursor) {
      console.log(`Next cursor: ${data.nextCursor}`);
    }
    return;
  }

  if (data !== null && typeof data === "object") {
    if (isDocumentLike(data)) {
      console.table([toDocumentRow(data)]);
      return;
    }

    console.table([data]);
    return;
  }

  console.log(String(data));
}

export function renderEnvelope<Data>(envelope: OutputEnvelope<Data>, options: GlobalOptions): void {
  if (options.json) {
    console.log(JSON.stringify(envelope, null, 2));
    return;
  }

  if (envelope.ok) {
    if (!options.quiet) {
      console.log(`${envelope.entity}.${envelope.action}`);
    }
    printHumanData(envelope.data);
    return;
  }

  if (isErrorEnvelope(envelope)) {
    console.error(`${envelope.entity}.${envelope.action} failed: ${envelope.error.message}`);
    if (envelope.error.details) {
      console.error(JSON.stringify(envelope.error.details, null, 2));
    }
  }
}
