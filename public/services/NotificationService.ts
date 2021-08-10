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

import { HttpSetup } from "opensearch-dashboards/public";
import { GetChannelsResponse } from "../../server/models/interfaces";
import { ServerResponse } from "../../server/models/types";
import { NODE_API } from "../../utils/constants";

export default class NotificationService {
  httpClient: HttpSetup;

  constructor(httpClient: HttpSetup) {
    this.httpClient = httpClient;
  }

  getChannels = async (): Promise<ServerResponse<GetChannelsResponse>> => {
    let url = `..${NODE_API.CHANNELS}`;
    const response = (await this.httpClient.get(url)) as ServerResponse<GetChannelsResponse>;
    return response;
  };
}
