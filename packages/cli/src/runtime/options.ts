import type { Command } from "commander";
import { isRecord, readBoolean, readNumber, readString } from "../utils/guards.js";

export interface GlobalOptions {
  readonly json: boolean;
  readonly profile?: string;
  readonly team?: string;
  readonly limit?: number;
  readonly cursor?: string;
  readonly quiet: boolean;
  readonly mine?: boolean;
  readonly project?: string;
  readonly cycle?: string;
  readonly state?: string;
  readonly assignee?: string;
  readonly label?: string;
  readonly priority?: string;
  readonly status?: string;
  readonly filter?: string;
  readonly sort?: string;
  readonly view?: "table" | "detail" | "dense";
  readonly all?: boolean;
  readonly fields?: readonly string[];
}

export function getGlobalOptions(command: Command): GlobalOptions {
  const rawValue = command.optsWithGlobals();
  const raw = isRecord(rawValue) ? rawValue : {};
  const fields = readString(raw.fields)
    ?.split(",")
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

  return {
    json: readBoolean(raw.json),
    quiet: readBoolean(raw.quiet),
    ...(readString(raw.profile) ? { profile: readString(raw.profile) } : {}),
    ...(readString(raw.team) ? { team: readString(raw.team) } : {}),
    ...(readNumber(raw.limit) !== undefined ? { limit: readNumber(raw.limit) } : {}),
    ...(readString(raw.cursor) ? { cursor: readString(raw.cursor) } : {}),
    ...(readBoolean(raw.mine) ? { mine: true } : {}),
    ...(readString(raw.project) ? { project: readString(raw.project) } : {}),
    ...(readString(raw.cycle) ? { cycle: readString(raw.cycle) } : {}),
    ...(readString(raw.state) ? { state: readString(raw.state) } : {}),
    ...(readString(raw.assignee) ? { assignee: readString(raw.assignee) } : {}),
    ...(readString(raw.label) ? { label: readString(raw.label) } : {}),
    ...(readString(raw.priority) ? { priority: readString(raw.priority) } : {}),
    ...(readString(raw.status) ? { status: readString(raw.status) } : {}),
    ...(readString(raw.filter) ? { filter: readString(raw.filter) } : {}),
    ...(readString(raw.sort) ? { sort: readString(raw.sort) } : {}),
    ...(readString(raw.view) ? { view: readString(raw.view) as "table" | "detail" | "dense" } : {}),
    ...(readBoolean(raw.all) ? { all: true } : {}),
    ...(fields && fields.length > 0 ? { fields } : {}),
  };
}
