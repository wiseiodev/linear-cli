import { Box, Text } from "ink";
import type { PropsWithChildren } from "react";
import type { TuiScreen } from "../state/types.js";

interface LayoutProps {
  readonly screen: TuiScreen;
}

export function Layout({ screen, children }: PropsWithChildren<LayoutProps>) {
  return (
    <Box flexDirection="column" paddingX={1}>
      <Text bold color="cyan">
        Linear TUI
      </Text>
      <Box marginTop={1}>
        <Box
          width={24}
          marginRight={2}
          flexDirection="column"
          borderStyle="round"
          borderColor="gray"
          paddingX={1}
        >
          <Text bold>Navigation</Text>
          <Text color={screen === "issues" ? "green" : "gray"}>[1] Issues</Text>
          <Text color={screen === "projects" ? "green" : "gray"}>[2] Projects</Text>
          <Text color={screen === "initiatives" ? "green" : "gray"}>[3] Initiatives</Text>
          <Text color={screen === "documents" ? "green" : "gray"}>[4] Documents</Text>
          <Text color={screen === "cycles" ? "green" : "gray"}>[5] Cycles</Text>
          <Text color="gray">[tab] next</Text>
          <Text color="gray">[shift-tab] prev</Text>
        </Box>
        <Box flexGrow={1} flexDirection="column">
          {children}
        </Box>
      </Box>
      <Box marginTop={1}>
        <Text color="gray">
          Active: <Text color="green">{screen}</Text> | [j/k] move | [n/p] page | [o] open | [r]
          refresh | [q] quit
        </Text>
      </Box>
    </Box>
  );
}
