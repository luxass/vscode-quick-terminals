/* eslint-disable @typescript-eslint/indent */

import { ConfigurationTarget, workspace } from "vscode";
import type { ConfigurationScope, TerminalOptions } from "vscode";

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

export interface Config {
  terminals: QuickTerminal[];
  openOnStartup: boolean | string;
  presets: Preset[];
}

export interface Preset {
  name: string;
  cwd?: string;
  shellPath?: TerminalOptions["shellPath"];
  shellArgs?: TerminalOptions["shellArgs"];
  env?: TerminalOptions["env"];
  terminals: QuickPresetTerminal[];
}

export interface QuickPresetTerminal extends QuickTerminal {
  preventCwdPrepend?: boolean;
}

export const config = {
  get<T extends Path<Config>>(
    key: T,
    options?: {
      scope?: ConfigurationScope;
      defaultValue?: PathValue<Config, T>;
      section: string;
    }
  ): PathValue<Config, T> {
    const section = options?.section ?? "quickTerminals";
    const defaultValue = options?.defaultValue;
    const scope = options?.scope;

    const value = !defaultValue ?
      workspace
          .getConfiguration(section, scope)
          .get<PathValue<Config, T>>(key)! :
      workspace
          .getConfiguration(section, scope)
          .get<PathValue<Config, T>>(key, defaultValue)!;

    return value;
  },

  set<T extends Path<Config>>(
    key: T,
    options?: {
      section?: string;
      value: PathValue<Config, T>;
      target?: ConfigurationTarget;
    }
  ): Thenable<void> {
    const section = options?.section ?? "quickTerminals";

    const target = options?.target ?? ConfigurationTarget.Global;

    return workspace
      .getConfiguration(section)
      .update(key, options?.value, target);
  }
};

type ChildPath<T, Key extends keyof T> = Key extends string
  ? T[Key] extends Record<string, any>
    ?
        | `${Key}.${ChildPath<T[Key], Exclude<keyof T[Key], keyof any[]>> &
            string}`
        | `${Key}.${Exclude<keyof T[Key], keyof any[]> & string}`
    : never
  : never;

type Path<T> = ChildPath<T, keyof T> | keyof T;

type PathValue<T, P extends Path<T>> = P extends `${infer Key}.${infer Rest}`
  ? Key extends keyof T
    ? Rest extends Path<T[Key]>
      ? PathValue<T[Key], Rest>
      : never
    : never
  : P extends keyof T
  ? T[P]
  : never;
