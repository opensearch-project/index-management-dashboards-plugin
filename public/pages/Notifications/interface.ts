/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { ActionTypeMapName } from "./constant";

type ValueOf<T> = T[keyof T];
export interface ILronConfig {
  lron_condition: {
    success?: boolean;
    failure?: boolean;
  };
  task_id?: string;
  action_name?: ValueOf<typeof ActionTypeMapName>;
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
  dataSource: ILronPlainConfig[];
  allConfig: ILronPlainConfig;
};
