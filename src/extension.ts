import type { ExtensionContext } from "vscode";
import {
  ThemeColor,
  ThemeIcon,
  Uri,
  commands,
  window,
  workspace
} from "vscode";

import type { Preset } from "./configuration";
import { COLOR_MAP, config } from "./configuration";

export function activate(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand("quickTerminals.open-terminals", async () => {
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

      const terminals = config.get("terminals");
      if (!terminals || !Array.isArray(terminals) || !terminals.length) {
        window.showErrorMessage("No terminals found.");
        return;
      }

      terminals.forEach((terminal) => {
        const term = window.createTerminal({
          name: terminal.name,
          color: terminal.color ?
            new ThemeColor(COLOR_MAP[terminal.color]) :
            undefined,
          cwd: /\$\{.+?\}/.test(terminal.cwd || "") ?
            terminal.cwd :
            Uri.joinPath(workspaceUri, terminal.cwd || ""),
          shellArgs: terminal.shellArgs,
          shellPath: terminal.shellPath,
          env: terminal.env,
          message: terminal.message,
          iconPath: terminal.icon ? new ThemeIcon(terminal.icon) : undefined
        });

        if (terminal.command) {
          term.sendText(terminal.command, true);
        }

        if (terminal.show || terminal.show === undefined) {
          term.show();
        }
      });
    }),
    commands.registerCommand("quickTerminals.open-terminal", async () => {
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
      const terminals = config.get("terminals");
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
          "You picked a terminal, but we couldn't find it."
        );
      }

      const term = window.createTerminal({
        name: terminal.name,
        color: terminal.color ?
          new ThemeColor(COLOR_MAP[terminal.color]) :
          undefined,
        cwd: /\$\{.+?\}/.test(terminal.cwd || "") ?
          terminal.cwd :
          Uri.joinPath(workspaceUri, terminal.cwd || ""),
        shellArgs: terminal.shellArgs,
        shellPath: terminal.shellPath,
        env: terminal.env,
        message: terminal.message,
        iconPath: terminal.icon ? new ThemeIcon(terminal.icon) : undefined
      });

      if (terminal.command) {
        term.sendText(terminal.command, true);
      }

      if (terminal.show || terminal.show === undefined) {
        term.show();
      }
    }),
    commands.registerCommand("quickTerminals.open-preset", async () => {
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

      const presets = config.get("presets");
      if (!presets || !Array.isArray(presets) || !presets.length) {
        window.showErrorMessage("No presets found.");
        return;
      }

      let preset: Preset | undefined;
      if (presets.length > 1) {
        await window
          .showQuickPick(
            presets.map((preset) => ({
              label: preset.name
            })),
            {
              placeHolder: "Select a preset to open"
            }
          )
          .then((picked) => {
            if (picked) {
              preset = presets.find((preset) => preset.name === picked.label);
            }
          });
      } else {
        preset = presets[0];
      }

      if (!preset) {
        return window.showErrorMessage(
          "You picked a preset, but we couldn't find it."
        );
      }

      preset.terminals.forEach((terminal) => {
        console.log("Terminal:", terminal);
        const term = window.createTerminal({
          name: terminal.name,
          color: terminal.color ?
            new ThemeColor(COLOR_MAP[terminal.color]) :
            undefined,
          cwd: /\$\{.+?\}/.test(terminal.cwd || "") ?
            terminal.cwd :
            Uri.joinPath(workspaceUri, terminal.cwd || ""),
          shellArgs: terminal.shellArgs,
          shellPath: terminal.shellPath,
          env: terminal.env,
          message: terminal.message,
          iconPath: terminal.icon ? new ThemeIcon(terminal.icon) : undefined
        });

        if (terminal.command) {
          term.sendText(terminal.command, true);
        }

        if (terminal.show || terminal.show === undefined) {
          term.show();
        }
      });
    })
  );

  const showOnStartup = config.get("showOnStartup");

  if (showOnStartup || typeof showOnStartup === "string") {
    if (typeof showOnStartup === "string") {
      commands.executeCommand("quickTerminals.open-preset");
    } else {
      commands.executeCommand("quickTerminals.open-terminals");
    }
  }
}

export function deactivate() {}
