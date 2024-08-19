/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  RequestHandlerContext,
  OpenSearchDashboardsRequest,
  OpenSearchDashboardsResponseFactory,
  IOpenSearchDashboardsResponse,
  ResponseError,
} from "opensearch-dashboards/server";
import { ServerResponse } from "../models/types";
import { GetChannelsResponse, GetNotificationConfigsResponse } from "../models/interfaces";
import { MDSEnabledClientService } from "./MDSEnabledClientService";

export default class NotificationService extends MDSEnabledClientService {
  getChannels = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<GetChannelsResponse> | ResponseError>> => {
    try {
      const callWithRequest = this.getClientBasedOnDataSource(context, request);
      const getChannelsResponse: GetChannelsResponse = (await callWithRequest("ism.getChannels", {})) as GetChannelsResponse;

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

      const callWithRequest = this.getClientBasedOnDataSource(context, request);
      const getResponse: GetNotificationConfigsResponse = (await callWithRequest("ism.getChannel", {
        id,
      })) as GetNotificationConfigsResponse;

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
