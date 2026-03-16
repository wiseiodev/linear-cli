import { Box, Text } from "ink";
import { useAsyncResource } from "../hooks/useAsyncResource.js";
import type { TuiGateway } from "../types.js";

interface CyclesScreenProps {
  readonly gateway: TuiGateway;
  readonly refreshToken: number;
}

export function CyclesScreen({ gateway, refreshToken }: CyclesScreenProps) {
  const state = useAsyncResource(() => gateway.listCycles({ limit: 10 }), refreshToken);

  if (state.loading) {
    return <Text>Loading cycles...</Text>;
  }

  if (state.error) {
    return <Text color="red">Failed to load cycles: {state.error}</Text>;
  }

  const cycles = state.data?.items ?? [];
  if (cycles.length === 0) {
    return <Text color="yellow">No cycles found.</Text>;
  }

  return (
    <Box flexDirection="column">
      {cycles.map((cycle) => (
        <Text key={cycle.id}>
          Cycle {cycle.number}
          {cycle.name ? ` (${cycle.name})` : ""} - {Math.round(cycle.progress * 100)}%
          {cycle.isActive ? " [active]" : ""}
        </Text>
      ))}
    </Box>
  );
}
