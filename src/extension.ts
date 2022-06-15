import {
  commands,
  ExtensionContext,
  ThemeColor,
  window,
  workspace,
} from "vscode";
import { getTerminals } from "./utils";

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
          const terminals = await getTerminals(
            workspace.workspaceFolders[0].uri.fsPath
          );

          console.log(terminals);
          
          // const terminal = await window.showQuickPick(terminals, {
        } catch (error: any) {
          window.showErrorMessage(error.message);
        }

        window.createTerminal({
          name: "Terminal 1",
          color: new ThemeColor("terminal.ansiRed"),
          location: 1,
        });
      }
    )
  );
}

export function deactivate() {}
