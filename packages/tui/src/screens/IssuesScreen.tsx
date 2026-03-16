import { Box, Text } from "ink";
import { useAsyncResource } from "../hooks/useAsyncResource.js";
import type { TuiGateway } from "../types.js";

interface IssuesScreenProps {
  readonly gateway: TuiGateway;
  readonly refreshToken: number;
}

export function IssuesScreen({ gateway, refreshToken }: IssuesScreenProps) {
  const state = useAsyncResource(() => gateway.listIssues({ limit: 10 }), refreshToken);

  if (state.loading) {
    return <Text>Loading issues...</Text>;
  }

  if (state.error) {
    return <Text color="red">Failed to load issues: {state.error}</Text>;
  }

  const issues = state.data?.items ?? [];
  if (issues.length === 0) {
    return <Text color="yellow">No issues found.</Text>;
  }

  return (
    <Box flexDirection="column">
      {issues.map((issue) => (
        <Text key={issue.id}>
          {issue.identifier} - {issue.title}
          {issue.stateName ? ` (${issue.stateName})` : ""}
        </Text>
      ))}
    </Box>
  );
}
