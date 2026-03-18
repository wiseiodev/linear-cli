import { useApp, useInput } from "ink";
import { Layout } from "./components/Layout.js";
import { CyclesScreen } from "./screens/CyclesScreen.js";
import { DocumentsScreen } from "./screens/DocumentsScreen.js";
import { InitiativesScreen } from "./screens/InitiativesScreen.js";
import { IssuesScreen } from "./screens/IssuesScreen.js";
import { ProjectsScreen } from "./screens/ProjectsScreen.js";
import { TUI_SCREENS, type TuiScreen } from "./state/types.js";
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

  useInput((input, key) => {
    if (input === "q") {
      exit();
      return;
    }

    if (input === "\t" || key.tab || input === "\u001B[Z") {
      const direction = key.shift || input === "\u001B[Z" ? -1 : 1;
      const currentIndex = TUI_SCREENS.indexOf(screen);
      const nextIndex = (currentIndex + direction + TUI_SCREENS.length) % TUI_SCREENS.length;
      const [nextScreen] = TUI_SCREENS.slice(nextIndex, nextIndex + 1);
      if (nextScreen) {
        onSelectScreen(nextScreen);
      }
      return;
    }

    if (input === "1") {
      onSelectScreen("issues");
      return;
    }

    if (input === "2") {
      onSelectScreen("projects");
      return;
    }

    if (input === "3") {
      onSelectScreen("initiatives");
      return;
    }

    if (input === "4") {
      onSelectScreen("documents");
      return;
    }

    if (input === "5") {
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
      ) : screen === "projects" ? (
        <ProjectsScreen gateway={gateway} refreshToken={refreshToken} openUrl={openUrl} />
      ) : screen === "initiatives" ? (
        <InitiativesScreen gateway={gateway} refreshToken={refreshToken} openUrl={openUrl} />
      ) : screen === "documents" ? (
        <DocumentsScreen gateway={gateway} refreshToken={refreshToken} openUrl={openUrl} />
      ) : (
        <CyclesScreen gateway={gateway} refreshToken={refreshToken} />
      )}
    </Layout>
  );
}
