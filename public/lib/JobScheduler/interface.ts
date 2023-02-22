/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
export interface IJobItemMetadata {
  interval: number;
  extras: any; // extra fields to store job-related info
  type: "reindex" | "split" | "shrink"; // enum for job type
  id?: string; // a number to indicate the job
  createTime?: number; // the time when this job is created
  latestRunTime?: number; // the time when the job latest run, will be used to check if the job is staled
  // the timeout for job to do, once the time goes beyond the timeout
  // a timeout error toast will show.
  timeout?: number;
}

export type JobItemMetadata = IJobItemMetadata & Required<Pick<IJobItemMetadata, "id" | "createTime" | "timeout">>;

export interface IJobSchedulerOptions {
  callbacks: {
    listenType?: IJobItemMetadata["type"];
    callback: (params: IJobItemMetadata) => Promise<boolean>;
    timeoutCallback: (params: IJobItemMetadata) => void;
    callbackName: string;
  }[];
  storage?: IStorage;
}

export interface IStorage {
  setup(): Promise<boolean>;
  getAll(): Promise<JobItemMetadata[]>;
  set(key: string, value: JobItemMetadata): Promise<boolean>;
  get(key: string): Promise<JobItemMetadata | undefined>;
  delete(key: string): Promise<boolean>;
}

export type TimeoutId = ReturnType<typeof setTimeout>;
