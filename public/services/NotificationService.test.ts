/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
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
