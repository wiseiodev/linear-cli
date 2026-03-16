import { useApp, useInput } from "ink";
import { useState } from "react";
import { Layout } from "./components/Layout.js";
import { BoardsScreen } from "./screens/BoardsScreen.js";
import { CyclesScreen } from "./screens/CyclesScreen.js";
import { IssuesScreen } from "./screens/IssuesScreen.js";
import type { TuiScreen } from "./state/types.js";
import type { TuiGateway } from "./types.js";

interface AppProps {
  readonly gateway: TuiGateway;
  readonly initialScreen: TuiScreen;
}

export function App({ gateway, initialScreen }: AppProps) {
  const { exit } = useApp();
  const [screen, setScreen] = useState<TuiScreen>(initialScreen);
  const [refreshToken, setRefreshToken] = useState(0);

  useInput((input) => {
    if (input === "q") {
      exit();
      return;
    }

    if (input === "1") {
      setScreen("issues");
      return;
    }

    if (input === "2") {
      setScreen("boards");
      return;
    }

    if (input === "3") {
      setScreen("cycles");
      return;
    }

    if (input === "r") {
      setRefreshToken((value) => value + 1);
    }
  });

  return (
    <Layout screen={screen}>
      {screen === "issues" ? (
        <IssuesScreen gateway={gateway} refreshToken={refreshToken} />
      ) : screen === "boards" ? (
        <BoardsScreen gateway={gateway} refreshToken={refreshToken} />
      ) : (
        <CyclesScreen gateway={gateway} refreshToken={refreshToken} />
      )}
    </Layout>
  );
}
