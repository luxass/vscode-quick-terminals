import { TERMINAL_COLORS } from "./utils";

export interface QuickTerminals {
  terminals: QuickTerminal[];
}

export interface QuickTerminal {
  name?: string;
  color?: QuickTerminalColor;
  cwd?: string;
}

export type QuickTerminalColor = `terminal.ansi${typeof TERMINAL_COLORS[number]}`;
