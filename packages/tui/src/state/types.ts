export const TUI_SCREENS = ["issues", "projects", "initiatives", "cycles"] as const;

export type TuiScreen = (typeof TUI_SCREENS)[number];
