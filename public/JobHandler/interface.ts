/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { IJobItemMetadata } from "../lib/JobScheduler/interface";
import { CoreSetup } from "../../../../src/core/public";

export type CallbackType = (
  jobData: IJobItemMetadata,
  params: {
    core: CoreSetup;
  }
) => Promise<boolean>;

export type TaskResult<T = {}> = {
  completed: boolean;
  response: T;
  error?: {
    type: string;
    reason: string;
  };
};

export type RecoveryTaskResult = TaskResult<{
  acknowledged: boolean;
  index: string;
  shards_acknowledged: boolean;
}>;
