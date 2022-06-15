export interface QuickTerminals {
  terminals: QuickTerminal[];
}

export interface QuickTerminal {
  name: string;
  color: QuickTerminalColor;
  icon: string;
}

// This should probably be updated, when vscode updates their terminal colors.
export type QuickTerminalColor =
  | "black"
  | "red"
  | "green"
  | "yellow"
  | "blue"
  | "magenta"
  | "cyan"
  | "white";
