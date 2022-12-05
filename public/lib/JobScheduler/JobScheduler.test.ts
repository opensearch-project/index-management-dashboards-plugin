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
    // setup job scheduler
    const jobScheduler = new JobScheduler({
      callbacks: [
        {
          callback,
          callbackName: "test",
        },
      ],
    });
    jobScheduler.init();

    // add a job
    const addedJob = await jobScheduler.addJob({
      cron: "* * * * * *",
      timeout: 3000,
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
      cron: "* * * * * *",
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
    });

    // delete the callback
    jobScheduler.deleteCallback("test1");
    expect(jobScheduler.getAllCallbacks()).toHaveLength(1);

    // add a job
    const testDeleteJob = await jobScheduler.addJob({
      cron: "* * * * * *",
      type: "reindex",
      extras: {},
      id: "testDeleteJob",
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    jobScheduler.deleteJob(testDeleteJob.id);
  }, 30000);

  it("jobs when resume", async () => {
    const callback = jest.fn(() => Promise.reject(false));
    // setup job scheduler
    const jobScheduler = new JobScheduler({
      callbacks: [
        {
          callback,
          callbackName: "test",
        },
      ],
    });
    jobScheduler.addJob({
      createTime: Date.now() - 20 * 1000,
      timeout: 2000,
      cron: "* * * * * *",
      type: "reindex",
      extras: {},
    });
    jobScheduler.init();
    await new Promise((resolve) => setTimeout(resolve, 3000));
    expect(jobScheduler.getAllJobs()).resolves.toHaveLength(0);
    expect(callback).toBeCalledTimes(0);
    const result = await jobScheduler.changeJob("1", {});
    expect(result).toBe(false);
  });
});
