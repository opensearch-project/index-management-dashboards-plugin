/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
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
