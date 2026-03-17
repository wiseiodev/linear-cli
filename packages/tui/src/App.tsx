import { useApp, useInput } from "ink";
import { Layout } from "./components/Layout.js";
import { BoardsScreen } from "./screens/BoardsScreen.js";
import { CyclesScreen } from "./screens/CyclesScreen.js";
import { IssuesScreen } from "./screens/IssuesScreen.js";
import type { TuiScreen } from "./state/types.js";
import type { TuiGateway } from "./types.js";

interface AppProps {
  readonly gateway: TuiGateway;
  readonly screen: TuiScreen;
  readonly refreshToken: number;
  readonly onRefresh: () => void;
  readonly onSelectScreen: (screen: TuiScreen) => void;
  readonly openUrl: (url: string) => Promise<void>;
}

export function App({
  gateway,
  screen,
  refreshToken,
  onRefresh,
  onSelectScreen,
  openUrl,
}: AppProps) {
  const { exit } = useApp();

  useInput((input) => {
    if (input === "q") {
      exit();
      return;
    }

    if (input === "1") {
      onSelectScreen("issues");
      return;
    }

    if (input === "2") {
      onSelectScreen("boards");
      return;
    }

    if (input === "3") {
      onSelectScreen("cycles");
      return;
    }

    if (input === "r") {
      onRefresh();
    }
  });

  return (
    <Layout screen={screen}>
      {screen === "issues" ? (
        <IssuesScreen gateway={gateway} refreshToken={refreshToken} openUrl={openUrl} />
      ) : screen === "boards" ? (
        <BoardsScreen gateway={gateway} refreshToken={refreshToken} />
      ) : (
        <CyclesScreen gateway={gateway} refreshToken={refreshToken} />
      )}
    </Layout>
  );
}
