import type {
  CustomerNeedRecord,
  CustomerRecord,
  IssueRecord,
  ListOptions,
  NotificationRecord,
  PageResult,
  ProjectMilestoneRecord,
  ProjectRecord,
  ProjectUpdateRecord,
} from "@wiseiodev/linear-core";
import type { GlobalOptions } from "./options.js";

function asRecord(value: object): Record<string, unknown> {
  return value as Record<string, unknown>;
}

function normalizeText(value: string | undefined): string | undefined {
  return value?.trim().toLowerCase();
}

function matchText(value: string | undefined, query: string | undefined): boolean {
  if (!query) {
    return true;
  }

  return normalizeText(value)?.includes(normalizeText(query) ?? "") ?? false;
}

function runFilterExpression(item: object, expression: string | undefined): boolean {
  if (!expression) {
    return true;
  }

  const greaterThanMatch = expression.match(/^([a-zA-Z0-9_]+)>(.+)$/);
  if (greaterThanMatch) {
    const [, field = "", rawValue = ""] = greaterThanMatch;
    const currentValue = Number(asRecord(item)[field]);
    return Number.isFinite(currentValue) && currentValue > Number(rawValue);
  }

  const equalsMatch = expression.match(/^([a-zA-Z0-9_]+)=(.+)$/);
  if (equalsMatch) {
    const [, field = "", rawValue = ""] = equalsMatch;
    return String(asRecord(item)[field] ?? "").toLowerCase() === rawValue.trim().toLowerCase();
  }

  return Object.values(asRecord(item)).some((value) =>
    String(value ?? "")
      .toLowerCase()
      .includes(expression.toLowerCase()),
  );
}

function sortItems<T extends object>(items: readonly T[], sort?: string): T[] {
  if (!sort) {
    return [...items];
  }

  const descending = sort.startsWith("-");
  const field = descending ? sort.slice(1) : sort;

  return [...items].sort((left, right) => {
    const leftValue = asRecord(left)[field];
    const rightValue = asRecord(right)[field];
    const comparison = String(leftValue ?? "").localeCompare(String(rightValue ?? ""), undefined, {
      numeric: true,
      sensitivity: "base",
    });

    return descending ? -comparison : comparison;
  });
}

function shouldDrainPages(options: GlobalOptions): boolean {
  return Boolean(
    options.all ||
      options.mine ||
      options.project ||
      options.cycle ||
      options.state ||
      options.assignee ||
      options.label ||
      options.priority ||
      options.status ||
      options.filter ||
      options.sort,
  );
}

export async function collectPageResult<T extends object>(
  loader: (options: ListOptions) => Promise<PageResult<T>>,
  globals: GlobalOptions,
  predicate: (item: T) => boolean = () => true,
): Promise<PageResult<T>> {
  if (!shouldDrainPages(globals)) {
    const page = await loader({
      limit: globals.limit,
      cursor: globals.cursor,
    });

    return {
      items: sortItems(page.items.filter(predicate), globals.sort).slice(
        0,
        globals.limit ?? page.items.length,
      ),
      nextCursor: page.nextCursor,
    };
  }

  let cursor = globals.cursor;
  const collected: T[] = [];

  do {
    const page = await loader({
      limit: globals.limit ?? 50,
      cursor,
    });
    collected.push(...page.items.filter(predicate));
    cursor = page.nextCursor ?? undefined;
  } while (cursor);

  const items = sortItems(collected, globals.sort).slice(0, globals.limit ?? collected.length);
  return {
    items,
    nextCursor: null,
  };
}

export function matchesIssue(
  issue: IssueRecord,
  globals: GlobalOptions,
  viewerName?: string,
): boolean {
  const labels = issue.labelNames?.join(" ");
  const assigneeQuery = globals.mine ? (viewerName ?? globals.assignee) : globals.assignee;
  return (
    matchText(issue.teamKey ?? issue.teamName, globals.team) &&
    matchText(issue.projectId ?? issue.projectName, globals.project) &&
    matchText(issue.cycleId ?? issue.cycleName, globals.cycle) &&
    matchText(issue.stateName, globals.state) &&
    matchText(issue.assigneeName, assigneeQuery) &&
    matchText(labels, globals.label) &&
    (globals.priority ? String(issue.priority) === String(globals.priority) : true) &&
    runFilterExpression(issue, globals.filter)
  );
}

export function matchesProject(project: ProjectRecord, globals: GlobalOptions): boolean {
  return (
    matchText(project.state, globals.status) &&
    matchText(project.id ?? project.name, globals.project) &&
    runFilterExpression(project, globals.filter)
  );
}

export function matchesCustomer(
  customer: CustomerRecord,
  globals: GlobalOptions,
  viewerName?: string,
): boolean {
  const ownerQuery = globals.mine ? (viewerName ?? globals.assignee) : globals.assignee;
  return (
    matchText(customer.ownerName, ownerQuery) &&
    matchText(customer.statusName, globals.status) &&
    runFilterExpression(customer, globals.filter)
  );
}

export function matchesCustomerNeed(need: CustomerNeedRecord, globals: GlobalOptions): boolean {
  return (
    matchText(need.customerId ?? need.customerName, globals.project) &&
    (globals.priority ? String(need.priority) === String(globals.priority) : true) &&
    runFilterExpression(need, globals.filter)
  );
}

export function matchesMilestone(
  milestone: ProjectMilestoneRecord,
  globals: GlobalOptions,
): boolean {
  return (
    matchText(milestone.projectId ?? milestone.projectName, globals.project) &&
    matchText(milestone.status, globals.status) &&
    runFilterExpression(milestone, globals.filter)
  );
}

export function matchesProjectUpdate(update: ProjectUpdateRecord, globals: GlobalOptions): boolean {
  return (
    matchText(update.projectId ?? update.projectName, globals.project) &&
    matchText(update.health, globals.status) &&
    runFilterExpression(update, globals.filter)
  );
}

export function matchesNotification(
  notification: NotificationRecord,
  globals: GlobalOptions,
): boolean {
  return (
    matchText(notification.category, globals.status) &&
    matchText(notification.type, globals.state) &&
    runFilterExpression(notification, globals.filter)
  );
}
