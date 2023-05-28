import type { Terminal, TerminalOptions } from "vscode";
import { ThemeColor, ThemeIcon, Uri, window, workspace } from "vscode";

import { config } from "./configuration";

export const COLOR_MAP = {
  black: "terminal.ansiBlack",
  blue: "terminal.ansiBlue",
  cyan: "terminal.ansiCyan",
  green: "terminal.ansiGreen",
  magenta: "terminal.ansiMagenta",
  red: "terminal.ansiRed",
  white: "terminal.ansiWhite",
  yellow: "terminal.ansiYellow"
};

export type QuickTerminalColor = keyof typeof COLOR_MAP;

export interface QuickTerminal {
  id: string;
  extend?: string;
  name?: string;
  color?: QuickTerminalColor;
  cwd?: string;
  show?: boolean;
  command?: string;
  shellPath?: TerminalOptions["shellPath"];
  shellArgs?: TerminalOptions["shellArgs"];
  env?: TerminalOptions["env"];
  message?: string;
  icon?: string;
  split?: Omit<QuickTerminal, "split">[];
}

export interface Preset {
  name: string;
  terminals: QuickTerminal[];
}

export async function getWorkspace(): Promise<Uri | undefined> {
  if (!workspace.workspaceFolders?.length) {
    window.showErrorMessage("No workspace folder is open.");
    return;
  }

  let workspaceUri = workspace.workspaceFolders[0].uri;
  if (workspace.workspaceFolders.length > 1) {
    const pickedWorkspace = await window.showWorkspaceFolderPick();

    if (!pickedWorkspace) {
      return;
    }

    workspaceUri = pickedWorkspace.uri;
  }
  return workspaceUri;
}

function getOptions({
  terminal,
  workspaceUri
}: {
  terminal: QuickTerminal;
  workspaceUri: Uri;
}): TerminalOptions | undefined {
  console.log("TERMINAL", terminal);

  if (terminal.extend) {
    const extended = config
      .get("terminals")
      ?.find((term) => term.id === terminal.extend);

    if (!extended) {
      window.showErrorMessage(
        `Terminal "${terminal.extend}" not found. Please check your settings.`
      );
      return;
    }

    console.log("EXTENDED", extended);
    console.log("TERMINAL", terminal);

    // Deep merge
    return {
      ...extended,
      ...terminal,
      cwd: transformCwd(workspaceUri, terminal.cwd || extended.cwd)
    };
  }

  return {
    // ...terminal,
    name: terminal.name,
    // color: terminal.color ?
    //   new ThemeColor(COLOR_MAP[terminal.color]) :
    //   undefined,
    color: new ThemeColor("terminal.ansiBlue"),
    // iconPath: terminal.icon ?
    // new ThemeIcon(terminal.icon) :
    // undefined,
    message: undefined,
    iconPath: new ThemeIcon(
      "callhierarchy-outgoing",
      new ThemeColor("terminal.ansiBlue")
    ),
    cwd: transformCwd(workspaceUri, terminal.cwd)
  };
}

export function openTerminal({
  workspaceUri,
  terminal,
  parent
}: {
  workspaceUri: Uri;
  terminal: QuickTerminal;
  parent?: Terminal;
}) {
  const options = getOptions({
    terminal,
    workspaceUri
  });

  if (!options) {
    return;
  }

  if (parent) {
    options.location = {
      parentTerminal: parent
    };
  }

  const term = window.createTerminal(options);

  if (terminal.split && Array.isArray(terminal.split)) {
    terminal.split.forEach((splitTerminal) =>
      openTerminal({
        workspaceUri,
        terminal: splitTerminal,
        parent: term
      })
    );
  }

  if (terminal.command) {
    term.sendText(terminal.command, true);
  }

  if (terminal.show || terminal.show === undefined) {
    term.show();
  }
}

function transformCwd(
  workspaceUri: Uri,
  cwd?: string | Uri
): Uri | string | undefined {
  if (cwd instanceof Uri) {
    return cwd;
  }

  // prettier-ignore
  return /\$\{.+?\}/.test(cwd || "") ?
      (cwd || "") :
    Uri.joinPath(workspaceUri, cwd || "");
}
