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
    const url = `${NODE_API.API_CALLER}`;
    const payload: HttpFetchOptions = {};
    payload.method = "POST";
    payload.body = JSON.stringify({
      data: params.data,
      endpoint: params.endpoint,
      hideLog: params.hideLog,
    });
    return (await this.httpClient.fetch(url, payload)) as ServerResponse<T>;
  };
}
