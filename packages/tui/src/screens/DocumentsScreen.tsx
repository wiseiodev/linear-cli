import { Box, Text, useInput } from "ink";
import { useCallback, useState } from "react";
import { useAsyncResource } from "../hooks/useAsyncResource.js";
import type { DocumentViewModel, TuiGateway } from "../types.js";

interface DocumentsScreenProps {
  readonly gateway: TuiGateway;
  readonly refreshToken: number;
  readonly openUrl: (url: string) => Promise<void>;
}

export function DocumentsScreen({ gateway, refreshToken, openUrl }: DocumentsScreenProps) {
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [cursorHistory, setCursorHistory] = useState<Array<string | undefined>>([]);
  const loadDocuments = useCallback(
    () => gateway.listDocuments({ limit: 25, cursor }),
    [cursor, gateway],
  );
  const state = useAsyncResource(loadDocuments, refreshToken);

  const documents = state.data?.items ?? [];
  const hasNextPage = typeof state.data?.nextCursor === "string";
  const hasPreviousPage = cursorHistory.length > 0;

  if (state.loading) {
    return <Text>Loading documents...</Text>;
  }

  if (state.error) {
    return <Text color="red">Failed to load documents: {state.error}</Text>;
  }

  if (documents.length === 0) {
    return <Text color="yellow">No documents found.</Text>;
  }

  return (
    <DocumentsTable
      key={`${cursor ?? "start"}:${refreshToken}`}
      documents={documents}
      hasNextPage={hasNextPage}
      hasPreviousPage={hasPreviousPage}
      onOpenDocument={openUrl}
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

interface DocumentsTableProps {
  readonly documents: readonly DocumentViewModel[];
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
  readonly onOpenDocument: (url: string) => Promise<void>;
  readonly onNextPage: () => void;
  readonly onPreviousPage: () => void;
}

function DocumentsTable({
  documents,
  hasNextPage,
  hasPreviousPage,
  onOpenDocument,
  onNextPage,
  onPreviousPage,
}: DocumentsTableProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedDocument = documents[selectedIndex];

  useInput((input, key) => {
    if (documents.length === 0) {
      return;
    }

    if (input === "j" || key.downArrow) {
      setSelectedIndex((value) => Math.min(value + 1, documents.length - 1));
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

    if (input === "o" && selectedDocument) {
      void onOpenDocument(selectedDocument.url);
    }
  });

  const visibleRowCount = 10;
  const start = Math.max(0, Math.min(selectedIndex - 4, documents.length - visibleRowCount));
  const visibleDocuments = documents.slice(start, start + visibleRowCount);

  return (
    <Box flexDirection="column">
      <Text bold> Title Scope Updated</Text>
      <Text dimColor>
        {" "}
        ------------------------------------------------------------------------
      </Text>
      {visibleDocuments.map((document, index) => {
        const absoluteIndex = start + index;
        const isSelected = absoluteIndex === selectedIndex;

        return (
          <Text key={document.id} color={isSelected ? "cyan" : undefined}>
            {isSelected ? ">" : " "} {pad(truncate(document.title, 40), 40)}{" "}
            {pad(scope(document), 16)} {formatTimestamp(document.updatedAt)}
          </Text>
        );
      })}
      <Text dimColor>
        {" "}
        ------------------------------------------------------------------------
      </Text>
      <Text color="gray">
        Rows {start + 1}-{Math.min(start + visibleDocuments.length, documents.length)} of{" "}
        {documents.length} | Prev page [{hasPreviousPage ? "p" : "-"}] | Next page [
        {hasNextPage ? "n" : "-"}] | Move [j/k or arrows] | Open [o]
      </Text>
      {selectedDocument ? (
        <>
          <Text>Selected: {selectedDocument.title}</Text>
          <Text color="gray">{selectedDocument.url}</Text>
        </>
      ) : null}
    </Box>
  );
}

function scope(document: DocumentViewModel): string {
  if (document.projectId) {
    return `project:${document.projectId.slice(0, 8)}`;
  }

  if (document.initiativeId) {
    return `init:${document.initiativeId.slice(0, 8)}`;
  }

  return "-";
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

function formatTimestamp(value: string): string {
  return value.replace("T", " ").slice(0, 16);
}
