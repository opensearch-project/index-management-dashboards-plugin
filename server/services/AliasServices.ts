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
  ILegacyScopedClusterClient,
} from "opensearch-dashboards/server";
import { ServerResponse } from "../models/types";
import { Alias, GetAliasesResponse } from "../models/interfaces";
import { SECURITY_EXCEPTION_PREFIX } from "../utils/constants";

export default class AliasServices {
  osDriver: ILegacyCustomClusterClient;

  constructor(osDriver: ILegacyCustomClusterClient) {
    this.osDriver = osDriver;
  }

  getAliases = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<GetAliasesResponse>>> => {
    try {
      const { search } = request.query as {
        search?: string;
      };

      const client = this.osDriver.asScoped(request);
      const [aliases, apiAccessible, errMsg] = await getAliases(client, search);

      if (!apiAccessible)
        return response.custom({
          statusCode: 200,
          body: {
            ok: false,
            error: errMsg,
          },
        });

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: {
            aliases,
            totalAliases: aliases.length,
          },
        },
      });
    } catch (err) {
      console.error("Index Management - AliasesService - getAliases:", err);
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

export async function getAliases(
  { callAsCurrentUser: callWithRequest }: ILegacyScopedClusterClient,
  search?: string
): Promise<[Alias[], boolean, string]> {
  const searchPattern = search ? `*${search}*` : "*";

  let accessible = true;
  let errMsg = "";
  const aliasesResponse = await callWithRequest("cat.aliases", {
    format: "json",
    name: searchPattern,
  }).catch((e) => {
    if (e.statusCode === 403 && e.message.startsWith(SECURITY_EXCEPTION_PREFIX)) {
      accessible = false;
      errMsg = e.message;
      return { alias: [] };
    }
    throw e;
  });

  return [aliasesResponse, accessible, errMsg];
}
