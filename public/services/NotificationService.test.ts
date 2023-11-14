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
import NotificationService from "./NotificationService";
import { NODE_API } from "../../utils/constants";

const notificationService = new NotificationService(httpClientMock);

describe("NotificationService spec", () => {
  it("calls get channels nodejs route when calling getChannels", async () => {
    httpClientMock.get = jest.fn().mockResolvedValue({ data: {} });
    await notificationService.getChannels();

    expect(httpClientMock.get).toHaveBeenCalledTimes(1);
    expect(httpClientMock.get).toHaveBeenCalledWith(`..${NODE_API.CHANNELS}`);
  });
});
