import type { ExtensionContext } from "vscode";
import { commands, window } from "vscode";


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
  );
  return {

  };
}

export function deactivate() { }
