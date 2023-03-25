import {
  ExtensionContext,
  TerminalOptions,
  ThemeColor,
  ThemeIcon,
  Uri,
  commands,
  window,
  workspace
} from "vscode";

type QuickTerminalColor =
  | "terminal.ansiBlack"
  | "terminal.ansiRed"
  | "terminal.ansiGreen"
  | "terminal.ansiYellow"
  | "terminal.ansiBlue"
  | "terminal.ansiMagenta"
  | "terminal.ansiCyan"
  | "terminal.ansiWhite";

type IconPath =
  | string
  | {
      light: string;
      dark: string;
    }
  | {
      id: string;
      color?: string;
    };

interface QuickTerminal {
  name: string;
  color?: QuickTerminalColor;
  cwd?: string;
  show?: boolean;
  command?: string;
  shellPath?: TerminalOptions["shellPath"];
  shellArgs?: TerminalOptions["shellArgs"];
  env?: TerminalOptions["env"];
  message?: string;
  iconPath?: IconPath;
}

export function activate(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand("quick-terminals.open-terminals", async () => {
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

      const terminals = workspace
        .getConfiguration("quickTerminals")
        .get<QuickTerminal[]>("terminals");
      if (!terminals || !Array.isArray(terminals) || !terminals.length) {
        window.showErrorMessage("No terminals found.");
        return;
      }

      terminals.forEach((terminal) => {
        const term = window.createTerminal({
          name: terminal.name,
          color: terminal.color ? new ThemeColor(terminal.color) : undefined,
          cwd: /\$\{.+?\}/.test(terminal.cwd || "")
            ? terminal.cwd
            : Uri.joinPath(workspaceUri, terminal.cwd || ""),
          shellArgs: terminal.shellArgs,
          shellPath: terminal.shellPath,
          env: terminal.env,
          message: terminal.message,
          iconPath: getIcon(terminal.iconPath)
        });

        if (terminal.show || terminal.show === undefined) {
          term.show();
        }

        if (terminal.command) {
          term.sendText(terminal.command);
        }
      });
    }),
    commands.registerCommand("quick-terminals.open-terminal", async () => {
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
      const terminals = workspace
        .getConfiguration("quickTerminals")
        .get<QuickTerminal[]>("terminals");
      if (!terminals || !Array.isArray(terminals) || !terminals.length) {
        window.showErrorMessage("No terminals found.");
        return;
      }

      const pickedTerminal = await window.showQuickPick(
        terminals.map((term) => ({
          label: term.name,
          description: term.cwd
        })),
        {
          placeHolder: "Select a terminal to open"
        }
      );

      if (!pickedTerminal) {
        return;
      }
      const terminal = terminals.find(
        (term) =>
          term.name === pickedTerminal.label &&
          term.cwd === pickedTerminal.description
      );

      if (!terminal) {
        return window.showErrorMessage(
          "You picked a terminal, but we couldn't find it.\nPlease report this."
        );
      }

      const term = window.createTerminal({
        name: terminal.name,
        color: terminal.color ? new ThemeColor(terminal.color) : undefined,
        cwd: /\$\{.+?\}/.test(terminal.cwd || "")
          ? terminal.cwd
          : Uri.joinPath(workspaceUri, terminal.cwd || ""),
        shellArgs: terminal.shellArgs,
        shellPath: terminal.shellPath,
        env: terminal.env,
        message: terminal.message,
        iconPath: getIcon(terminal.iconPath)
      });

      if (terminal.show || terminal.show === undefined) {
        term.show();
      }

      if (terminal.command) {
        term.sendText(terminal.command);
      }
    })
  );

  if (workspace.getConfiguration("quickTerminals").get("openOnStartup")) {
    commands.executeCommand("quick-terminals.open-terminals");
  }
}

function getIcon(
  iconPath: IconPath | undefined
): Uri | { light: Uri; dark: Uri } | ThemeIcon | undefined {
  if (!iconPath) {
    return undefined;
  }

  if (typeof iconPath === "object") {
    if ("light" in iconPath && "dark" in iconPath) {
      return {
        light: Uri.file(iconPath.light),
        dark: Uri.file(iconPath.dark)
      };
    }

    if ("id" in iconPath && "color" in iconPath) {
      return new ThemeIcon(iconPath.id, new ThemeColor(iconPath.color || ""));
    }

    return undefined;
  }

  return Uri.file(iconPath);
}

export function deactivate() {}
