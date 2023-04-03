/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { ActionType } from "./constant";

export interface ILronConfig {
  lron_condition: {
    success?: boolean;
    failure?: boolean;
  };
  task_id?: string;
  action_name: ActionType;
  channels: {
    id: string;
  }[];
}

export type ILronPlainConfig = ILronConfig["lron_condition"] &
  Omit<ILronConfig, "lron_condition"> & {
    title: string;
    index: number;
  };

export type FieldState = {
  useDifferentSettings: boolean;
  dataSource: ILronPlainConfig[];
  allConfig: ILronPlainConfig;
};
