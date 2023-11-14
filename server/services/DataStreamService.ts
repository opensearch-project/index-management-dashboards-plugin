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
import { DataStream, GetDataStreamsResponse, IndexToDataStream } from "../models/interfaces";
import { SECURITY_EXCEPTION_PREFIX } from "../utils/constants";

export default class DataStreamService {
  osDriver: ILegacyCustomClusterClient;

  constructor(osDriver: ILegacyCustomClusterClient) {
    this.osDriver = osDriver;
  }

  getDataStreams = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<GetDataStreamsResponse>>> => {
    try {
      const { search } = request.query as {
        search?: string;
      };

      const client = this.osDriver.asScoped(request);
      const [dataStreams, apiAccessible, errMsg] = await getDataStreams(client, search);

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
            dataStreams,
            totalDataStreams: dataStreams.length,
          },
        },
      });
    } catch (err) {
      console.error("Index Management - DataStreamService - getDataStreams:", err);
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

export async function getDataStreams(
  { callAsCurrentUser: callWithRequest }: ILegacyScopedClusterClient,
  search?: string
): Promise<[DataStream[], boolean, string]> {
  const searchPattern = search ? `*${search}*` : "*";

  let accessible = true;
  let errMsg = "";
  const dataStreamsResponse = await callWithRequest("transport.request", {
    path: `/_data_stream/${searchPattern}`,
    method: "GET",
  }).catch((e) => {
    if (e.statusCode === 403 && e.message.startsWith(SECURITY_EXCEPTION_PREFIX)) {
      accessible = false;
      errMsg = e.message;
      return { data_streams: [] };
    }
    throw e;
  });

  return [dataStreamsResponse.data_streams, accessible, errMsg];
}

export async function getIndexToDataStreamMapping({
  callAsCurrentUser: callWithRequest,
}: ILegacyScopedClusterClient): Promise<IndexToDataStream> {
  const [dataStreams] = await getDataStreams({ callAsCurrentUser: callWithRequest });

  const mapping: { [indexName: string]: string } = {};
  dataStreams.forEach((dataStream) => {
    dataStream.indices.forEach((index) => {
      mapping[index.index_name] = dataStream.name;
    });
  });

  return mapping;
}
