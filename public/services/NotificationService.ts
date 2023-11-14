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
    const url = `..${NODE_API.CHANNELS}`;
    const response = (await this.httpClient.get(url)) as ServerResponse<GetChannelsResponse>;
    return response;
  };

  getChannel = async (channelId: string): Promise<ServerResponse<GetNotificationConfigsResponse>> => {
    const url = `..${NODE_API.CHANNELS}/${channelId}`;
    const response = (await this.httpClient.get(url)) as ServerResponse<GetNotificationConfigsResponse>;
    return response;
  };
}
