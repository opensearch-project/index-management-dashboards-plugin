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
import { CoreSetup } from "opensearch-dashboards/public";
import { callbackForReindex, callbackForReindexTimeout } from "./reindex";
import { coreServicesMock, httpClientMock } from "../../../test/mocks";
import { ListenType } from "../../lib/JobScheduler";

const getMockFn = (response = {}, ok = true) => {
  return jest.fn().mockResolvedValue({
    ok,
    response,
  });
};

const reindexMetaData = {
  interval: 0,
  extras: {
    toastId: "toastId",
    sourceIndex: "sourceIndex",
    destIndex: "destIndex",
    writingIndex: "destIndex",
    taskId: "taskId",
    destType: "index",
  },
  type: ListenType.REINDEX,
};

const core = ({
  ...coreServicesMock,
  http: httpClientMock,
} as unknown) as CoreSetup;

describe("callbackForOpen spec", () => {
  it("callback when error", async () => {
    httpClientMock.fetch = getMockFn({}, false);
    const result = await callbackForReindex(reindexMetaData, {
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
    const result = await callbackForReindex(reindexMetaData, {
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
    const result = await callbackForReindex(reindexMetaData, {
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
    const result = await callbackForReindex(reindexMetaData, {
      core,
    });
    expect(result).toBe(true);
    expect(core.notifications.toasts.remove).toBeCalledWith("toastId");
    expect(core.notifications.toasts.addDanger).toBeCalledTimes(1);
  });

  it("callback when timeout", async () => {
    const result = await callbackForReindexTimeout(reindexMetaData, {
      core,
    });
    expect(result).toBe(true);
    expect(core.notifications.toasts.remove).toBeCalledWith("toastId");
    expect(core.notifications.toasts.addWarning).toBeCalledTimes(1);
  });
});
