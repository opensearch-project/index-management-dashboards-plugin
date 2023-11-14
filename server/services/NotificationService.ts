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

import {
  RequestHandlerContext,
  OpenSearchDashboardsRequest,
  OpenSearchDashboardsResponseFactory,
  IOpenSearchDashboardsResponse,
  ILegacyCustomClusterClient,
  ResponseError,
} from "opensearch-dashboards/server";
import { ServerResponse } from "../models/types";
import { GetChannelsResponse, GetNotificationConfigsResponse } from "../models/interfaces";

export default class NotificationService {
  osDriver: ILegacyCustomClusterClient;

  constructor(osDriver: ILegacyCustomClusterClient) {
    this.osDriver = osDriver;
  }

  getChannels = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<GetChannelsResponse> | ResponseError>> => {
    try {
      const { callAsCurrentUser: callWithRequest } = this.osDriver.asScoped(request);
      const getChannelsResponse: GetChannelsResponse = await callWithRequest("ism.getChannels");

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: getChannelsResponse,
        },
      });
    } catch (err) {
      console.error("Index Management - NotificationService - getChannels:", err);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: err.message,
        },
      });
    }
  };

  getChannelById = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<GetNotificationConfigsResponse> | ResponseError>> => {
    try {
      const { id } = request.params as {
        id: string;
      };

      const { callAsCurrentUser: callWithRequest } = this.osDriver.asScoped(request);
      const getResponse: GetNotificationConfigsResponse = await callWithRequest("ism.getChannel", {
        id,
      });

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: getResponse,
        },
      });
    } catch (err) {
      console.error("Index Management - NotificationService - getChannel:", err);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: err.message,
        },
      });
    }
  };
}
