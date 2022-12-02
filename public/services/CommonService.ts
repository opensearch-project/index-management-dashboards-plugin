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

  apiCaller = async <T>(params: IAPICaller): Promise<ServerResponse<T>> => {
    let url = `${NODE_API.API_CALLER}`;
    const payload: HttpFetchOptions = {};
    payload.method = "POST";
    payload.body = JSON.stringify({
      data: params.data,
      endpoint: params.endpoint,
    });
    return (await this.httpClient.fetch(url, payload)) as ServerResponse<T>;
  };
}
