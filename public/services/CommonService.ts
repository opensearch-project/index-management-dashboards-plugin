/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpFetchOptions, HttpSetup } from "opensearch-dashboards/public";
import { ServerResponse } from "../../server/models/types";
import { NODE_API } from "../../utils/constants";
import { IAPICaller } from "../../models/interfaces";

export default class CommonService {
  httpClient: HttpSetup;

  constructor(httpClient: HttpSetup) {
    this.httpClient = httpClient;
  }

  apiCaller = async (params: IAPICaller): Promise<ServerResponse<any>> => {
    let url = `${NODE_API.API_CALLER}`;
    const payload: HttpFetchOptions = {};
    payload.method = (params.method || "GET")?.toLowerCase();
    if (["get"].includes(payload.method)) {
      payload.query = {
        data: JSON.stringify(params.data),
        endpoint: params.endpoint,
      };
    } else {
      payload.body = JSON.stringify({
        data: params.data,
        endpoint: params.endpoint,
      });
    }
    const response = (await this.httpClient.fetch(url, payload)) as ServerResponse<any>;
    if (response.ok) {
      return response;
    } else {
      throw new Error(response.error);
    }
  };
}
