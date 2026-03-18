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
      <Text color="gray">
        Screens: [1] Issues [2] Projects [3] Initiatives [4] Cycles | [tab/shift+tab] switch | [j/k]
        move | [n/p] page | [o] open selected | [r] refresh | [q] quit
      </Text>
      <Text>
        Active: <Text color="green">{screen}</Text>
      </Text>
      <Box marginTop={1} flexDirection="column">
        {children}
      </Box>
    </Box>
  );
}
