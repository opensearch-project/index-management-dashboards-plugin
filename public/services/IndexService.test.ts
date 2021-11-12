/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { httpClientMock } from "../../test/mocks";
import IndexService from "./IndexService";
import { NODE_API } from "../../utils/constants";

const indexService = new IndexService(httpClientMock);

describe("IndexService spec", () => {
  it("calls get indices nodejs route when calling getIndices", async () => {
    httpClientMock.get = jest.fn().mockResolvedValue({ data: {} });
    const queryObject = {};
    await indexService.getIndices(queryObject);

    expect(httpClientMock.get).toHaveBeenCalledTimes(1);
    expect(httpClientMock.get).toHaveBeenCalledWith(`..${NODE_API._INDICES}`, { query: queryObject });
  });

  it("calls get data streams nodejs route when calling getDataStreams", async () => {
    httpClientMock.get = jest.fn().mockResolvedValue({ data: {} });
    const queryObject = {};
    await indexService.getDataStreams(queryObject);

    expect(httpClientMock.get).toHaveBeenCalledTimes(1);
    expect(httpClientMock.get).toHaveBeenCalledWith(`..${NODE_API._DATA_STREAMS}`, { query: queryObject });
  });

  it("calls apply policy nodejs route when calling applyPolicy", async () => {
    httpClientMock.post = jest.fn().mockResolvedValue({ data: {} });
    const indices = ["one", "two"];
    const policyId = "test";
    await indexService.applyPolicy(indices, policyId);

    expect(httpClientMock.post).toHaveBeenCalledTimes(1);
    expect(httpClientMock.post).toHaveBeenCalledWith(`..${NODE_API.APPLY_POLICY}`, { body: JSON.stringify({ indices, policyId }) });
  });

  it("calls search nodejs route when calling searchPolicies", async () => {
    httpClientMock.post = jest.fn().mockResolvedValue({ data: {} });
    const searchValue = "test";
    await indexService.searchPolicies(searchValue);

    expect(httpClientMock.get).toHaveBeenCalledTimes(1);
  });
});
