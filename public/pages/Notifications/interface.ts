import { ActionType } from "./constant";

/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
export type LronActionName = keyof typeof ActionType;

export interface ILronConfig {
  lron_condition: {
    success?: boolean;
    failure?: boolean;
  };
  action_name: LronActionName;
  channels: {
    id: string;
  }[];
}

export type ILronPlainConfig = ILronConfig["lron_condition"] &
  Omit<ILronConfig, "lron_condition"> & {
    title: string;
  };

export type FieldState = {
  useDifferentSettings: boolean;
  dataSource: ILronPlainConfig[];
  allConfig: ILronPlainConfig;
};
