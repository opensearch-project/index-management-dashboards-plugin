/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpFetchError, HttpFetchOptions, HttpSetup } from "opensearch-dashboards/public";
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
      hideLog: params.hideLog,
    });
    return (await this.httpClient.fetch(url, payload)) as ServerResponse<T>;
  };

  consoleProxyCaller = async <T>(params: IAPICaller): Promise<ServerResponse<T>> => {
    let url = NODE_API.CONSOLE_PROXY_CALLER;
    try {
      const result = await this.httpClient.fetch(url, {
        method: "POST",
        body: JSON.stringify(params.data?.body),
        query: {
          path: params.data?.path,
          method: params.data?.method,
        },
      });
      if (result.error) {
        return {
          ok: false,
          error: result.error.reason,
          body: result,
        };
      }

      return {
        ok: true,
        response: result,
      };
    } catch (e: unknown) {
      if ((e as HttpFetchError).body) {
        const finalError = e as HttpFetchError;
        return {
          ok: false,
          body: finalError.body,
          error: finalError.body?.error?.reason,
        };
      }
      return {
        ok: false,
        error: e as string,
      };
    }
  };
}
