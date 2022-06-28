/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpSetup } from "opensearch-dashboards/public";
import { GetChannelsResponse, GetNotificationConfigsResponse } from "../../server/models/interfaces";
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

  getChannel = async (channelId: string): Promise<ServerResponse<GetNotificationConfigsResponse>> => {
    let url = `..${NODE_API.CHANNELS}/${channelId}`;
    const response = (await this.httpClient.get(url)) as ServerResponse<GetNotificationConfigsResponse>;
    return response;
  };
}
