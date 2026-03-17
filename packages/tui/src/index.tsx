import { render } from "ink";
import { useState } from "react";
import { App } from "./App.js";
import type { TuiScreen } from "./state/types.js";
import type { TuiGateway } from "./types.js";

export interface RunTuiOptions {
  readonly gateway: TuiGateway;
  readonly defaultScreen: TuiScreen;
  readonly openUrl: (url: string) => Promise<void>;
}

function createTuiRoot(options: RunTuiOptions) {
  return function LinearTuiRoot() {
    const [screen, setScreen] = useState<TuiScreen>(options.defaultScreen);
    const [refreshToken, setRefreshToken] = useState(0);

    return (
      <App
        gateway={options.gateway}
        screen={screen}
        refreshToken={refreshToken}
        onRefresh={() => {
          setRefreshToken((value) => value + 1);
        }}
        onSelectScreen={setScreen}
        openUrl={options.openUrl}
      />
    );
  };
}

export async function runLinearTui(options: RunTuiOptions): Promise<void> {
  const TuiRoot = createTuiRoot(options);
  const app = render(<TuiRoot />);
  await app.waitUntilExit();
}
