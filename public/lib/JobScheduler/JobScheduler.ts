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

/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { IJobSchedulerOptions, IJobItemMetadata, IStorage, JobItemMetadata, TimeoutId } from "./interface";
import { StoreLocalStorage } from "./store-localstorage";

export class JobScheduler {
  private options: IJobSchedulerOptions;
  // key: jobId value: timerid
  private runningJobMap: Record<string, TimeoutId> = {};
  private storage: IStorage;
  constructor(options: IJobSchedulerOptions) {
    this.options = options;
    this.storage = options.storage || new StoreLocalStorage();
  }
  public setStorage(storage: IStorage): JobScheduler {
    this.storage = storage;
    return this;
  }
  async init(): Promise<boolean> {
    this.loopJob();
    return true;
  }
  private getId() {
    return `${Date.now()}_${Math.floor(Math.random() * 10)}`;
  }
  private formatJob(job: IJobItemMetadata): JobItemMetadata {
    const { firstRunTimeout, ...others } = job;
    const formattedJob = { ...others };
    if (!formattedJob.id) {
      formattedJob.id = this.getId();
    }

    if (!formattedJob.createTime) {
      formattedJob.createTime = Date.now();
    }

    if (!formattedJob.timeout) {
      formattedJob.timeout = 1000 * 60 * 60;
    }

    return formattedJob as JobItemMetadata;
  }
  private isStaledJob(job: JobItemMetadata) {
    if (!job.latestRunTime) {
      // haven't run once, return false
      return false;
    }

    return job.timeout + job.createTime < job.latestRunTime;
  }
  private async loopJob() {
    const jobs = await this.storage.getAll();
    // loop all the jobs to see if any job do not exist in runningJobMap
    jobs.forEach(async (job) => {
      // if a job is staled, remove that
      if (this.isStaledJob(job)) {
        await this.runStaledJob(job.id);
        await this.deleteJob(job.id);
        return;
      }

      if (!this.runningJobMap[job.id]) {
        const timeoutCallback = setTimeout(async () => {
          if (!this.isStaledJob(job)) {
            this.runJob(job.id);
          } else {
            await this.runStaledJob(job.id);
            await this.deleteJob(job.id);
          }
        }, job.interval);
        this.runningJobMap[job.id] = timeoutCallback;
      }
    });
  }
  private async runStaledJob(jobId: JobItemMetadata["id"]): Promise<void> {
    const job = await this.getJob(jobId);
    if (!job) {
      return undefined;
    }
    const filteredCallbacks = this.options.callbacks.filter(
      (callbackItem) => callbackItem.listenType === job.type || !callbackItem.listenType
    );
    await Promise.all(
      filteredCallbacks.map(async (callbackItem) => {
        try {
          return callbackItem.timeoutCallback(job);
        } catch (e) {
          return false;
        }
      })
    );
  }
  private async runJob(jobId: JobItemMetadata["id"]): Promise<void> {
    const job = await this.getJob(jobId);
    if (!job) {
      return undefined;
    }
    const filteredCallbacks = this.options.callbacks.filter(
      (callbackItem) => callbackItem.listenType === job.type || !callbackItem.listenType
    );
    job.latestRunTime = Date.now();
    const result = await Promise.all(
      filteredCallbacks.map(async (callbackItem) => {
        try {
          return await callbackItem.callback(job);
        } catch (e) {
          return false;
        }
      })
    );
    const hasFinish = result.some((res) => res === true);
    await this.deleteJob(job.id);
    if (!hasFinish) {
      await this.addJob(job);
    }
  }
  addCallback(callback: IJobSchedulerOptions["callbacks"][number]) {
    this.options.callbacks.push(callback);
  }
  deleteCallback(callbackName: string) {
    const findIndex = this.options.callbacks.findIndex((item) => item.callbackName === callbackName);
    if (findIndex > -1) {
      this.options.callbacks.splice(findIndex, 1);
    }
  }
  getAllCallbacks() {
    return this.options.callbacks;
  }
  async addJob(job: IJobItemMetadata): Promise<JobItemMetadata> {
    const formattedJob = this.formatJob(job);
    if (this.runningJobMap[formattedJob.id]) {
      return formattedJob;
    }

    await this.storage.set(formattedJob.id, formattedJob);
    if (job.firstRunTimeout) {
      setTimeout(() => {
        this.runJob(formattedJob.id);
      }, job.firstRunTimeout);
    }
    this.loopJob();
    return formattedJob;
  }
  async deleteJob(jobId: JobItemMetadata["id"]): Promise<boolean> {
    clearTimeout(this.runningJobMap[jobId]);
    delete this.runningJobMap[jobId];
    const storageResult = await this.storage.delete(jobId);
    return storageResult || true;
  }
  getJob(jobId: JobItemMetadata["id"]): Promise<JobItemMetadata | undefined> {
    return this.storage.get(jobId);
  }
  getAllJobs(): Promise<JobItemMetadata[]> {
    return this.storage.getAll();
  }
  async changeJob(jobId: JobItemMetadata["id"], jobMeta: Partial<Omit<JobItemMetadata, "id">>): Promise<boolean> {
    const nowJob = await this.getJob(jobId);

    if (!nowJob) {
      return false;
    }

    return this.storage.set(jobId, {
      ...nowJob,
      ...jobMeta,
      id: jobId,
    });
  }
}
