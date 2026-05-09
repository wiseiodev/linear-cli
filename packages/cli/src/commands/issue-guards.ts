import type { SdkIssueUpdateInput } from "@wiseiodev/linear-core";
import { isRecord } from "../utils/guards.js";

export function isIssueUpdateInput(value: unknown): value is SdkIssueUpdateInput {
  return isRecord(value) && Object.keys(value).length > 0;
}
