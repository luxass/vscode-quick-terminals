import { join } from "path";
import * as fs from "fs";
import * as util from "util";
import { Terminal, ThemeColor, ThemeIcon, Uri, window } from "vscode";
import { QuickTerminal, QuickTerminalColor, QuickTerminals } from "./types";

const exists = util.promisify(fs.exists);
const readFile = util.promisify(fs.readFile);

// This should probably be updated, when vscode updates their terminal colors.
export const TERMINAL_COLORS = [
  "Black",
  "Red",
  "Green",
  "Yellow",
  "Blue",
  "Magenta",
  "Cyan",
  "White",
] as const;

export async function getTerminals(
  workspaceUri: string
): Promise<QuickTerminal[]> {
  const quickTerminalsPath = join(workspaceUri, ".vscode/quick-terminals.json");

  const quickTerminalsExists = await exists(quickTerminalsPath);

  if (!quickTerminalsExists) {
    await window.showWarningMessage("No quick-terminals.json found.");
    return [];
  }

  const quickTerminals = await readFile(quickTerminalsPath, "utf8");

  const parsed = JSON.parse(quickTerminals) as QuickTerminals;

  if (!parsed.terminals || !Array.isArray(parsed.terminals)) {
    await window.showWarningMessage("No terminals found.");
    return [];
  }

  return parsed.terminals;
}

export function getRandomColor(): QuickTerminalColor {
  return `terminal.ansi${
    TERMINAL_COLORS[Math.floor(Math.random() * TERMINAL_COLORS.length)]
  }`;
}

export function openTerminal(
  workspace: string,
  terminal: QuickTerminal
): Terminal {
  const name = terminal.name || "No Name";
  const color = terminal.color || getRandomColor();
  const cwd = terminal.cwd || "";
  const uri = Uri.parse(workspace);

  return window.createTerminal({
    name: name,
    color: new ThemeColor(color),
    cwd: Uri.joinPath(uri, cwd),
  });
}
