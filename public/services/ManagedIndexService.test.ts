/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { httpClientMock } from "../../test/mocks";
import ManagedIndexService from "./ManagedIndexService";
import { NODE_API } from "../../utils/constants";

const managedIndexService = new ManagedIndexService(httpClientMock);

describe("ManagedIndexService spec", () => {
  it("calls get managed index nodejs route when calling getManagedIndex", async () => {
    httpClientMock.get = jest.fn().mockResolvedValue({ data: {} });
    const managedIndexUuid = "test";
    await managedIndexService.getManagedIndex(managedIndexUuid);

    expect(httpClientMock.get).toHaveBeenCalledTimes(1);
    expect(httpClientMock.get).toHaveBeenCalledWith(`..${NODE_API.MANAGED_INDICES}/${managedIndexUuid}`, expect.anything());
  });

  it("calls get managed indices nodejs route when calling getManagedIndices", async () => {
    httpClientMock.get = jest.fn().mockResolvedValue({ data: {} });
    const queryObject = {};
    await managedIndexService.getManagedIndices(queryObject);

    expect(httpClientMock.get).toHaveBeenCalledTimes(1);
    expect(httpClientMock.get).toHaveBeenCalledWith(`..${NODE_API.MANAGED_INDICES}`, { query: queryObject });
  });

  it("calls get data streams nodejs route when calling getDataStreams", async () => {
    httpClientMock.get = jest.fn().mockResolvedValue({ data: {} });
    await managedIndexService.getDataStreams();

    expect(httpClientMock.get).toHaveBeenCalledTimes(1);
    expect(httpClientMock.get).toHaveBeenCalledWith(`..${NODE_API._DATA_STREAMS}`, expect.anything());
  });

  it("calls retry policy nodejs route when calling retryManagedIndexPolicy", async () => {
    httpClientMock.post = jest.fn().mockResolvedValue({ data: {} });
    const index = ["one", "two"];
    const state = "test";
    await managedIndexService.retryManagedIndexPolicy(index, state);

    expect(httpClientMock.post).toHaveBeenCalledTimes(1);
    expect(httpClientMock.post).toHaveBeenCalledWith(`..${NODE_API.RETRY}`, { body: JSON.stringify({ index, state }) });
  });

  it("calls remove policy nodejs route when calling removePolicy", async () => {
    httpClientMock.post = jest.fn().mockResolvedValue({ data: {} });
    const indices = ["one", "two"];
    await managedIndexService.removePolicy(indices);

    expect(httpClientMock.post).toHaveBeenCalledTimes(1);
    expect(httpClientMock.post).toHaveBeenCalledWith(`..${NODE_API.REMOVE_POLICY}`, { body: JSON.stringify({ indices }) });
  });

  it("calls change policy nodejs route when calling changePolicy", async () => {
    httpClientMock.post = jest.fn().mockResolvedValue({ data: {} });
    const indices = ["one", "two"];
    const policyId = "test";
    const state = "state_test";
    const include: object[] = [];
    await managedIndexService.changePolicy(indices, policyId, state, include);
    const requestBody = { indices, policyId, state, include };

    expect(httpClientMock.post).toHaveBeenCalledTimes(1);
    expect(httpClientMock.post).toHaveBeenCalledWith(`..${NODE_API.CHANGE_POLICY}`, { body: JSON.stringify(requestBody) });
  });
});
