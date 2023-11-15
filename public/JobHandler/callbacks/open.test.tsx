/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { CoreSetup } from "opensearch-dashboards/public";
import { callbackForOpen, callbackForOpenTimeout } from "./open";
import { coreServicesMock, httpClientMock } from "../../../test/mocks";
import { ListenType } from "../../lib/JobScheduler";

const getMockFn = (response = {}, ok = true) => {
  return jest.fn().mockResolvedValue({
    ok,
    response,
  });
};

const openMetaData = {
  interval: 0,
  extras: {
    toastId: "toastId",
    indexes: ["sourceIndex"],
    taskId: "taskId",
  },
  type: ListenType.OPEN,
};

const core = ({
  ...coreServicesMock,
  http: httpClientMock,
} as unknown) as CoreSetup;

describe("callbackForOpen spec", () => {
  it("callback when error", async () => {
    httpClientMock.fetch = getMockFn({}, false);
    const result = await callbackForOpen(openMetaData, {
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
    const result = await callbackForOpen(openMetaData, {
      core,
    });
    expect(result).toBe(false);
  });

  it("callback when successfully complete", async () => {
    httpClientMock.fetch = getMockFn({
      found: true,
      _source: {
        completed: true,
        response: {
          acknowledged: true,
          shards_acknowledged: true,
        },
      },
    });
    const result = await callbackForOpen(openMetaData, {
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
      },
    });
    const result = await callbackForOpen(openMetaData, {
      core,
    });
    expect(result).toBe(true);
    expect(core.notifications.toasts.remove).toBeCalledWith("toastId");
    expect(core.notifications.toasts.addDanger).toBeCalledTimes(1);
  });

  it("callback when timeout", async () => {
    const result = await callbackForOpenTimeout(openMetaData, {
      core,
    });
    expect(result).toBe(true);
    expect(core.notifications.toasts.remove).toBeCalledWith("toastId");
    expect(core.notifications.toasts.addWarning).toBeCalledTimes(1);
  });
});
