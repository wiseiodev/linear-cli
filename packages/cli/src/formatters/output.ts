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

function formatUpdatedAt(value: string): string {
  return value.replace("T", " ").slice(0, 16);
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
