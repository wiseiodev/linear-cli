import type { Command } from "commander";
import { isRecord, readBoolean, readNumber, readString } from "../utils/guards.js";

export interface GlobalOptions {
  readonly json: boolean;
  readonly profile?: string;
  readonly team?: string;
  readonly limit?: number;
  readonly cursor?: string;
  readonly quiet: boolean;
}

export function getGlobalOptions(command: Command): GlobalOptions {
  const rawValue = command.optsWithGlobals();
  const raw = isRecord(rawValue) ? rawValue : {};

  return {
    json: readBoolean(raw.json),
    profile: readString(raw.profile),
    team: readString(raw.team),
    limit: readNumber(raw.limit),
    cursor: readString(raw.cursor),
    quiet: readBoolean(raw.quiet),
  };
}
