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
} from "../../../../src/core/server";
import { IAPICaller } from "../../models/interfaces";
import { getClientBasedOnDataSource } from "../utils/helpers";

const VALID_METHODS = ["HEAD", "GET", "POST", "PUT", "DELETE"];

export type ICommonCaller = <T>(arg: any) => T;

export default class CommonService {
  osDriver: ILegacyCustomClusterClient;
  dataSourceEnabled: boolean;

  constructor(osDriver: ILegacyCustomClusterClient, dataSourceEnabled: boolean = false) {
    this.osDriver = osDriver;
    this.dataSourceEnabled = dataSourceEnabled;
  }

  apiCaller = async (
    context: any,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<AcknowledgedResponse>>> => {
    const useQuery = !request.body;
    const usedParam = (useQuery ? request.query : request.body) as IAPICaller;
    const { endpoint, data, hideLog } = usedParam || {};

    try {
      const finalData = data;
      const { dataSourceId = "" } = data;
      const callWithRequest = getClientBasedOnDataSource(context, this.dataSourceEnabled, request, dataSourceId, this.osDriver);
      delete finalData.dataSourceId;

      /**
       * The endpoint must not be an empty string, reference from proxy caller
       */
      if (!endpoint) {
        return response.custom({
          statusCode: 200,
          body: {
            ok: false,
            error: `Expected non-empty string on endpoint`,
          },
        });
      }

      /**
       * Update path parameter to follow RFC/generic HTTP convention
       */
      if (endpoint === "transport.request" && typeof finalData?.path === "string" && !/^\//.test(finalData?.path || "")) {
        finalData.path = `/${finalData.path || ""}`;
      }

      /**
       * Check valid method here
       */
      if (endpoint === "transport.request" && data?.method) {
        if (VALID_METHODS.indexOf(data.method.toUpperCase?.()) === -1) {
          return response.custom({
            statusCode: 200,
            body: {
              ok: false,
              error: `Method must be one of, case insensitive ['HEAD', 'GET', 'POST', 'PUT', 'DELETE']. Received '${data.method}'.`,
            },
          });
        }
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
