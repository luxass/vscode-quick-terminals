import { join } from "path";
import * as fs from "fs";
import * as util from "util";
import { window } from "vscode";
import { QuickTerminal, QuickTerminals } from "./types";

const exists = util.promisify(fs.exists);
const readFile = util.promisify(fs.readFile);

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
