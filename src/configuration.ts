/* eslint-disable @typescript-eslint/indent */

import { ConfigurationTarget, workspace } from "vscode";
import type { ConfigurationScope } from "vscode";

import type { Preset, QuickTerminal } from "./utils";

export interface Config {
  terminals: QuickTerminal[];
  openOnStartup?: string;
  presets: Preset[];
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
