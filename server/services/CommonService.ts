/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { AcknowledgedResponse } from "../models/interfaces";
import { ServerResponse } from "../models/types";
import {
  OpenSearchDashboardsRequest,
  OpenSearchDashboardsResponseFactory,
  ILegacyCustomClusterClient,
  IOpenSearchDashboardsResponse,
  RequestHandlerContext,
} from "../../../../src/core/server";
import { IAPICaller } from "../../models/interfaces";

export interface ICommonCaller {
  <T>(arg: any): T;
}

export default class IndexService {
  osDriver: ILegacyCustomClusterClient;

  constructor(osDriver: ILegacyCustomClusterClient) {
    this.osDriver = osDriver;
  }

  apiCaller = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<AcknowledgedResponse>>> => {
    const useQuery = !request.body;
    const usedParam = (useQuery ? request.query : request.body) as IAPICaller;
    const { endpoint, data, hideLog } = usedParam || {};
    try {
      const { callAsCurrentUser: callWithRequest } = this.osDriver.asScoped(request);
      const finalData = data;
      /**
       * Update path parameter to follow RFC/generic HTTP convention
       */
      if (endpoint === "transport.request" && typeof finalData?.path === "string" && !/^\//.test(finalData?.path || "")) {
        finalData.path = `/${finalData.path || ""}`;
      }
      const payload = useQuery ? JSON.parse(finalData || "{}") : finalData;
      const commonCallerResponse = await callWithRequest(endpoint, payload || {});
      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: commonCallerResponse,
        },
      });
    } catch (err) {
      if (!hideLog) {
        console.error("Index Management - CommonService - apiCaller", err);
      }
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: err?.message,
          body: err?.body || "",
        },
      });
    }
  };
}
