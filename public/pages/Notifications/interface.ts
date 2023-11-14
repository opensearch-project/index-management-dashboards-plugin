/*
 *   Copyright OpenSearch Contributors
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
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
  channels: Array<{
    id: string;
  }>;
}

export type ILronPlainConfig = ILronConfig["lron_condition"] &
  Omit<ILronConfig, "lron_condition"> & {
    title: string;
    index: number;
  };

export interface FieldState {
  dataSource: ILronPlainConfig[];
  allConfig: ILronPlainConfig;
}
