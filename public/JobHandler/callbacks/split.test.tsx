/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { callbackForSplit, callbackForSplitTimeout } from "./split";
import { coreServicesMock, httpClientMock } from "../../../test/mocks";
import { ListenType } from "../../lib/JobScheduler";
import { CoreSetup } from "opensearch-dashboards/public";

const getMockFn = (response = {}, ok = true) => {
  return jest.fn().mockResolvedValue({
    ok,
    response,
  });
};

const splitMetaData = {
  interval: 0,
  extras: {
    toastId: "toastId",
    sourceIndex: "sourceIndex",
    destIndex: "destIndex",
    taskId: "taskId",
  },
  type: ListenType.SPLIT,
};

const core = ({
  ...coreServicesMock,
  http: httpClientMock,
} as unknown) as CoreSetup;

describe("callbackForOpen spec", () => {
  it("callback when error", async () => {
    httpClientMock.fetch = getMockFn({}, false);
    let result = await callbackForSplit(splitMetaData, {
      core,
    });
    expect(result).toBe(false);
  });

  it("callback when not complete", async () => {
    httpClientMock.fetch = getMockFn({
      found: true,
      _source: {
        completed: false,
      },
    });
    const result = await callbackForSplit(splitMetaData, {
      core,
    });
    expect(result).toBe(false);
  });

  it("callback when successfully complete", async () => {
    httpClientMock.fetch = getMockFn({
      found: true,
      _source: {
        completed: true,
      },
    });
    const result = await callbackForSplit(splitMetaData, {
      core,
    });
    expect(result).toBe(true);
    expect(core.notifications.toasts.remove).toBeCalledWith("toastId");
    expect(core.notifications.toasts.addSuccess).toBeCalledTimes(1);
  });

  it("callback when failed", async () => {
    httpClientMock.fetch = getMockFn({
      found: true,
      _source: {
        completed: true,
        error: {
          reason: "reason",
        },
        failures: [
          {
            cause: {
              reason: "cause",
            },
          },
        ],
      },
    });
    const result = await callbackForSplit(splitMetaData, {
      core,
    });
    expect(result).toBe(true);
    expect(core.notifications.toasts.remove).toBeCalledWith("toastId");
    expect(core.notifications.toasts.addDanger).toBeCalledTimes(1);
  });

  it("callback when timeout", async () => {
    const result = await callbackForSplitTimeout(splitMetaData, {
      core,
    });
    expect(result).toBe(true);
    expect(core.notifications.toasts.remove).toBeCalledWith("toastId");
    expect(core.notifications.toasts.addDanger).toBeCalledTimes(1);
  });
});
