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
import { waitFor } from "@testing-library/dom";
import { JobScheduler } from "./JobScheduler";

describe("JobScheduler spec", () => {
  it("basic usage", async () => {
    const callback = jest.fn(async () => {
      return false;
    });
    const timeoutCallback = jest.fn();
    // setup job scheduler
    const jobScheduler = new JobScheduler({
      callbacks: [
        {
          callback,
          callbackName: "test",
          timeoutCallback,
        },
      ],
    });
    jobScheduler.init();

    // add a job
    const addedJob = await jobScheduler.addJob({
      interval: 1000,
      timeout: 2500,
      extras: {},
      type: "reindex",
    });
    await jobScheduler.addJob(addedJob);
    // if the same job was added, ignore that.
    expect(jobScheduler.getAllJobs()).resolves.toHaveLength(1);

    // excute every second
    await waitFor(
      () =>
        new Promise(async (resolve, reject) => {
          const result = await jobScheduler.getAllJobs();
          try {
            expect(result).toHaveLength(0);
            resolve(true);
          } catch (e) {
            reject(e);
          }
        }),
      {
        timeout: 10000,
      }
    );
    expect(callback).toBeCalledTimes(3);

    // setup a long timeout job
    const testJob = await jobScheduler.addJob({
      interval: 1000,
      type: "reindex",
      extras: {},
      id: "test",
    });
    expect(testJob.id).toEqual("test");
    await jobScheduler.changeJob(testJob.id, {
      timeout: 2000,
    });
    await new Promise((resolve) => setTimeout(resolve, 3000));
    // wait for 3s, and the job should be gone
    expect(jobScheduler.getAllJobs()).resolves.toHaveLength(0);

    // add a callback
    jobScheduler.addCallback({
      callbackName: "test1",
      callback: async () => false,
      timeoutCallback,
    });

    // delete the callback
    jobScheduler.deleteCallback("test1");
    expect(jobScheduler.getAllCallbacks()).toHaveLength(1);

    // add a job
    const testDeleteJob = await jobScheduler.addJob({
      interval: 1000,
      type: "reindex",
      extras: {},
      id: "testDeleteJob",
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    jobScheduler.deleteJob(testDeleteJob.id);
  }, 30000);

  it("jobs when resume", async () => {
    const callback = jest.fn(() => Promise.reject(false));
    const timeoutCallback = jest.fn();
    // setup job scheduler
    const jobScheduler = new JobScheduler({
      callbacks: [
        {
          callback,
          callbackName: "test",
          timeoutCallback,
        },
      ],
    });
    jobScheduler.addJob({
      createTime: Date.now() - 20 * 1000,
      timeout: 2000,
      interval: 1000,
      type: "reindex",
      extras: {},
    });
    jobScheduler.init();
    await new Promise((resolve) => setTimeout(resolve, 3000));
    expect(jobScheduler.getAllJobs()).resolves.toHaveLength(0);
    expect(callback).toBeCalledTimes(1);
    expect(timeoutCallback).toBeCalledTimes(1);
    const result = await jobScheduler.changeJob("1", {});
    expect(result).toBe(false);
  });
});
