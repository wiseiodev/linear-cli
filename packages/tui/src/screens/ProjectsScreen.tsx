import { Box, Text, useInput } from "ink";
import { useCallback, useState } from "react";
import { useAsyncResource } from "../hooks/useAsyncResource.js";
import type { ProjectViewModel, TuiGateway } from "../types.js";

interface ProjectsScreenProps {
  readonly gateway: TuiGateway;
  readonly refreshToken: number;
  readonly openUrl: (url: string) => Promise<void>;
}

export function ProjectsScreen({ gateway, refreshToken, openUrl }: ProjectsScreenProps) {
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [cursorHistory, setCursorHistory] = useState<Array<string | undefined>>([]);
  const loadProjects = useCallback(
    () => gateway.listProjects({ limit: 25, cursor }),
    [cursor, gateway],
  );
  const state = useAsyncResource(loadProjects, refreshToken);

  const projects = state.data?.items ?? [];
  const hasNextPage = typeof state.data?.nextCursor === "string";
  const hasPreviousPage = cursorHistory.length > 0;

  if (state.loading) {
    return <Text>Loading projects...</Text>;
  }

  if (state.error) {
    return <Text color="red">Failed to load projects: {state.error}</Text>;
  }

  if (projects.length === 0) {
    return <Text color="yellow">No projects found.</Text>;
  }

  return (
    <ProjectsTable
      key={`${cursor ?? "start"}:${refreshToken}`}
      projects={projects}
      hasNextPage={hasNextPage}
      hasPreviousPage={hasPreviousPage}
      onOpenProject={openUrl}
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

interface ProjectsTableProps {
  readonly projects: readonly ProjectViewModel[];
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
  readonly onOpenProject: (url: string) => Promise<void>;
  readonly onNextPage: () => void;
  readonly onPreviousPage: () => void;
}

function ProjectsTable({
  projects,
  hasNextPage,
  hasPreviousPage,
  onOpenProject,
  onNextPage,
  onPreviousPage,
}: ProjectsTableProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedProject = projects[selectedIndex];

  useInput((input, key) => {
    if (projects.length === 0) {
      return;
    }

    if (input === "j" || key.downArrow) {
      setSelectedIndex((value) => Math.min(value + 1, projects.length - 1));
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

    if (input === "o" && selectedProject) {
      void onOpenProject(selectedProject.url);
    }
  });

  const visibleRowCount = 10;
  const start = Math.max(0, Math.min(selectedIndex - 4, projects.length - visibleRowCount));
  const visibleProjects = projects.slice(start, start + visibleRowCount);

  return (
    <Box flexDirection="column">
      <Text bold> Name State Progress Updated</Text>
      <Text dimColor>
        {" "}
        ------------------------------------------------------------------------
      </Text>
      {visibleProjects.map((project, index) => {
        const absoluteIndex = start + index;
        const isSelected = absoluteIndex === selectedIndex;

        return (
          <Text key={project.id} color={isSelected ? "cyan" : undefined}>
            {isSelected ? ">" : " "} {pad(truncate(project.name, 40), 40)} {pad(project.state, 16)}{" "}
            {pad(formatProgress(project.progress), 8)} {formatTimestamp(project.updatedAt)}
          </Text>
        );
      })}
      <Text dimColor>
        {" "}
        ------------------------------------------------------------------------
      </Text>
      <Text color="gray">
        Rows {start + 1}-{Math.min(start + visibleProjects.length, projects.length)} of{" "}
        {projects.length} | Prev page [{hasPreviousPage ? "p" : "-"}] | Next page [
        {hasNextPage ? "n" : "-"}] | Move [j/k or arrows] | Open [o]
      </Text>
      {selectedProject ? (
        <>
          <Text>Selected: {selectedProject.name}</Text>
          <Text color="gray">{selectedProject.url}</Text>
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

function formatProgress(progress: number): string {
  return `${Math.round(progress * 100)}%`;
}

function formatTimestamp(value: string): string {
  return value.replace("T", " ").slice(0, 16);
}
