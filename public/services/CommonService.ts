/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpFetchOptions, HttpFetchQuery } from "opensearch-dashboards/public";
import { ServerResponse } from "../../server/models/types";
import { NODE_API } from "../../utils/constants";
import { IAPICaller } from "../../models/interfaces";
import { MDSEnabledClientService } from "./MDSEnabledClientService";

export default class CommonService extends MDSEnabledClientService {
  apiCaller = async <T>(params: IAPICaller, queryObject?: HttpFetchQuery): Promise<ServerResponse<T>> => {
    let url = `${NODE_API.API_CALLER}`;
    const payload: HttpFetchOptions = {};
    queryObject = this.patchQueryObjectWithDataSourceId(queryObject);
    payload.method = "POST";
    payload.body = JSON.stringify({
      data: params.data,
      endpoint: params.endpoint,
      hideLog: params.hideLog,
    });
    payload.query = queryObject;
    return (await this.httpClient.fetch(url, payload)) as ServerResponse<T>;
  };

  accountInfo = async <T>(params: IAPICaller): Promise<ServerResponse<T>> => {
    let url = `${NODE_API.ACCOUNT_INFO}`;
    const payload: HttpFetchOptions = {};
    payload.method = "POST";
    payload.body = JSON.stringify({
      data: params.data,
      endpoint: params.endpoint,
      hideLog: params.hideLog,
    });
    // we are not sending dataSourceId in query object, as for securityInfo,
    // it will always contact local cluster
    return (await this.httpClient.fetch(url, payload)) as ServerResponse<T>;
  };
}
