import { render } from "ink";
import { App } from "./App.js";
import type { TuiScreen } from "./state/types.js";
import type { TuiGateway } from "./types.js";

export interface RunTuiOptions {
  readonly gateway: TuiGateway;
  readonly initialScreen: TuiScreen;
}

export async function runLinearTui(options: RunTuiOptions): Promise<void> {
  const app = render(<App gateway={options.gateway} initialScreen={options.initialScreen} />);
  await app.waitUntilExit();
}
