import {
  commands,
  ExtensionContext,
  ThemeColor,
  window,
  workspace,
} from "vscode";
import { getTerminals, openTerminal } from "./utils";

export function activate(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand(
      "vscode-quick-terminals.open-terminals",
      async () => {
        if (!workspace.workspaceFolders?.length) {
          window.showErrorMessage("No workspace folder is open.");
          return;
        }

        try {
          const fsPath = workspace.workspaceFolders[0].uri.fsPath;
          const terminals = await getTerminals(fsPath);

          console.log(terminals);
          terminals.forEach((terminal) => {
            openTerminal(fsPath, terminal);
          });
          // const terminal = await window.showQuickPick(terminals, {
        } catch (error: any) {
          window.showErrorMessage(error.message);
        }
      }
    )
  );
}

export function deactivate() {}
