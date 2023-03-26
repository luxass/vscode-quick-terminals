import path from "node:path";

import type { ExtensionContext } from "vscode";
import {
  ThemeColor,
  ThemeIcon,
  Uri,
  commands,
  window,
  workspace
} from "vscode";

import type { Preset, QuickTerminal } from "./configuration";
import { COLOR_MAP, config } from "./configuration";

const VARIABLE_REGEX = /\$\{.+?\}/;

const NO_NAME = "No Name";

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
        openTerminal({
          ...terminal,
          cwd: /\$\{.+?\}/.test(terminal.cwd || "") ?
            terminal.cwd :
            Uri.joinPath(workspaceUri, terminal.cwd || "")
        });
      });
    }),
    commands.registerCommand(
      "quickTerminals.open-terminal",
      async (args?: { id?: string }) => {
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

        let terminal: QuickTerminal | undefined;
        if (terminals.length > 1 && (!args?.id || args?.id.trim() === "")) {
          await window
            .showQuickPick(
              terminals.map((term) => ({
                label: term.name || NO_NAME,
                description: term.id
              })),
              {
                placeHolder: "Select a terminal to open"
              }
            )
            .then((picked) => {
              if (picked) {
                terminal = terminals.find(
                  (term) =>
                    term.name ||
                    (NO_NAME === picked.label && term.id === picked.description)
                );
              }
            });
        } else {
          terminal =
            terminals.find((terminal) => terminal.id === args?.id) ||
            terminals[0];
        }

        if (!terminal) {
          return window.showErrorMessage(
            "You picked a terminal, but we couldn't find it."
          );
        }

        openTerminal({
          ...terminal,
          cwd: /\$\{.+?\}/.test(terminal.cwd || "") ?
            terminal.cwd :
            Uri.joinPath(workspaceUri, terminal.cwd || "")
        });
      }
    ),
    commands.registerCommand(
      "quickTerminals.open-preset",
      async (args?: { id?: string }) => {
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
        if (presets.length > 1 && (!args?.id || args?.id.trim() === "")) {
          await window
            .showQuickPick(
              presets.map((preset) => ({
                label: preset.name || NO_NAME,
                description: preset.cwd?.toString()
              })),
              {
                placeHolder: "Select a preset to open"
              }
            )
            .then((picked) => {
              if (picked) {
                preset = presets.find(
                  (preset) =>
                    preset.name ||
                    (NO_NAME === picked.label &&
                      preset.cwd === picked.description)
                );
              }
            });
        } else {
          preset =
            presets.find((preset) => preset.name === args?.id) || presets[0];
        }

        if (!preset) {
          return window.showErrorMessage(
            "You picked a preset, but we couldn't find it."
          );
        }

        preset.terminals.forEach((terminal) => {
          let cwd: string | Uri | undefined;
          if (terminal.preventCwdPrepend) {
            cwd = VARIABLE_REGEX.test(terminal.cwd || "") ?
              terminal.cwd :
              Uri.joinPath(workspaceUri, terminal.cwd || "");
          } else {
            cwd = VARIABLE_REGEX.test(
              path.resolve(preset?.cwd || "", terminal.cwd || "")
            ) ?
              path.resolve(preset?.cwd || "", terminal.cwd || "") :
              Uri.joinPath(
                workspaceUri,
                path.resolve(preset?.cwd || "", terminal.cwd || "")
              );
          }

          console.log(
            "AAA",
            VARIABLE_REGEX.test(
              path.resolve(preset?.cwd || "", terminal.cwd || "")
            ) ?
              path.resolve(preset?.cwd || "", terminal.cwd || "") :
              Uri.joinPath(
                workspaceUri,
                path.resolve(preset?.cwd || "", terminal.cwd || "")
              )
          );

          openTerminal({
            ...terminal,
            cwd
          });
        });
      }
    )
  );

  const openOnStartup = config.get("openOnStartup");

  if (openOnStartup || typeof openOnStartup === "string") {
    if (typeof openOnStartup !== "string") {
      commands.executeCommand("quickTerminals.open-terminals");
    } else {
      if (openOnStartup.startsWith("preset:")) {
        commands.executeCommand("quickTerminals.open-preset", {
          id: openOnStartup.slice(7)
        });
      } else {
        commands.executeCommand("quickTerminals.open-terminal", {
          id: openOnStartup
        });
      }
    }
  }
}

function openTerminal(
  terminal: Omit<QuickTerminal, "cwd"> & {
    cwd?: string | Uri;
  }
) {
  console.log("CWD", terminal.cwd);

  const term = window.createTerminal({
    name: terminal.name,
    color: terminal.color ?
      new ThemeColor(COLOR_MAP[terminal.color]) :
      undefined,
    cwd: terminal.cwd,
    shellArgs: terminal.shellArgs,
    shellPath: terminal.shellPath,
    env: terminal.env,
    message: terminal.message,
    iconPath: terminal.icon ? new ThemeIcon(terminal.icon) : undefined
  });

  if (terminal.split && Array.isArray(terminal.split)) {
    terminal.split.forEach((splitTerminal) => {
    });
  }

  if (terminal.command) {
    term.sendText(terminal.command, true);
  }

  if (terminal.show || terminal.show === undefined) {
    term.show();
  }
}

export function deactivate() {}
