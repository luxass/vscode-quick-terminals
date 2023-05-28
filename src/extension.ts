import type { ExtensionContext } from "vscode";
import { commands, window } from "vscode";

import { config } from "./configuration";
import type { Preset, QuickTerminal } from "./utils";
import { getWorkspace, openTerminal } from "./utils";

const VARIABLE_REGEX = /\$\{.+?\}/;

const NO_NAME = "No Name";

export function activate(ctx: ExtensionContext) {
  ctx.subscriptions.push(
    commands.registerCommand("quickTerminals.run-terminal", async () => {
      window.showInformationMessage("Run terminal");
    }),
    commands.registerCommand("quickTerminals.run-terminals", async () => {
      window.showInformationMessage("Run terminals");
    }),
    commands.registerCommand("quickTerminals.run-folder", async () => {
      window.showInformationMessage("Run folder");
    }),
    commands.registerCommand("quickTerminals.kill", async () => {
      window.showInformationMessage("Kill terminal(s)");
    })
  )
  ctx.subscriptions.push(
    commands.registerCommand(
      "quickTerminals.open-terminal",
      async (args?: { id?: string }) => {
        const workspaceUri = await getWorkspace();

        if (!workspaceUri) return;

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
                    (term.name || NO_NAME) === picked.label &&
                    term.id === picked.description
                );
              }
            });
        } else {
          terminal =
            terminals.find((terminal) => terminal.id === args?.id) ||
            terminals[0];
        }

        if (!terminal) {
          return;
        }

        openTerminal({
          terminal,
          workspaceUri
        });
      }
    )
  );

  ctx.subscriptions.push(
    commands.registerCommand(
      "quickTerminals.open-preset",
      async (args?: { id?: string }) => {
        const workspaceUri = await getWorkspace();

        if (!workspaceUri) {
          return;
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
              presets.map((preset, idx) => ({
                label: preset.name || `Preset ${idx}`
              })),
              {
                placeHolder: "Select a preset to open"
              }
            )
            .then((picked) => {
              if (picked) {
                preset = presets.find(
                  (preset, idx) =>
                    preset.name || `Preset ${idx}` === picked.label
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

        preset.terminals.forEach((terminal) =>
          openTerminal({
            workspaceUri,
            terminal
          })
        );
      }
    )
  );

  const openOnStartup = config.get("openOnStartup");

  if (openOnStartup) {
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

  return {

  }
}

export function deactivate() { }
