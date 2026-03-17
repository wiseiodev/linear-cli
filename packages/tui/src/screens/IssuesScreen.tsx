import { Box, Text, useInput } from "ink";
import { useCallback, useState } from "react";
import { useAsyncResource } from "../hooks/useAsyncResource.js";
import type { IssueViewModel, TuiGateway } from "../types.js";

interface IssuesScreenProps {
  readonly gateway: TuiGateway;
  readonly refreshToken: number;
  readonly openUrl: (url: string) => Promise<void>;
}

export function IssuesScreen({ gateway, refreshToken, openUrl }: IssuesScreenProps) {
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [cursorHistory, setCursorHistory] = useState<Array<string | undefined>>([]);
  const loadIssues = useCallback(
    () => gateway.listIssues({ limit: 25, cursor }),
    [cursor, gateway],
  );
  const state = useAsyncResource(loadIssues, refreshToken);

  const issues = state.data?.items ?? [];
  const hasNextPage = typeof state.data?.nextCursor === "string";
  const hasPreviousPage = cursorHistory.length > 0;

  if (state.loading) {
    return <Text>Loading issues...</Text>;
  }

  if (state.error) {
    return <Text color="red">Failed to load issues: {state.error}</Text>;
  }

  if (issues.length === 0) {
    return <Text color="yellow">No issues found.</Text>;
  }

  return (
    <IssuesTable
      key={`${cursor ?? "start"}:${refreshToken}`}
      issues={issues}
      hasNextPage={hasNextPage}
      hasPreviousPage={hasPreviousPage}
      onOpenIssue={openUrl}
      onNextPage={() => {
        if (!state.data?.nextCursor) {
          return;
        }

        setCursorHistory((value) => [...value, cursor]);
        setCursor(state.data.nextCursor);
      }}
      onPreviousPage={() => {
        const previousCursor = cursorHistory[cursorHistory.length - 1];
        if (previousCursor === undefined && cursorHistory.length === 0) {
          return;
        }

        setCursorHistory((value) => value.slice(0, -1));
        setCursor(previousCursor);
      }}
    />
  );
}

interface IssuesTableProps {
  readonly issues: readonly IssueViewModel[];
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
  readonly onOpenIssue: (url: string) => Promise<void>;
  readonly onNextPage: () => void;
  readonly onPreviousPage: () => void;
}

function IssuesTable({
  issues,
  hasNextPage,
  hasPreviousPage,
  onOpenIssue,
  onNextPage,
  onPreviousPage,
}: IssuesTableProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedIssue = issues[selectedIndex];

  useInput((input, key) => {
    if (issues.length === 0) {
      return;
    }

    if (input === "j" || key.downArrow) {
      setSelectedIndex((value) => Math.min(value + 1, issues.length - 1));
      return;
    }

    if (input === "k" || key.upArrow) {
      setSelectedIndex((value) => Math.max(value - 1, 0));
      return;
    }

    if ((input === "n" || key.rightArrow || key.pageDown) && hasNextPage) {
      onNextPage();
      return;
    }

    if (input === "p" || key.leftArrow || key.pageUp) {
      onPreviousPage();
      return;
    }

    if (input === "o" && selectedIssue) {
      void onOpenIssue(selectedIssue.url);
    }
  });

  const visibleRowCount = 10;
  const start = Math.max(0, Math.min(selectedIndex - 4, issues.length - visibleRowCount));
  const visibleIssues = issues.slice(start, start + visibleRowCount);

  return (
    <Box flexDirection="column">
      <Text bold> Key Title State Pri Updated</Text>
      <Text dimColor>
        {" "}
        -------------------------------------------------------------------------------
      </Text>
      {visibleIssues.map((issue, index) => {
        const absoluteIndex = start + index;
        const isSelected = absoluteIndex === selectedIndex;

        return (
          <Text key={issue.id} color={isSelected ? "cyan" : undefined}>
            {isSelected ? ">" : " "} {pad(issue.identifier, 8)} {pad(truncate(issue.title, 42), 42)}{" "}
            {pad(issue.stateName ?? "-", 14)} {pad(formatPriority(issue.priority), 4)}{" "}
            {formatTimestamp(issue.updatedAt)}
          </Text>
        );
      })}
      <Text dimColor>
        {" "}
        -------------------------------------------------------------------------------
      </Text>
      <Text color="gray">
        Rows {start + 1}-{Math.min(start + visibleIssues.length, issues.length)} of {issues.length}{" "}
        | Prev page [{hasPreviousPage ? "p" : "-"}] | Next page [{hasNextPage ? "n" : "-"}] | Move
        [j/k or arrows] | Open [o]
      </Text>
      {selectedIssue ? (
        <>
          <Text>
            Selected: {selectedIssue.identifier} - {selectedIssue.title}
          </Text>
          <Text color="gray">{selectedIssue.url}</Text>
        </>
      ) : null}
    </Box>
  );
}

function truncate(value: string, maxWidth: number): string {
  if (value.length <= maxWidth) {
    return value;
  }

  return `${value.slice(0, Math.max(0, maxWidth - 1))}…`;
}

function pad(value: string, width: number): string {
  return value.padEnd(width, " ");
}

function formatPriority(priority: number): string {
  return priority > 0 ? `P${priority}` : "-";
}

function formatTimestamp(value: string): string {
  return value.replace("T", " ").slice(0, 16);
}
