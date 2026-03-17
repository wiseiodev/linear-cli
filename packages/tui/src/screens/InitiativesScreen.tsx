import { Box, Text, useInput } from "ink";
import { useCallback, useState } from "react";
import { useAsyncResource } from "../hooks/useAsyncResource.js";
import type { InitiativeViewModel, TuiGateway } from "../types.js";

interface InitiativesScreenProps {
  readonly gateway: TuiGateway;
  readonly refreshToken: number;
  readonly openUrl: (url: string) => Promise<void>;
}

export function InitiativesScreen({ gateway, refreshToken, openUrl }: InitiativesScreenProps) {
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [cursorHistory, setCursorHistory] = useState<Array<string | undefined>>([]);
  const loadInitiatives = useCallback(
    () => gateway.listInitiatives({ limit: 25, cursor }),
    [cursor, gateway],
  );
  const state = useAsyncResource(loadInitiatives, refreshToken);

  const initiatives = state.data?.items ?? [];
  const hasNextPage = typeof state.data?.nextCursor === "string";
  const hasPreviousPage = cursorHistory.length > 0;

  if (state.loading) {
    return <Text>Loading initiatives...</Text>;
  }

  if (state.error) {
    return <Text color="red">Failed to load initiatives: {state.error}</Text>;
  }

  if (initiatives.length === 0) {
    return <Text color="yellow">No initiatives found.</Text>;
  }

  return (
    <InitiativesTable
      key={`${cursor ?? "start"}:${refreshToken}`}
      initiatives={initiatives}
      hasNextPage={hasNextPage}
      hasPreviousPage={hasPreviousPage}
      onOpenInitiative={openUrl}
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

interface InitiativesTableProps {
  readonly initiatives: readonly InitiativeViewModel[];
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
  readonly onOpenInitiative: (url: string) => Promise<void>;
  readonly onNextPage: () => void;
  readonly onPreviousPage: () => void;
}

function InitiativesTable({
  initiatives,
  hasNextPage,
  hasPreviousPage,
  onOpenInitiative,
  onNextPage,
  onPreviousPage,
}: InitiativesTableProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedInitiative = initiatives[selectedIndex];

  useInput((input, key) => {
    if (initiatives.length === 0) {
      return;
    }

    if (input === "j" || key.downArrow) {
      setSelectedIndex((value) => Math.min(value + 1, initiatives.length - 1));
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

    if (input === "o" && selectedInitiative) {
      void onOpenInitiative(selectedInitiative.url);
    }
  });

  const visibleRowCount = 10;
  const start = Math.max(0, Math.min(selectedIndex - 4, initiatives.length - visibleRowCount));
  const visibleInitiatives = initiatives.slice(start, start + visibleRowCount);

  return (
    <Box flexDirection="column">
      <Text bold> Name Status Target Updated</Text>
      <Text dimColor>
        {" "}
        ------------------------------------------------------------------------
      </Text>
      {visibleInitiatives.map((initiative, index) => {
        const absoluteIndex = start + index;
        const isSelected = absoluteIndex === selectedIndex;

        return (
          <Text key={initiative.id} color={isSelected ? "cyan" : undefined}>
            {isSelected ? ">" : " "} {pad(truncate(initiative.name, 34), 34)}{" "}
            {pad(initiative.status, 16)} {pad(formatDate(initiative.targetDate), 12)}{" "}
            {formatTimestamp(initiative.updatedAt)}
          </Text>
        );
      })}
      <Text dimColor>
        {" "}
        ------------------------------------------------------------------------
      </Text>
      <Text color="gray">
        Rows {start + 1}-{Math.min(start + visibleInitiatives.length, initiatives.length)} of{" "}
        {initiatives.length} | Prev page [{hasPreviousPage ? "p" : "-"}] | Next page [
        {hasNextPage ? "n" : "-"}] | Move [j/k or arrows] | Open [o]
      </Text>
      {selectedInitiative ? (
        <>
          <Text>Selected: {selectedInitiative.name}</Text>
          <Text color="gray">{selectedInitiative.url}</Text>
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

function formatDate(value?: string): string {
  if (!value) {
    return "-";
  }

  return value.slice(0, 10);
}

function formatTimestamp(value: string): string {
  return value.replace("T", " ").slice(0, 16);
}
