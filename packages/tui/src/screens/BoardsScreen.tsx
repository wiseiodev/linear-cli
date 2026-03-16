import { Box, Text } from "ink";
import { useAsyncResource } from "../hooks/useAsyncResource.js";
import type { TuiGateway } from "../types.js";

interface BoardsScreenProps {
  readonly gateway: TuiGateway;
  readonly refreshToken: number;
}

export function BoardsScreen({ gateway, refreshToken }: BoardsScreenProps) {
  const state = useAsyncResource(() => gateway.listProjects({ limit: 10 }), refreshToken);

  if (state.loading) {
    return <Text>Loading boards...</Text>;
  }

  if (state.error) {
    return <Text color="red">Failed to load boards: {state.error}</Text>;
  }

  const projects = state.data?.items ?? [];
  if (projects.length === 0) {
    return <Text color="yellow">No boards found.</Text>;
  }

  return (
    <Box flexDirection="column">
      {projects.map((project) => (
        <Text key={project.id}>
          {project.name} - {project.state} ({Math.round(project.progress * 100)}%)
        </Text>
      ))}
    </Box>
  );
}
