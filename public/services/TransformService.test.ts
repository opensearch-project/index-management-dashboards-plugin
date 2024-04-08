/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { httpClientMock } from "../../test/mocks";
import { NODE_API } from "../../utils/constants";
import { testTransform } from "../../test/constants";
import TransformService from "./TransformService";

const transformService = new TransformService(httpClientMock);

describe("transformService spec", () => {
  it("calls get transform nodejs route when calling getTransform", async () => {
    httpClientMock.get = jest.fn().mockResolvedValue({ data: {} });
    const transformId = "test";
    await transformService.getTransform(transformId);

    expect(httpClientMock.get).toHaveBeenCalledTimes(1);
    expect(httpClientMock.get).toHaveBeenCalledWith(`..${NODE_API.TRANSFORMS}/${transformId}`, expect.anything());
  });

  it("calls get transforms nodejs route when calling getTransforms", async () => {
    httpClientMock.get = jest.fn().mockResolvedValue({ data: {} });
    const queryObject = {};
    await transformService.getTransforms(queryObject);

    expect(httpClientMock.get).toHaveBeenCalledTimes(1);
    expect(httpClientMock.get).toHaveBeenCalledWith(`..${NODE_API.TRANSFORMS}`, { query: {} });
  });

  it("calls put transform nodejs route when calling putTransform", async () => {
    httpClientMock.put = jest.fn().mockResolvedValue({ data: {} });
    const transformId = "test_1";
    await transformService.putTransform(testTransform.transform, transformId);

    expect(httpClientMock.put).toHaveBeenCalledTimes(1);
    expect(httpClientMock.put).toHaveBeenCalledWith(`..${NODE_API.TRANSFORMS}/${transformId}`, {
      query: { primaryTerm: undefined, seqNo: undefined },
      body: JSON.stringify(testTransform.transform),
    });
  });

  it("calls delete transform nodejs route when calling deleteTransform", async () => {
    httpClientMock.delete = jest.fn().mockResolvedValue({ data: {} });
    const transformId = "transform_id";
    await transformService.deleteTransform(transformId);

    expect(httpClientMock.delete).toHaveBeenCalledTimes(1);
    expect(httpClientMock.delete).toHaveBeenCalledWith(`..${NODE_API.TRANSFORMS}/${transformId}`, expect.anything());
  });

  it("calls start transform nodejs route when calling startTransform", async () => {
    httpClientMock.post = jest.fn().mockResolvedValue({ data: {} });
    const transformId = "transform_id";
    await transformService.startTransform(transformId);

    expect(httpClientMock.post).toHaveBeenCalledTimes(1);
    expect(httpClientMock.post).toHaveBeenCalledWith(`..${NODE_API.TRANSFORMS}/${transformId}/_start`, expect.anything());
  });

  it("calls stop transform nodejs route when calling stopTransform", async () => {
    httpClientMock.post = jest.fn().mockResolvedValue({ data: {} });
    const transformId = "transform_id";
    await transformService.stopTransform(transformId);

    expect(httpClientMock.post).toHaveBeenCalledTimes(1);
    expect(httpClientMock.post).toHaveBeenCalledWith(`..${NODE_API.TRANSFORMS}/${transformId}/_stop`, expect.anything());
  });

  it("calls preview transform nodejs route when calling previewTransform", async () => {
    httpClientMock.post = jest.fn().mockResolvedValue({ data: {} });
    await transformService.previewTransform(testTransform.transform);

    expect(httpClientMock.post).toHaveBeenCalledTimes(1);
    expect(httpClientMock.post).toHaveBeenCalledWith(`..${NODE_API.TRANSFORMS}/_preview`, {
      body: JSON.stringify(testTransform.transform),
    });
  });

  it("calls get mappings nodejs route when calling getMappings", async () => {
    httpClientMock.post = jest.fn().mockResolvedValue({ data: {} });
    const indexName = "index_1";
    await transformService.getMappings(indexName);

    expect(httpClientMock.post).toHaveBeenCalledTimes(1);
    expect(httpClientMock.post).toHaveBeenCalledWith(`..${NODE_API._MAPPINGS}`, { body: JSON.stringify({ index: indexName }) });
  });

  it("calls search sample data nodejs route when calling searchSampleData with no data filter", async () => {
    httpClientMock.post = jest.fn().mockResolvedValue({ data: {} });
    const indexName = "index_1";
    const queryObject = {};
    const body = "";
    await transformService.searchSampleData(indexName, body, queryObject);

    expect(httpClientMock.post).toHaveBeenCalledTimes(1);
    expect(httpClientMock.post).toHaveBeenCalledWith(`..${NODE_API._SEARCH_SAMPLE_DATA}/${indexName}`, { query: queryObject, body: body });
  });

  it("calls search sample data nodejs route when calling searchSampleData with data filter", async () => {
    httpClientMock.post = jest.fn().mockResolvedValue({ data: {} });
    const indexName = "index_1";
    const queryObject = {};
    const body = JSON.stringify({
      match: {
        customer_gender: "FEMALE",
      },
    });
    await transformService.searchSampleData(indexName, body, queryObject);

    expect(httpClientMock.post).toHaveBeenCalledTimes(1);
    expect(httpClientMock.post).toHaveBeenCalledWith(`..${NODE_API._SEARCH_SAMPLE_DATA}/${indexName}`, { query: queryObject, body: body });
  });
});
