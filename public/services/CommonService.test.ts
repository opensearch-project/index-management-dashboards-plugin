/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { httpClientMock } from "../../test/mocks";
import { NODE_API } from "../../utils/constants";
import CommonService from "./CommonService";

const commonService = new CommonService(httpClientMock);
describe("CommonService spec", () => {
  it("calls api caller nodejs route when calling apiCaller", async () => {
    httpClientMock.fetch = jest.fn().mockResolvedValue({ ok: true });
    const queryObject = {
      endpoint: "indices.get",
    };
    await commonService.apiCaller(queryObject);

    expect(httpClientMock.fetch).toHaveBeenCalledTimes(1);
    expect(httpClientMock.fetch).toHaveBeenCalledWith(`${NODE_API.API_CALLER}`, {
      method: "get",
      query: queryObject,
    });
  });
});
