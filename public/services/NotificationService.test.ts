/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
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
    expect(httpClientMock.get).toHaveBeenCalledWith(`..${NODE_API.CHANNELS}`, expect.anything());
  });
});
