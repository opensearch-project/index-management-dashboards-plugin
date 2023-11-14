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
      method: "POST",
      body: JSON.stringify(queryObject),
    });
  });
});
